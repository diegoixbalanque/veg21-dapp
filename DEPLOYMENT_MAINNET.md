# VEG21 Mainnet Deployment Guide

## Overview

This guide explains how to safely migrate your VEG21 dApp from **Demo Mode** → **Testnet** → **Mainnet** while maintaining security and preventing accidental transactions.

---

## 🎯 Migration Path

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Demo Mode   │  →   │   Testnet    │  →   │   Mainnet    │
│ (localhost)  │      │ (Alfajores)  │      │  (Celo)      │
└──────────────┘      └──────────────┘      └──────────────┘
 No blockchain         Test CELO only        REAL MONEY
 localStorage          Free from faucet      Buy real CELO
 Safe & Fast           Test thoroughly       IRREVERSIBLE
```

---

## Phase 1: Demo Mode (Current State)

**Status:** ✅ Default Configuration

### What It Does
- Simulates all blockchain interactions using localStorage
- No wallet required (optional demo wallet available)
- No gas fees, no real transactions
- Perfect for local development and testing

### Configuration
```bash
# .env
VITE_VEG21_MODE=demo
# That's it! No other variables needed.
```

### When to Use
- ✅ Local development
- ✅ Feature testing
- ✅ UI/UX iteration
- ✅ Demonstrations without MetaMask

---

## Phase 2: Testnet Deployment (Celo Alfajores)

**Purpose:** Test contracts on real blockchain with fake money

### Prerequisites
1. ✅ MetaMask installed
2. ✅ Testnet CELO from faucet
3. ✅ CeloScan API key (free)
4. ✅ Dedicated deployment wallet

### Step-by-Step Guide

#### 1. Get Testnet CELO
```bash
# Visit Celo Alfajores Faucet
https://faucet.celo.org

# Request testnet CELO for your deployment wallet
# Recommended: 5-10 CELO for deployment + testing
```

#### 2. Configure Environment

Create your `.env` file:
```bash
# Copy example file
cp .env.example .env
```

**Add these to `.env`:**
```bash
# ===== APPLICATION MODE =====
VITE_VEG21_MODE=celo-alfajores

# ===== DEPLOYMENT CREDENTIALS =====
# ⚠️  Use a DEDICATED wallet for deployment (not your personal wallet!)
# Get testnet CELO from: https://faucet.celo.org
PRIVATE_KEY=<64_hex_characters_WITHOUT_0x_prefix>

# ===== RPC CONFIGURATION =====
CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org

# ===== CONTRACT VERIFICATION =====
# Get FREE API key at: https://celoscan.io/myapikey
CELOSCAN_API_KEY=<your_api_key>

# ===== DEPLOYER ADDRESS =====
# Public address matching your PRIVATE_KEY
VITE_DEPLOYER_PUBLIC_ADDRESS=0x8fB54C9698eDfB25Ca8F055554B3A9E06AB75f6C
```

#### 3. Validate Configuration
```bash
# Run validation script
./scripts/validate_config.sh

# Expected output:
# ✅ All checks passed!
# Your configuration is ready for deployment.
```

#### 4. Dry-Run Deployment (Simulate)
```bash
# This simulates deployment WITHOUT broadcasting transactions
npx hardhat run scripts/deploy.ts --network celo-alfajores

# Expected output:
# ⚠️  DRY-RUN MODE ⚠️
# No transactions will be broadcast.
# 📊 Gas estimate: ...
# 💰 Estimated cost: ... CELO
```

#### 5. Execute Real Deployment
```bash
# ⚠️  This deploys to REAL blockchain (testnet)
npx hardhat run scripts/deploy.ts --network celo-alfajores --execute

# Deployment takes ~3-5 minutes
# Gas cost: ~0.5-1.0 testnet CELO
```

#### 6. Verify Contracts
```bash
# Automatic verification
npx hardhat run scripts/verify.ts --network celo-alfajores

# Check verification status
https://alfajores.celoscan.io
```

#### 7. Update Frontend Configuration

Copy contract addresses from deployment output to `.env`:
```bash
VITE_CELO_ALFAJORES_TOKEN_ADDRESS=0x...
VITE_CELO_ALFAJORES_STAKING_ADDRESS=0x...
VITE_CELO_ALFAJORES_DONATIONS_ADDRESS=0x...
VITE_CELO_ALFAJORES_REWARDS_ADDRESS=0x...
```

#### 8. Test with Real Wallet
```bash
# Restart app
npm run dev

# Open browser → Connect MetaMask
# Should show: "🧪 Testnet Mode — Celo Alfajores"

