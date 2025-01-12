// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

export type DirectoryId = 'tangle' | 'tangle-testnet';
export type ChainId = DirectoryId | 'custom';

export interface NetworkDirectoryItemSystem {
  chain: string;
  ss58Format: number;
  units: number;
  unit: string;
}

export interface NetworkDirectoryItem {
  system: NetworkDirectoryItemSystem;
  name: string;
  initial?: string;
  color: string;
  providers: Record<string, string>;
  isRelayChain?: boolean;
  smoldot?: {
    relayChain: string;
  };
  relayChain?: DirectoryId;
}

export interface TangleNetworkConfig {
  mainnet: NetworkDirectoryItem;
  testnet: NetworkDirectoryItem;
}

export interface TangleProviders {
  mainnet: Record<string, string>;
  testnet: Record<string, string>;
}

export interface ChainSystemProperties {
  ss58Format: number;
  tokenDecimals: number;
  tokenSymbol: string;
  chainId: number;
}
