// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { TabChainData } from 'contexts/Tabs/types';
import type { IntegrityCheckedChainContext } from './types';
import { dummyChainSpec } from 'contexts/ChainSpaceEnv/defaults';
import type { ApiPromise } from '@polkadot/api';

// Default chain values for Tangle Network
export const dummyChain: TabChainData = {
  id: 'tangle',
  endpoint: 'wss://rpc.tangle.tools',
  ss58Format: 42, // Changed from ss58
  units: 18,
  unit: 'TNT',
  api: {
    instanceIndex: 0,
  },
};

// Secondary testnet configuration
export const dummyChainTestnet: TabChainData = {
  id: 'tangle-testnet',
  endpoint: 'wss://testnet-rpc.tangle.tools',
  ss58Format: 42,
  units: 18,
  unit: 'TNT',
  api: {
    instanceIndex: 1,
  },
};

export const defaultChainContextInterface: IntegrityCheckedChainContext = {
  chain: dummyChain,
  chainSpec: dummyChainSpec,
  instanceId: 'tab_0_0',
  api: {} as ApiPromise,
};

// Chain configuration constants
export const TANGLE_CHAIN_CONSTANTS = {
  MAINNET: {
    CHAIN_ID: 5845,
    TOKEN_DECIMALS: 18,
    TOKEN_SYMBOL: 'TNT',
    SS58_FORMAT: 42,
  },
  TESTNET: {
    CHAIN_ID: 5846,
    TOKEN_DECIMALS: 18,
    TOKEN_SYMBOL: 'TNT',
    SS58_FORMAT: 42,
  },
};
