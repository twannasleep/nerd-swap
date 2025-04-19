import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { AppKitNetwork, bscTestnet } from '@reown/appkit/networks';

// Define the networks - focusing only on BNB Testnet for this project
export const networks = [bscTestnet] as const satisfies [AppKitNetwork, ...AppKitNetwork[]];

// Get projectId - using the same env variable across the application
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn(
    'Please provide a valid WalletConnect project ID in your environment variables (NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID)'
  );
}

// Create the Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

// Export the Wagmi config derived from the adapter
export const config = wagmiAdapter.wagmiConfig;

// 2. Create Solana adapter
export const solanaAdapter = new SolanaAdapter();

// 3. Set up the metadata - *Optional but Recommended*
// Replace with your actual application details
export const metadata = {
  name: 'Nerd Swap',
  description: 'Uniswap V2 Token Swap on BNB Testnet',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://nerdswap.xyz',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};
