import { Address } from 'viem';

// Contract Addresses from PLANNING.md
export const UNISWAP_V2_ROUTER: Address = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
export const TEST_TOKEN: Address = '0xfe113952C81D14520a8752C87c47f79564892bA3';

// Default Slippage from PLANNING.md
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%

// Token List Configuration
export const TOKENS = {
  BNB: {
    symbol: 'BNB',
    name: 'Binance Coin',
    decimals: 18,
    isNative: true,
  },
  TEST63: {
    symbol: 'TEST63',
    name: 'TEST63 Token',
    address: TEST_TOKEN,
    decimals: 18,
    isNative: false,
  },
} as const;
