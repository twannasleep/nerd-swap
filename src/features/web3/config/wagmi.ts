'use client';

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { type AppKitNetwork, bscTestnet, mainnet } from '@reown/appkit/networks';
import { cookieStorage, createStorage } from '@wagmi/core';

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Define the networks with proper typing
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, bscTestnet];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

// Export the config for use in other files
export const config = wagmiAdapter.wagmiConfig;
