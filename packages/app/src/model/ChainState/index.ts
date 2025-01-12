// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { VoidFn } from '@polkadot/api/types';
import { ApiController } from 'controllers/Api';
import type {
  ChainStateConstantEventDetail,
  ChainStateEventDetail,
  ConstantEntry,
  ConstantResult,
  SubscriptionConfig,
  SubscriptionEntry,
  SubscriptionType,
  TangleSpecificConstants,
} from './types';
import type { AnyJson } from '@w3ux/types';
import { splitConstantKey, splitSubscriptionKey } from './util';
import type { ApiInstanceId } from 'model/Api/types';
import { getIndexFromInstanceId } from 'model/Api/util';
import type { OwnerId } from 'types';
import { getUnixTime } from 'date-fns';
import type { ChainStateSubscriptions } from 'contexts/ChainState/types';
import * as localChainState from 'contexts/ChainState/Local';

export class ChainState {
  // ------------------------------------------------------
  // Class members for Tangle Network State
  // ------------------------------------------------------

  #ownerId: OwnerId;
  #instanceId: ApiInstanceId;
  subscriptions: Record<string, SubscriptionEntry> = {};
  constants: Record<string, ConstantEntry> = {};
  #unsubs: Record<string, VoidFn> = {};
  #tangleConstants: TangleSpecificConstants | null = null;

  getEntries(type: SubscriptionType): ChainStateSubscriptions {
    const entries = Object.entries(
      type === 'subscription' ? this.subscriptions : this.constants
    );

    const formatted = Object.fromEntries(
      entries.map((entry) => ({
        ...entry,
      }))
    ) as ChainStateSubscriptions;

    return formatted;
  }

  // ------------------------------------------------------
  // Constructor
  // ------------------------------------------------------

  constructor(ownerId: OwnerId, instanceId: ApiInstanceId) {
    this.#ownerId = ownerId;
    this.#instanceId = instanceId;

    // Initialize Tangle-specific constants
    this.initializeTangleConstants();

    // Get local subscriptions for this owner and subscribe to them
    const localSubscriptions = localChainState.getChainStateSubscriptions();
    const entries = Object.entries(localSubscriptions?.[ownerId] || []);

    for (const [key, config] of entries) {
      if (['raw', 'storage'].includes(config.type)) {
        this.subscribe(
          splitSubscriptionKey(key)[1],
          config as SubscriptionConfig
        );
      }
    }

    // Get local constants for this owner
    const localConstants = localChainState.getChainStateConstants();
    const constants = Object.entries(localConstants?.[ownerId] || []);

    for (const [key, config] of constants) {
      const [, pallet, constant] = splitConstantKey(key);
      const result = this.fetchConstant(pallet, constant, config.pinned);

      if (result) {
        this.dispatchConstant(result.key, result.value);
      } else {
        localChainState.removeChainStateConstant(ownerId, key);
      }
    }
  }

  // ------------------------------------------------------
  // Tangle-specific Methods
  // ------------------------------------------------------

  private async initializeTangleConstants() {
    const api = ApiController.getInstanceApi(
      this.#ownerId,
      getIndexFromInstanceId(this.#instanceId)
    );

    if (api) {
      try {
        this.#tangleConstants = {
          chainId: Number((await api.consts.system?.chainId)?.toString()),
          ss58Prefix: Number((await api.consts.system?.ss58Prefix)?.toString()),
          tokenDecimals:
            'chainDecimals' in api.registry
              ? api.registry.chainDecimals[0]
              : 12,
          tokenSymbol: await api.registry.chainTokens[0],
        };
      } catch (error) {
        console.error('Failed to initialize Tangle constants:', error);
      }
    }
  }

  public getTangleSpecificConstants(): TangleSpecificConstants | null {
    return this.#tangleConstants;
  }

  public isConnectedToTangle(): boolean {
    return this.#tangleConstants?.tokenSymbol === 'TNT';
  }

  // ------------------------------------------------------
  // Subscription
  // ------------------------------------------------------

