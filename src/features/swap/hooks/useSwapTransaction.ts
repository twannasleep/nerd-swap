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
import { SwapMode } from './useSwapState';

interface UseSwapTransactionProps {
  account?: `0x${string}` | undefined;
  inputAmount: string;
  outputAmount: string;
  derivedInputAmount: string;
  derivedOutputAmount: string;
  swapMode: SwapMode;
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
  outputAmount,
  derivedInputAmount,
  derivedOutputAmount,
  swapMode,
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

  // For ExactIn mode, we use the inputAmount, for ExactOut, we use the derivedInputAmount
  const getActualInputAmount = React.useCallback(() => {
    if (swapMode === 'exactIn') {
      return inputAmount;
    } else {
      return derivedInputAmount;
    }
  }, [swapMode, inputAmount, derivedInputAmount]);

  // For ExactIn mode, we use the derivedOutputAmount, for ExactOut, we use the outputAmount
  const getActualOutputAmount = React.useCallback(() => {
    if (swapMode === 'exactIn') {
      return derivedOutputAmount;
    } else {
      return outputAmount;
    }
  }, [swapMode, outputAmount, derivedOutputAmount]);

  const amountInBigInt = React.useMemo(() => {
    try {
      return parseUnits(getActualInputAmount() || '0', inputDecimals);
    } catch {
      return 0n;
    }
  }, [getActualInputAmount, inputDecimals]);

  const amountOutBigInt = React.useMemo(() => {
    try {
      return parseUnits(getActualOutputAmount() || '0', outputDecimals);
    } catch {
      return 0n;
    }
  }, [getActualOutputAmount, outputDecimals]);

  const handleSwap = React.useCallback(async () => {
    if (!account || !swapAsync || isSwapping || typeof slippage !== 'number') return;

    if (swapMode === 'exactIn' && (!inputAmount || !derivedOutputAmount)) {
      toast.error('Enter an amount to swap');
      return;
    }

    if (swapMode === 'exactOut' && (!outputAmount || !derivedInputAmount)) {
      toast.error('Enter an amount to receive');
      return;
    }

    const actualInputAmount = getActualInputAmount();
    const actualOutputAmount = getActualOutputAmount();

    const amountIn = amountInBigInt;
    if (amountIn <= 0n) {
      toast.error(
        swapMode === 'exactIn' ? 'Enter an amount to swap' : 'Invalid input amount calculated'
      );
      return;
    }

    if (inputBalanceBigInt !== undefined && amountIn > inputBalanceBigInt) {
      toast.error('Insufficient balance');
      return;
    }

    let slippageAdjustedAmount: bigint;
    try {
      if (swapMode === 'exactIn') {
        // For exactIn, calculate minimum output with slippage
        slippageAdjustedAmount = parseUnits(
          (parseFloat(actualOutputAmount) * (1 - slippage / 100)).toFixed(outputDecimals),
          outputDecimals
        );
      } else {
        // For exactOut, calculate maximum input with slippage
        slippageAdjustedAmount = parseUnits(
          (parseFloat(actualInputAmount) * (1 + slippage / 100)).toFixed(inputDecimals),
          inputDecimals
        );
      }

      if (slippageAdjustedAmount <= 0n) {
        throw new Error(
          swapMode === 'exactIn' ? 'Min amount out is zero' : 'Max amount in is zero'
        );
      }
    } catch (calcError) {
      console.error('Error calculating amounts with slippage:', calcError);
      toast.error('Invalid amount for slippage calculation.');
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

      if (swapMode === 'exactIn') {
        // ---- EXACT INPUT SWAPS ----
        if (inputIsNative) {
          // BNB to Token (exactIn)
          txHash = await swapAsync({
            address: UNISWAP_V2_ROUTER_ADDRESS,
            abi: uniswapV2RouterAbi,
            functionName: 'swapExactETHForTokens',
            args: [slippageAdjustedAmount, path, account, deadline],
            value: amountIn,
            chainId: BNB_TESTNET_CHAIN_ID,
          });
        } else if (outputIsNative) {
          // Token to BNB (exactIn)
          txHash = await swapAsync({
            address: UNISWAP_V2_ROUTER_ADDRESS,
            abi: uniswapV2RouterAbi,
            functionName: 'swapExactTokensForETH' as any,
            args: [amountIn, slippageAdjustedAmount, path, account, deadline],
            chainId: BNB_TESTNET_CHAIN_ID,
          });
        } else {
          // Token to Token (exactIn)
          txHash = await swapAsync({
            address: UNISWAP_V2_ROUTER_ADDRESS,
            abi: uniswapV2RouterAbi,
            functionName: 'swapExactTokensForTokens',
            args: [amountIn, slippageAdjustedAmount, path, account, deadline],
            chainId: BNB_TESTNET_CHAIN_ID,
          });
        }
      } else {
        // ---- EXACT OUTPUT SWAPS ----
        if (inputIsNative) {
          // BNB to Token (exactOut)
          txHash = await swapAsync({
            address: UNISWAP_V2_ROUTER_ADDRESS,
            abi: uniswapV2RouterAbi,
            functionName: 'swapETHForExactTokens' as any,
            args: [amountOutBigInt, path, account, deadline],
            value: slippageAdjustedAmount, // max ETH to spend
            chainId: BNB_TESTNET_CHAIN_ID,
          });
        } else if (outputIsNative) {
          // Token to BNB (exactOut)
          txHash = await swapAsync({
            address: UNISWAP_V2_ROUTER_ADDRESS,
            abi: uniswapV2RouterAbi,
            functionName: 'swapTokensForExactETH',
            args: [amountOutBigInt, slippageAdjustedAmount, path, account, deadline],
            chainId: BNB_TESTNET_CHAIN_ID,
          });
        } else {
          // Token to Token (exactOut)
          txHash = await swapAsync({
            address: UNISWAP_V2_ROUTER_ADDRESS,
            abi: uniswapV2RouterAbi,
            functionName: 'swapTokensForExactTokens' as any,
            args: [amountOutBigInt, slippageAdjustedAmount, path, account, deadline],
            chainId: BNB_TESTNET_CHAIN_ID,
          });
        }
      }

      if (txHash) {
        const actionDescription =
          swapMode === 'exactIn'
            ? `Swapping ${actualInputAmount} ${selectedInputBase.symbol} to ${selectedOutputBase.symbol}...`
            : `Getting exactly ${actualOutputAmount} ${selectedOutputBase.symbol} for max ${actualInputAmount} ${selectedInputBase.symbol}...`;

        toast.success('Swap transaction sent', {
          description: actionDescription,
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
    swapAsync,
    isSwapping,
    swapMode,
    inputAmount,
    outputAmount,
    derivedInputAmount,
    derivedOutputAmount,
    getActualInputAmount,
    getActualOutputAmount,
    amountInBigInt,
    amountOutBigInt,
    inputBalanceBigInt,
    slippage,
    inputDecimals,
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
