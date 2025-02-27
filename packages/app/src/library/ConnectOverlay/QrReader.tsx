// Copyright 2024 @polkadot-cloud/polkadot-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import { QrScanSignature } from 'library/QRCode/ScanSignature';
import { ImportQRWrapper } from './Wrappers';
import type { QrReaderProps } from './types';
import { useEffect, useState } from 'react';
import type { AnyJson } from '@w3ux/types';
import { isValidAddress, formatAccountSs58 } from '@w3ux/utils';
import { useVaultAccounts } from '@w3ux/react-connect-kit';

export const QrReader = ({
  directoryId,
  importActive,
  activeChain,
  onSuccess,
}: QrReaderProps) => {
  const { addVaultAccount, vaultAccountExists, vaultAccounts } =
    useVaultAccounts();

  // Store data from QR Code scanner.
  const [qrData, setQrData] = useState<AnyJson>(undefined);

  const ss58Format = activeChain?.system.ss58Format || 0;

  // Handle a newly received QR signature.
  const handleQrData = (signature: string) => {
    setQrData(signature.split(':')?.[1] || '');
  };

  const valid =
    isValidAddress(qrData) &&
    !vaultAccountExists(directoryId, qrData) &&
    formatAccountSs58(qrData, ss58Format) !== null;

  useEffect(() => {
    // Add account and close overlay if valid.
    if (valid) {
      const account = addVaultAccount(
        directoryId,
        qrData,
        vaultAccounts.length
      );
      if (account) {
        onSuccess();
      }
    }
  });

  const exists = vaultAccountExists(directoryId, qrData);

  // Display feedback.
  const feedback =
    qrData === undefined
      ? 'Waiting for QR Code'
      : isValidAddress(qrData)
        ? formatAccountSs58(qrData, ss58Format) === null
          ? 'Different Network Address'
          : exists
            ? 'Account Already Imported'
            : 'Address Received'
        : 'Invalid Address';

  return (
    <ImportQRWrapper>
      {importActive && (
        <>
          <div className="qrRegion">
            <QrScanSignature
              size={250}
              onScan={({ signature }) => handleQrData(signature)}
            />
          </div>
          <h4>{feedback}</h4>
        </>
      )}
    </ImportQRWrapper>
  );
};