# Test all features:
# - Stake tokens
# - Donate to charity
# - Claim rewards
# - Complete 21-day challenge
```

---

## Phase 3: Mainnet Deployment (Celo)

**⚠️  WARNING:** This deploys contracts with REAL MONEY. Contracts are IMMUTABLE and IRREVERSIBLE.

### Pre-Mainnet Checklist

Before proceeding, ensure:

- [ ] ✅ **100% test coverage on Alfajores**
  - All contracts deployed and verified
  - All features tested with real wallet
  - No bugs or issues found

- [ ] ✅ **Documentation complete**
  - DEPLOYMENT_CHECKLIST.md reviewed
  - REVIEW_AND_VERIFY.md completed
  - All QA tests passed

- [ ] ✅ **Team approval**
  - Product owner sign-off
  - Technical lead approval
  - Legal/compliance review (if applicable)

- [ ] ✅ **Mainnet wallet funded**
  - 5-10 real CELO for deployment
  - Additional CELO for gas fees
  - Separate from testnet wallet

- [ ] ✅ **Backup plan**
  - Rollback procedures documented
  - Monitoring configured
  - Support channels ready

### Mainnet Deployment Steps

#### 1. Fund Mainnet Wallet

**Buy real CELO:**
- Centralized exchanges: Coinbase, Binance, Kraken
- Decentralized exchanges: Uniswap, Ubeswap
- Transfer 5-10 CELO to your deployment wallet

**Verify balance:**
```bash
# Check your wallet has enough CELO
# Mainnet deployment costs ~2-5 CELO in gas fees
```

#### 2. Update Environment for Mainnet

**Backup your testnet .env first:**
```bash
cp .env .env.testnet.backup
```

**Update `.env` for mainnet:**
```bash
# ===== APPLICATION MODE =====
# ⚠️  CRITICAL: This switches to REAL blockchain!
VITE_VEG21_MODE=celo-mainnet

# ===== DEPLOYMENT CREDENTIALS =====
# ⚠️  Use a DEDICATED mainnet wallet
# ⚠️  NEVER reuse testnet private key!
PRIVATE_KEY=<mainnet_deployment_wallet_private_key>

# ===== RPC CONFIGURATION =====
# Recommended: Use dedicated RPC for production
VITE_CELO_MAINNET_RPC_URL=https://forno.celo.org

# Or use premium RPC for better performance:
# VITE_CELO_MAINNET_RPC_URL=https://celo-mainnet.infura.io/v3/YOUR_KEY

# ===== CONTRACT VERIFICATION =====
CELOSCAN_API_KEY=<your_api_key>

# ===== DEPLOYER ADDRESS =====
VITE_DEPLOYER_PUBLIC_ADDRESS=<mainnet_deployer_public_address>

# ===== MAINNET NETWORK INFO =====
VITE_CELO_MAINNET_CHAIN_ID=42220
VITE_CELO_MAINNET_EXPLORER=https://celoscan.io
```

#### 3. Final Safety Checks

```bash
# Run validation
./scripts/validate_config.sh

# Should show:
# ✅ Mode: celo-mainnet
# 🚀 MAINNET mode - REAL MONEY!
# ⚠️  WARNING: Ensure you have completed all testing!
```

#### 4. Dry-Run Mainnet Deployment

```bash
# ⚠️  CRITICAL: Always dry-run first!
npx hardhat run scripts/deploy.ts --network celo-mainnet

# Review:
# - Gas estimates (should be ~0.01-0.02 CELO per contract)
# - Total deployment cost (should be 2-5 CELO)
# - Contract addresses (simulated)
```

#### 5. Execute Mainnet Deployment

**⚠️  FINAL WARNING:**
- This action is **IRREVERSIBLE**
- You will spend **REAL MONEY**
- Contracts are **IMMUTABLE** once deployed

```bash
# The moment of truth
npx hardhat run scripts/deploy.ts --network celo-mainnet --execute

# Script includes 10-second abort window
# Press Ctrl+C to cancel if needed

# Deployment takes ~3-7 minutes
# Gas cost: ~2-5 CELO (~$1-3 USD)
```

**During deployment:**
- Do not close terminal
- Do not interrupt network connection
- Monitor transaction progress

#### 6. Verify Mainnet Contracts

```bash
# Verify all contracts on CeloScan
npx hardhat run scripts/verify.ts --network celo-mainnet

# Check verification status
https://celoscan.io

