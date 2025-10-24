# VEG21 - Vegan Habit Tracker

## Overview
VEG21 is a blockchain-based web application designed to promote and gamify vegan lifestyle adoption through 21-day challenges. It integrates habit tracking, social impact, and cryptocurrency rewards (VEG21 tokens) to create an engaging ecosystem. The platform enables users to participate in vegan challenges, contribute to community causes, and earn rewards, fostering environmental sustainability and a growing vegan community. Key features include a global impact leaderboard, user profiles, onboarding flows, community feed with recipe sharing, daily check-ins with proof upload, and a token simulation layer with transaction tracking, all preparing for Celo Testnet integration.

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
- **Leaderboard System**: Global ranking based on VEG21 tokens earned, donations, and staking rewards; community impact metrics dashboard; localStorage persistence.
- **User Profile & Onboarding**: Multi-step onboarding with challenge selection (meat-free, vegan breakfasts, full vegan, zero waste); editable user profiles with challenge progress, personal statistics, and gamification elements (badges); localStorage persistence.
- **Community Feed & Recipe Sharing**: Multi-type content system (recipes, tips, experiences) with forms; engagement features (likes, comments); content filtering; real-time community statistics; localStorage persistence.
- **Enhanced Onboarding & Challenge Flow**: User registration, daily check-ins with photo/video proof upload (mock), community validation for check-ins, automatic 21-day challenge completion detection with +50 VEG21 bonus, leaderboard integration; localStorage persistence.
- **Token Simulation & Transaction System**: Comprehensive transaction history (claims, transfers, donations, staking); peer-to-peer VEG21 token transfers with balance validation; community activity feed displaying real-time token events; localStorage persistence for transactions.

### Blockchain and Web3 Integration (Sprint 4 - Milestone 2 Preparation)
- **Celo Testnet Preparation**: Multi-network configuration system supporting Celo Alfajores (chainId 44787), Astar Shibuya (chainId 81), local Hardhat (chainId 31337), and Demo mode with environment-based switching via VEG21_MODE variable.
- **Network Configuration**: Centralized configuration in `client/src/config/chainConfig.ts` with NetworkConfig interface defining chainId, name, displayName, RPC URL, block explorer, native currency, and testnet flag for each supported network.
- **Token Contract (Placeholder)**: ERC20 VEG21Token smart contract (`contracts/VEG21TokenMock.sol`) with:
  - Standard ERC20 implementation (transfer, approve, transferFrom, balanceOf, totalSupply)
  - Minting capabilities with authorized minter system for rewards contracts
  - Burning mechanism for donations and charity contributions
  - Owner-controlled minter management prepared for VEG21Staking and VEG21Rewards contracts
  - Comprehensive deployment notes for Milestone 2 Celo Alfajores deployment
  - Token economics: 18 decimals, configurable initial supply, integration points documented
- **Wallet Integration**: MetaMask connection for real blockchain; demo wallet mode with localStorage simulation; enhanced wallet connection state management with purple UI indicators for demo mode.
- **Dynamic Network Display**: Header component displays current network name from chainConfig based on VEG21_MODE (Celo Alfajores, Astar Shibuya, Local Network, or Demo Mode).
- **Switch Network Button**: Non-functional UI button in Header showing informational toast ("Función próximamente - disponible en Milestone 2") preparing for future network switching feature.
- **Hybrid Architecture**: Current mockWeb3 localStorage simulation maintained for all features with seamless upgrade path to real blockchain contracts in Milestone 2.
- **Contract Service Layer**: Abstraction in `client/src/config/contracts.ts` with getNetworkConfig() function enabling dynamic mode selection without breaking existing features.
- **Migration Strategy**: Clear path from localStorage simulation → Celo Alfajores testnet → Celo mainnet with backward compatibility for all Sprint 1-3 features.

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