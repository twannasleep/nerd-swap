'use client';

import React from 'react';
import { SwapForm } from '@/features/swap/components/SwapForm';

export default function SwapTestPage() {
  return (
    <div className="container flex min-h-screen max-w-7xl flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-center text-3xl font-bold">Nerd Swap - DEX</h1>
      <div className="w-full max-w-md">
        <SwapForm />
      </div>
      <div className="text-muted-foreground mt-8 text-center text-sm">
        <p>Running on BNB Testnet</p>
        <p className="mt-2">
          <a
            href="https://testnet.bnbchain.org/faucet-smart"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Get test BNB from faucet
          </a>
        </p>
      </div>
    </div>
  );
}