# All contracts should show "✅ Contract source code verified"
```

#### 7. Update Frontend for Mainnet

**Add contract addresses to `.env`:**
```bash
VITE_CELO_MAINNET_TOKEN_ADDRESS=0x...
VITE_CELO_MAINNET_STAKING_ADDRESS=0x...
VITE_CELO_MAINNET_DONATIONS_ADDRESS=0x...
VITE_CELO_MAINNET_REWARDS_ADDRESS=0x...
```

**Restart application:**
```bash
npm run dev
```

#### 8. Verify Mainnet Live

**Open browser and verify:**
- ✅ Banner shows: "🚀 Live on Celo Mainnet"
- ✅ MetaMask connected to Celo mainnet
- ✅ Contract addresses correct
- ✅ Token balance reads from blockchain

**Test with small amounts first:**
1. Transfer 1 VEG21 token
2. Stake 10 VEG21
3. Donate 5 VEG21
4. Verify all transactions on CeloScan

#### 9. Public Launch

**Announce on socials:**
- Update README with mainnet contract links
- Post on Twitter/X announcing mainnet launch
- Submit to Celo Colombia dashboard
- Share on Discord/Telegram

**Monitor closely:**
- First 100 transactions
- Gas costs staying reasonable
- No unusual activity or errors
- User feedback positive

---

## 🔐 Security Best Practices

### Private Key Management

**DO:**
- ✅ Use dedicated deployment wallet (separate from personal)
- ✅ Store private key in password manager (1Password, LastPass, etc.)
- ✅ Use hardware wallet for mainnet (Ledger, Trezor) if possible
- ✅ Keep different wallets for testnet and mainnet
- ✅ Backup private key securely (encrypted, offline)

**DON'T:**
- ❌ Never commit `.env` to Git
- ❌ Never share private key with anyone
- ❌ Never reuse personal wallet for deployment
- ❌ Never store private key in plaintext
- ❌ Never use same key across testnets and mainnet

### Environment Variable Safety

```bash
# ALWAYS verify .gitignore includes:
.env
.env.local
.env.*.local
deployments/deployed-*

# NEVER commit:
- Private keys
- API keys
- Contract addresses (until public)
- Deployment artifacts
```

### Deployment Safety Checks

Before **every** deployment:
1. Run `./scripts/validate_config.sh`
2. Review gas estimates
3. Verify deployer wallet balance
4. Double-check network (testnet vs mainnet)
5. Ensure team approval documented

---

## 🔄 Rolling Back Changes

**If you need to switch modes:**

### Mainnet → Testnet
```bash
# 1. Update .env
VITE_VEG21_MODE=celo-alfajores

# 2. Restart app
npm run dev

# 3. Verify banner shows testnet mode
```

### Any Mode → Demo Mode
```bash
# 1. Update .env
VITE_VEG21_MODE=demo

# 2. Restart app
npm run dev

# 3. Verify banner shows demo mode
# 4. All data now from localStorage
```

**Important:** Switching modes does NOT affect deployed contracts. Once on mainnet, contracts are permanent.

---

## 📊 Deployment Cost Summary

| Network | Gas Cost | Time | Reversible? |
|---------|----------|------|-------------|
| Demo | $0 (free) | Instant | ✅ Yes |
| Alfajores | $0 (testnet) | 3-5 min | ✅ Yes (redeploy) |
| Mainnet | $1-3 USD | 3-7 min | ❌ NO |

---

## 🐛 Troubleshooting

### "Insufficient funds for gas"
**Solution:**
- Testnet: Get more from https://faucet.celo.org
- Mainnet: Buy more CELO on exchange

### "PRIVATE_KEY not found"
**Solution:**
```bash
# 1. Check .env file exists
ls -la .env

# 2. Verify PRIVATE_KEY is set
grep PRIVATE_KEY .env

# 3. Run validation
./scripts/validate_config.sh
```

### "Network mismatch"
**Solution:**
- Ensure MetaMask connected to correct network
- Match VITE_VEG21_MODE to MetaMask network
- Restart browser if needed

### "Contract deployment failed"
**Solution:**
1. Check deployer wallet has enough balance
2. Verify RPC URL is correct
3. Wait a few minutes and retry
4. Try alternative RPC provider

---

## 📚 Additional Resources

- **Celo Documentation:** https://docs.celo.org
- **Celo Faucet (Testnet):** https://faucet.celo.org
- **CeloScan Testnet:** https://alfajores.celoscan.io
- **CeloScan Mainnet:** https://celoscan.io
- **Hardhat Docs:** https://hardhat.org/docs
- **VEG21 Deployment Checklist:** See DEPLOYMENT_CHECKLIST.md
- **VEG21 QA Guide:** See REVIEW_AND_VERIFY.md

---

## ✅ Quick Command Reference

```bash
# Validate configuration
./scripts/validate_config.sh

# Testnet deployment
npx hardhat run scripts/deploy.ts --network celo-alfajores --execute

# Mainnet dry-run
npx hardhat run scripts/deploy.ts --network celo-mainnet

# Mainnet deployment (REAL!)
npx hardhat run scripts/deploy.ts --network celo-mainnet --execute

# Verify contracts
npx hardhat run scripts/verify.ts --network <network>

# Start app
npm run dev
```

---

**Last updated:** October 28, 2025  
**VEG21** — Gamifying Vegan Lifestyle on Celo Blockchain

*Built with ❤️ for Celo Colombia Hackathon 2025*
