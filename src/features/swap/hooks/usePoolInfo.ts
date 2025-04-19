import * as React from 'react';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';
import {
  BNB_TESTNET_CHAIN_ID,
  type BaseToken,
  UNISWAP_V2_FACTORY_ADDRESS,
  uniswapV2FactoryAbi,
  uniswapV2PoolAbi,
} from '../../web3/constants';

interface PoolInfoProps {
  tokenA?: BaseToken;
  tokenB?: BaseToken;
}

interface PoolReserves {
  reserve0: bigint;
  reserve1: bigint;
  reserve0Formatted: string;
  reserve1Formatted: string;
  blockTimestampLast: number;
  token0: `0x${string}`;
  token1: `0x${string}`;
  isTokenAToken0: boolean;
}

/**
 * Hook to directly access Uniswap V2 pool information
 * This provides lower-level access to pools compared to the router-based hooks
 */
export function usePoolInfo({ tokenA, tokenB }: PoolInfoProps) {
  const [poolAddress, setPoolAddress] = React.useState<`0x${string}` | undefined>(undefined);
  const [poolReserves, setPoolReserves] = React.useState<PoolReserves | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Only enable the query when both tokens are defined
  const shouldQueryPair =
    !!tokenA?.address && !!tokenB?.address && tokenA.address !== tokenB.address;

  // Convert addresses to checksummed format if needed
  const tokenAAddress = tokenA?.address as `0x${string}`;
  const tokenBAddress = tokenB?.address as `0x${string}`;

  // Get the pool address from the factory
  const { data: pairAddress, refetch: refetchPair } = useReadContract({
    address: UNISWAP_V2_FACTORY_ADDRESS,
    abi: uniswapV2FactoryAbi,
    functionName: 'getPair',
    args: shouldQueryPair ? [tokenAAddress, tokenBAddress] : undefined,
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: shouldQueryPair,
    },
  });

  // When we get a pair address, save it
  React.useEffect(() => {
    if (pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000') {
      setPoolAddress(pairAddress as `0x${string}`);
      setError(null);
    } else if (shouldQueryPair && pairAddress === '0x0000000000000000000000000000000000000000') {
      setPoolAddress(undefined);
      setError('No liquidity pool exists for this token pair');
    }
  }, [pairAddress, shouldQueryPair]);

  // Get token0 from the pool
  const { data: token0 } = useReadContract({
    address: poolAddress,
    abi: uniswapV2PoolAbi,
    functionName: 'token0',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: !!poolAddress,
    },
  });

  // Get token1 from the pool
  const { data: token1 } = useReadContract({
    address: poolAddress,
    abi: uniswapV2PoolAbi,
    functionName: 'token1',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: !!poolAddress,
    },
  });

  // Get reserves from the pool
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: poolAddress,
    abi: uniswapV2PoolAbi,
    functionName: 'getReserves',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: !!poolAddress,
    },
  });

  // Update the reserves when data changes
  React.useEffect(() => {
    if (reserves && token0 && token1 && tokenA && tokenB) {
      const [reserve0, reserve1, blockTimestampLast] = reserves as [bigint, bigint, number];

      // Determine if tokenA is token0 or token1
      const isTokenAToken0 =
        tokenA.address.toLowerCase() === (token0 as `0x${string}`).toLowerCase();

      // Format the reserves based on token decimals
      const reserve0Formatted = formatUnits(
        reserve0,
        isTokenAToken0 ? tokenA.decimals : tokenB.decimals
      );

      const reserve1Formatted = formatUnits(
        reserve1,
        isTokenAToken0 ? tokenB.decimals : tokenA.decimals
      );

      setPoolReserves({
        reserve0,
        reserve1,
        reserve0Formatted,
        reserve1Formatted,
        blockTimestampLast,
        token0: token0 as `0x${string}`,
        token1: token1 as `0x${string}`,
        isTokenAToken0,
      });
    } else {
      setPoolReserves(null);
    }
  }, [reserves, token0, token1, tokenA, tokenB]);

  // Function to refresh the pool data
  const refreshPool = React.useCallback(() => {
    refetchPair();
    if (poolAddress) {
      refetchReserves();
    }
  }, [poolAddress, refetchPair, refetchReserves]);

  return {
    poolAddress,
    poolReserves,
    error,
    refreshPool,
    // Direct access to token order in the pool
    token0: token0 as `0x${string}` | undefined,
    token1: token1 as `0x${string}` | undefined,
  };
}
