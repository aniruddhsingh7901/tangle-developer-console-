// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import { Api } from './index';
import { TANGLE_CONFIG, getTangleNetworkType } from './TangleConfig';
import type {
  TangleNetworkType,
  TangleChainProperties,
  APIChainSpec,
  APIChainSpecVersion,
} from './types';
import type { AccountInfo } from '@polkadot/types/interfaces';
import type { Metadata } from '@polkadot/types';
import type { ChainId } from 'config/networks/types';
import BigNumber from 'bignumber.js';
import { getUnixTime } from 'date-fns';
import { PalletScraper } from '../Scraper/Pallet';

interface ValidatedMetadata {
  palletExists: (name: string) => boolean;
  get: (key: string) => unknown;
  metadata: Metadata;
}

// Define interface for constants
interface TangleConstants {
  existentialDeposit?: BigNumber;
  networkType: TangleNetworkType;
  chainId?: number;
  tokenDecimals?: number;
  timestamp?: number;
}

export class TangleApi extends Api {
  #networkType: TangleNetworkType;
  #properties: TangleChainProperties;

  constructor(
    chainSpaceId: string,
    ownerId: string,
    instanceIndex: number,
    chainId: ChainId,
    endpoint: string
  ) {
    super(chainSpaceId, ownerId, instanceIndex, chainId, endpoint);
    this.#networkType = getTangleNetworkType(endpoint);
    this.#properties = TANGLE_CONFIG.CHAIN_PROPERTIES[this.#networkType];
  }

  async initialize(): Promise<void> {
    await super.initialize();
    await this.validateTangleNetwork();
  }

  private async validateTangleNetwork(): Promise<void> {
    if (!this.api) {
      return;
    }

    try {
      const [chainId, tokenSymbol] = await Promise.all([
        this.api.consts.system?.chainId,
        this.api.registry.chainTokens[0],
      ]);

      const expectedProperties =
        TANGLE_CONFIG.CHAIN_PROPERTIES[this.#networkType];

      if (
        chainId?.toString() !== expectedProperties.chainId.toString() ||
        tokenSymbol !== expectedProperties.tokenSymbol
      ) {
        throw new Error('Invalid Tangle network configuration');
      }
    } catch (error) {
      this.dispatchEvent(this.ensureEventStatus('error'), {
        err: 'InvalidTangleNetwork',
      });
    }
  }

  async fetchChainSpec(): Promise<void> {
    await super.fetchChainSpec();

    if (this.chainSpec) {
      const version: APIChainSpecVersion = {
        ...this.chainSpec.version,
        specName: this.#networkType === 'mainnet' ? 'tangle' : 'tangle-testnet',
        apis: this.chainSpec.version.apis,
        authoringVersion: this.chainSpec.version.authoringVersion,
        implName: this.chainSpec.version.implName,
        implVersion: this.chainSpec.version.implVersion,
        specVersion: this.chainSpec.version.specVersion,
        stateVersion: this.chainSpec.version.stateVersion,
        transactionVersion: this.chainSpec.version.transactionVersion,
      };

      const tangleSpec: APIChainSpec = {
        ...this.chainSpec,
        ...this.#properties,
        version,
      };
      this.chainSpec = tangleSpec;
    }
  }

  private isValidMetadata(metadata: unknown): metadata is ValidatedMetadata {
    if (!metadata || typeof metadata !== 'object') {
      return false;
    }

    return (
      'palletExists' in metadata &&
      'get' in metadata &&
      'metadata' in metadata &&
      typeof (metadata as ValidatedMetadata).palletExists === 'function'
    );
  }

  fetchConsts = (): void => {
    const metadata = this.chainSpec?.metadata;
    const newConsts: TangleConstants = {
      networkType: this.#networkType,
    };

    try {
      if (metadata && this.isValidMetadata(metadata)) {
        const scraper = new PalletScraper(metadata);
        const hasBalancesPallet = metadata.palletExists('Balances');

        if (hasBalancesPallet) {
          const existentialDeposit = this.papiBuilder
            ?.buildConstant('Balances', 'ExistentialDeposit')
            .dec(
              String(
                scraper.getConstantValue('Balances', 'ExistentialDeposit') ||
                  '0x'
              )
            );

          newConsts.existentialDeposit = new BigNumber(existentialDeposit || 0);
        }

        newConsts.chainId = this.#properties.chainId;
        newConsts.tokenDecimals = this.#properties.tokenDecimals;
      }

      this.consts = newConsts;
    } catch (error) {
      console.error('Error fetching Tangle constants:', error);
      this.consts = {
        networkType: this.#networkType,
        timestamp: getUnixTime(new Date()),
      };
    }
  };

  async getTangleBalance(address: string): Promise<{
    free: string;
    reserved: string;
    miscFrozen: string;
    feeFrozen: string;
    total: string;
  }> {
    if (!this.api) {
      throw new Error('API not initialized');
    }

    try {
      const accountInfo = (await this.api.query.system.account(
        address
      )) as unknown as AccountInfo;
      const { free, reserved, miscFrozen, feeFrozen } = accountInfo.data;

      return {
        free: free.toString(),
        reserved: reserved.toString(),
        miscFrozen: miscFrozen.toString(),
        feeFrozen: feeFrozen.toString(),
        total: new BigNumber(free.toString())
          .plus(reserved.toString())
          .toString(),
      };
    } catch (error) {
      console.error('Error fetching Tangle balance:', error);
      throw error;
    }
  }

  getNetworkType(): TangleNetworkType {
    return this.#networkType;
  }

  getChainProperties(): TangleChainProperties {
    return this.#properties;
  }
}
