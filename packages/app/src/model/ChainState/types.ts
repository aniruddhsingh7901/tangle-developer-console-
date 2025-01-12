// // Copyright 2024 @polkadot-cloud/polkadot-developer-console authors & contributors
// // SPDX-License-Identifier: AGPL-3.0

// import type { AnyJson } from '@w3ux/types';
// import type { ApiInstanceId } from 'model/Api/types';
// import type { OwnerId } from 'types';

// export type StorageType = StorageSubscriptionType | 'constant';

// export type StorageSubscriptionType = 'raw' | 'storage';

// export interface SubscriptionCallConfig {
//   namespace: string;
//   method: string;
//   args: AnyJson[];
// }

// // Configuration for storage subscriptions.
// export type SubscriptionConfig = SubscriptionCallConfig & {
//   type: StorageSubscriptionType;
//   pinned?: boolean;
// };

// export interface ConstantResult {
//   key: string;
//   value: ConstantEntry;
// }

// export type ChainStateEventDetail = SubscriptionCallConfig & {
//   ownerId: OwnerId;
//   instanceId: ApiInstanceId;
//   type: StorageSubscriptionType;
//   timestamp: number;
//   key: string;
//   result: AnyJson;
//   pinned?: boolean;
// };

// export type ChainStateConstantEventDetail = ChainStateEntry & {
//   key: string;
//   ownerId: OwnerId;
//   instanceId: ApiInstanceId;
// };

// export interface ChainStateEntry {
//   type: StorageType;
//   timestamp: number;
//   result: AnyJson;
//   pinned: boolean;
// }
// export type SubscriptionEntry = ChainStateEntry & SubscriptionCallConfig;

// export type ConstantEntry = ChainStateEntry;

// export type SubscriptionType = 'subscription' | 'constant';

// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { AnyJson } from '@w3ux/types';
import type { ApiInstanceId } from 'model/Api/types';
import type { OwnerId } from 'types';

export interface TangleSpecificConstants {
  chainId: number;
  ss58Prefix: number;
  tokenDecimals: number;
  tokenSymbol: string;
}

export type StorageType = StorageSubscriptionType | 'constant';

export type StorageSubscriptionType = 'raw' | 'storage';

export interface SubscriptionCallConfig {
  namespace: string;
  method: string;
  args: AnyJson[];
}

// Configuration for storage subscriptions.
export type SubscriptionConfig = SubscriptionCallConfig & {
  type: StorageSubscriptionType;
  pinned?: boolean;
};

export interface ConstantResult {
  key: string;
  value: ConstantEntry;
}

export type ChainStateEventDetail = SubscriptionCallConfig & {
  ownerId: OwnerId;
  instanceId: ApiInstanceId;
  type: StorageSubscriptionType;
  timestamp: number;
  key: string;
  result: AnyJson;
  pinned?: boolean;
};

export type ChainStateConstantEventDetail = ChainStateEntry & {
  key: string;
  ownerId: OwnerId;
  instanceId: ApiInstanceId;
};

export interface ChainStateEntry {
  type: StorageType;
  timestamp: number;
  result: AnyJson;
  pinned: boolean;
}

export type SubscriptionEntry = ChainStateEntry & SubscriptionCallConfig;

export type ConstantEntry = ChainStateEntry;

export type SubscriptionType = 'subscription' | 'constant';

// Tangle-specific types
export interface TangleNetworkMetadata {
  chainId: number;
  tokenSymbol: string;
  tokenDecimals: number;
  ss58Format: number;
}

export interface TangleStorageEntry extends ChainStateEntry {
  network: TangleNetworkMetadata;
}

export interface TangleSubscriptionResult {
  blockNumber?: number;
  blockHash?: string;
  result: AnyJson;
  timestamp: number;
}
