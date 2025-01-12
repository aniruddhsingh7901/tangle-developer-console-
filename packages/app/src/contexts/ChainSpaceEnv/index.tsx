// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import { eqSet, setStateWithRef } from '@w3ux/utils';
import { isCustomEvent } from 'Utils';
import { SubscriptionsController } from 'controllers/Subscriptions';
import { AccountBalances } from 'model/AccountBalances';
import type {
  APIStatusEventDetail,
  ApiInstanceId,
  ApiStatus,
  TangleChainProperties,
} from 'model/Api/types';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';
import type {
  ChainSpaceApiStatuses,
  ChainSpaceChainSpecs,
  ChainSpaceEnvContextInterface,
  ChainSpaceEnvProps,
  ConnectedChain,
  PalletVersions,
} from './types';
import { defaultChainSpaceEnvContext } from './defaults';
import { useGlobalChainSpace } from 'contexts/GlobalChainSpace';
import type { ChainId } from 'config/networks/types';
import { ApiController } from 'controllers/Api';
import { BlockNumber } from 'model/BlockNumber';
import { useApiIndexer } from 'contexts/ApiIndexer';
import type { OwnerId } from 'types';
import { useTabs } from 'contexts/Tabs';
import { ownerIdToTabId, tabIdToOwnerId } from 'contexts/Tabs/Utils';
import type { ApiIndexLabel } from 'contexts/ApiIndexer/types';
import type { MetadataVersion } from 'model/Metadata/types';
import type { ApiPromise } from '@polkadot/api';
import { PalletScraper } from 'model/Scraper/Pallet';
import { xxhashAsHex } from '@polkadot/util-crypto';
import { u16 } from 'scale-ts';
import type { AnyJson } from '@w3ux/types';
import { getApiInstanceOwnerAndIndex } from './Utils';
import { useTxMeta } from 'contexts/TxMeta';
//import { TANGLE_CONFIG } from 'model/Api/tangle/TangleConfig';
import { TANGLE_CONFIG } from '../../model/Api/TangleConfig';

export const ChainSpaceEnv = createContext<ChainSpaceEnvContextInterface>(
  defaultChainSpaceEnvContext
);

export const useChainSpaceEnv = () => useContext(ChainSpaceEnv);

