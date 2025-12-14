# VEG21 - Vegan Habit Tracker

## Overview
VEG21 is a blockchain-based web application designed to promote and gamify vegan lifestyle adoption through 21-day challenges. It integrates habit tracking, social impact, and cryptocurrency rewards (VEG21 tokens) to create an engaging ecosystem. The platform enables users to participate in vegan challenges, contribute to community causes, and earn rewards, fostering environmental sustainability and a growing vegan community. Key features include a global impact leaderboard, user profiles, onboarding flows, community feed with recipe sharing, daily check-ins with proof upload, and a token simulation layer with transaction tracking, all preparing for Celo Testnet integration.

---

## How the 21-Day Challenge Works

The core feature of VEG21 is a gamified 21-day vegan challenge designed to help users build sustainable habits.

### The Journey
1. **Choose Your Challenge** - Pick from 4 difficulty levels:
   - *21 días sin carne* (Beginner) - No meat for 21 days
   - *21 días de desayunos veganos* (Beginner) - Vegan breakfasts only
   - *21 días completamente vegano* (Intermediate) - Fully vegan diet
   - *21 días vegano zero waste* (Advanced) - Vegan + zero waste

2. **Earn Rewards at Milestones** - Total: 600 VEG21 tokens
   | Day | Reward | Description |
   |-----|--------|-------------|
   | 1   | 50 VEG21 | First day completed |
   | 7   | 100 VEG21 | First week completed |
   | 14  | 150 VEG21 | Two weeks completed |
   | 21  | 300 VEG21 | Challenge completed! |

3. **Daily Progress** - Each day shows:
   - "Inspiración Diaria" - A daily vegan tip or activity suggestion
   - Contextual message showing days until next milestone
   - Visual progress bar and day tracker

4. **Claim Rewards** - When you reach a milestone, a reward button appears. Click to claim your VEG21 tokens.

5. **Completion Celebration** - On Day 21, you see a trophy celebration with your total earned tokens and option to start a new challenge.

---

## Demo Mode vs Wallet Mode

VEG21 supports two modes to accommodate all users:

### Demo Mode (Default)
- **What it is**: A safe sandbox to explore all features without any real blockchain interaction
- **How to activate**: Click "Usar Wallet de Prueba" (Use Test Wallet) in the header
- **Visual indicator**: Purple banner showing "Demo Mode — No On-Chain Transactions"
- **What works**: All features function normally - challenges, rewards, donations, staking, leaderboard
- **Data storage**: Everything saved to browser localStorage
- **Best for**: First-time users, judges evaluating the app, development testing

### Wallet Mode (MetaMask)
- **What it is**: Real blockchain connection for actual token transactions
- **How to activate**: Click "Conectar" and approve MetaMask connection
- **Visual indicators**:
  - Yellow banner = Testnet (Celo Alfajores - free test tokens)
  - Green banner = Mainnet (Celo - real money)
- **Requirements**: MetaMask browser extension, network configured
- **Best for**: Production use once smart contracts are deployed

---

## What is Mocked or Simulated

For judges and collaborators: the following features are intentionally simulated for demonstration purposes.

### Currently Simulated (localStorage-based)
| Feature | What's Simulated | Production Path |
|---------|------------------|-----------------|
| **VEG21 Token Balance** | Stored in localStorage, no real tokens | Deploy VEG21Token.sol to Celo |
| **Reward Claims** | Milestone rewards added to localStorage balance | VEG21Rewards.sol contract |
| **Staking** | 10% APR calculated locally | VEG21Staking.sol contract |
| **Donations** | Token deductions from localStorage | VEG21Donations.sol contract |
| **Transfers** | Peer-to-peer transfers in localStorage | ERC20 transfer function |
| **Transaction History** | Events logged to localStorage | On-chain event logs |
| **Demo Wallet** | Fixed address: 0xDEMO...1234 | Real MetaMask address |

### Fully Functional (Real Implementation)
| Feature | Implementation |
|---------|----------------|
| **User Authentication** | Real PostgreSQL database, JWT tokens, bcrypt hashing |
| **User Profiles** | Persisted to PostgreSQL |
| **Community Posts** | Stored in PostgreSQL with likes/comments |
| **Challenge Progress** | Tracked in localStorage (upgradable to DB) |
| **Leaderboard** | Aggregates from user data |
| **UI/UX Flow** | Complete production-ready interface |

### Smart Contracts (Ready for Deployment)
Located in `/contracts/`:
- `VEG21Token.sol` - ERC20 token with mint/burn
- `VEG21Staking.sol` - Staking with 10% APR rewards
- `VEG21Donations.sol` - Charity donations with token burning
- `VEG21Rewards.sol` - Challenge completion reward distribution

Deployment scripts in `/scripts/deploy.ts` support:
- `--dry-run` - Simulate deployment without executing
- `--execute` - Real deployment to configured network

---

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technologies
- **Frontend**: React, TypeScript, Vite, Wouter (routing), Tailwind CSS, Shadcn/ui (component library), TanStack Query (server state).
- **Backend**: Express.js with TypeScript, modular storage interface, middleware pipeline.
- **Database**: Drizzle ORM with PostgreSQL dialect, schema-first approach, migration support.

### UI/UX and Design
- **Styling**: Tailwind CSS, Shadcn/ui, responsive design (mobile-first), custom vegan-themed color palette, CSS custom properties for theming.
- **Components**: High-quality, accessible React components built on Radix UI.
- **Visuals**: Crown/medal icons for leaderboard, custom avatars, progress bars, milestone badges, camera icons for proof uploads.