  subscribe = async (
    rawKey: string,
    config: SubscriptionConfig
  ): Promise<void> => {
    const api = ApiController.getInstanceApi(
      this.#ownerId,
      getIndexFromInstanceId(this.#instanceId)
    );
    const subscriptionKey = this.prependIndexToKey('subscription', rawKey);

    if (api) {
      try {
        const { type, pinned } = config;
        const timestamp = getUnixTime(new Date());

        if (['raw', 'storage'].includes(type)) {
          const { namespace, method } = config;
          let { args } = config;

          const apiNamespace = type === 'raw' ? 'rpc' : 'query';

          if (args && !Array.isArray(args)) {
            args = [args];
          }

          const subscriptionConfig = {
            type,
            namespace,
            method,
            args,
            timestamp,
            pinned: config?.pinned || false,
          };

          const detail: ChainStateEventDetail = {
            ...subscriptionConfig,
            ownerId: this.#ownerId,
            instanceId: this.#instanceId,
            key: subscriptionKey,
            pinned,
            result: undefined,
          };

          document.dispatchEvent(
            new CustomEvent('callback-new-chain-state-subscription', {
              detail,
            })
          );

          const unsub = await (api as any)[apiNamespace][namespace][method](
            ...Object.values(args || [undefined]),
            (res: AnyJson) => {
              const result =
                type === 'raw' ? res.data.unwrapOr(undefined) : res;

              if (result !== undefined) {
                this.subscriptions[subscriptionKey] = {
                  ...subscriptionConfig,
                  result,
                };

                document.dispatchEvent(
                  new CustomEvent('callback-new-chain-state-subscription', {
                    detail: {
                      ...detail,
                      result,
                    },
                  })
                );
              } else {
                this.unsubscribeOne(subscriptionKey);
              }
            }
          );
          this.#unsubs[subscriptionKey] = unsub;
        }
      } catch (e) {
        localChainState.removeChainStateSubscription(
          this.#ownerId,
          subscriptionKey
        );
      }
    }
  };

  // ------------------------------------------------------
  // Constants
  // ------------------------------------------------------

  fetchConstant = (
    pallet: string,
    constant: string,
    pinned = false
  ): ConstantResult | null => {
    const api = ApiController.getInstanceApi(
      this.#ownerId,
      getIndexFromInstanceId(this.#instanceId)
    );
    const result = api?.consts?.[pallet]?.[constant];

    if (result) {
      const rawKey = `${pallet}_${constant}`;
      const key = this.prependIndexToKey('constant', rawKey);
      const timestamp = getUnixTime(new Date());

      const value: ConstantEntry = {
        type: 'constant',
        timestamp,
        result,
        pinned,
      };

      this.constants[key] = value;
      return { key, value };
    }
    return null;
  };

  dispatchConstant = (key: string, value: ConstantEntry): void => {
    const timestamp = getUnixTime(new Date());

    const detail: ChainStateConstantEventDetail = {
      ownerId: this.#ownerId,
      instanceId: this.#instanceId,
      type: 'constant',
      key,
      timestamp,
      result: value.result,
      pinned: value.pinned,
    };

    document.dispatchEvent(
      new CustomEvent('callback-new-chain-state-constant', {
        detail,
      })
    );
  };

  // ------------------------------------------------------
  // Utilities
  // ------------------------------------------------------

  prependIndexToKey = (
    type: SubscriptionType,
    subscriptionKey: string
  ): string => {
    const entries =
      type === 'subscription' ? this.subscriptions : this.constants;

    const greatestIndex = Object.keys(entries).reduce((acc: number, key) => {
      const [index] = splitSubscriptionKey(key);
      return Number(index) > acc ? Number(index) : acc;
    }, 0);
    return `${greatestIndex + 1}_${subscriptionKey}`;
  };

  // ------------------------------------------------------
  // Unsubscribe & removal
  // ------------------------------------------------------

  unsubscribeOne = (subscriptionKey: string): void => {
    const unsub = this.#unsubs[subscriptionKey];

    if (unsub !== undefined) {
      if (typeof unsub === 'function') {
        unsub();
      }

      delete this.subscriptions[subscriptionKey];
      delete this.#unsubs[subscriptionKey];
    }
  };

  unsubscribeAll = (): void => {
    for (const key in Object.keys(this.#unsubs)) {
      this.unsubscribeOne(key);
    }
  };

  removeConstant = (key: string): void => {
    delete this.constants[key];
  };
}
