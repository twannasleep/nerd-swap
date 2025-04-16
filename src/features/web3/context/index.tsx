'use client';

import { type ReactNode } from 'react';
import { mainnet } from '@reown/appkit/networks';
import { type ChainAdapter, createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi';
import { config } from '../config';
import { networks, projectId, wagmiAdapter } from '../config/wagmi';

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Set up metadata
const metadata = {
  name: 'Nerd Swap',
  description: 'Uniswap V2 token swap form clone',
  url: 'http://localhost:3000', // Update this with your domain
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter as ChainAdapter],
  projectId,
  networks,
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: true,
  },
});

export function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(config as Config, cookies);

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