### Feature Specifications
- **Authentication System**: Email/password authentication with JWT tokens; PostgreSQL user storage; bcrypt password hashing; optional wallet linking; session persistence via localStorage token.
- **Leaderboard System**: Global ranking based on VEG21 tokens earned, donations, and staking rewards; community impact metrics dashboard.
- **User Profile & Onboarding**: Multi-step onboarding with challenge selection (meat-free, vegan breakfasts, full vegan, zero waste); editable user profiles with challenge progress, personal statistics, and gamification elements (badges).
- **Community Feed & Recipe Sharing**: Multi-type content system (recipes, tips, experiences) with forms; engagement features (likes, comments); content filtering; real-time community statistics.
- **Enhanced Onboarding & Challenge Flow**: User registration, daily check-ins with photo/video proof upload (mock), community validation for check-ins, automatic 21-day challenge completion detection with +50 VEG21 bonus, leaderboard integration.
- **Challenge UX Clarity System**: 
  - Standardized 600 VEG21 reward total distributed across milestones (Day 1: 50, Day 7: 100, Day 14: 150, Day 21: 300)
  - Post-selection confirmation step with milestone breakdown
  - Contextual progress messages ("X días para tu próximo hito", "¡Hito desbloqueado!")
  - "Inspiración Diaria" daily suggestions with helper text
  - First-time reward explanation (one-time localStorage-tracked message)
  - Day 21 completion celebration with trophy, total earned, and "Start another challenge" prompt
- **Token Simulation & Transaction System**: Comprehensive transaction history (claims, transfers, donations, staking); peer-to-peer VEG21 token transfers with balance validation; community activity feed displaying real-time token events.

### Authentication Architecture
- **Backend Routes**: 
  - POST /api/auth/register - Create account with email/password
  - POST /api/auth/login - Authenticate and receive JWT
  - GET /api/auth/me - Get current user (requires Bearer token)
  - PATCH /api/auth/me - Update user profile
  - POST /api/auth/link-wallet - Link MetaMask wallet to account
- **Frontend Components**:
  - AuthProvider context wrapping entire app
  - useAuth hook for authentication state
  - AuthModal with login/register tabs
  - User dropdown menu in header when authenticated
- **Security**: bcrypt password hashing, JWT tokens (7-day expiry), optional wallet connection (not required for platform use)

### Blockchain and Web3 Integration (Mainnet Ready)
- **Multi-Network Support**: Full configuration for Celo Alfajores testnet (chainId 44787), Celo Mainnet (chainId 42220), Astar Shibuya (chainId 81), local Hardhat (chainId 31337), and Demo mode with environment-based switching via VEG21_MODE variable.
- **Network Configuration**: Centralized configuration in `client/src/config/chainConfig.ts` with NetworkConfig interface defining chainId, name, displayName, RPC URL, block explorer, native currency, and testnet flag for each supported network.
- **Smart Contracts**: Complete VEG21 contract suite ready for deployment:
  - VEG21Token: ERC20 with minting/burning (18 decimals, 1M initial supply)
  - VEG21Staking: 10% APR staking rewards system
  - VEG21Donations: Charity donations with token burning
  - VEG21Rewards: Challenge completion rewards (+50 VEG21 for 21-day completion)
  - All contracts use OpenZeppelin libraries with role-based access control
- **Deployment Infrastructure**: Production-ready deployment system with:
  - Enhanced scripts/deploy.ts with --dry-run (simulation) and --execute (real deployment) modes
  - Mainnet safety guards: 10-second abort window, balance checks, gas estimation
  - scripts/validate_config.sh for environment validation
  - Private key validation guards preventing deployment without proper credentials
  - Default demo mode (no blockchain/private key required)
- **Wallet Integration**: MetaMask connection for real blockchain; demo wallet mode with localStorage simulation; enhanced wallet connection state management.
- **Mode Indicators**: Visual banners showing current mode:
  - 🟣 Purple banner: Demo Mode (safe, no transactions)
  - 🟡 Yellow banner: Testnet Mode (Celo Alfajores, free test CELO)
  - 🟢 Green banner: Mainnet Mode (Celo, real money)
- **Hybrid Architecture**: Demo mode localStorage simulation with seamless upgrade path to testnet/mainnet blockchain contracts.
- **Migration Path**: Clear deployment pathway: Demo (default) → Celo Alfajores (testnet) → Celo Mainnet (production)
- **Security**: Safe by default - no sensitive data in repository, private key validation, deployment confirmation required, .gitignore protection.

### State Management
- **Client-side**: React Query for server state caching, custom hooks for wallet and mobile detection, React Context for shared UI state (toasts, modals).

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database.

### Blockchain Infrastructure
- **MetaMask**: Web3 wallet for user authentication and blockchain transactions.
- **Celo Network**: Primary target Layer 1 blockchain - Celo Alfajores testnet (Chain ID 44787) prepared for Milestone 2 smart contract deployment.
- **Astar Network**: Secondary target Layer 1 blockchain - Astar Shibuya testnet (Chain ID 81) maintained for future deployment options.
- **Ethers.js**: Ethereum JavaScript library for blockchain interactions.
- **Demo Wallet**: Mock wallet address (0xDEMO1234567890abcdef1234567890abcdef1234) with localStorage simulation for testing without MetaMask.

### UI and Styling
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon library.
- **Google Fonts**: Custom typography.
- **Tailwind CSS**: Utility-first CSS framework.

### Content and Media
- **Unsplash**: External image hosting.
- **Font Awesome**: Icon library.

### Development Tools
- **Replit Integration**: Development environment optimizations.
- **ESBuild**: Fast JavaScript bundler.
- **PostCSS**: CSS processing.
- **Node.js**: Server runtime.
- **TypeScript**: Type checking.
- **Vite**: Development server.