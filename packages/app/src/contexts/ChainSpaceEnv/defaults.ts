// // Copyright 2024 @tangle-developer-console authors & contributors
// // SPDX-License-Identifier: AGPL-3.0
// /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

// import type { APIChainSpec } from 'model/Api/types';
// import type { ChainSpaceEnvContextInterface } from './types';
// import type { ChainId } from 'config/networks/types';

// export const defaultChainSpaceEnvContext: ChainSpaceEnvContextInterface = {
//   getApiStatus: (instanceId) => 'disconnected',
//   getChainSpec: (instanceId) => undefined,
//   getPalletVersions: (ownerId) => undefined,
//   handleConnectApi: (ownerId, label, chainId, provider) => Promise.resolve(),
//   getApiInstanceById: (instanceId) => undefined,
//   getApiInstance: (ownerId, label) => undefined,
//   destroyApiInstance: (ownerId, label) => {},
//   destroyAllApiInstances: (ownerId) => {},
//   instantiateApiFromTab: (tabId) => {},
//   getConnectedChains: () => [],
//   getChainIdCaip: (chainId) => '',
//   allActiveChainsConnected: () => false,
// };

// // Default chain specification for Tangle Network
// export const dummyChainSpec: APIChainSpec = {
//   chain: 'Tangle Network',
//   version: {
//     apis: {},
//     authoringVersion: 0,
//     implName: 'tangle-node',
//     implVersion: 0,
//     specName: 'tangle' as ChainId,
//     specVersion: 0,
//     stateVersion: 0,
//     transactionVersion: 0,
//   },
//   ss58Format: 42,
//   tokenDecimals: 18,
//   tokenSymbol: 'TNT',
//   chainId: 5845,
//   metadata: {},
//   consts: {},
// };

// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { APIChainSpec } from 'model/Api/types';
import type {
  ChainSpaceEnvContextInterface,
  TangleChainProperties,
} from './types';
import type { ChainId } from 'config/networks/types';

export const defaultChainSpaceEnvContext: ChainSpaceEnvContextInterface = {
  getApiStatus: (instanceId) => 'disconnected',
  getChainSpec: (instanceId) => undefined,
  getPalletVersions: (ownerId) => undefined,
  handleConnectApi: (ownerId, label, chainId, provider) => Promise.resolve(),
  getApiInstanceById: (instanceId) => undefined,
  getApiInstance: (ownerId, label) => undefined,
  destroyApiInstance: (ownerId, label) => {},
  destroyAllApiInstances: (ownerId) => {},
  instantiateApiFromTab: (tabId) => {},
  getConnectedChains: () => [],
  getChainIdCaip: (chainId) => '',
  allActiveChainsConnected: () => false,
  // New Tangle-specific methods
  isTangleNetwork: () => false,
  getTangleProperties: () => undefined as TangleChainProperties | undefined,
  //getTangleNetworkType: () => 'mainnet' as const,
};

// Default chain specification for Tangle Network
export const dummyChainSpec: APIChainSpec = {
  chain: 'Tangle Network',
  version: {
    apis: {},
    authoringVersion: 0,
    implName: 'tangle-node',
    implVersion: 0,
    specName: 'tangle' as ChainId,
    specVersion: 0,
    stateVersion: 0,
    transactionVersion: 0,
  },
  ss58Format: 42,
  tokenDecimals: 18,
  tokenSymbol: 'TNT',
  chainId: 5845,
  metadata: {},
  consts: {},
};

// Types for Tangle-specific methods
export interface TangleContextExtension {
  isTangleNetwork: () => boolean;
  getTangleProperties: () => TangleChainProperties | undefined;
  getTangleNetworkType: () => 'mainnet' | 'testnet';
}
