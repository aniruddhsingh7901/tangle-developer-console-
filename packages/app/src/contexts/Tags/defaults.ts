// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TagsConfig, TagsContextInterface, TagsList } from './types';

export const defaultTags: TagsList = {
  tag_mainnet: { name: 'Tangle Mainnet', locked: true, counter: 0 },
  tag_testnet: { name: 'Tangle Testnet', locked: true, counter: 1 },
  tag_system: { name: 'Tangle System', locked: true, counter: 2 },
  tag_ethereum: { name: 'Ethereum Compatible', locked: true, counter: 3 },
  tag_substrate: { name: 'Substrate Chain', locked: true, counter: 4 },
};

export const defaultTagsConfig: TagsConfig = {
  tag_mainnet: ['tangle'],
  tag_testnet: ['tangle-testnet'],
  tag_system: ['tangle', 'tangle-testnet'],
  tag_ethereum: ['tangle'],
  tag_substrate: ['tangle', 'tangle-testnet'],
};

export const defaultTagsContext: TagsContextInterface = {
  tags: {},
  setTags: (newTags) => {},
  tagsConfig: defaultTagsConfig,
  setTagsConfig: (newTagsConfig) => {},
  getTagsForChain: (chain) => [],
  getChainsForTag: (tagId) => [],
  getLargestTagCounter: () => 0,
  removeTag: (tagId) => {},
  addChainToTag: (tagId, chain) => {},
  removeChainFromTag: (tagId, chain) => {},
};

// Utility function to check if chain is Tangle mainnet
export const isTangleMainnet = (chain: string) => chain === 'tangle';

// Utility function to check if chain is Tangle testnet
export const isTangleTestnet = (chain: string) => chain === 'tangle-testnet';
