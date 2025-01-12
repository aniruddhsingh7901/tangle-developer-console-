// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import { useLedgerAccounts } from '@w3ux/react-connect-kit';
import type {
  LedgerAccount,
  LedgerAddress,
} from '@w3ux/react-connect-kit/types';
import { Polkicon } from '@w3ux/react-polkicon';
import { ellipsisFn, setStateWithRef } from '@w3ux/utils';
import { NetworkDirectory } from 'config/networks';
import type { DirectoryId } from 'config/networks/types';
import { HardwareAddress } from 'library/HardwareAddress';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChainSearchInput } from './ChainSearchInput';
import type { ManageHardwareProps } from './types';
import { useEffectIgnoreInitial } from '@w3ux/hooks';
import { ImportButtonWrapper, SubHeadingWrapper } from './Wrappers';
import { CloudIcon } from '@polkadot-cloud/icons';
import { LedgerChains } from 'contexts/LedgerHardware/defaults';
import { useLedgerHardware } from 'contexts/LedgerHardware';
import type { LedgerResponse } from 'contexts/LedgerHardware/types';
import { iconUsbDrive } from '@polkadot-cloud/icons/duotone';
import {
  getLedgerApp,
  getLocalLedgerAddresses,
} from 'contexts/LedgerHardware/Utils';
import type { AnyJson } from '@w3ux/types';
import { iconSquareMinus } from '@polkadot-cloud/icons/solid';

