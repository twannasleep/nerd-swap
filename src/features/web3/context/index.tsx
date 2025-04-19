'use client';

import { type ReactNode } from 'react';
import type { ChainAdapter } from '@reown/appkit';
import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi';
import { config, metadata, networks, projectId, wagmiAdapter } from '../config/appKitConfig';

export const modal = createAppKit({
  adapters: [wagmiAdapter as ChainAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true,
    email: false,
    allWallets: true,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#6366F1',
    '--w3m-border-radius-master': '4px',
    '--w3m-font-family': 'var(--font-geist-sans)',
  },
});

const queryClient = new QueryClient();

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
