'use client';

import Link from 'next/link';
// Import useAccount to conditionally show the network button
import { useAccount } from 'wagmi';

// You might need to declare these custom elements for TypeScript if errors arise.
// See: https://lit.dev/docs/frameworks/react/#using-custom-elements

// Attempt to declare custom elements by augmenting the React module directly
declare module 'react' {
  interface IntrinsicElements {
    'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'appkit-network-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="border-border flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-2xl font-extrabold text-transparent hover:opacity-90"
        >
          Nerd Swap
        </Link>
        {/* Add navigation links here if needed */}
      </div>
      <div className="flex items-center gap-2">
        {/* AppKit web components for wallet interactions */}
        {isConnected && <appkit-network-button />}
        <appkit-button />
      </div>
    </header>
  );
}
