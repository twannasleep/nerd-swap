import * as React from 'react';
import { useDebounce } from 'use-debounce';
import { formatUnits, parseUnits } from 'viem';
import { useReadContract } from 'wagmi';
import {
  BNB_TESTNET_CHAIN_ID,
  UNISWAP_V2_ROUTER_ADDRESS,
  erc20Abi,
  uniswapV2RouterAbi,
} from '../constants';
import type { BaseToken } from '../types';

// Mock exchange rate for USD (in a real app, fetch this from an API)
// Consider moving this to constants or a config file
const USD_EXCHANGE_RATES = {
  BNB: 240.5, // 1 BNB = $240.5
  TEST63: 0.12, // 1 TEST63 = $0.12
};

interface UseSwapCalculationsProps {
  account?: `0x${string}` | undefined;
  inputAmount: string;
  selectedInputBase: BaseToken;
  selectedOutputBase: BaseToken;
}

export function useSwapCalculations({
  account,
  inputAmount,
  selectedInputBase,
  selectedOutputBase,
}: UseSwapCalculationsProps) {
  const [debouncedInputAmount] = useDebounce(inputAmount, 500);
  const [derivedOutputAmount, setDerivedOutputAmount] = React.useState('');
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
    args: [account!],
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

  // Calculate amounts out
  const isInputAmountValid = !!debouncedInputAmount && debouncedInputAmount !== '0';
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

  // Update derived output amount when amounts out changes
  React.useEffect(() => {
    if (amountsOut?.[1] && isInputAmountValid) {
      setDerivedOutputAmount(formatUnits(BigInt(amountsOut[1].toString()), actualOutputDecimals));
    } else {
      setDerivedOutputAmount('');
    }
  }, [amountsOut, actualOutputDecimals, isInputAmountValid]);

  // Calculate USD values
  const inputUsdValue = React.useMemo(() => {
    if (!inputAmount) return '$0.00';
    const rate =
      USD_EXCHANGE_RATES[selectedInputBase.symbol as keyof typeof USD_EXCHANGE_RATES] || 0;
    return `$${(parseFloat(inputAmount) * rate).toFixed(2)}`;
  }, [inputAmount, selectedInputBase.symbol]);

  const outputUsdValue = React.useMemo(() => {
    if (!derivedOutputAmount) return '$0.00';
    const rate =
      USD_EXCHANGE_RATES[selectedOutputBase.symbol as keyof typeof USD_EXCHANGE_RATES] || 0;
    return `$${(parseFloat(derivedOutputAmount) * rate).toFixed(2)}`;
  }, [derivedOutputAmount, selectedOutputBase.symbol]);

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
    if (initialAmountsOut?.[1]) {
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
    if (isInputAmountValid && derivedOutputAmount && inputAmount !== '0') {
      const inputVal = parseFloat(inputAmount);
      const outputVal = parseFloat(derivedOutputAmount);
      if (inputVal > 0 && outputVal > 0) {
        return outputVal / inputVal;
      }
    }
    return initialRate;
  }, [isInputAmountValid, inputAmount, derivedOutputAmount, initialRate]);

  // Calculate price impact
  React.useEffect(() => {
    if (inputAmount && derivedOutputAmount) {
      const inputRate =
        USD_EXCHANGE_RATES[selectedInputBase.symbol as keyof typeof USD_EXCHANGE_RATES] || 0;
      const outputRate =
        USD_EXCHANGE_RATES[selectedOutputBase.symbol as keyof typeof USD_EXCHANGE_RATES] || 0;
      if (inputRate > 0 && outputRate > 0) {
        const inputValueUsd = parseFloat(inputAmount) * inputRate;
        const outputValueUsd = parseFloat(derivedOutputAmount) * outputRate;
        if (inputValueUsd > 0) {
          const impact = ((inputValueUsd - outputValueUsd) / inputValueUsd) * 100;
          setPriceImpact(impact);
        } else {
          setPriceImpact(null);
        }
      } else {
        setPriceImpact(null);
      }
    } else {
      setPriceImpact(null);
    }
  }, [inputAmount, derivedOutputAmount, selectedInputBase.symbol, selectedOutputBase.symbol]);

  // Loading states
  const isLoadingDecimals = isLoadingInputDecimals || isLoadingOutputDecimals;
  const isLoading =
    isLoadingAmountsOut ||
    isLoadingDecimals ||
    isLoadingInputBalance ||
    (isLoadingInitialRate && !initialRate);

  // Error handling
  React.useEffect(() => {
    if (!account) {
      setError('Please connect your wallet');
    } else if (
      isInputAmountValid &&
      !derivedOutputAmount &&
      !isLoadingAmountsOut &&
      !isLoadingDecimals
    ) {
      setError('Insufficient liquidity for this trade');
    } else if (
      inputBalance !== undefined &&
      isInputAmountValid &&
      !isLoadingInputBalance &&
      !isLoadingInputDecimals &&
      parseUnits(inputAmount, actualInputDecimals) > (inputBalance as bigint)
    ) {
      setError('Insufficient balance');
    } else {
      setError(null);
    }
  }, [
    account,
    inputAmount,
    isInputAmountValid,
    derivedOutputAmount,
    isLoadingAmountsOut,
    isLoadingDecimals,
    inputBalance,
    isLoadingInputBalance,
    actualInputDecimals,
  ]);

  const formattedInputBalance = React.useMemo(() => {
    if (typeof inputBalance !== 'bigint' || isLoadingInputBalance || isLoadingInputDecimals)
      return '...';
    return parseFloat(formatUnits(inputBalance, actualInputDecimals)).toFixed(4);
  }, [inputBalance, isLoadingInputBalance, isLoadingInputDecimals, actualInputDecimals]);

  return {
    derivedOutputAmount,
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
    isLoadingDecimals,
    isLoadingInitialRate,
  };
}
