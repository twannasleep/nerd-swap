import { useAccount, useBalance } from 'wagmi';
import { TOKENS } from '@/features/web3/constants';

export function useTokenBalance(symbol: keyof typeof TOKENS) {
  const { address } = useAccount();
  const token = TOKENS[symbol];

  const { data: balance, isLoading } = useBalance({
    address,
    token: token.isNative ? undefined : (token.address as `0x${string}`),
  });

  return {
    balance: balance?.formatted,
    symbol: balance?.symbol,
    isLoading,
  };
}
