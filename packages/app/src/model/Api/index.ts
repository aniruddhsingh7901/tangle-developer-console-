// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import type { ChainId } from 'config/networks/types';
import type {
  APIChainSpec,
  APIStatusEventDetail,
  EventStatus,
  ErrDetail,
  ApiInstanceId,
  APIChainSpecEventDetail,
  PapiObservableClient,
  PapiDynamicBuilder,
} from './types';
import { SubscriptionsController } from 'controllers/Subscriptions';
import type { AnyJson } from '@w3ux/types';
import type { ChainSpaceId, OwnerId } from 'types';
import type { JsonRpcProvider } from '@polkadot-api/ws-provider/web';
import { getWsProvider } from '@polkadot-api/ws-provider/web';
import { createClient as createRawClient } from '@polkadot-api/substrate-client';
import { getObservableClient } from '@polkadot-api/observable-client';
import { ChainSpec } from 'model/Observables/ChainSpec';
import { getDataFromObservable } from 'model/Observables/util';
import { TaggedMetadata } from 'model/Observables/TaggedMetadata';
import { MetadataV15 } from 'model/Metadata/MetadataV15';
import { PalletScraper } from 'model/Scraper/Pallet';
import {
  getLookupFn,
  getDynamicBuilder,
} from '@polkadot-api/metadata-builders';
import { formatChainSpecName } from './util';
import { MetadataController } from 'controllers/Metadata';
import BigNumber from 'bignumber.js';

export class Api {
  #chainSpaceId: ChainSpaceId;
  #ownerId: OwnerId;
  #instanceId: ApiInstanceId;
  #chainId: ChainId;
  #provider: WsProvider;
  #api: ApiPromise;
  #papiProvider: JsonRpcProvider;
  #papiClient: PapiObservableClient;
  #papiBuilder: PapiDynamicBuilder;
  #rpcEndpoint: string;
  chainSpec: APIChainSpec;
  consts: Record<string, AnyJson> = {};
  #initialized = false;
  status: EventStatus = 'disconnected';

  get chainSpaceId() {
    return this.#chainSpaceId;
  }
  get ownerId() {
    return this.#ownerId;
  }
  get instanceId() {
    return this.#instanceId;
  }
  get chainId() {
    return this.#chainId;
  }
  get provider() {
    return this.#provider;
  }
  get api() {
    return this.#api;
  }
  get papiProvider() {
    return this.#papiProvider;
  }
  get papiClient() {
    return this.#papiClient;
  }
  get papiBuilder() {
    return this.#papiBuilder;
  }
  get rpcEndpoint() {
    return this.#rpcEndpoint;
  }

  constructor(
    chainSpaceId: ChainSpaceId,
    ownerId: OwnerId,
    instanceIndex: number,
    chainId: ChainId,
    endpoint: string
  ) {
    this.#chainSpaceId = chainSpaceId;
    this.#ownerId = ownerId;
    this.#instanceId = `${ownerId}_${instanceIndex}`;
    this.#chainId = chainId;
    this.#rpcEndpoint = endpoint;
  }

  async initialize() {
    try {
      this.#provider = new WsProvider(this.#rpcEndpoint);
      this.#papiProvider = getWsProvider(this.#rpcEndpoint);
      this.dispatchEvent(this.ensureEventStatus('connecting'));
      this.#api = new ApiPromise({ provider: this.provider });
      this.#papiClient = getObservableClient(
        createRawClient(this.#papiProvider)
      );
      this.initPolkadotJsApiEvents();
      await this.#api.isReady;
      this.#initialized = true;
    } catch (e) {
      this.dispatchEvent(this.ensureEventStatus('error'), {
        err: 'InitializationError',
      });
    }
  }

