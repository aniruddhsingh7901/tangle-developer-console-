// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { DirectoryId, NetworkDirectoryItem } from './types';

export const NetworkDirectory: Record<DirectoryId, NetworkDirectoryItem> = {
  tangle: {
    system: {
      chain: 'Tangle',
      ss58Format: 42,
      units: 18,
      unit: 'TNT',
    },
    name: 'Tangle Network',
    color: '#8585F6',
    providers: {
      'Tangle RPC': 'wss://rpc.tangle.tools',
      Dwellir: 'wss://tangle-mainnet-rpc.dwellir.com',
    },
    isRelayChain: true,
    smoldot: {
      relayChain: 'tangle',
    },
  },
  'tangle-testnet': {
    system: {
      chain: 'Tangle Testnet',
      ss58Format: 42,
      units: 18,
      unit: 'TNT',
    },
    name: 'Tangle Testnet',
    initial: 'T',
    color: '#8585F6',
    providers: {
      'Tangle Testnet': 'wss://testnet-rpc.tangle.tools',
    },
    isRelayChain: false,
    smoldot: {
      relayChain: 'tangle-testnet',
    },
  },
};

export type { NetworkDirectoryItem };
export type { NetworkDirectoryItemSystem } from './types';
