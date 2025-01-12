// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import { AccountId32 } from 'library/Inputs/AccountId32';
import { useImportedAccounts } from 'contexts/ImportedAccounts';
import { FormWrapper } from 'routes/Home/Wrappers';
import { useParachain } from 'routes/ParachainSetup/Provider';
import { SetupNote } from '../Wrappers';
import { iconCheckCircle, iconCircle } from '@polkadot-cloud/icons/regular';
import { useEffect } from 'react';
import { SubscriptionsController } from 'controllers/Subscriptions';
import { NextFreeParaId } from 'model/NextFreeParaId';
import { useActiveTab } from 'contexts/ActiveTab';
import BigNumber from 'bignumber.js';
import { Textbox } from 'library/Inputs/Textbox';
import { useEffectIgnoreInitial } from '@w3ux/hooks';
import { SubmitTx } from 'library/SubmitTx';
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic';
import { useReserveParaId } from 'contexts/ParaSetup/ReserveParaId';
import type { ReservedParaId } from 'contexts/ParaSetup/ReserveParaId/types';
import { ParaIdOptionsWrapper } from './Wrappers';
import { CloudIcon } from '@polkadot-cloud/icons';

export const ReserveParaId = () => {
  const {
    getNextParaId,
    nextParaIdChainExists,
    addNextParaIdChain,
    getSelectedAccount,
    setSelectedAccount,
    getSelectedOption,
    setSelectedOption,
    getExistingParaIdInput,
    setExistingParaIdInput,
    getExistingReservedParaId,
    setExistingReservedParaId,
    getReservedNextParaId,
    setReservedNextParaId,
    validateParaId,
  } = useReserveParaId();

  const { getAccounts } = useImportedAccounts();
  const { ownerId, tabId, metaKey } = useActiveTab();
  const { chainSpec, chain, instanceId, api } = useParachain();

  const chainId = chain.id;
  const { ss58Format, units, unit } = chain;
  const nextParaId = getNextParaId(chainId);
  const { transactionVersion } = chainSpec.version;
  const { existentialDeposit } = chainSpec.consts;

  const accounts = chainSpec
    ? getAccounts(chainSpec.version.specName, chainSpec.ss58Format)
    : [];

  const selectedAccount =
    getSelectedAccount(tabId) || accounts?.[0]?.address || '';
  const selectedOption = getSelectedOption(tabId);
  const existingParaId = getExistingParaIdInput(tabId);
  const reservedNextParaId = getReservedNextParaId(tabId, selectedAccount);

  const queryExistingParaId = async () => {
    if (!existingParaId || !selectedAccount) {
      return;
    }

    let valid = false;
    const result = await api.query.registrar.paras(existingParaId);
    const json = result?.toHuman() as unknown as ReservedParaId | null;

    if (json) {
      const result2 = await api.query.paras.paraLifecycles(existingParaId);
      if (result2.toHuman() === null) {
        valid = true;
        json.paraId = existingParaId;
      }
    }
    setExistingReservedParaId(tabId, valid ? json : null);
  };

  const getTx = () => {
    if (!api || selectedOption !== 'new' || !selectedAccount || !nextParaId) {
      return null;
    }

    try {
      return api.tx.registrar.reserve();
    } catch (e) {
      return null;
    }
  };

  const submitExtrinsic = useSubmitExtrinsic({
    api,
    instanceId,
    chainId,
    ss58Format,
    unit,
    tx: getTx(),
    from: selectedAccount,
    shouldSubmit: true,
    callbackSubmit: () => {
      if (nextParaId) {
        setReservedNextParaId(tabId, selectedAccount, nextParaId);
      }
    },
  });

  const reserveNextIdValid =
    selectedOption === 'new' && !!selectedAccount && !!nextParaId;
  const reservedExistingParaId = getExistingReservedParaId(tabId);

  const existingFeedback =
    reservedExistingParaId === null
      ? `Para ID ${existingParaId} is not valid.`
      : reservedExistingParaId !== undefined
        ? reservedExistingParaId.manager === selectedAccount
          ? `Found Para ID ${reservedExistingParaId.paraId}. Ready to configure node.`
          : `Para ID found, but has a different owner.`
        : 'Ready to fetch Para ID.';

  const newFeedback = reservedNextParaId
    ? 'Para ID reserved. Ready to configure node.'
    : 'Ready to Reserve Para ID.';

  useEffect(() => {
    if (!nextParaIdChainExists(chainId)) {
      addNextParaIdChain(chainId);
      SubscriptionsController.set(
        instanceId,
        'nextFreeParaId',
        new NextFreeParaId(ownerId, instanceId, chainId)
      );
    }
  }, []);

  useEffectIgnoreInitial(() => {
    queryExistingParaId();
  }, [existingParaId, selectedAccount]);

  return (
    <FormWrapper>
      <h3>Reserve a Para ID for Tangle Network</h3>
      <section>
        <AccountId32
          inputId={`${metaKey}_managerAddress`}
          defaultAddress={selectedAccount}
          accounts={accounts}
          onChange={(val) => setSelectedAccount(tabId, val)}
        />
        <ParaIdOptionsWrapper>
          <section>
            <div
              className={`inner ${selectedOption === 'new' ? ' selected' : ''}`}
            >
              <h3>Reserve Next Para ID</h3>
              <button onClick={() => setSelectedOption(tabId, 'new')}>
                <h1>
                  {nextParaId ? new BigNumber(nextParaId).toString() : '...'}
                </h1>
              </button>
              <button
                className="foot"
                onClick={() => setSelectedOption(tabId, 'new')}
              >
                <span>
                  <h4>{selectedOption === 'new' ? ' Selected' : 'Select'}</h4>
                </span>
                <span>
                  {selectedOption === 'new' ? (
                    <CloudIcon icon={iconCheckCircle} transform="grow-2" />
                  ) : (
                    <CloudIcon icon={iconCircle} transform="grow-2" />
                  )}
                </span>
              </button>
            </div>
          </section>
          <section>
            <div
              className={`inner ${selectedOption === 'existing' ? ' selected' : ''}`}
            >
              <h3>Find Existing Para ID</h3>
              <Textbox
                initial={existingParaId || ''}
                value={existingParaId || ''}
                onFocus={() => setSelectedOption(tabId, 'existing')}
                onChange={(val) => setExistingParaIdInput(tabId, val)}
                placeholder="Para ID"
                shrinkPlaceholder={true}
                numeric
              />
              <button
                className="foot"
                onClick={() => setSelectedOption(tabId, 'existing')}
              >
                <span>
                  <h4>
                    {selectedOption === 'existing' ? ' Selected' : 'Select'}
                  </h4>
                </span>
                <span>
                  {selectedOption === 'existing' ? (
                    <CloudIcon icon={iconCheckCircle} transform="grow-2" />
                  ) : (
                    <CloudIcon icon={iconCircle} transform="grow-2" />
                  )}
                </span>
              </button>
            </div>
          </section>
        </ParaIdOptionsWrapper>

        <SetupNote>
          {validateParaId(tabId, selectedAccount) ? (
            <CloudIcon icon={iconCheckCircle} transform="grow-1" />
          ) : null}
          {selectedOption === 'existing' ? existingFeedback : newFeedback}
        </SetupNote>

        {!reservedNextParaId && reserveNextIdValid && (
          <SubmitTx
            {...submitExtrinsic}
            valid={reserveNextIdValid}
            instanceId={instanceId}
            chainId={chainId}
            ss58Format={ss58Format}
            units={units}
            unit={unit}
            existentialDeposit={existentialDeposit}
            transactionVersion={String(transactionVersion)}
          />
        )}
      </section>
    </FormWrapper>
  );
};