  async fetchChainSpec() {
    try {
      const [resultChainSpec, resultTaggedMetadata] = await Promise.all([
        getDataFromObservable(
          this.#instanceId,
          'chainSpec',
          new ChainSpec(this.#ownerId, this.#instanceId)
        ),
        getDataFromObservable(
          this.#instanceId,
          'metadata',
          new TaggedMetadata(this.#ownerId, this.#instanceId)
        ),
      ]);

      if (!resultChainSpec || !resultTaggedMetadata) {
        throw new Error();
      }

      this.#papiBuilder = getDynamicBuilder(getLookupFn(resultTaggedMetadata));
      const chainName = formatChainSpecName(resultChainSpec.specName);
      const resultTaggedMetadataV15 = new MetadataV15(resultTaggedMetadata);
      const scraper = new PalletScraper(resultTaggedMetadataV15);

      const ss58Format = this.#papiBuilder
        .buildConstant('System', 'SS58Format')
        .dec(
          String(scraper.getConstantValue('System', 'SS58Format') || '0x2A')
        );

      const metadataPJs = this.api.runtimeMetadata;
      const metadataPJsJson = metadataPJs.asV15.toJSON();

      this.chainSpec = {
        chain: chainName,
        version: resultChainSpec.specVersion,
        ss58Format: Number(ss58Format),
        tokenDecimals: 18,
        tokenSymbol: 'TNT',
        chainId: 5845,
        metadata: MetadataController.instantiate(metadataPJsJson),
        consts: {},
      };
    } catch (e) {
      this.dispatchEvent(this.ensureEventStatus('error'), {
        err: 'ChainSpecError',
      });
    }
  }

  async handleFetchChainData() {
    if (!this.chainSpec) {
      await this.fetchChainSpec();
      this.fetchConsts();
    }

    const detail: APIChainSpecEventDetail = {
      chainSpaceId: this.chainSpaceId,
      ownerId: this.ownerId,
      instanceId: this.instanceId,
      spec: this.chainSpec,
      consts: this.consts,
    };

    document.dispatchEvent(new CustomEvent('new-chain-spec', { detail }));
  }

  fetchConsts = () => {
    const metadata = this.chainSpec.metadata;
    const newConsts: Record<string, AnyJson> = {};

    try {
      const scraper = new PalletScraper(metadata);
      const hasBalancesPallet = metadata.palletExists('Balances');

      if (hasBalancesPallet) {
        const existentialDeposit = this.#papiBuilder
          .buildConstant('Balances', 'ExistentialDeposit')
          .dec(
            String(
              scraper.getConstantValue('Balances', 'ExistentialDeposit') || '0x'
            )
          );

        newConsts['existentialDeposit'] = new BigNumber(existentialDeposit);
        newConsts['tokenDecimals'] = 18;
        newConsts['tokenSymbol'] = 'TNT';
        newConsts['chainId'] = 5845;
      }
      this.consts = newConsts;
    } catch (e) {
      this.consts = {};
    }
  };

  async initPolkadotJsApiEvents() {
    this.#api.on('ready', async () => {
      this.dispatchEvent(this.ensureEventStatus('ready'));
      this.handleFetchChainData();
    });

    this.#api.on('connected', () => {
      this.dispatchEvent(this.ensureEventStatus('connected'));
      if (this.#initialized) {
        this.dispatchEvent(this.ensureEventStatus('ready'));
        this.handleFetchChainData();
      }
    });

    this.#api.on('disconnected', () => {
      this.dispatchEvent(this.ensureEventStatus('disconnected'));
    });

    this.#api.on('error', (err: ErrDetail) => {
      this.dispatchEvent(this.ensureEventStatus('error'), { err });
    });
  }

  dispatchEvent(
    event: EventStatus,
    options?: {
      err?: ErrDetail;
    }
  ) {
    const detail: APIStatusEventDetail = {
      event,
      chainSpaceId: this.chainSpaceId,
      ownerId: this.ownerId,
      instanceId: this.instanceId,
      chainId: this.chainId,
    };
    if (options?.err) {
      detail['err'] = options.err;
    }

    this.status = event;
    document.dispatchEvent(new CustomEvent('api-status', { detail }));
  }

  unsubscribe = () => {
    const subs = SubscriptionsController.getAll(this.instanceId);

    if (subs) {
      Object.entries(subs).forEach(([subscriptionId, subscription]) => {
        subscription.unsubscribe();
        SubscriptionsController.remove(this.instanceId, subscriptionId);
      });
    }
  };

  ensureEventStatus = (status: string | EventStatus): EventStatus => {
    const eventStatus: string[] = [
      'connecting',
      'connected',
      'disconnected',
      'ready',
      'error',
      'destroyed',
    ];
    if (eventStatus.includes(status)) {
      return status as EventStatus;
    }
    return 'error' as EventStatus;
  };

  async disconnect(destroy = false) {
    this.unsubscribe();
    this.provider?.disconnect();
    await this.api?.disconnect();

    if (destroy) {
      this.dispatchEvent(this.ensureEventStatus('destroyed'));
    }
  }
}
