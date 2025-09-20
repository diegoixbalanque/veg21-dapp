# VEG21 - Vegan Habit Tracker

## Overview

VEG21 is a blockchain-based web application that gamifies vegan lifestyle adoption through 21-day challenges. Users participate in vegan habit-building challenges, contribute to community causes, and earn cryptocurrency rewards. The platform combines habit tracking, social impact, and decentralized finance to create an engaging ecosystem for promoting veganism and environmental sustainability.

**Sprint 5 Completed** (September 2025): Global Impact Leaderboard feature implemented with user ranking system, community impact metrics, navigation integration, and localStorage persistence.

**Sprint 6 Completed** (September 2025): User Profile & Onboarding Flow implemented with welcome modal for first-time users, challenge selection system, editable user profiles, gamification elements, and complete navigation integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Component-based UI with type safety
- **Vite**: Fast development server and build tool optimized for modern web development
- **Wouter**: Lightweight client-side routing solution
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Shadcn/ui**: High-quality React component library built on Radix UI primitives
- **TanStack Query**: Server state management for API calls and caching

### Backend Architecture
- **Express.js**: RESTful API server with TypeScript support
- **Modular Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **Middleware Pipeline**: Request logging, JSON parsing, and error handling
- **Development Server**: Hot-reload enabled development environment with Vite integration

### Database Design
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Schema-First Approach**: Database schema defined in TypeScript with automatic type inference
- **Migration Support**: Database versioning through Drizzle Kit
- **User Entity**: Simple user model with username/password authentication

### Styling and UI System
- **Design System**: Consistent theming with CSS custom properties
- **Component Variants**: Class Variance Authority for component styling variations
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Custom Color Palette**: Vegan-themed color scheme with gradients

### Leaderboard System (Sprint 5)
- **Global Impact Ranking**: User ranking system based on total VEG21 tokens earned, donations contributed, and staking rewards
- **Community Impact Metrics**: Dashboard displaying total tokens distributed, donated, staked, and active users
- **Visual Recognition System**: Crown/medal icons for top 3 performers, special "Tú" badge for current user
- **Data Integration**: Combines real user statistics from mockWeb3 with mock user data for realistic leaderboard experience
- **Navigation System**: Integrated header navigation with active state highlighting
- **Data Persistence**: localStorage integration for maintaining leaderboard state across sessions

### User Profile & Onboarding System (Sprint 6)
- **Welcome Onboarding Flow**: First-time user modal with 4 challenge options (meat-free, vegan breakfasts, full vegan, zero waste)
- **Challenge Selection System**: 21-day challenges with difficulty levels, estimated rewards, and localStorage persistence
- **User Profile Page**: Complete profile with avatar generation, editable username, challenge progress tracking
- **Gamification Elements**: Progress bars, milestone badges (7-day, 14-day, completion), day completion tracking
- **Personal Statistics Dashboard**: Integration with mockWeb3 for tokens earned, challenges completed, donations, staking
- **Navigation Enhancement**: Extended header navigation with Home, Leaderboard, and Profile links
- **Data Persistence**: localStorage for onboarding status, challenge progress, username, and user preferences

### State Management
- **React Query**: Server state caching and synchronization
- **Custom Hooks**: Encapsulated wallet connection and mobile detection logic
- **Context Pattern**: Shared state for UI components like toasts and modals

### Blockchain Integration
- **Wallet Connection**: MetaMask integration with fallback simulation
- **Astar Network**: Target blockchain for token transactions
- **Token Economy**: Community fund donations and challenge rewards system

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database provider
- **Environment Variables**: Database connection via DATABASE_URL

### Blockchain Infrastructure
- **MetaMask**: Web3 wallet for user authentication and transactions
- **Astar Network**: Layer 1 blockchain for token operations
- **Ethers.js**: Ethereum JavaScript library for blockchain interactions

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Feather-inspired icon library
- **Google Fonts**: Custom typography with Inter and additional font families
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Replit Integration**: Development environment optimizations and debugging tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Content and Media
- **Unsplash**: External image hosting for charity and community content
- **Font Awesome**: Icon library for social media and branding elements

### Runtime Environment
- **Node.js**: Server runtime with ES module support
- **TypeScript**: Type checking and compilation
- **Vite**: Development server with hot module replacement