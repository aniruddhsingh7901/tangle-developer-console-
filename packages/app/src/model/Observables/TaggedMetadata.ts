// Copyright 2024 @polkadot-cloud/polkadot-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import { getLookupFn } from '@polkadot-api/metadata-builders';
import type { AnyJson, VoidFn } from '@w3ux/types';
import { ApiController } from 'controllers/Api';
import type { ObservableGetter } from 'controllers/Subscriptions/types';
import type { ApiInstanceId } from 'model/Api/types';
import { getIndexFromInstanceId } from 'model/Api/util';
import type { OwnerId } from 'types';

export class TaggedMetadata implements ObservableGetter {
  // ------------------------------------------------------
  // Class members.
  // ------------------------------------------------------

  // The associated owner for this instance.
  #ownerId: OwnerId;

  // The associated api instance for this instance.
  #instanceId: ApiInstanceId;

  // Unsubscribe object.
  #unsub: VoidFn;

  // Data to be returned.
  #value: AnyJson = null;

  // ------------------------------------------------------
  // Constructor.
  // ------------------------------------------------------

  constructor(ownerId: OwnerId, instanceId: ApiInstanceId) {
    this.#ownerId = ownerId;
    this.#instanceId = instanceId;
  }

  get = async () =>
    new Promise((resolve, reject) => {
      try {
        const client = ApiController.getInstanceApi(
          this.#ownerId,
          getIndexFromInstanceId(this.#instanceId),
          true
        );

        const observable = client.chainHead$().metadata$;

        // Handle subscription failure.
        const error = async () => {
          reject(null);
        };

        // Handle completion.
        const complete = async () => {
          resolve(this.#value);
        };

        const subscription = observable.subscribe({
          next: async (data: AnyJson) => {
            if (!data) {
              return;
            }
            // Check if this is the correct data to persist, return `null` otherwise.
            if (
              !('lookup' in data) ||
              !('pallets' in data) ||
              !('extrinsic' in data) ||
              !('type' in data) ||
              !('apis' in data) ||
              !('outerEnums' in data) ||
              !('custom' in data)
            ) {
              reject(null);
            } else {
              // Persist data to class. NOTE: Currently not using `LookupEntry`, can explore this
              // later.
              this.#value = getLookupFn(data)?.metadata || null;
            }

            // Call `complete` to stop observable emissions & resolve function.
            subscription.complete();
          },
          error,
          complete,
        });

        this.#unsub = subscription.unsubscribe;
      } catch (e) {
        reject(null);
      }
    });

  // ------------------------------------------------------
  // Unsubscribe handler.
  // ------------------------------------------------------

  // Unsubscribe from class subscription.
  unsubscribe = (): void => {
    if (typeof this.#unsub === 'function') {
      this.#unsub();
    }
  };
}
