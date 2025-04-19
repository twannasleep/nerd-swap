import * as React from 'react';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  BNB_TESTNET_CHAIN_ID,
  type BaseToken,
  NATIVE_BNB_ADDRESS,
  UNISWAP_V2_ROUTER_ADDRESS,
  uniswapV2RouterAbi,
} from '../../web3/constants';

interface UseLiquidityProps {
  account?: `0x${string}` | undefined;
  tokenA?: BaseToken;
  tokenB?: BaseToken;
  amountA: string;
  amountB: string;
  slippage: number;
}

export function useLiquidity({
  account,
  tokenA,
  tokenB,
  amountA,
  amountB,
  slippage,
}: UseLiquidityProps) {
  const [isLiquidityActionPending, setIsLiquidityActionPending] = React.useState(false);

  const {
    data: liquidityWriteHash,
    isPending: isLiquidityTxPending,
    writeContractAsync: liquidityActionAsync,
  } = useWriteContract();

  const { isLoading: isWaitingForLiquidityConfirmation, isSuccess: isLiquiditySuccess } =
    useWaitForTransactionReceipt({
      hash: liquidityWriteHash,
    });

  const isProcessing = isLiquidityTxPending || isWaitingForLiquidityConfirmation;

  // Convert input amounts to BigInt with proper decimals
  const amountABigInt = React.useMemo(() => {
    try {
      return parseUnits(amountA || '0', tokenA?.decimals || 18);
    } catch {
      return 0n;
    }
  }, [amountA, tokenA?.decimals]);

  const amountBBigInt = React.useMemo(() => {
    try {
      return parseUnits(amountB || '0', tokenB?.decimals || 18);
    } catch {
      return 0n;
    }
  }, [amountB, tokenB?.decimals]);

  // Calculate minimum amounts with slippage tolerance
  const amountAMin = React.useMemo(() => {
    return (amountABigInt * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);
  }, [amountABigInt, slippage]);

  const amountBMin = React.useMemo(() => {
    return (amountBBigInt * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);
  }, [amountBBigInt, slippage]);

  // Add liquidity function
  const addLiquidity = React.useCallback(async () => {
    if (
      !account ||
      !liquidityActionAsync ||
      isProcessing ||
      !tokenA ||
      !tokenB ||
      !amountA ||
      !amountB
    ) {
      toast.error('Cannot add liquidity with the current inputs');
      return false;
    }

    if (amountABigInt <= 0n || amountBBigInt <= 0n) {
      toast.error('Both token amounts must be greater than zero');
      return false;
    }

    try {
      setIsLiquidityActionPending(true);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 min deadline

      const tokenAIsNative = tokenA.address === NATIVE_BNB_ADDRESS;
      const tokenBIsNative = tokenB.address === NATIVE_BNB_ADDRESS;

      let txHash: `0x${string}` | undefined;

      if (tokenAIsNative || tokenBIsNative) {
        // ETH + Token case
        const token = tokenAIsNative ? tokenB : tokenA;
        const tokenAmount = tokenAIsNative ? amountBBigInt : amountABigInt;
        const tokenAmountMin = tokenAIsNative ? amountBMin : amountAMin;
        const ethAmount = tokenAIsNative ? amountABigInt : amountBBigInt;
        const ethAmountMin = tokenAIsNative ? amountAMin : amountBMin;

        txHash = await liquidityActionAsync({
          address: UNISWAP_V2_ROUTER_ADDRESS,
          abi: uniswapV2RouterAbi,
          functionName: 'addLiquidityETH',
          args: [token.address, tokenAmount, tokenAmountMin, ethAmountMin, account, deadline],
          value: ethAmount,
          chainId: BNB_TESTNET_CHAIN_ID,
        });
      } else {
        // Token + Token case
        txHash = await liquidityActionAsync({
          address: UNISWAP_V2_ROUTER_ADDRESS,
          abi: uniswapV2RouterAbi,
          functionName: 'addLiquidity',
          args: [
            tokenA.address,
            tokenB.address,
            amountABigInt,
            amountBBigInt,
            amountAMin,
            amountBMin,
            account,
            deadline,
          ],
          chainId: BNB_TESTNET_CHAIN_ID,
        });
      }

      if (txHash) {
        toast.success('Add liquidity transaction sent', {
          description: `Adding liquidity with ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol}`,
        });
        return true;
      } else {
        toast.error('Failed to send add liquidity transaction');
        return false;
      }
    } catch (error) {
      console.error('Add liquidity error:', error);
      toast.error('Failed to add liquidity', { description: (error as Error)?.message });
      return false;
    } finally {
      setIsLiquidityActionPending(false);
    }
  }, [
    account,
    liquidityActionAsync,
    isProcessing,
    tokenA,
    tokenB,
    amountA,
    amountB,
    amountABigInt,
    amountBBigInt,
    amountAMin,
    amountBMin,
  ]);

  // Remove liquidity function (simplified version)
  const removeLiquidity = React.useCallback(
    async (liquidityAmount: bigint) => {
      if (
        !account ||
        !liquidityActionAsync ||
        isProcessing ||
        !tokenA ||
        !tokenB ||
        liquidityAmount <= 0n
      ) {
        toast.error('Cannot remove liquidity with the current inputs');
        return false;
      }

      try {
        setIsLiquidityActionPending(true);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 min deadline

        const tokenAIsNative = tokenA.address === NATIVE_BNB_ADDRESS;
        const tokenBIsNative = tokenB.address === NATIVE_BNB_ADDRESS;

        let txHash: `0x${string}` | undefined;

        if (tokenAIsNative || tokenBIsNative) {
          // ETH + Token case
          const token = tokenAIsNative ? tokenB : tokenA;
          const tokenAmountMin =
            (amountABigInt * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);
          const ethAmountMin =
            (amountBBigInt * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);

          txHash = await liquidityActionAsync({
            address: UNISWAP_V2_ROUTER_ADDRESS,
            abi: uniswapV2RouterAbi,
            functionName: 'removeLiquidityETH',
            args: [token.address, liquidityAmount, tokenAmountMin, ethAmountMin, account, deadline],
            chainId: BNB_TESTNET_CHAIN_ID,
          });
        } else {
          // Token + Token case
          txHash = await liquidityActionAsync({
            address: UNISWAP_V2_ROUTER_ADDRESS,
            abi: uniswapV2RouterAbi,
            functionName: 'removeLiquidity',
            args: [
              tokenA.address,
              tokenB.address,
              liquidityAmount,
              amountAMin,
              amountBMin,
              account,
              deadline,
            ],
            chainId: BNB_TESTNET_CHAIN_ID,
          });
        }

        if (txHash) {
          toast.success('Remove liquidity transaction sent', {
            description: `Removing liquidity for ${tokenA.symbol}/${tokenB.symbol} pair`,
          });
          return true;
        } else {
          toast.error('Failed to send remove liquidity transaction');
          return false;
        }
      } catch (error) {
        console.error('Remove liquidity error:', error);
        toast.error('Failed to remove liquidity', { description: (error as Error)?.message });
        return false;
      } finally {
        setIsLiquidityActionPending(false);
      }
    },
    [
      account,
      liquidityActionAsync,
      isProcessing,
      tokenA,
      tokenB,
      amountABigInt,
      amountBBigInt,
      amountAMin,
      amountBMin,
      slippage,
    ]
  );

  return {
    addLiquidity,
    removeLiquidity,
    isLiquidityActionPending,
    isLiquiditySuccess,
    isProcessing,
  };
}
