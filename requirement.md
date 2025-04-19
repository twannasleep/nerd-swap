## Overview

A dApp frontend project that replicates a Uniswap V2 token swap form on BNB Testnet, demonstrating frontend development, Web3 integration, and UI/UX design skills.

- **Network**: BNB Testnet (RPC: <https://data-seed-prebsc-1-s1.binance.org:8545/>)

## Core Requirements

### 2. Swap Form Features

- Token selection from predefined list (BNB, mock tokens)
- Amount input for either token
- Automatic rate calculation
- Display estimated swap rate
- Transaction status feedback

### 4. Smart Contract Details

- **Router Address**: `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`
- **Mock Token**: `0xfe113952C81D14520a8752C87c47f79564892bA3` (BEP-20: TEST63)
- Use standard Uniswap V2 Router ABI

### 5. UI/UX Requirements

- Token selection dropdowns/buttons
- Amount input fields
- Token swap button
- Transaction status display
- Responsive design (desktop/mobile)

## Bonus Features (Optional)

### 1. Unit Testing

- Test token selection logic
- Test amount calculations
- Test UI component rendering

### 2. Exact In/Out Implementation

- Toggle between exact_in and exact_out modes
- Implement swapExactTokensForTokens
- Implement swapTokensForExactTokens
- Dynamic pair reserves calculation
- Slippage tolerance (1-3%)

## Deliverables

### 1. GitHub Repository

- Private repo shared with: @tiendn, @meliodas95, @kanechan25
- Complete source code
- Setup instructions in README.md
- Optional: Unit tests and exact_in/exact_out implementation

### 2. Optional

- Live demo (Vercel/Netlify)

## Evaluation Criteria

### Core Components (100%)

- Frontend Core (40%)
- Web3 Integration (30%)
- UI/UX Design (20%)
- Code Quality (10%)

### Bonus Points

- Unit test implementation
- Exact in/out swap logic
- Creative UI/UX improvements

## Notes

- Wallet address should be provided to receive test tokens
- Partial completion is acceptable
- Evaluation based on:
  - Completed features
  - Code quality
  - Problem-solving approach
  - Overall implementation
