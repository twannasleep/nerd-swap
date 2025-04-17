import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { bscTestnet, mainnet } from '@reown/appkit/networks';
import { cookieStorage, createStorage } from '@wagmi/core';

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [mainnet, bscTestnet];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

// Export everything needed by other files
export const config = wagmiAdapter.wagmiConfig;

export * from './wagmi';
