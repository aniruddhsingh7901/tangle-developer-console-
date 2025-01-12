// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { LedgerChain, LedgerHardwareContextInterface } from './types';
import type { DirectoryId } from 'config/networks/types';

// The supported networks and the corresponding Ledger app name.
export const LedgerChains: LedgerChain[] = [
  {
    network: 'tangle' as DirectoryId,
    txMetadataChainId: 'tnt',
  },
  {
    network: 'tangle-testnet' as DirectoryId,
    txMetadataChainId: 'ttnt',
  },
];

// Default empty feedback message.
export const defaultFeedback = {
  message: null,
  helpKey: null,
};

// Default ledger hardware context interface.
export const defaultLedgerHardwareContext: LedgerHardwareContextInterface = {
  transportResponse: null,
  integrityChecked: false,
  setIntegrityChecked: (checked) => {},
  checkRuntimeVersion: async (txMetadataChainId, transactionVersion) =>
    new Promise((resolve) => resolve()),
  setStatusCode: (ack, newStatusCode) => {},
  setIsExecuting: (val) => {},
  getIsExecuting: () => false,
  getStatusCode: () => null,
  resetStatusCode: () => {},
  getFeedback: () => defaultFeedback,
  setFeedback: (message, helpKey) => {},
  resetFeedback: () => {},
  handleUnmount: () => {},
  handleErrors: (err) => {},
  handleGetAddress: async (txMetadataChainId, accountIndex, ss58Format) =>
    new Promise((resolve) => resolve()),
  handleSignTx: async (txMetadataChainId, uid, index, payload, txMetadata) =>
    new Promise((resolve) => resolve()),
  handleResetLedgerTask: () => {},
  runtimesInconsistent: false,
};
