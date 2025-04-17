'use client';

import { PropsWithChildren } from 'react';
import { Header } from './Header';

// Assuming Header is in src/features/web3/components

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header: Assumes Header component renders a <header> or similar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex flex-grow items-center justify-center p-4 md:p-6 lg:p-8">
        {/* Centered container for the main content (e.g., SwapBox) */}
        {/* max-w-md matches the SwapBox max-width for consistency */}
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer (Optional) - Add if needed later
      <footer className="p-4 bg-muted text-muted-foreground text-center">
        Footer Content
      </footer>
      */}
    </div>
  );
}
