export const TangleNetwork = {
  name: 'Tangle',
  endpoints: [
    {
      name: 'Tangle RPC',
      url: 'wss://rpc.tangle.tools',
    },
    {
      name: 'Dwellir',
      url: 'wss://tangle-mainnet-rpc.dwellir.com',
    },
  ],
  chainId: 5845,
  units: {
    token: 'TNT',
    decimals: 18,
  },
  ss58Prefix: 'tg',
  defaultProvider: 'substrate',
};