export const ManageLedger = ({
  getMotionProps,
  selectedConnectItem,
}: ManageHardwareProps) => {
  const {
    addLedgerAccount,
    removeLedgerAccount,
    renameLedgerAccount,
    ledgerAccountExists,
    getLedgerAccounts,
  } = useLedgerAccounts();
  const {
    getFeedback,
    setStatusCode,
    handleUnmount,
    getIsExecuting,
    resetStatusCode,
    handleGetAddress,
    transportResponse,
    handleResetLedgerTask,
  } = useLedgerHardware();

  // Default to Tangle mainnet
  const [directoryId, setDirectoryId] = useState<DirectoryId>('tangle');

  // Get SS58 format for the network
  const ss58Format = NetworkDirectory[directoryId].system.ss58Format;

  const [addresses, setAddresses] = useState<LedgerAccount[]>(
    getLedgerAccounts(directoryId)
  );
  const addressesRef = useRef(addresses);

  const [searchActive, setSearchActive] = useState<boolean>(false);

  const { txMetadataChainId } = getLedgerApp(directoryId);

  const activeChain = NetworkDirectory[directoryId as DirectoryId];
  const supportedChains = LedgerChains.map((a) => a.network);
  const isExecuting = getIsExecuting();

  const onSearchFocused = () => setSearchActive(true);
  const onSearchBlurred = () => setSearchActive(false);
  const showAddresses = !searchActive;

  const handleRename = (address: string, newName: string) => {
    renameLedgerAccount(directoryId, address, newName);
  };

  const handleRemove = (address: string) => {
    if (confirm('Are you sure you want to remove this account?')) {
      let newLedgerAddresses = getLocalLedgerAddresses();

      newLedgerAddresses = newLedgerAddresses.filter((a) => {
        if (a.address !== address) {
          return true;
        }
        if (a.network !== directoryId) {
          return true;
        }
        return false;
      });

      if (!newLedgerAddresses.length) {
        localStorage.removeItem('ledger_addresses');
      } else {
        localStorage.setItem(
          'ledger_addresses',
          JSON.stringify(newLedgerAddresses)
        );
      }

      removeLedgerAccount(directoryId, address);

      setStateWithRef(
        [...addressesRef.current.filter((a) => a.address !== address)],
        setAddresses,
        addressesRef
      );
    }
  };

  const getNextAddressIndex = () => {
    if (!addressesRef.current.length) {
      return 0;
    }
    return addressesRef.current[addressesRef.current.length - 1].index + 1;
  };

  const onGetAddress = async () => {
    await handleGetAddress(
      txMetadataChainId,
      getNextAddressIndex(),
      ss58Format
    );
  };

  const handleLedgerStatusResponse = (response: LedgerResponse) => {
    if (!response) {
      return;
    }

    const { ack, statusCode, body, options } = response;
    setStatusCode(ack, statusCode);

    if (statusCode === 'ReceivedAddress') {
      const newAddress = body.map(({ pubKey, address }: LedgerAddress) => ({
        index: options.accountIndex,
        pubKey,
        address,
        name: ellipsisFn(address),
        network: directoryId,
      }));

      setStateWithRef(
        [...addressesRef.current, ...newAddress],
        setAddresses,
        addressesRef
      );

      const newAddresses = getLocalLedgerAddresses()
        .filter((a: AnyJson) => {
          if (a.address !== newAddress[0].address) {
            return true;
          }
          if (a.network !== directoryId) {
            return true;
          }
          return false;
        })
        .concat(newAddress);
      localStorage.setItem('ledger_addresses', JSON.stringify(newAddresses));

      addLedgerAccount(
        directoryId,
        newAddress[0].address,
        options.accountIndex
      );

      resetStatusCode();
    }
  };

  const resetLedgerAccounts = () => {
    addressesRef.current.forEach((account) => {
      removeLedgerAccount(directoryId, account.address);
    });
    setStateWithRef([], setAddresses, addressesRef);
  };

  const feedback = getFeedback();

  useEffectIgnoreInitial(() => {
    handleLedgerStatusResponse(transportResponse);
  }, [transportResponse]);

  useEffectIgnoreInitial(() => {
    if (selectedConnectItem !== 'ledger') {
      setSearchActive(false);
    }
  }, [selectedConnectItem]);

  useEffect(
    () => () => {
      handleUnmount();
    },
    []
  );

  return (
    <>
      <motion.div {...getMotionProps('address_config', true)}>
        <ChainSearchInput
          activeChain={activeChain}
          directoryId={directoryId}
          setDirectoryId={setDirectoryId}
          onSearchFocused={onSearchFocused}
          onSearchBlurred={onSearchBlurred}
          supportedChains={supportedChains}
        />
      </motion.div>

      <motion.div {...getMotionProps('address_config', !searchActive)}>
        <SubHeadingWrapper className="noBorder">
          <ImportButtonWrapper>
            {addressesRef.current.length > 0 && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to remove all Tangle ledger accounts?'
                    )
                  ) {
                    resetLedgerAccounts();
                  }
                }}
              >
                <CloudIcon
                  icon={iconSquareMinus}
                  style={{ marginRight: '0.4rem' }}
                />
                Reset
              </button>
            )}
            <button
              onClick={async () => {
                if (!isExecuting) {
                  await onGetAddress();
                } else {
                  handleResetLedgerTask();
                }
              }}
            >
              <CloudIcon
                icon={iconUsbDrive}
                style={{ marginRight: '0.4rem' }}
              />
              {isExecuting ? 'Cancel Import' : 'Import Next Account'}
            </button>
          </ImportButtonWrapper>
        </SubHeadingWrapper>
        <SubHeadingWrapper>
          <h5>
            {feedback?.message ||
              `${addressesRef.current.length || 'No'} ${
                addressesRef.current.length === 1 ? 'Account' : 'Accounts'
              }`}
          </h5>
        </SubHeadingWrapper>
      </motion.div>

      <motion.div {...getMotionProps('address', showAddresses)}>
        {addressesRef.current.map(({ name, address }: LedgerAccount, i) => (
          <HardwareAddress
            key={`ledger_imported_${i}`}
            network="tangle"
            address={address}
            index={0}
            initial={name}
            Identicon={<Polkicon address={address} fontSize="2.1rem" />}
            existsHandler={ledgerAccountExists}
            renameHandler={handleRename}
            onRemove={handleRemove}
            onConfirm={() => undefined}
          />
        ))}
      </motion.div>
    </>
  );
};
