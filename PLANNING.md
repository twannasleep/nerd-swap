# Nerd Swap: Implementation Planning Document

## Project Overview

A dApp frontend that replicates a Uniswap V2 token swap form on BNB Testnet, showcasing frontend development, Web3 integration, and UI/UX design skills.

**Network**: BNB Testnet (RPC: <https://data-seed-prebsc-1-s1.binance.org:8545/>)

## Core Requirements Status

| Requirement          | Status      | Notes                             |
| -------------------- | ----------- | --------------------------------- |
| Token selection      | In Progress | Basic UI components exist         |
| Amount input         | In Progress | TokenAmountInput component exists |
| Rate calculation     | In Progress | useSwapCalculations hook exists   |
| Swap execution       | In Progress | Basic structure in SwapForm.tsx   |
| Transaction feedback | In Progress | Basic toast notifications exist   |

## Components Status

| Component           | Status      | Description                                |
| ------------------- | ----------- | ------------------------------------------ |
| SwapForm            | In Progress | Main swap interface container              |
| TokenAmountInput    | In Progress | Input field for token amounts              |
| TokenSelectorDialog | In Progress | Modal for selecting tokens                 |
| SlippageSettings    | In Progress | Settings for slippage tolerance            |
| SwapButton          | Not Started | Button to execute swap transaction         |
| PriceDisplay        | Not Started | Shows exchange rate between tokens         |
| TransactionStatus   | Not Started | Shows status of pending transactions       |
| ErrorDisplay        | Not Started | Displays validation and transaction errors |
| NetworkStatus       | Completed   | Shows network connection status            |
| ContractStatus      | Completed   | Verifies contract integration              |

## Hooks Status

| Hook                | Status      | Description                       |
| ------------------- | ----------- | --------------------------------- |
| useSwapState        | In Progress | Manages swap form state           |
| useSwapCalculations | In Progress | Calculates swap rates and amounts |
| useTokenBalances    | Not Started | Fetches token balances            |
| useTokenAllowance   | Not Started | Manages token approvals           |
| useSwapTransaction  | Not Started | Executes swap transactions        |

## Current Development Tasks

| Task                            | Assignee | Status      | Priority | Est. Completion |
| ------------------------------- | -------- | ----------- | -------- | --------------- |
| Verify BNB Testnet config       |          | Completed   | High     |                 |
| Complete token balance display  |          | Not Started | High     |                 |
| Finish swap transaction logic   |          | Not Started | High     |                 |
| Improve TokenSelectorDialog     |          | Not Started | Medium   |                 |
| Implement transaction status UI |          | Not Started | Medium   |                 |
| Setup slippage settings UI      |          | Not Started | Medium   |                 |
| Create unit tests               |          | Not Started | Low      |                 |
| Document components             |          | Not Started | Low      |                 |

## Implementation Phases

### Phase 1: Core Web3 Integration (High Priority)

- [x] Project setup with Next.js, TypeScript, and Tailwind
- [x] Install required dependencies
- [x] Setup shadcn/ui components
- [x] Verify BNB Testnet configuration
  - [x] Confirm RPC connection
  - [x] Test network switching
- [x] Wallet connection integration
  - [x] Connect wallet button
  - [x] Display connected account
- [x] Contract integration
  - [x] Router address configuration (0xD99D1c33F9fC3444f8101754aBC46c52416550D1)
  - [x] Add TEST63 token contract (0xfe113952C81D14520a8752C87c47f79564892bA3)
  - [x] Implement contract ABIs

### Phase 2: Swap Core Functionality (High Priority)

- [ ] Token balance display
  - [ ] BNB balance
  - [ ] TEST63 token balance
- [ ] Token price calculation
  - [ ] Implement getAmountsOut
  - [ ] Price impact calculation
  - [ ] Price refresh mechanism
- [ ] Swap transaction logic
  - [ ] BNB to Token (swapExactETHForTokens)
  - [ ] Token to BNB (swapExactTokensForETH)
  - [ ] Token to Token (swapExactTokensForTokens)
- [ ] Token approval flow
  - [ ] Check allowance
  - [ ] Request approval
  - [ ] Approval confirmation

### Phase 3: UI Enhancement (Medium Priority)

- [ ] Complete token selection interface
  - [ ] Token search functionality
  - [ ] Token list with balances
  - [ ] Token selection confirmation
- [ ] Improve amount input UX
  - [ ] Max button
  - [ ] Input validation
  - [ ] USD value display
- [ ] Transaction status UI
  - [ ] Loading indicators
  - [ ] Success/error states
  - [ ] Transaction details
- [ ] Responsive design improvements
  - [ ] Mobile-friendly layout
  - [ ] Touch optimizations

### Phase 4: Bonus Features (Lower Priority)

- [ ] Exact In/Out Implementation
  - [ ] Toggle between modes
  - [ ] swapExactTokensForTokens implementation
  - [ ] swapTokensForExactTokens implementation
- [ ] Slippage tolerance settings
  - [ ] UI for settings
  - [ ] Apply to calculations
  - [ ] Persist preferences
- [ ] Additional token support
  - [ ] Extended token list
  - [ ] Token import feature
- [ ] Price chart integration
  - [ ] Historical price data
  - [ ] Visual chart component

### Phase 5: Testing & Refinement (Ongoing)

- [ ] Unit tests
  - [ ] Token selection logic
  - [ ] Amount calculation
  - [ ] UI component rendering
- [ ] End-to-end testing
  - [ ] Complete swap flow
  - [ ] Error handling
- [ ] Performance optimization
  - [ ] Bundle size optimization
  - [ ] Loading speed improvements
- [ ] Documentation
  - [ ] README update
  - [ ] Setup instructions
  - [ ] Usage guide

## Delivery Preparation

### Documentation

- [ ] Update README.md
  - [ ] Project overview
  - [ ] Technologies used
  - [ ] Setup instructions
  - [ ] Usage guide
  - [ ] Screenshots
- [ ] Code comments
  - [ ] Document complex logic
  - [ ] Explain contract interactions
  - [ ] Add JSDoc to hooks and components

### Deployment

- [ ] Setup Vercel/Netlify project
- [ ] Configure environment variables
- [ ] Initial build and test
- [ ] Final deployment
- [ ] Share live demo URL

### Final Testing

- [ ] Cross-browser testing
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
- [ ] Mobile testing
  - [ ] iOS Safari
  - [ ] Android Chrome
- [ ] Test with MetaMask
- [ ] Test with other wallets

### GitHub Finalization

- [ ] Share private repo with evaluators:
  - [ ] @tiendn
  - [ ] @meliodas95
  - [ ] @kanechan25
- [ ] Final code cleanup
- [ ] Organize project files
- [ ] Add planning.md to repository

## Technical Considerations

### Web3 Integration

- Use wagmi hooks for contract interactions
- Implement proper error handling for blockchain interactions
- Consider gas estimation and transaction optimization

### UI/UX Design

- Follow shadcn/ui design patterns
- Ensure responsive design works on all screen sizes
- Implement proper loading states and error handling
- Consider accessibility for all UI components

### Performance

- Optimize re-renders
- Cache blockchain queries with TanStack Query
- Minimize external requests

## Timeline Estimate

- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 1-2 days
- Phase 4: 2-3 days (optional)
- Phase 5: Ongoing

## Dependencies and Resources

- Uniswap V2 Router Documentation
- BNB Testnet Faucet: <https://testnet.bnbchain.org/faucet-smart>
- Block Explorer: <https://testnet.bscscan.com>
