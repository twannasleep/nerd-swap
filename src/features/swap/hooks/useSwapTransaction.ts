import * as React from 'react';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  BNB_TESTNET_CHAIN_ID,
  NATIVE_BNB_ADDRESS,
  UNISWAP_V2_ROUTER_ADDRESS,
  WBNB_ADDRESS,
  uniswapV2RouterAbi,
} from '../constants';
import type { BaseToken } from '../types';

interface UseSwapTransactionProps {
  account?: `0x${string}` | undefined;
  inputAmount: string;
  derivedOutputAmount: string;
  selectedInputBase: BaseToken;
  selectedOutputBase: BaseToken;
  slippage: number;
  inputDecimals: number;
  outputDecimals: number;
  inputBalanceBigInt?: bigint | undefined;
}

export function useSwapTransaction({
  account,
  inputAmount,
  derivedOutputAmount,
  selectedInputBase,
  selectedOutputBase,
  slippage,
  inputDecimals,
  outputDecimals,
  inputBalanceBigInt,
}: UseSwapTransactionProps) {
  const [isSwapPending, setIsSwapPending] = React.useState(false);

  const {
    data: swapWriteHash,
    isPending: isSwapTxPending,
    writeContractAsync: swapAsync,
  } = useWriteContract();

  const {
    data: swapReceipt,
    isLoading: isWaitingForSwapConfirmation,
    isSuccess: isSwapSuccess,
    isError: isSwapError,
  } = useWaitForTransactionReceipt({
    hash: swapWriteHash,
  });

  const isSwapping = isSwapTxPending || isWaitingForSwapConfirmation;

  const amountInBigInt = React.useMemo(() => {
    try {
      return parseUnits(inputAmount || '0', inputDecimals);
    } catch {
      return 0n;
    }
  }, [inputAmount, inputDecimals]);

  const handleSwap = React.useCallback(async () => {
    if (
      !account ||
      !inputAmount ||
      !derivedOutputAmount ||
      typeof slippage !== 'number' ||
      isSwapping ||
      !swapAsync
    )
      return;

    const amountIn = amountInBigInt;
    if (amountIn <= 0n) {
      toast.error('Enter an amount to swap');
      return;
    }
    if (inputBalanceBigInt !== undefined && amountIn > inputBalanceBigInt) {
      toast.error('Insufficient balance');
      return;
    }

    let minAmountOut: bigint;
    try {
      minAmountOut = parseUnits(
        (parseFloat(derivedOutputAmount) * (1 - slippage / 100)).toFixed(outputDecimals),
        outputDecimals
      );
      if (minAmountOut <= 0n) throw new Error('Min amount out is zero or negative');
    } catch (calcError) {
      console.error('Error calculating minAmountOut:', calcError);
      toast.error('Invalid derived output amount for slippage calculation.');
      return;
    }

    try {
      setIsSwapPending(true);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 min deadline

      const inputIsNative = selectedInputBase.address === NATIVE_BNB_ADDRESS;
      const outputIsNative = selectedOutputBase.address === NATIVE_BNB_ADDRESS;

      const path = [
        inputIsNative ? WBNB_ADDRESS : selectedInputBase.address,
        outputIsNative ? WBNB_ADDRESS : selectedOutputBase.address,
      ] as readonly [`0x${string}`, `0x${string}`];

      let txHash: `0x${string}` | undefined;

      if (inputIsNative) {
        // BNB to Token
        txHash = await swapAsync({
          address: UNISWAP_V2_ROUTER_ADDRESS,
          abi: uniswapV2RouterAbi,
          functionName: 'swapExactETHForTokens',
          args: [minAmountOut, path, account, deadline],
          value: amountIn,
          chainId: BNB_TESTNET_CHAIN_ID,
        });
      } else if (outputIsNative) {
        // Token to BNB
        txHash = await swapAsync({
          address: UNISWAP_V2_ROUTER_ADDRESS,
          abi: uniswapV2RouterAbi,
          functionName: 'swapTokensForExactETH',
          args: [amountIn, minAmountOut, path, account, deadline],
          chainId: BNB_TESTNET_CHAIN_ID,
        });
      } else {
        // Token to Token
        txHash = await swapAsync({
          address: UNISWAP_V2_ROUTER_ADDRESS,
          abi: uniswapV2RouterAbi,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, minAmountOut, path, account, deadline],
          chainId: BNB_TESTNET_CHAIN_ID,
        });
      }

      if (txHash) {
        toast.success('Swap transaction sent', {
          description: `Swapping ${inputAmount} ${selectedInputBase.symbol} to ${selectedOutputBase.symbol}...`,
        });
        return true;
      } else {
        toast.error('Swap initiation failed');
        return false;
      }
    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Failed to execute swap', { description: (error as Error)?.message });
      return false;
    } finally {
      setIsSwapPending(false);
    }
  }, [
    account,
    inputAmount,
    derivedOutputAmount,
    slippage,
    isSwapping,
    swapAsync,
    amountInBigInt,
    inputBalanceBigInt,
    outputDecimals,
    selectedInputBase,
    selectedOutputBase,
  ]);

  return {
    handleSwap,
    isSwapping,
    isSwapPending,
    isSwapSuccess,
    isSwapError,
    swapReceipt,
  };
}
