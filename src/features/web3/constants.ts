import { Address } from 'viem';
import uniswapV2FactoryAbi from './abi/uniswap-v2-factory.abi.json';
import uniswapV2PoolAbi from './abi/uniswap-v2-pool.abi.json';
import uniswapV2RouterAbi from './abi/uniswap-v2-router.abi.json';

// Chain Constants
export const BNB_TESTNET_CHAIN_ID = 97;

// Contract Addresses - All typed as Address
export const UNISWAP_V2_ROUTER_ADDRESS: Address = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
export const UNISWAP_V2_FACTORY_ADDRESS: Address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
export const WBNB_ADDRESS: Address = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
export const TEST63_TOKEN_ADDRESS: Address = '0xfe113952C81D14520a8752C87c47f79564892bA3';

// Special sentinel address for native BNB (not an actual contract address)
export const NATIVE_BNB_ADDRESS: Address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// Default swap settings
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const DEFAULT_DEADLINE_MINUTES = 20;

// Token Type Definition
export interface BaseToken {
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
  logoURI: string;
  isNative?: boolean;
}

// Token Definitions - Using the BaseToken interface
export const BNB_TOKEN: BaseToken = {
  name: 'Binance Coin',
  symbol: 'BNB',
  decimals: 18,
  address: NATIVE_BNB_ADDRESS,
  logoURI: 'https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png',
  isNative: true,
};

export const TEST63_TOKEN: BaseToken = {
  name: 'Test Token 63',
  symbol: 'TEST63',
  decimals: 18,
  address: TEST63_TOKEN_ADDRESS,
  logoURI: 'https://etherscan.io/images/main/empty-token.png',
  isNative: false,
};

// Token list for convenience
export const TOKENS = {
  BNB: BNB_TOKEN,
  TEST63: TEST63_TOKEN,
} as const;

// Export all ABIs
export { uniswapV2RouterAbi, uniswapV2PoolAbi, uniswapV2FactoryAbi };