export const ChainSpaceEnvProvider = ({ children }: ChainSpaceEnvProps) => {
  const {
    tabs,
    getTabTaskData,
    getTabActiveTask,
    resetTabActiveTask,
    getActiveTaskChainIds,
  } = useTabs();
  const {
    getTabApiIndex,
    setTabApiIndex,
    getTabApiIndexes,
    removeTabApiIndex,
  } = useApiIndexer();
  const { destroyInstanceTxMeta } = useTxMeta();
  const { globalChainSpace } = useGlobalChainSpace();

  const [chainSpecs, setChainSpecsState] = useState<ChainSpaceChainSpecs>({});
  const chainSpecsRef = useRef(chainSpecs);

  const [apiStatuses, setApiStatusesState] = useState<ChainSpaceApiStatuses>(
    {}
  );
  const apiStatusesRef = useRef(apiStatuses);

  const [palletVersions, setPalletVersions] = useState<PalletVersions>({});

  const setChainSpecs = (newChainSpecs: ChainSpaceChainSpecs) => {
    setStateWithRef(newChainSpecs, setChainSpecsState, chainSpecsRef);
  };

  const setApiStatuses = (newApiStatuses: ChainSpaceApiStatuses) => {
    setStateWithRef(newApiStatuses, setApiStatusesState, apiStatusesRef);
  };

  const isTangleNetwork = (chainId: ChainId): boolean =>
    chainId === 'tangle' || chainId === 'tangle-testnet';

  const getTangleProperties = (
    chainId: ChainId
  ): TangleChainProperties | undefined => {
    if (isTangleNetwork(chainId)) {
      const networkType = chainId === 'tangle' ? 'mainnet' : 'testnet';
      return TANGLE_CONFIG.CHAIN_PROPERTIES[networkType];
    }
    return undefined;
  };

  const getApiInstanceById = (instanceId: ApiInstanceId) => {
    const { ownerId, index } = getApiInstanceOwnerAndIndex(instanceId);
    return ApiController.instances[ownerId]?.[index];
  };

  const getApiInstance = (ownerId: OwnerId, label: ApiIndexLabel) => {
    const apiIndex = getTabApiIndex(ownerId, label);
    if (apiIndex !== undefined) {
      return ApiController.instances[ownerId]?.[apiIndex.index];
    }
  };

  const getConnectedChains = () => {
    const chains = Object.entries(chainSpecs).reduce(
      (acc: ConnectedChain[], [instanceId, spec]) => {
        if (spec.chain === null) {
          return acc;
        }
        const api = getApiInstanceById(instanceId)?.api;
        if (!api) {
          return acc;
        }
        acc.push({
          specName: spec.version.specName,
          genesisHash: api.genesisHash.toHex(),
        });
        return acc;
      },
      []
    );
    return [...new Set(chains)];
  };

  const getChainIdCaip = (chainId: string) => {
    if (isTangleNetwork(chainId as ChainId)) {
      const props = getTangleProperties(chainId as ChainId);
      return props ? `polkadot:${props.chainId}` : '';
    }
    const chain = getConnectedChains().find(
      (connectedChain) => connectedChain.specName === chainId
    );
    return `polkadot:${chain?.genesisHash.substring(2).substring(0, 32) || ''}`;
  };

  const getChainSpec = (instanceId?: ApiInstanceId) => {
    if (instanceId === undefined) {
      return undefined;
    }
    return chainSpecsRef.current[instanceId];
  };

  const removeChainSpec = (instanceId: ApiInstanceId) => {
    const updatedChainSpecs = { ...chainSpecsRef.current };
    delete updatedChainSpecs[instanceId];
    setChainSpecs(updatedChainSpecs);
  };

  const removePalletVersions = (ownerId: OwnerId) => {
    const updatedPalletVersions = { ...palletVersions };
    delete updatedPalletVersions[ownerId];
    setPalletVersions(updatedPalletVersions);
  };

  const getApiStatus = (instanceId?: ApiInstanceId) => {
    if (instanceId === undefined) {
      return 'disconnected';
    }
    return apiStatusesRef.current[instanceId] || 'disconnected';
  };

  const setApiStatus = (instanceId: ApiInstanceId, status: ApiStatus) => {
    setApiStatuses({
      ...apiStatusesRef.current,
      [instanceId]: status,
    });
  };

  const removeApiStatus = (instanceId: ApiInstanceId) => {
    const updatedApiStatuses = { ...apiStatusesRef.current };
    delete updatedApiStatuses[instanceId];
    setApiStatuses(updatedApiStatuses);
  };

  const handleConnectApi = async (
    ownerId: OwnerId,
    label: ApiIndexLabel,
    chainId: ChainId,
    provider: string
  ) => {
    const index = ApiController.getNextIndex(ownerId);
    setTabApiIndex(ownerId, { index, label });
    setApiStatus(`${ownerId}_${index}`, 'connecting');

    if (isTangleNetwork(chainId)) {
      const tangleProps = getTangleProperties(chainId);
      if (tangleProps) {
        await globalChainSpace.getInstance().addApi(ownerId, chainId, provider);
        return;
      }
    }
    await globalChainSpace.getInstance().addApi(ownerId, chainId, provider);
  };

  const handleNewApiStatus = (e: Event): void => {
    if (isCustomEvent(e)) {
      const { ownerId, instanceId, chainId, event } =
        e.detail as APIStatusEventDetail;

      switch (event) {
        case 'ready':
          setApiStatus(instanceId, 'ready');
          SubscriptionsController.set(
            instanceId,
            'blockNumber',
            new BlockNumber(ownerId, instanceId, chainId)
          );
          SubscriptionsController.set(
            instanceId,
            'accountBalances',
            new AccountBalances(ownerId, instanceId, chainId)
          );
          break;
        case 'connecting':
          setApiStatus(instanceId, 'connecting');
          break;
        case 'connected':
          setApiStatus(instanceId, 'connected');
          break;
        case 'disconnected':
        case 'error':
        case 'destroyed':
          handleApiDisconnect(ownerId, instanceId);
          break;
      }
    }
  };

  const handleNewChainSpec = (e: Event): void => {
    if (isCustomEvent(e)) {
      const { instanceId, ownerId, spec, consts } = e.detail;

      if (isTangleNetwork(spec.version.specName)) {
        const tangleProps = getTangleProperties(spec.version.specName);
        if (tangleProps) {
          spec.tokenDecimals = tangleProps.tokenDecimals;
          spec.tokenSymbol = tangleProps.tokenSymbol;
          spec.chainId = tangleProps.chainId;
        }
      }

      const updated = { ...chainSpecsRef.current };
      updated[instanceId] = { ...spec, consts };
      setChainSpecs(updated);

      fetchPalletVersions(
        ownerId,
        spec.metadata,
        ApiController.getInstanceApi(
          ownerId,
          getIndexFromInstanceId(instanceId)
        )
      );
    }
  };

  const handleApiDisconnect = async (
    ownerId: OwnerId,
    instanceId: ApiInstanceId,
    destroy = false
  ) => {
    const index = getIndexFromInstanceId(instanceId);

    if (destroy) {
      ApiController.destroy(ownerId, index);
      removeTabApiIndex(ownerId, index);
      removeApiStatus(instanceId);
      removeChainSpec(instanceId);
      removePalletVersions(ownerId);
      resetTabActiveTask(ownerIdToTabId(ownerId));
    } else {
      setApiStatus(instanceId, 'disconnected');
    }
  };

  const destroyAllApiInstances = (ownerId: OwnerId) => {
    const indexes = getTabApiIndexes(ownerId);
    if (indexes.length) {
      for (const apiIndex of indexes) {
        const instanceId = `${ownerId}_${apiIndex.index}`;
        destroyInstanceTxMeta(instanceId);
        handleApiDisconnect(ownerId, instanceId, true);
      }
    }
  };

  const getIndexFromInstanceId = (instanceId: string): number => {
    const result = instanceId.split('_');
    return Number(result[2]);
  };

  const destroyApiInstance = (ownerId: OwnerId, label: ApiIndexLabel) => {
    const apiIndex = getTabApiIndex(ownerId, label);
    if (apiIndex !== undefined) {
      ApiController.destroy(ownerId, apiIndex.index);
      removeTabApiIndex(ownerId, apiIndex.index);
    }
  };

  const instantiateApiFromTab = async (tabId: number) => {
    const activeTask = getTabActiveTask(tabId);
    const taskData = getTabTaskData(tabId);

    if (activeTask && taskData?.chain && taskData?.autoConnect) {
      handleConnectApi(
        tabIdToOwnerId(tabId),
        activeTask,
        taskData.chain.id,
        taskData.chain.endpoint
      );
    }
  };

  const fetchPalletVersions = async (
    ownerId: OwnerId,
    metadata: MetadataVersion,
    apiInstance: ApiPromise
  ) => {
    if (palletVersions[ownerId] !== undefined) {
      return;
    }
    const scraper = new PalletScraper(metadata);
    const pallets = scraper.getPalletList();

    const calls = pallets.map(({ name }) => {
      const storageKey =
        xxhashAsHex(name, 128) +
        xxhashAsHex(':__STORAGE_VERSION__:', 128).slice(2);
      return apiInstance.rpc.state.getStorage(storageKey);
    });

    const result = await Promise.all(calls);

    const newPalletVersions = Object.fromEntries(
      result.map((element: AnyJson, index: number) => {
        const versionAsHex = element.toHex();
        return [
          pallets[index].name,
          versionAsHex == '0x' ? '0' : String(u16.dec(element.toString())),
        ];
      })
    );

    setPalletVersions((prev) => ({
      ...prev,
      [ownerId]: newPalletVersions,
    }));
  };

  const allActiveChainsConnected = (): boolean => {
    const tabChainIds = getActiveTaskChainIds();
    const connectedChains = getConnectedChains();
    const connectedChainIds = new Set(
      connectedChains.map((chain) => chain.specName)
    );
    return eqSet(tabChainIds, connectedChainIds);
  };

  const getPalletVersions = (
    ownerId: OwnerId
  ): Record<string, string> | undefined => palletVersions[ownerId];

  useEffect(() => {
    tabs.forEach((tab) => {
      if (tab.taskData?.autoConnect) {
        instantiateApiFromTab(tab.id);
      }
    });
  }, []);

  const documentRef = useRef<Document>(document);
  useEventListener('api-status', handleNewApiStatus, documentRef);
  useEventListener('new-chain-spec', handleNewChainSpec, documentRef);

  return (
    <ChainSpaceEnv.Provider
      value={{
        getApiStatus,
        getChainSpec,
        getApiInstanceById,
        getApiInstance,
        getPalletVersions,
        getConnectedChains,
        getChainIdCaip,
        handleConnectApi,
        instantiateApiFromTab,
        destroyApiInstance,
        destroyAllApiInstances,
        allActiveChainsConnected,
        isTangleNetwork,
        getTangleProperties,
      }}
    >
      {children}
    </ChainSpaceEnv.Provider>
  );
};
