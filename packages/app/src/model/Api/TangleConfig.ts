// // // Copyright 2024 @tangle-developer-console authors & contributors
// // // SPDX-License-Identifier: AGPL-3.0

// // export const TANGLE_CONFIG = {
// //     DEFAULT_PROVIDERS: {
// //       'Tangle RPC': 'wss://rpc.tangle.tools',
// //       'Dwellir': 'wss://tangle-mainnet-rpc.dwellir.com'
// //     },
// //     CHAIN_PROPERTIES: {
// //       ss58Format: 42,
// //       tokenDecimals: 18,
// //       tokenSymbol: 'TNT',
// //       chainId: 5845
// //     },
// //     ENDPOINTS: {
// //       mainnet: ['wss://rpc.tangle.tools', 'wss://tangle-mainnet-rpc.dwellir.com'],
// //       testnet: ['wss://testnet-rpc.tangle.tools']
// //     }
// //   };

// // Copyright 2024 @tangle-developer-console authors & contributors
// // SPDX-License-Identifier: AGPL-3.0

// import type { TangleChainProperties } from './types';

// export const TANGLE_CONFIG = {
//   NETWORKS: {
//     mainnet: {
//       endpoints: {
//         'Tangle RPC': 'wss://rpc.tangle.tools',
//         Dwellir: 'wss://tangle-mainnet-rpc.dwellir.com',
//       },
//     },
//     testnet: {
//       endpoints: {
//         'Tangle Testnet': 'wss://testnet-rpc.tangle.tools',
//       },
//     },
//   },

//   CHAIN_PROPERTIES: {
//     mainnet: {
//       ss58Format: 42,
//       tokenDecimals: 18,
//       tokenSymbol: 'TNT',
//       chainId: 5845,
//     } as TangleChainProperties,
//     testnet: {
//       ss58Format: 42,
//       tokenDecimals: 18,
//       tokenSymbol: 'tTNT',
//       chainId: 5846,
//     } as TangleChainProperties,
//   },

//   // Default configuration
//   DEFAULT: {
//     network: 'mainnet' as const,
//     endpoint: 'wss://rpc.tangle.tools',
//   },

//   // RPC methods specific to Tangle
//   RPC_METHODS: {
//     state: ['getBalance', 'getMetadata', 'getRuntimeVersion'],
//     chain: ['getBlock', 'getBlockHash', 'getFinalizedHead'],
//   },
// };

// export const isTangleEndpoint = (endpoint: string): boolean => {
//   return (
//     endpoint.includes('tangle.tools') || endpoint.includes('tangle-mainnet')
//   );
// };

// export const getTangleNetworkType = (endpoint: string) => {
//   return endpoint.includes('testnet') ? 'testnet' : 'mainnet';
// };

// Copyright 2024 @tangle-developer-console authors & contributors
// SPDX-License-Identifier: AGPL-3.0

import type { TangleChainProperties } from './types';

export const TANGLE_CONFIG = {
  NETWORKS: {
    mainnet: {
      endpoints: {
        'Tangle RPC': 'wss://rpc.tangle.tools',
        Dwellir: 'wss://tangle-mainnet-rpc.dwellir.com',
      },
    },
    testnet: {
      endpoints: {
        'Tangle Testnet': 'wss://testnet-rpc.tangle.tools',
      },
    },
  },

  CHAIN_PROPERTIES: {
    mainnet: {
      ss58Format: 42,
      tokenDecimals: 18,
      tokenSymbol: 'TNT',
      chainId: 5845,
    } as TangleChainProperties,
    testnet: {
      ss58Format: 42,
      tokenDecimals: 18,
      tokenSymbol: 'tTNT',
      chainId: 5846,
    } as TangleChainProperties,
  },

  // Default configuration
  DEFAULT: {
    network: 'mainnet' as const,
    endpoint: 'wss://rpc.tangle.tools',
  },

  // RPC methods specific to Tangle
  RPC_METHODS: {
    state: ['getBalance', 'getMetadata', 'getRuntimeVersion'],
    chain: ['getBlock', 'getBlockHash', 'getFinalizedHead'],
  },
} as const;

// Utility functions
export const isTangleEndpoint = (endpoint: string): boolean =>
  endpoint.includes('tangle.tools') || endpoint.includes('tangle-mainnet');

export const getTangleNetworkType = (
  endpoint: string
): 'testnet' | 'mainnet' =>
  endpoint.includes('testnet') ? 'testnet' : 'mainnet';

// Types
export type TangleNetwork = keyof typeof TANGLE_CONFIG.NETWORKS;
export type TangleEndpoint = string;
export type TangleNetworkConfig =
  (typeof TANGLE_CONFIG.NETWORKS)[TangleNetwork];
