// // Copyright 2024 @tangle-developer-console authors & contributors
// // SPDX-License-Identifier: AGPL-3.0

// import type { ChainId } from 'config/networks/types';
// import type { ApiIndexLabel } from 'contexts/ApiIndexer/types';
// import type { Api } from 'model/Api';
// import type {
//   APIChainSpec,
//   ApiInstanceId,
//   ApiStatus,
//   TangleChainProperties
// } from 'model/Api/types';
// import type { OwnerId } from 'types';

// export interface ChainSpaceEnvContextInterface {
//   handleConnectApi: (
//     ownerId: OwnerId,
//     label: ApiIndexLabel,
//     chainId: ChainId,
//     provider: string
//   ) => Promise<void>;
//   getApiStatus: (instanceId?: ApiInstanceId) => ApiStatus;
//   getChainSpec: (instanceId?: ApiInstanceId) => APIChainSpec | undefined;
//   getPalletVersions: (ownerId: OwnerId) => Record<string, string> | undefined;
//   getApiInstanceById: (instanceId: ApiInstanceId) => Api | undefined;
//   getApiInstance: (ownerId: OwnerId, label: ApiIndexLabel) => Api | undefined;
//   destroyApiInstance: (ownerId: OwnerId, label: ApiIndexLabel) => void;
//   destroyAllApiInstances: (ownerId: OwnerId) => void;
//   instantiateApiFromTab: (tabId: number) => void;
//   getConnectedChains: () => ConnectedChain[];
//   getChainIdCaip: (chainId: string) => string;
//   allActiveChainsConnected: () => boolean;
//   // Tangle-specific methods
//   isTangleNetwork: (chainId: ChainId) => boolean;
//   getTangleProperties: (chainId: ChainId) => TangleChainProperties | undefined;
// }

// export interface ConnectedChain {
//   specName: string;
//   genesisHash: string;
// }

// export interface ChainSpaceEnvProps {
//   children: React.ReactNode;
//   chains?: Record<number, ChainId>;
// }

// export type TabToApiIndexes = Record<number, number[]>;

// export type ChainSpaceChainSpecs = Record<ApiInstanceId, APIChainSpec>;

// export type ChainSpaceApiStatuses = Record<ApiInstanceId, ApiStatus>;

// // Store versions of pallets. {ownerId: { palletName: version }}.
// export type PalletVersions = Record<OwnerId, Record<string, string>>;

// // Tangle-specific types
// export interface TangleChainState {
//   blockNumber: number;
//   blockHash: string;
//   finalized: boolean;
//   timestamp: number;
// }

// export interface TangleChainConnection {
//   status: ApiStatus;
//   chainId: number;
//   networkType: 'mainnet' | 'testnet';
//   properties: TangleChainProperties;
// }

// export type TangleChainStateMap = Record<ApiInstanceId, TangleChainState>;

// export type TangleConnectionMap = Record<ApiInstanceId, TangleChainConnection>;

// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { ChainId } from 'config/networks/types';
import type { ApiIndexLabel } from 'contexts/ApiIndexer/types';
import type { Api } from 'model/Api';
import type { APIChainSpec, ApiInstanceId, ApiStatus } from 'model/Api/types';
import type { OwnerId } from 'types';

// Define and export TangleChainProperties
export interface TangleChainProperties {
  ss58Format: number;
  tokenDecimals: number;
  tokenSymbol: string;
  chainId: number;
}

export interface ChainSpaceEnvContextInterface {
  handleConnectApi: (
    ownerId: OwnerId,
    label: ApiIndexLabel,
    chainId: ChainId,
    provider: string
  ) => Promise<void>;
  getApiStatus: (instanceId?: ApiInstanceId) => ApiStatus;
  getChainSpec: (instanceId?: ApiInstanceId) => APIChainSpec | undefined;
  getPalletVersions: (ownerId: OwnerId) => Record<string, string> | undefined;
  getApiInstanceById: (instanceId: ApiInstanceId) => Api | undefined;
  getApiInstance: (ownerId: OwnerId, label: ApiIndexLabel) => Api | undefined;
  destroyApiInstance: (ownerId: OwnerId, label: ApiIndexLabel) => void;
  destroyAllApiInstances: (ownerId: OwnerId) => void;
  instantiateApiFromTab: (tabId: number) => void;
  getConnectedChains: () => ConnectedChain[];
  getChainIdCaip: (chainId: string) => string;
  allActiveChainsConnected: () => boolean;
  // Tangle-specific methods
  isTangleNetwork: (chainId: ChainId) => boolean;
  getTangleProperties: (chainId: ChainId) => TangleChainProperties | undefined;
}

export interface ConnectedChain {
  specName: string;
  genesisHash: string;
}

export interface ChainSpaceEnvProps {
  children: React.ReactNode;
  chains?: Record<number, ChainId>;
}

export interface TangleChainState {
  blockNumber: number;
  blockHash: string;
  finalized: boolean;
  timestamp: number;
}

export interface TangleChainConnection {
  status: ApiStatus;
  chainId: number;
  networkType: 'mainnet' | 'testnet';
  properties: TangleChainProperties;
}

export type TabToApiIndexes = Record<number, number[]>;

export type ChainSpaceChainSpecs = Record<ApiInstanceId, APIChainSpec>;

export type ChainSpaceApiStatuses = Record<ApiInstanceId, ApiStatus>;

export type PalletVersions = Record<OwnerId, Record<string, string>>;

export type TangleChainStateMap = Record<ApiInstanceId, TangleChainState>;

export type TangleConnectionMap = Record<ApiInstanceId, TangleChainConnection>;
