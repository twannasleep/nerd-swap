import * as React from 'react';
import { useDebounce } from 'use-debounce';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { useReadContract } from 'wagmi';
import {
  BNB_TESTNET_CHAIN_ID,
  type BaseToken,
  UNISWAP_V2_ROUTER_ADDRESS,
  uniswapV2RouterAbi,
} from '../constants';
import { SwapMode } from './useSwapState';

// Mock exchange rate for USD (in a real app, fetch this from an API)
// Consider moving this to constants or a config file
const USD_EXCHANGE_RATES = {
  BNB: 240.5, // 1 BNB = $240.5
  TEST63: 0.12, // 1 TEST63 = $0.12
};

interface UseSwapCalculationsProps {
  account?: `0x${string}` | undefined;
  inputAmount: string;
  outputAmount: string;
  swapMode: SwapMode;
  selectedInputBase: BaseToken;
  selectedOutputBase: BaseToken;
}

export function useSwapCalculations({
  account,
  inputAmount,
  outputAmount,
  swapMode,
  selectedInputBase,
  selectedOutputBase,
}: UseSwapCalculationsProps) {
  const [debouncedInputAmount] = useDebounce(inputAmount, 500);
  const [debouncedOutputAmount] = useDebounce(outputAmount, 500);
  const [derivedOutputAmount, setDerivedOutputAmount] = React.useState('');
  const [derivedInputAmount, setDerivedInputAmount] = React.useState('');
  const [priceImpact, setPriceImpact] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Contract reads for token information
  const { data: inputTokenDecimals, isLoading: isLoadingInputDecimals } = useReadContract({
    address: selectedInputBase.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: { enabled: !!selectedInputBase.address },
  });

  const { data: outputTokenDecimals, isLoading: isLoadingOutputDecimals } = useReadContract({
    address: selectedOutputBase.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: { enabled: !!selectedOutputBase.address },
  });

  const { data: inputBalance, isLoading: isLoadingInputBalance } = useReadContract({
    address: selectedInputBase.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: !!account && !!selectedInputBase.address,
    },
  });

  // Get the actual token decimals
  const actualInputDecimals = React.useMemo(() => {
    return inputTokenDecimals !== undefined
      ? Number(inputTokenDecimals)
      : selectedInputBase.decimals;
  }, [inputTokenDecimals, selectedInputBase.decimals]);

  const actualOutputDecimals = React.useMemo(() => {
    return outputTokenDecimals !== undefined
      ? Number(outputTokenDecimals)
      : selectedOutputBase.decimals;
  }, [outputTokenDecimals, selectedOutputBase.decimals]);

  // Calculate based on exact input (getAmountsOut)
  const isInputAmountValid =
    swapMode === 'exactIn' && !!debouncedInputAmount && debouncedInputAmount !== '0';
  const parsedDebouncedInputAmount = isInputAmountValid
    ? parseUnits(debouncedInputAmount, actualInputDecimals)
    : BigInt(0);

  const { data: amountsOut, isLoading: isLoadingAmountsOut } = useReadContract({
    address: UNISWAP_V2_ROUTER_ADDRESS as `0x${string}`,
    abi: uniswapV2RouterAbi,
    functionName: 'getAmountsOut',
    args: [parsedDebouncedInputAmount, [selectedInputBase.address, selectedOutputBase.address]],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled:
        isInputAmountValid &&
        !!selectedInputBase.address &&
        !!selectedOutputBase.address &&
        !isLoadingInputDecimals &&
        !isLoadingOutputDecimals,
    },
  });

  // Calculate based on exact output (getAmountsIn)
  const isOutputAmountValid =
    swapMode === 'exactOut' && !!debouncedOutputAmount && debouncedOutputAmount !== '0';
  const parsedDebouncedOutputAmount = isOutputAmountValid
    ? parseUnits(debouncedOutputAmount, actualOutputDecimals)
    : BigInt(0);

  const { data: amountsIn, isLoading: isLoadingAmountsIn } = useReadContract({
    address: UNISWAP_V2_ROUTER_ADDRESS as `0x${string}`,
    abi: uniswapV2RouterAbi,
    functionName: 'getAmountsIn',
    args: [parsedDebouncedOutputAmount, [selectedInputBase.address, selectedOutputBase.address]],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled:
        isOutputAmountValid &&
        !!selectedInputBase.address &&
        !!selectedOutputBase.address &&
        !isLoadingInputDecimals &&
        !isLoadingOutputDecimals,
    },
  });

  // Update derived amounts when calculations change
  React.useEffect(() => {
    if (swapMode === 'exactIn') {
      if (amountsOut && Array.isArray(amountsOut) && amountsOut[1] && isInputAmountValid) {
        setDerivedOutputAmount(formatUnits(BigInt(amountsOut[1].toString()), actualOutputDecimals));
        setDerivedInputAmount('');
      } else {
        setDerivedOutputAmount('');
      }
    } else if (swapMode === 'exactOut') {
      if (amountsIn && Array.isArray(amountsIn) && amountsIn[0] && isOutputAmountValid) {
        setDerivedInputAmount(formatUnits(BigInt(amountsIn[0].toString()), actualInputDecimals));
        setDerivedOutputAmount('');
      } else {
        setDerivedInputAmount('');
      }
    }
  }, [
    amountsOut,
    amountsIn,
    actualOutputDecimals,
    actualInputDecimals,
    isInputAmountValid,
    isOutputAmountValid,
    swapMode,
  ]);

  // Calculate USD values
  const inputUsdValue = React.useMemo(() => {
    const amount = swapMode === 'exactIn' ? inputAmount : derivedInputAmount;
    if (!amount) return '$0.00';
    const rate =
      USD_EXCHANGE_RATES[selectedInputBase.symbol as keyof typeof USD_EXCHANGE_RATES] || 0;
    return `$${(parseFloat(amount) * rate).toFixed(2)}`;
  }, [inputAmount, derivedInputAmount, selectedInputBase.symbol, swapMode]);

  const outputUsdValue = React.useMemo(() => {
    const amount = swapMode === 'exactOut' ? outputAmount : derivedOutputAmount;
    if (!amount) return '$0.00';
    const rate =
      USD_EXCHANGE_RATES[selectedOutputBase.symbol as keyof typeof USD_EXCHANGE_RATES] || 0;
    return `$${(parseFloat(amount) * rate).toFixed(2)}`;
  }, [outputAmount, derivedOutputAmount, selectedOutputBase.symbol, swapMode]);

  // --- Initial Rate Calculation (for 1 unit) ---
  const oneUnitInput = React.useMemo(() => {
    try {
      return parseUnits('1', actualInputDecimals);
    } catch {
      return BigInt(0);
    }
  }, [actualInputDecimals]);

  const { data: initialAmountsOut, isLoading: isLoadingInitialRate } = useReadContract({
    address: UNISWAP_V2_ROUTER_ADDRESS as `0x${string}`,
    abi: uniswapV2RouterAbi,
    functionName: 'getAmountsOut',
    args: [oneUnitInput, [selectedInputBase.address, selectedOutputBase.address]],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled:
        oneUnitInput > 0 &&
        !!selectedInputBase.address &&
        !!selectedOutputBase.address &&
        !isLoadingInputDecimals &&
        !isLoadingOutputDecimals,
      staleTime: 60_000,
    },
  });

  const initialRate = React.useMemo(() => {
    if (initialAmountsOut && Array.isArray(initialAmountsOut) && initialAmountsOut[1]) {
      try {
        const outputForOneUnit = formatUnits(
          BigInt(initialAmountsOut[1].toString()),
          actualOutputDecimals
        );
        return parseFloat(outputForOneUnit);
      } catch {
        return null;
      }
    }
    return null;
  }, [initialAmountsOut, actualOutputDecimals]);

  // Use derivedOutputAmount for actual swap rate if available, otherwise use initialRate
  const displayRate = React.useMemo(() => {
    if (
      swapMode === 'exactIn' &&
      isInputAmountValid &&
      derivedOutputAmount &&
      inputAmount !== '0'
    ) {
      const inputVal = parseFloat(inputAmount);
      const outputVal = parseFloat(derivedOutputAmount);
      if (inputVal > 0 && outputVal > 0) {
        return outputVal / inputVal;
      }
    } else if (
      swapMode === 'exactOut' &&
      isOutputAmountValid &&
      derivedInputAmount &&
      outputAmount !== '0'
    ) {
      const inputVal = parseFloat(derivedInputAmount);
      const outputVal = parseFloat(outputAmount);
      if (inputVal > 0 && outputVal > 0) {
        return outputVal / inputVal;
      }
    }
    return initialRate;
  }, [
    isInputAmountValid,
    isOutputAmountValid,
    inputAmount,
    outputAmount,
    derivedInputAmount,
    derivedOutputAmount,
    initialRate,
    swapMode,
  ]);

  // Calculate price impact
  const calculatePriceImpact = React.useCallback(
    (inputAmt: string, outputAmt: string) => {
      const inputRate =
        USD_EXCHANGE_RATES[selectedInputBase.symbol as keyof typeof USD_EXCHANGE_RATES] || 0;
      const outputRate =
        USD_EXCHANGE_RATES[selectedOutputBase.symbol as keyof typeof USD_EXCHANGE_RATES] || 0;
      if (inputRate > 0 && outputRate > 0) {
        const inputValueUsd = parseFloat(inputAmt) * inputRate;
        const outputValueUsd = parseFloat(outputAmt) * outputRate;
        if (inputValueUsd > 0) {
          const impact = ((inputValueUsd - outputValueUsd) / inputValueUsd) * 100;
          setPriceImpact(impact);
        } else {
          setPriceImpact(null);
        }
      } else {
        setPriceImpact(null);
      }
    },
    [selectedInputBase.symbol, selectedOutputBase.symbol]
  );

  // Price impact calculation
  React.useEffect(() => {
    if (swapMode === 'exactIn' && inputAmount && derivedOutputAmount) {
      calculatePriceImpact(inputAmount, derivedOutputAmount);
    } else if (swapMode === 'exactOut' && derivedInputAmount && outputAmount) {
      calculatePriceImpact(derivedInputAmount, outputAmount);
    } else {
      setPriceImpact(null);
    }
  }, [
    inputAmount,
    outputAmount,
    derivedInputAmount,
    derivedOutputAmount,
    swapMode,
    calculatePriceImpact,
  ]);

  // Loading states
  const isLoadingDecimals = isLoadingInputDecimals || isLoadingOutputDecimals;
  const isLoading =
    (swapMode === 'exactIn' ? isLoadingAmountsOut : isLoadingAmountsIn) ||
    isLoadingDecimals ||
    isLoadingInputBalance ||
    (isLoadingInitialRate && !initialRate);

  // Error handling
  React.useEffect(() => {
    if (!account) {
      setError('Please connect your wallet');
    } else if (
      (swapMode === 'exactIn' &&
        isInputAmountValid &&
        !derivedOutputAmount &&
        !isLoadingAmountsOut &&
        !isLoadingDecimals) ||
      (swapMode === 'exactOut' &&
        isOutputAmountValid &&
        !derivedInputAmount &&
        !isLoadingAmountsIn &&
        !isLoadingDecimals)
    ) {
      setError('Insufficient liquidity for this trade');
    } else if (
      inputBalance !== undefined &&
      !isLoadingInputBalance &&
      !isLoadingInputDecimals &&
      ((swapMode === 'exactIn' &&
        isInputAmountValid &&
        parseUnits(inputAmount, actualInputDecimals) > (inputBalance as bigint)) ||
        (swapMode === 'exactOut' &&
          isOutputAmountValid &&
          derivedInputAmount &&
          parseUnits(derivedInputAmount, actualInputDecimals) > (inputBalance as bigint)))
    ) {
      setError('Insufficient balance');
    } else {
      setError(null);
    }
  }, [
    account,
    inputAmount,
    outputAmount,
    isInputAmountValid,
    isOutputAmountValid,
    derivedOutputAmount,
    derivedInputAmount,
    isLoadingAmountsOut,
    isLoadingAmountsIn,
    isLoadingDecimals,
    inputBalance,
    isLoadingInputBalance,
    actualInputDecimals,
    isLoadingInputDecimals,
    swapMode,
  ]);

  const formattedInputBalance = React.useMemo(() => {
    if (typeof inputBalance !== 'bigint' || isLoadingInputBalance || isLoadingInputDecimals)
      return '...';
    return parseFloat(formatUnits(inputBalance, actualInputDecimals)).toFixed(4);
  }, [inputBalance, isLoadingInputBalance, isLoadingInputDecimals, actualInputDecimals]);

  return {
    derivedOutputAmount,
    derivedInputAmount,
    inputBalance: formattedInputBalance,
    inputBalanceBigInt: typeof inputBalance === 'bigint' ? inputBalance : undefined,
    inputUsdValue,
    outputUsdValue,
    displayRate,
    initialRate,
    priceImpact,
    actualInputDecimals,
    actualOutputDecimals,
    error,
    isLoading,
    isLoadingAmountsOut,
    isLoadingAmountsIn: swapMode === 'exactOut' ? isLoadingAmountsIn : false,
    isLoadingDecimals,
    isLoadingInitialRate,
  };
}
