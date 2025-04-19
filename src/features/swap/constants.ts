import {
  BNB_TESTNET_CHAIN_ID,
  BNB_TOKEN,
  type BaseToken,
  NATIVE_BNB_ADDRESS,
  TEST63_TOKEN,
  TEST63_TOKEN_ADDRESS,
  UNISWAP_V2_ROUTER_ADDRESS,
  WBNB_ADDRESS,
  uniswapV2PoolAbi,
  uniswapV2RouterAbi,
} from '../web3/constants';

// Re-export everything needed by swap feature
export {
  BNB_TESTNET_CHAIN_ID,
  BNB_TOKEN as BNB_BASE, // For backward compatibility
  NATIVE_BNB_ADDRESS,
  TEST63_TOKEN as TEST63_BASE, // For backward compatibility
  TEST63_TOKEN_ADDRESS,
  UNISWAP_V2_ROUTER_ADDRESS,
  WBNB_ADDRESS,
  uniswapV2PoolAbi,
  uniswapV2RouterAbi,
  type BaseToken,
};
