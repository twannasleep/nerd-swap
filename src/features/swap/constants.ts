// BNB Testnet Constants
export const BNB_TESTNET_CHAIN_ID = 97;

// Contract Addresses (BNB Testnet)
export const UNISWAP_V2_ROUTER_ADDRESS = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1' as const;
export const WBNB_ADDRESS = '0xae13d989dac2f0debff460ac112a837c89baa7cd' as const; // Wrapped BNB on Testnet
export const TEST63_TOKEN_ADDRESS = '0xfe113952C81D14520a8752C87c47f79564892bA3' as const;

// Minimal ERC20 ABI (for decimals, balance, approval)
export const erc20Abi = [
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'who', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Minimal Uniswap V2 Router ABI (for fetching rates)
export const uniswapV2RouterAbi = [
  {
    inputs: [
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Add swap functions later as needed
  // swapExactTokensForTokens, swapExactETHForTokens, etc.
] as const;
