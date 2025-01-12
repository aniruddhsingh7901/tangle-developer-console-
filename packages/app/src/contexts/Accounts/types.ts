// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { ImportedAccount } from '@w3ux/react-connect-kit/types';
import type BigNumber from 'bignumber.js';
import type { ActiveBalancesInterface } from 'hooks/useActiveBalances/types';
import type { BalanceLock, Balances } from 'model/AccountBalances/types';
import type { APIChainSpec } from 'model/Api/types';

// Network type for Tangle
export type TangleNetwork = 'mainnet' | 'testnet';

// Extended account interface for Tangle
export type TangleAccount = ImportedAccount & {
  networkType: TangleNetwork;
  chainId: number;
};

// Main context interface
export type AccountsContextInterface = ActiveBalancesInterface & {
  getAccounts: (chainSpec?: APIChainSpec) => ImportedAccount[];
  getTangleAccounts?: (networkType?: TangleNetwork) => TangleAccount[];
};

// Account balances, keyed by address
export type AccountBalancesState = Record<string, Balances>;

// Balance locks interface
export interface BalanceLocks {
  locks: BalanceLock[];
  maxLock: BigNumber;
}

// Tangle-specific balance types
export interface TangleBalances extends Balances {
  evm?: {
    balance: BigNumber;
    nonce: number;
  };
}

// Changed from interface with index signature to Record type
export type TangleAccountBalancesState = Record<string, TangleBalances>;
