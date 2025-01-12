// // Copyright 2024 @tangle-developer-console authors & contributors
// // SPDX-License-Identifier: AGPL-3.0

// import type { AnyJson } from '@w3ux/types';
// import type { ChainId, ChainSystemProperties } from 'config/networks/types';
// import type { MetadataVersion } from 'controllers/Metadata/types';
// import type { ChainSpaceId, OwnerId } from 'types';

// // Tangle Network Types
// export type TangleNetworkType = 'mainnet' | 'testnet';

// export interface TangleChainProperties extends ChainSystemProperties {
//   ss58Format: number;
//   tokenDecimals: number;
//   tokenSymbol: string;
//   chainId: number;
// }

// export interface TangleApiConfig {
//   endpoint: string;
//   networkType: TangleNetworkType;
//   properties: TangleChainProperties;
// }

// // API Types
// export type PapiObservableClient = any; // TODO: Replace with actual type
// export type PapiDynamicBuilder = any; // TODO: Replace with actual type
// export type ApiInstanceId = string;
// export type ApiStatus = 'connecting' | 'connected' | 'disconnected' | 'ready';
// export type EventStatus = ApiStatus | 'error' | 'destroyed';
// export type ErrDetail =
//   | 'InitializationError'
//   | 'ChainSpecError'
//   | 'InvalidTangleNetwork';
// export type ApiStatusState = Record<ApiInstanceId, ApiStatus>;
// export type ChainSpecState = Record<ApiInstanceId, APIChainSpec>;

// // API Event Details
// export interface APIStatusEventDetail {
//   event: EventStatus;
//   chainSpaceId: ChainSpaceId;
//   ownerId: OwnerId;
//   instanceId: ApiInstanceId;
//   chainId: ChainId;
//   err?: ErrDetail;
// }

// export interface APIChainSpecEventDetail {
//   chainSpaceId: ChainSpaceId;
//   ownerId: OwnerId;
//   instanceId: ApiInstanceId;
//   spec: APIChainSpec | undefined;
//   consts: Record<string, AnyJson>;
// }

// // Chain Specification Types
// export interface APIChainSpec extends TangleChainProperties {
//   chain: string | null;
//   version: APIChainSpecVersion;
//   metadata: MetadataVersion | AnyJson;
//   consts: AnyJson;
// }

// export interface APIChainSpecVersion {
//   apis: AnyJson;
//   authoringVersion: number;
//   implName: string;
//   implVersion: number;
//   specName: ChainId;
//   specVersion: number;
//   stateVersion: number;
//   transactionVersion: number;
// }

// // Tangle-specific Types
// export interface TangleNetworkEventDetail {
//   networkType: TangleNetworkType;
//   endpoint: string;
//   properties: TangleChainProperties;
// }

// export interface TangleBalanceEventDetail {
//   address: string;
//   total: string;
//   free: string;
//   reserved: string;
//   miscFrozen: string;
//   feeFrozen: string;
// }

// // API Response Types
// export interface TangleApiResponse<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
// }

// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { ChainId, ChainSystemProperties } from 'config/networks/types';
import type { MetadataVersion } from 'controllers/Metadata/types';
import type { ChainSpaceId, OwnerId } from 'types';
import type { Observable } from 'rxjs';
import type { Codec } from '@polkadot/types/types';

// Papi Types to replace 'any'
export interface PapiObservableClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query: Record<
    string,
    Record<string, (...args: unknown[]) => Observable<Codec>>
  >;
  consts: Record<string, Record<string, Codec>>;
  registry: {
    chainTokens: string[];
  };
}

export interface PapiDynamicBuilder {
  buildConstant(
    pallet: string,
    name: string
  ): {
    dec(value: string): string | undefined;
  };
}

// Tangle Network Types
export type TangleNetworkType = 'mainnet' | 'testnet';

export interface TangleChainProperties extends ChainSystemProperties {
  ss58Format: number;
  tokenDecimals: number;
  tokenSymbol: string;
  chainId: number;
}

export interface TangleApiConfig {
  endpoint: string;
  networkType: TangleNetworkType;
  properties: TangleChainProperties;
}

// API Types
export type ApiInstanceId = string;
export type ApiStatus = 'connecting' | 'connected' | 'disconnected' | 'ready';
export type EventStatus = ApiStatus | 'error' | 'destroyed';
export type ErrDetail =
  | 'InitializationError'
  | 'ChainSpecError'
  | 'InvalidTangleNetwork';
export type ApiStatusState = Record<ApiInstanceId, ApiStatus>;
export type ChainSpecState = Record<ApiInstanceId, APIChainSpec>;

// API Event Details
export interface APIStatusEventDetail {
  event: EventStatus;
  chainSpaceId: ChainSpaceId;
  ownerId: OwnerId;
  instanceId: ApiInstanceId;
  chainId: ChainId;
  err?: ErrDetail;
}

export interface APIChainSpecEventDetail {
  chainSpaceId: ChainSpaceId;
  ownerId: OwnerId;
  instanceId: ApiInstanceId;
  spec: APIChainSpec | undefined;
  consts: Record<string, unknown>; // Replaced AnyJson with unknown for better type safety
}

// Chain Specification Types
export interface APIChainSpec extends TangleChainProperties {
  chain: string | null;
  version: APIChainSpecVersion;
  metadata: MetadataVersion | Record<string, unknown>; // Replaced AnyJson
  consts: Record<string, unknown>; // Replaced AnyJson
}

export interface APIChainSpecVersion {
  apis: [string, number][]; // Replaced AnyJson with specific tuple type
  authoringVersion: number;
  implName: string;
  implVersion: number;
  specName: ChainId;
  specVersion: number;
  stateVersion: number;
  transactionVersion: number;
}

// Tangle-specific Types
export interface TangleNetworkEventDetail {
  networkType: TangleNetworkType;
  endpoint: string;
  properties: TangleChainProperties;
}

export interface TangleBalanceEventDetail {
  address: string;
  total: string;
  free: string;
  reserved: string;
  miscFrozen: string;
  feeFrozen: string;
}

// API Response Types
export interface TangleApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
