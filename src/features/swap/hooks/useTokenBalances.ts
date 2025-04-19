import * as React from 'react';
import { erc20Abi, formatUnits } from 'viem';
import { useBalance, useReadContract } from 'wagmi';
import { BNB_TESTNET_CHAIN_ID, BaseToken, NATIVE_BNB_ADDRESS, TEST63_BASE } from '../constants';

interface UseTokenBalancesProps {
  account?: `0x${string}` | undefined;
}

export function useTokenBalances({ account }: UseTokenBalancesProps) {
  // For BNB (native token)
  const {
    data: bnbBalanceData,
    isLoading: isLoadingBnbBalance,
    refetch: refetchBnbBalance,
  } = useBalance({
    address: account,
    query: {
      enabled: !!account,
      staleTime: 15_000, // 15 seconds
    },
    chainId: BNB_TESTNET_CHAIN_ID,
  });

  // For TEST63 token
  const {
    data: test63Balance,
    isLoading: isLoadingTest63Balance,
    refetch: refetchTest63Balance,
  } = useReadContract({
    address: TEST63_BASE.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account!],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: !!account && TEST63_BASE.address !== NATIVE_BNB_ADDRESS,
      staleTime: 15_000, // 15 seconds
    },
  });

  // Get token balances by address
  const getBalanceByToken = React.useCallback(
    (token: BaseToken) => {
      if (!account) return { value: '0', formatted: '0', decimals: token.decimals };

      if (token.address === NATIVE_BNB_ADDRESS) {
        return {
          value: bnbBalanceData?.value.toString() || '0',
          formatted: bnbBalanceData?.formatted || '0',
          decimals: 18,
        };
      }

      if (token.address === TEST63_BASE.address) {
        const decimals = token.decimals;
        const value = test63Balance ? test63Balance.toString() : '0';
        const formatted = test63Balance ? formatUnits(BigInt(value), decimals) : '0';
        return { value, formatted, decimals };
      }

      return { value: '0', formatted: '0', decimals: token.decimals };
    },
    [account, bnbBalanceData, test63Balance]
  );

  // Refetch all balances
  const refetchAllBalances = React.useCallback(() => {
    if (account) {
      refetchBnbBalance();
      refetchTest63Balance();
    }
  }, [account, refetchBnbBalance, refetchTest63Balance]);

  return {
    getBalanceByToken,
    refetchAllBalances,
    isLoading: isLoadingBnbBalance || isLoadingTest63Balance,
    bnbBalance: bnbBalanceData?.formatted || '0',
    test63Balance: test63Balance
      ? formatUnits(BigInt(test63Balance.toString()), TEST63_BASE.decimals)
      : '0',
  };
}
