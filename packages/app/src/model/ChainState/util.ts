// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

// Define interface for chain state
interface TangleChainState {
  balance?: string | number;
  blockNumber?: {
    toNumber(): number;
  };
  [key: string]: unknown; // Allow for additional properties
}

interface FormattedChainState extends Record<string, unknown> {
  network: 'tangle';
  formatted: {
    balance: string;
    blockNumber?: number;
  };
}

// Destructure subscription key into index key.
export const splitSubscriptionKey = (
  subscriptionKey: string
): [string, string] => {
  const result = subscriptionKey.split('_');
  return [result[0] || '', result[1] || ''];
};

// Destructure subscription key into index key.
export const splitConstantKey = (
  constantKey: string
): [string, string, string] => {
  const result = constantKey.split('_');
  return [result[0] || '', result[1] || '', result[2] || ''];
};

// Tangle-specific utility functions
export const isTangleAddress = (address: string): boolean =>
  address.startsWith('tg');

export const formatTangleBalance = (
  balance: string | number,
  decimals = 18
): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return (num / Math.pow(10, decimals)).toFixed(6);
};

export const validateTangleEndpoint = (endpoint: string): boolean =>
  endpoint.includes('tangle.tools') || endpoint.includes('tangle-mainnet');

export const getTangleNetworkType = (
  endpoint: string
): 'mainnet' | 'testnet' =>
  endpoint.includes('testnet') ? 'testnet' : 'mainnet';

// Format chain state for Tangle network
export const formatTangleChainState = (
  state: TangleChainState | null
): FormattedChainState | null => {
  if (!state) {
    return null;
  }

  return {
    ...state,
    network: 'tangle',
    formatted: {
      balance: state.balance ? formatTangleBalance(state.balance) : '0',
      blockNumber: state.blockNumber?.toNumber(),
    },
  };
};
