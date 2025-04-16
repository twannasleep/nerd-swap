'use client';

import { Button } from '@mantine/core';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { ThemeSynchronizer } from './ThemeSynchronizer';

interface ConnectButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'outline' | 'light' | 'subtle' | 'default' | 'gradient';
}

export function ConnectButton({ size = 'md', variant = 'filled' }: ConnectButtonProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
      <>
        <ThemeSynchronizer />
        <Button
          size={size}
          variant="outline"
          color="gray"
          onClick={() => open({ view: 'Account' })}
        >
          {shortAddress}
        </Button>
      </>
    );
  }

  return (
    <>
      <ThemeSynchronizer />
      <Button size={size} variant={variant} onClick={() => open()}>
        Connect Wallet
      </Button>
    </>
  );
}
