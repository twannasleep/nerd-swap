# Nerd Swap: Implementation Planning Document

## Project Overview

A dApp frontend that replicates a Uniswap V2 token swap form on BNB Testnet, showcasing frontend development, Web3 integration, and UI/UX design skills.

**Network**: BNB Testnet (RPC: <https://data-seed-prebsc-1-s1.binance.org:8545/>)

## Core Requirements Status

| Requirement          | Status    | Notes                             |
| -------------------- | --------- | --------------------------------- |
| Token selection      | Completed | Input and output token selection  |
| Amount input         | Completed | TokenAmountInput fully functional |
| Rate calculation     | Completed | useSwapCalculations implemented   |
| Swap execution       | Completed | Full swap flow implemented        |
| Transaction feedback | Completed | Toast notifications for all steps |

## Components Status

| Component           | Status    | Description                                |
| ------------------- | --------- | ------------------------------------------ |
| SwapForm            | Completed | Main swap interface container              |
| TokenAmountInput    | Completed | Input field for token amounts              |
| TokenSelectorDialog | Completed | Modal for selecting tokens                 |
| SlippageSettings    | Completed | Settings for slippage tolerance            |
| SwapButton          | Completed | Button to execute swap transaction         |
| PriceDisplay        | Completed | Shows exchange rate between tokens         |
| TransactionStatus   | Completed | Shows status of pending transactions       |
| ErrorDisplay        | Completed | Displays validation and transaction errors |
| NetworkStatus       | Completed | Shows network connection status            |
| ContractStatus      | Completed | Verifies contract integration              |

## Hooks Status

| Hook                | Status    | Description                       |
| ------------------- | --------- | --------------------------------- |
| useSwapState        | Completed | Manages swap form state           |
| useSwapCalculations | Completed | Calculates swap rates and amounts |
| useTokenBalances    | Completed | Fetches token balances            |
| useTokenAllowance   | Completed | Manages token approvals           |
| useSwapTransaction  | Completed | Executes swap transactions        |

## Current Development Tasks

| Task                            | Assignee | Status      | Priority | Est. Completion |
| ------------------------------- | -------- | ----------- | -------- | --------------- |
| Verify BNB Testnet config       |          | Completed   | High     | Completed       |
| Complete token balance display  |          | Completed   | High     | Completed       |
| Finish swap transaction logic   |          | Completed   | High     | Completed       |
| Improve TokenSelectorDialog     |          | Completed   | Medium   | Completed       |
| Implement transaction status UI |          | Completed   | Medium   | Completed       |
| Setup slippage settings UI      |          | Completed   | Medium   | Completed       |
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

- [x] Token balance display
  - [x] BNB balance
  - [x] TEST63 token balance
- [x] Token price calculation
  - [x] Implement getAmountsOut
  - [x] Price impact calculation
  - [x] Price refresh mechanism
- [x] Swap transaction logic
  - [x] BNB to Token (swapExactETHForTokens)
  - [x] Token to BNB (swapTokensForExactETH)
  - [x] Token to Token (swapExactTokensForTokens)
- [x] Token approval flow
  - [x] Check allowance
  - [x] Request approval
  - [x] Approval confirmation

### Phase 3: UI Enhancement (Medium Priority)

- [x] Complete token selection interface
  - [x] Token search functionality
  - [x] Token list with balances
  - [x] Token selection confirmation
- [x] Improve amount input UX
  - [x] Max button
  - [x] Input validation
  - [x] USD value display
- [x] Transaction status UI
  - [x] Loading indicators
  - [x] Success/error states
  - [x] Transaction details
- [x] Responsive design improvements
  - [x] Mobile-friendly layout
  - [x] Touch optimizations

### Phase 4: Bonus Features (Lower Priority)

- [ ] Exact In/Out Implementation
  - [ ] Toggle between modes
  - [ ] swapExactTokensForTokens implementation
  - [ ] swapTokensForExactTokens implementation
- [x] Slippage tolerance settings
  - [x] UI for settings
  - [x] Apply to calculations
  - [x] Persist preferences
- [ ] Additional token support
  - [x] Extended token list
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
