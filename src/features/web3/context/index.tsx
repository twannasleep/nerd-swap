'use client';

import { type ReactNode } from 'react';
import type { ChainAdapter } from '@reown/appkit';
import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi';
import {
  config,
  metadata,
  networks,
  projectId,
  solanaAdapter,
  wagmiAdapter,
} from '../config/appKitConfig';

export const modal = createAppKit({
  adapters: [wagmiAdapter as ChainAdapter, solanaAdapter as ChainAdapter],
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
