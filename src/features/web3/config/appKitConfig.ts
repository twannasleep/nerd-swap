import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
  AppKitNetwork,
  arbitrum,
  mainnet,
  sepolia,
  solana,
  solanaDevnet,
  solanaTestnet,
} from '@reown/appkit/networks';

// Define the networks you want to support
export const networks = [
  sepolia,
  solana as AppKitNetwork,
  solanaTestnet as AppKitNetwork,
  solanaDevnet as AppKitNetwork,
] as const satisfies [AppKitNetwork, ...AppKitNetwork[]];

// 0. Get projectId from https://cloud.reown.com (use an environment variable)
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

if (!projectId || projectId === 'YOUR_PROJECT_ID') {
  console.warn(
    'Please provide a valid Reown project ID in your environment variables (e.g., NEXT_PUBLIC_REOWN_PROJECT_ID)'
  );
}

// 1. Create the Wagmi adapter
// This adapter is exported because you might need it for WagmiProvider setup
export const wagmiAdapter = new WagmiAdapter({
  ssr: true, // Adjust based on your SSR needs
  projectId,
  networks,
});

// Export the Wagmi config derived from the adapter (as per docs)
export const config = wagmiAdapter.wagmiConfig;

// 2. Create Solana adapter
export const solanaAdapter = new SolanaAdapter();

// 3. Set up the metadata - *Optional but Recommended*
// Replace with your actual application details
export const metadata = {
  name: 'Nerd Swap', // Your app name
  description: 'Trade digital collectibles', // Your app description
  url: typeof window !== 'undefined' ? window.location.origin : 'https://nerdswap.xyz', // Dynamically set or use your production URL
  icons: ['https://avatars.githubusercontent.com/u/179229932'], // Replace with your app icon URL(s)
};
