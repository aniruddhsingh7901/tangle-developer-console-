// // Copyright 2024 @polkadot-cloud/polkadot-developer-console authors & contributors
// // SPDX-License-Identifier: AGPL-3.0

// import type { ApiInstanceId } from 'model/Api/types';
// import { ChainState } from 'model/ChainState';
// import type { OwnerId } from 'types';

// export class ChainStateController {
//   // ------------------------------------------------------
//   // Class members.
//   // ------------------------------------------------------
//   // The currently instantiated chain state instances, keyed by ownerId.
//   static instances: Record<ApiInstanceId, ChainState> = {};

//   // ------------------------------------------------------
//   // Getters.
//   // ------------------------------------------------------

//   // Get subscriptions from an instance.
//   static getSubscriptions(instanceId?: ApiInstanceId) {
//     return !instanceId
//       ? {}
//       : this.instances?.[instanceId]?.getEntries('subscription') || {};
//   }

//   // Get constants from an instance.
//   static getConstants(instanceId?: ApiInstanceId) {
//     return !instanceId
//       ? {}
//       : this.instances?.[instanceId]?.getEntries('constant') || {};
//   }

//   // ------------------------------------------------------
//   // Chain state instance methods.
//   // ------------------------------------------------------

//   // Instantiate a new `ChainState` instance with the supplied ownerId.
//   static async instantiate(ownerId: OwnerId, instanceId: ApiInstanceId) {
//     if (this.instances[instanceId]) {
//       this.destroy(instanceId);
//     }

//     this.instances[instanceId] = new ChainState(ownerId, instanceId);
//   }

//   // Gracefully disconnect and then destroy an api instance.
//   static destroy(instanceId: ApiInstanceId) {
//     const instance = this.instances[instanceId];
//     if (instance) {
//       instance.unsubscribeAll();
//       delete this.instances[instanceId];
//     }
//   }
// }

// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { ApiInstanceId } from 'model/Api/types';
import { ChainState } from 'model/ChainState';
import type { OwnerId } from 'types';

export class ChainStateController {
  // ------------------------------------------------------
  // Class members - Tangle Network State Management
  // ------------------------------------------------------

  // The currently instantiated Tangle chain state instances, keyed by ownerId.
  static instances: Record<ApiInstanceId, ChainState> = {};

  // ------------------------------------------------------
  // Getters for Tangle Chain State
  // ------------------------------------------------------

  // Get active subscriptions from a Tangle instance
  static getSubscriptions(instanceId?: ApiInstanceId) {
    return !instanceId
      ? {}
      : this.instances?.[instanceId]?.getEntries('subscription') || {};
  }

  // Get Tangle network constants from an instance
  static getConstants(instanceId?: ApiInstanceId) {
    return !instanceId
      ? {}
      : this.instances?.[instanceId]?.getEntries('constant') || {};
  }

  // ------------------------------------------------------
  // Tangle Chain State Instance Methods
  // ------------------------------------------------------

  // Instantiate a new Tangle `ChainState` instance with the supplied ownerId.
  static async instantiate(ownerId: OwnerId, instanceId: ApiInstanceId) {
    // Destroy existing instance if it exists
    if (this.instances[instanceId]) {
      await this.destroy(instanceId);
    }

    // Create new Tangle chain state instance
    this.instances[instanceId] = new ChainState(ownerId, instanceId);
  }

  // Gracefully disconnect and destroy a Tangle chain state instance
  static async destroy(instanceId: ApiInstanceId) {
    const instance = this.instances[instanceId];
    if (instance) {
      // Cleanup all subscriptions
      await instance.unsubscribeAll();
      // Remove instance
      delete this.instances[instanceId];
    }
  }

  // ------------------------------------------------------
  // Tangle-specific Helpers
  // ------------------------------------------------------

  // Validate if instance is connected to Tangle network
  static isTangleInstance(instanceId: ApiInstanceId): boolean {
    const instance = this.instances[instanceId];
    return instance?.isConnectedToTangle() || false;
  }

  // Get Tangle-specific chain constants
  static getTangleConstants(instanceId?: ApiInstanceId) {
    if (!instanceId || !this.isTangleInstance(instanceId)) {
      return {};
    }
    return this.instances[instanceId]?.getTangleSpecificConstants() || {};
  }
}
