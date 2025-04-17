# Frontend Web3 Hometest: Uniswap V2 Swap Form Clone (Nerd Swap)

## Project Overview

Build a simple decentralized application (dApp) frontend that mimics a Uniswap V2 token swap form, interacting with the Uniswap V2 smart contract on the BNB Testnet.

## Tech Stack (Current Project Setup)

- **Framework**: Next.js (App Router) ✓
- **Language**: TypeScript ✓
- **Styling**: Tailwind CSS v4 ✓
- **UI Components**: Radix UI Primitives (via `src/components/ui`) ✓, `lucide-react` for icons ✓
- **State Management/Data Fetching**: `@tanstack/react-query` ✓
- **Web3**: `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `@reown/appkit-adapter-solana`, `wagmi`, `viem` ✓
- **Theming**: `next-themes` ✓
- **Testing**: Jest ✓
- **Linting/Formatting**: ESLint, Prettier, Commitlint, Lint-Staged, Husky ✓
- **Fonts**: Geist Sans, Geist Mono ✓

## Core Requirements (Hometest)

1. **Wallet Connection:**
   - Connect to MetaMask (or other wallets supported by AppKit) on BNB Testnet.
   - Display wallet connection status.
2. **Swap Form UI:**
   - Select two tokens: BNB (native) and a test ERC-20 token (TEST63: `0xfe113952C81D14520a8752C87c47f79564892bA3`).
   - Input field for the "input" token amount.
   - Display the calculated "output" token amount based on the Uniswap V2 pair rate.
   - Display the estimated swap rate (e.g., "1 BNB = X TEST63").
   - "Switch" button to reverse input/output tokens.
   - "Swap" button to initiate the transaction.
3. **Smart Contract Interaction:**
   - Use `viem` (provided via `wagmi`) to interact with contracts.
   - Interact with the Uniswap V2 Router contract on BNB Testnet (`0xD99D1c33F9fC3444f8101754aBC46c52416550D1`).
   - Use the Router ABI to fetch exchange rates (e.g., `getAmountsOut`) and execute swaps (e.g., `swapExactTokensForTokens` or `swapExactETHForTokens`).
   - Handle ERC-20 token approvals if necessary before swapping.
4. **Transaction Feedback:**
   - Show transaction status (Pending, Success, Failed) using notifications or UI elements.
5. **UI/UX:**
   - Clean, intuitive interface.
   - Responsive design (desktop/mobile).

## Bonus Features (Optional)

1. **Exact Input / Exact Output:**
   - Add UI toggle/indicator for `exact_in` vs `exact_out`.
   - Implement `exact_in` logic (`swapExactTokensForTokens` / `swapExactETHForTokens`).
   - Implement `exact_out` logic (`swapTokensForExactTokens` / `swapETHForExactTokens`).
   - Fetch pair reserves dynamically using the Uniswap V2 Pair contract ABI.
   - Handle slippage tolerance (e.g., 1-3%) by calculating min/max amounts for swap functions.
2. **Unit Tests:**
   - Write 1-2 unit tests (Jest/React Testing Library) for:
     - Token selection logic.
     - Amount calculation logic.
     - UI component rendering.

## Implementation Plan (Mapped to Requirements)

### Phase 1: Setup & Core UI [✓ - Mostly]

- [✓] Base Project Setup (Next.js, TS, Tailwind, Radix, Fonts, Linting)
- [✓] Theming (`next-themes`, Dark Mode)
- [✓] Header Component with Logo
- [✓] Web3 Dependencies Installed (`@reown/appkit`, `wagmi`, `viem`, etc.)

### Phase 2: Wallet Connection & Basic Swap UI [In Progress]

- [✓] Wallet Connection (`@reown/appkit` configured and `<appkit-button>` in Header)
- [ ] Create Swap Form Component (`src/features/swap/components/SwapForm.tsx` - _suggested path_)
  - [ ] Add Token Selection Dropdowns (using BNB & TEST63)
  - [ ] Add Input fields for amounts
  - [ ] Add "Switch Tokens" button functionality
  - [ ] Add "Swap" button (initially disabled)

### Phase 3: Contract Interaction - Rate & Swap Logic [ ]

- [ ] Define Constants (Router Address, Token Addresses, ABIs)
- [ ] Implement `getAmountsOut` / `getAmountsIn` logic using `wagmi`/`viem` hooks to fetch rates.
- [ ] Update UI to display calculated amounts and swap rate dynamically.
- [ ] Implement logic to check/request token approval (`approve` function).
- [ ] Implement core swap execution (`swapExactTokensForTokens` / `swapExactETHForTokens`).
- [ ] Enable "Swap" button when inputs are valid and wallet is connected.

### Phase 4: Transaction Handling & Feedback [ ]

- [ ] Use `wagmi` hooks (e.g., `useWaitForTransactionReceipt`) to track transaction status.
- [ ] Display transaction status feedback (e.g., using toasts/notifications or inline messages).
- [ ] Handle potential transaction errors gracefully.

### Phase 5: UI/UX Refinement [ ]

- [✓] Dark Mode implemented
- [ ] Ensure form responsiveness.
- [ ] Add loading states (fetching rates, pending transaction).
- [ ] Refine error messages.

### Phase 6: Bonus Features (Optional) [ ]

- [ ] Implement Exact In / Exact Out toggle and logic.
- [ ] Implement Slippage handling.
- [ ] Add Unit Tests.

### Phase 7: Documentation [ ]

- [✓] Basic README exists
- [✓] PLANNING.md updated
- [ ] Add detailed setup instructions to README.md.
- [ ] Add code comments where necessary.

## Constants Needed

```typescript
// BNB Testnet
const BNB_TESTNET_CHAIN_ID = 97;
const BNB_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// Contract Addresses (BNB Testnet)
const UNISWAP_V2_ROUTER_ADDRESS = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
const WBNB_ADDRESS = '0xae13d989dac2f0debff460ac112a837c89baa7cd'; // Wrapped BNB on Testnet
const TEST63_TOKEN_ADDRESS = '0xfe113952C81D14520a8752C87c47f79564892bA3';

// ABIs (Need to be sourced/added)
// const UNISWAP_V2_ROUTER_ABI = [...];
// const ERC20_ABI = [...]; // Standard ERC20 ABI for approval/balance
// const UNISWAP_V2_PAIR_ABI = [...]; // For bonus: fetching reserves
```

## Progress Tracking

- [✓] Phase 1: Setup & Core UI (Mostly complete)
- [✓] Phase 2: Wallet Connection established via AppKit
- [ ] Phase 2: Basic Swap UI needs creation
- [ ] Phase 3: Contract Interaction - Rate & Swap Logic
- [ ] Phase 4: Transaction Handling & Feedback
- [ ] Phase 5: UI/UX Refinement (Beyond dark mode)
- [ ] Phase 6: Bonus Features
- [✓] Phase 7: Documentation (Basic files created)

## Next Steps

1. Create the basic `SwapForm` component structure (Phase 2).
2. Add token data (BNB, TEST63) and implement selection UI.
3. Add input fields and the "Switch Tokens" button.
4. Start implementing the logic to fetch exchange rates using the Router contract (Phase 3).
