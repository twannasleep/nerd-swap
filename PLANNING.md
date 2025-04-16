# Uniswap V2 Swap Form Clone - Project Planning

## Project Overview

A decentralized application (dApp) frontend that mimics a Uniswap V2 token swap form, with Web3 integration on BNB Testnet.

## Tech Stack

- **Framework**: Next.js 15.3.0
- **Language**: TypeScript
- **UI**: TailwindCSS
- **Web3**: TBD (wagmi/rainbowkit + viem/ethers.js)
- **Testing**: Jest + React Testing Library

## Project Structure

```
src/
├── app/                        # Next.js app structure
├── features/                   # Feature-based organization
│   ├── web3/                   # Web3 integration feature
│   ├── tokens/                 # Token management feature
│   ├── swap/                   # Swap functionality feature
│   └── transactions/           # Transaction handling feature
├── components/                 # Shared UI components
├── utils/                      # Shared utilities
└── providers/                  # App-wide providers
```

## Implementation Plan

### Phase 1: Project Setup [ ]

- [ ] Initialize Web3 dependencies
  - [ ] Install and configure wagmi/rainbowkit
  - [ ] Install and configure viem/ethers.js
- [ ] Configure TailwindCSS
- [ ] Set up project structure
- [ ] Configure BNB Testnet RPC

### Phase 2: Web3 Integration [ ]

- [ ] Create Web3 provider wrapper
- [ ] Implement wallet connection
  - [ ] Connect button component
  - [ ] Wallet status display
- [ ] Set up contract interaction utilities
- [ ] Configure Uniswap V2 Router contract

### Phase 3: Token Management [ ]

- [ ] Create token list configuration
  - [ ] BNB token
  - [ ] TEST63 token
- [ ] Implement token selection UI
  - [ ] Token dropdown component
  - [ ] Token balance display
- [ ] Create token price fetching logic

### Phase 4: Swap Form Implementation [ ]

- [ ] Create swap form UI
  - [ ] Input/output fields
  - [ ] Token selection dropdowns
  - [ ] Switch tokens button
- [ ] Implement price calculation
  - [ ] Get pair reserves
  - [ ] Calculate exchange rate
- [ ] Add slippage handling
  - [ ] Slippage input
  - [ ] Minimum output calculation

### Phase 5: Transaction Handling [ ]

- [ ] Implement swap execution
  - [ ] Approve token spending
  - [ ] Execute swap transaction
- [ ] Add transaction status tracking
  - [ ] Pending state
  - [ ] Success state
  - [ ] Error handling
- [ ] Create transaction feedback UI

### Phase 6: UI/UX Refinement [ ]

- [ ] Implement responsive design
- [ ] Add loading states
- [ ] Create error messages
- [ ] Add success notifications
- [ ] Implement dark/light mode (optional)

### Phase 7: Bonus Features [ ]

- [ ] Implement exact_in/exact_out swap logic
  - [ ] Toggle between modes
  - [ ] Different calculation methods
- [ ] Add unit tests
  - [ ] Token selection tests
  - [ ] Price calculation tests
  - [ ] Transaction flow tests

### Phase 8: Documentation & Deployment [ ]

- [ ] Create detailed README
- [ ] Document setup instructions
- [ ] Add code comments
- [ ] Deploy to Vercel/Netlify (optional)

## Testing Checklist

- [ ] Wallet connection
- [ ] Token selection
- [ ] Price calculation
- [ ] Swap execution
- [ ] Transaction status
- [ ] Error handling
- [ ] Responsive design

## Dependencies to Install

```bash
# Web3
npm install wagmi viem @rainbow-me/rainbowkit

# UI
npm install @headlessui/react @heroicons/react

# Testing
npm install @testing-library/react @testing-library/jest-dom
```

## Constants

```typescript
// BNB Testnet
const BNB_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// Contract Addresses
const UNISWAP_V2_ROUTER = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
const TEST_TOKEN = '0xfe113952C81D14520a8752C87c47f79564892bA3';

// Default Slippage
const DEFAULT_SLIPPAGE = 0.5; // 0.5%
```

## Progress Tracking

- [ ] Phase 1: Project Setup
- [ ] Phase 2: Web3 Integration
- [ ] Phase 3: Token Management
- [ ] Phase 4: Swap Form Implementation
- [ ] Phase 5: Transaction Handling
- [ ] Phase 6: UI/UX Refinement
- [ ] Phase 7: Bonus Features
- [ ] Phase 8: Documentation & Deployment

## Notes

- Keep track of any issues or blockers
- Document important decisions
- Update this file as progress is made
