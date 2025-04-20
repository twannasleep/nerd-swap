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
  // Reduce debounce time for faster response
  const [debouncedInputAmount] = useDebounce(inputAmount, 200);
  const [debouncedOutputAmount] = useDebounce(outputAmount, 200);
  const [derivedOutputAmount, setDerivedOutputAmount] = React.useState('');
  const [derivedInputAmount, setDerivedInputAmount] = React.useState('');
  const [priceImpact, setPriceImpact] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [hasFailedSwapCalculation, setHasFailedSwapCalculation] = React.useState(false);
  const [exchangeRate, setExchangeRate] = React.useState<number | null>(null);
  const [lastRateUpdate, setLastRateUpdate] = React.useState<Date>(new Date());

  // Contract reads for token information - only when needed
  const { data: inputTokenDecimals, isLoading: isLoadingInputDecimals } = useReadContract({
    address: selectedInputBase.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: !!selectedInputBase.address,
      staleTime: Infinity, // Cache decimals indefinitely as they don't change
    },
  });

  const { data: outputTokenDecimals, isLoading: isLoadingOutputDecimals } = useReadContract({
    address: selectedOutputBase.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: !!selectedOutputBase.address,
      staleTime: Infinity, // Cache decimals indefinitely as they don't change
    },
  });

  const { data: inputBalance, isLoading: isLoadingInputBalance } = useReadContract({
    address: selectedInputBase.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: !!selectedInputBase.address && !!account,
      staleTime: 2000, // Cache balance for 2 seconds
    },
  });

  // Calculate rate for 1 token
  const oneTokenUnit = React.useMemo(() => {
    try {
      return parseUnits('1', selectedInputBase.decimals);
    } catch {
      return BigInt(0);
    }
  }, [selectedInputBase.decimals]);

  // Query for initial/current rate with optimized settings
  const {
    data: initialAmountsOut,
    isLoading: isLoadingInitialRate,
    refetch: refetchRate,
  } = useReadContract({
    address: UNISWAP_V2_ROUTER_ADDRESS as `0x${string}`,
    abi: uniswapV2RouterAbi,
    functionName: 'getAmountsOut',
    args: [oneTokenUnit, [selectedInputBase.address, selectedOutputBase.address]],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: oneTokenUnit > 0n && !!selectedInputBase.address && !!selectedOutputBase.address,
      staleTime: 2000, // Cache for 2 seconds
      retry: 1, // Reduce retry attempts
      retryDelay: 500, // Faster retry
    },
  });

  // Get the actual token decimals with default fallback
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

  // Optimize the amount validation checks
  const isInputAmountValid = React.useMemo(() => {
    if (swapMode !== 'exactIn' || !debouncedInputAmount) return false;
    try {
      const numValue = Number(debouncedInputAmount);
      return !isNaN(numValue) && numValue > 0;
    } catch {
      return false;
    }
  }, [swapMode, debouncedInputAmount]);

  const parsedDebouncedInputAmount = React.useMemo(() => {
    if (!isInputAmountValid) return BigInt(0);
    try {
      return parseUnits(debouncedInputAmount, actualInputDecimals);
    } catch {
      return BigInt(0);
    }
  }, [isInputAmountValid, debouncedInputAmount, actualInputDecimals]);

  // Calculate based on exact output (getAmountsIn)
  const isOutputAmountValid = React.useMemo(() => {
    if (swapMode !== 'exactOut' || !debouncedOutputAmount) return false;

    try {
      // Convert to number to handle scientific notation
      const numValue = Number(debouncedOutputAmount);
      // Check if it's a valid number and greater than 0
      return !isNaN(numValue) && numValue > 0;
    } catch {
      return false;
    }
  }, [swapMode, debouncedOutputAmount]);

  const parsedDebouncedOutputAmount = React.useMemo(() => {
    if (!isOutputAmountValid) return BigInt(0);
    try {
      return parseUnits(debouncedOutputAmount, actualOutputDecimals);
    } catch {
      return BigInt(0);
    }
  }, [isOutputAmountValid, debouncedOutputAmount, actualOutputDecimals]);

  // Contract calls for swap calculations
  const {
    data: amountsOut,
    isLoading: isLoadingAmountsOut,
    isError: isAmountsOutError,
  } = useReadContract({
    address: UNISWAP_V2_ROUTER_ADDRESS as `0x${string}`,
    abi: uniswapV2RouterAbi,
    functionName: 'getAmountsOut',
    args: [parsedDebouncedInputAmount, [selectedInputBase.address, selectedOutputBase.address]],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled:
        isInputAmountValid &&
        parsedDebouncedInputAmount > 0n &&
        !!selectedInputBase.address &&
        !!selectedOutputBase.address,
      retry: 1,
      retryDelay: 500,
      staleTime: 1000, // Cache for 1 second
    },
  });

  const {
    data: amountsIn,
    isLoading: isLoadingAmountsIn,
    isError: isAmountsInError,
  } = useReadContract({
    address: UNISWAP_V2_ROUTER_ADDRESS as `0x${string}`,
    abi: uniswapV2RouterAbi,
    functionName: 'getAmountsIn',
    args: [parsedDebouncedOutputAmount, [selectedOutputBase.address, selectedInputBase.address]],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled:
        isOutputAmountValid &&
        parsedDebouncedOutputAmount > 0n &&
        !!selectedInputBase.address &&
        !!selectedOutputBase.address,
      retry: 1,
      retryDelay: 500,
      staleTime: 1000,
    },
  });

  // Optimize loading state determination
  const isLoading = React.useMemo(() => {
    // Only consider essential loading states
    const isCalculating = swapMode === 'exactIn' ? isLoadingAmountsOut : isLoadingAmountsIn;
    const isInitializing = !exchangeRate && isLoadingInitialRate;

    // Don't show loading if we have valid amounts
    if (swapMode === 'exactIn' && derivedOutputAmount) return false;
    if (swapMode === 'exactOut' && derivedInputAmount) return false;

    return isCalculating || isInitializing;
  }, [
    swapMode,
    isLoadingAmountsOut,
    isLoadingAmountsIn,
    exchangeRate,
    isLoadingInitialRate,
    derivedOutputAmount,
    derivedInputAmount,
  ]);

  // Update exchange rate when initial amounts change
  React.useEffect(() => {
    if (initialAmountsOut && Array.isArray(initialAmountsOut) && initialAmountsOut[1]) {
      try {
        const outputAmount = formatUnits(
          BigInt(initialAmountsOut[1].toString()),
          actualOutputDecimals
        );
        const rate = parseFloat(outputAmount);
        if (!isNaN(rate) && rate > 0) {
          setExchangeRate(rate);
        }
      } catch (e) {
        console.error('Error calculating exchange rate:', e);
        setExchangeRate(null);
      }
    }
  }, [initialAmountsOut, actualOutputDecimals]);

  // Auto refresh rate every 5 seconds
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      refetchRate().then(() => {
        setLastRateUpdate(new Date());
      });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [refetchRate]);

  // Update exchange rate immediately when tokens change
  React.useEffect(() => {
    refetchRate().then(() => {
      setLastRateUpdate(new Date());
    });
  }, [selectedInputBase.address, selectedOutputBase.address, refetchRate]);

  // Handle errors from contract calls
  React.useEffect(() => {
    if (swapMode === 'exactIn' && isInputAmountValid && isAmountsOutError && !isLoadingAmountsOut) {
      console.error('Error calculating amounts out');
      setHasFailedSwapCalculation(true);
      setError('Insufficient liquidity for this trade');
    } else if (
      swapMode === 'exactOut' &&
      isOutputAmountValid &&
      isAmountsInError &&
      !isLoadingAmountsIn
    ) {
      console.error('Error calculating amounts in');
      setHasFailedSwapCalculation(true);
      setError('Insufficient liquidity for this trade');
    }
  }, [
    swapMode,
    isInputAmountValid,
    isOutputAmountValid,
    isAmountsOutError,
    isAmountsInError,
    isLoadingAmountsOut,
    isLoadingAmountsIn,
  ]);

  // Update derived amounts when calculations change
  React.useEffect(() => {
    if (swapMode === 'exactIn') {
      if (amountsOut && Array.isArray(amountsOut) && amountsOut[1] && isInputAmountValid) {
        try {
          const formattedOutput = formatUnits(
            BigInt(amountsOut[1].toString()),
            actualOutputDecimals
          );
          // Ensure we're not setting an invalid number
          const numValue = Number(formattedOutput);
          if (!isNaN(numValue) && numValue > 0) {
            setDerivedOutputAmount(formattedOutput);
            setDerivedInputAmount('');
            setHasFailedSwapCalculation(false);
            setError(null);
          } else {
            setDerivedOutputAmount('');
            setError('Invalid output amount calculated');
          }
        } catch (e) {
          console.error('Error formatting output amount:', e);
          setDerivedOutputAmount('');
          setError('Error calculating swap amounts');
        }
      } else if (hasFailedSwapCalculation) {
        setDerivedOutputAmount('');
      }
    } else if (swapMode === 'exactOut') {
      if (amountsIn && Array.isArray(amountsIn) && amountsIn[0] && isOutputAmountValid) {
        try {
          setDerivedInputAmount(formatUnits(BigInt(amountsIn[0].toString()), actualInputDecimals));
          setDerivedOutputAmount('');
          // Reset error state when calculation succeeds
          setHasFailedSwapCalculation(false);
          setError(null);
        } catch (e) {
          console.error('Error formatting input amount:', e);
          setDerivedInputAmount('');
          setError('Error calculating swap amounts');
        }
      } else if (hasFailedSwapCalculation) {
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
    hasFailedSwapCalculation,
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

  // Format the exchange rate display
  const formattedExchangeRate = React.useMemo(() => {
    if (exchangeRate === null) return 'Loading...';
    return `1 ${selectedInputBase.symbol} = ${exchangeRate.toFixed(6)} ${selectedOutputBase.symbol}`;
  }, [exchangeRate, selectedInputBase.symbol, selectedOutputBase.symbol]);

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
    return exchangeRate;
  }, [
    isInputAmountValid,
    isOutputAmountValid,
    inputAmount,
    outputAmount,
    derivedInputAmount,
    derivedOutputAmount,
    exchangeRate,
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

  // Error handling
  React.useEffect(() => {
    if (!account) {
      // Don't set any error when wallet is not connected
      setError(null);
    } else if (
      (swapMode === 'exactIn' &&
        isInputAmountValid &&
        !derivedOutputAmount &&
        !isLoadingAmountsOut &&
        !isLoadingInputDecimals) ||
      (swapMode === 'exactOut' &&
        isOutputAmountValid &&
        !derivedInputAmount &&
        !isLoadingAmountsIn &&
        !isLoadingOutputDecimals)
    ) {
      setError('Insufficient liquidity for this trade');
    } else if (
      account && // Only check balance if wallet is connected
      inputBalance !== undefined &&
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
    isLoadingInputDecimals,
    isLoadingOutputDecimals,
    inputBalance,
    actualInputDecimals,
    swapMode,
  ]);

  const formattedInputBalance = React.useMemo(() => {
    if (!account) return '0.0000'; // Return 0 when wallet not connected
    if (typeof inputBalance !== 'bigint' || isLoadingInputDecimals) return '...';
    return parseFloat(formatUnits(inputBalance, actualInputDecimals)).toFixed(4);
  }, [account, inputBalance, isLoadingInputDecimals, actualInputDecimals]);

  return {
    derivedOutputAmount,
    derivedInputAmount,
    inputBalance: formattedInputBalance,
    inputBalanceBigInt: typeof inputBalance === 'bigint' ? inputBalance : undefined,
    inputUsdValue,
    outputUsdValue,
    displayRate,
    exchangeRate,
    priceImpact,
    actualInputDecimals,
    actualOutputDecimals,
    error,
    isLoading,
    isLoadingAmountsOut: isLoadingAmountsOut && !derivedOutputAmount,
    isLoadingAmountsIn: swapMode === 'exactOut' ? isLoadingAmountsIn && !derivedInputAmount : false,
    isLoadingDecimals: false, // We don't need to show this loading state
    isLoadingInitialRate: isLoadingInitialRate && !exchangeRate,
    formattedExchangeRate,
    lastRateUpdate,
  };
}
