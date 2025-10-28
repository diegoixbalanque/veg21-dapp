# VEG21 Smart Contract Deployment Guide

Complete guide for deploying VEG21 contracts to Celo networks.

## 📋 Prerequisites

### 1. Wallet Setup
- Create/import a wallet with a private key
- **For Alfajores Testnet**: Get free testnet CELO from [Celo Faucet](https://faucet.celo.org)
- **For Mainnet**: Ensure you have sufficient CELO for gas (~$5-20 for all contracts)

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `PRIVATE_KEY`: Your wallet private key (without 0x prefix)
- `CELOSCAN_API_KEY`: Get from [CeloScan](https://celoscan.io/myapikey) for verification

---

## 🧪 Phase 1: Alfajores Testnet Deployment

### Step 1: Get Testnet CELO
1. Visit [https://faucet.celo.org](https://faucet.celo.org)
2. Enter your wallet address
3. Receive testnet CELO (usually within minutes)

### Step 2: Deploy Contracts
```bash
npx hardhat run scripts/deploy.ts --network celo-alfajores
```

Expected output:
```
🌱 Starting VEG21 Contract Deployment...

📋 Deployment Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Network: celo-alfajores (Chain ID: 44787)
Deployer: 0x...
Balance: 10.0 CELO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Deploying VEG21Token...
✅ VEG21Token deployed to: 0x...

2️⃣  Deploying VEG21Staking...
✅ VEG21Staking deployed to: 0x...

3️⃣  Deploying VEG21Donations...
✅ VEG21Donations deployed to: 0x...

4️⃣  Deploying VEG21Rewards...
✅ VEG21Rewards deployed to: 0x...

🎉 Deployment Complete!
```

### Step 3: Verify Contracts on CeloScan
```bash
# VEG21Token
npx hardhat verify --network celo-alfajores <TOKEN_ADDRESS> "1000000" "<DEPLOYER_ADDRESS>"

# VEG21Staking
npx hardhat verify --network celo-alfajores <STAKING_ADDRESS> "<TOKEN_ADDRESS>" "<DEPLOYER_ADDRESS>"

# VEG21Donations
npx hardhat verify --network celo-alfajores <DONATIONS_ADDRESS> "<TOKEN_ADDRESS>" "<DEPLOYER_ADDRESS>"

# VEG21Rewards
npx hardhat verify --network celo-alfajores <REWARDS_ADDRESS> "<TOKEN_ADDRESS>" "<DEPLOYER_ADDRESS>"
```

### Step 4: Update .env with Deployed Addresses
Add the deployed contract addresses to your `.env`:

```bash
VITE_CELO_ALFAJORES_TOKEN_ADDRESS=0x...
VITE_CELO_ALFAJORES_STAKING_ADDRESS=0x...
VITE_CELO_ALFAJORES_DONATIONS_ADDRESS=0x...
VITE_CELO_ALFAJORES_REWARDS_ADDRESS=0x...
VITE_VEG21_MODE=celo-alfajores
```

### Step 5: Test on Alfajores
1. Restart your application
2. Connect MetaMask to Celo Alfajores network
3. Test all functionality:
   - Wallet connection
   - Token transfers
   - Staking/unstaking
   - Donations
   - Challenge rewards

---

## ✅ Checkpoint: Alfajores Testing

**DO NOT PROCEED TO MAINNET UNTIL:**
- ✅ All contracts verified on Alfajores CeloScan
- ✅ Token transfers work correctly
- ✅ Staking/unstaking functions properly
- ✅ Donation flow tested
- ✅ Rewards minting works
- ✅ All UI features functional on testnet
- ✅ No critical bugs found

---

## 🚀 Phase 2: Celo Mainnet Deployment

### Step 1: Prepare Mainnet Wallet
- Fund your deployment wallet with CELO (check current gas prices)
- Recommended: ~$20-30 worth of CELO for safe deployment

### Step 2: Triple-Check Contract Code
Before mainnet deployment, verify:
- ✅ All tests pass
- ✅ Contracts audited (or at minimum, reviewed thoroughly)
- ✅ No hardcoded testnet values
- ✅ Initial supply configured correctly
- ✅ Owner address is correct

### Step 3: Deploy to Mainnet
```bash
# Deploy during low gas periods if possible
npx hardhat run scripts/deploy.ts --network celo-mainnet
```

### Step 4: Verify on Mainnet CeloScan
```bash
# Use the same verification commands as testnet
npx hardhat verify --network celo-mainnet <TOKEN_ADDRESS> "1000000" "<DEPLOYER_ADDRESS>"
npx hardhat verify --network celo-mainnet <STAKING_ADDRESS> "<TOKEN_ADDRESS>" "<DEPLOYER_ADDRESS>"
npx hardhat verify --network celo-mainnet <DONATIONS_ADDRESS> "<TOKEN_ADDRESS>" "<DEPLOYER_ADDRESS>"
npx hardhat verify --network celo-mainnet <REWARDS_ADDRESS> "<TOKEN_ADDRESS>" "<DEPLOYER_ADDRESS>"
```

### Step 5: Update Production .env
```bash
VITE_CELO_MAINNET_TOKEN_ADDRESS=0x...
VITE_CELO_MAINNET_STAKING_ADDRESS=0x...
VITE_CELO_MAINNET_DONATIONS_ADDRESS=0x...
VITE_CELO_MAINNET_REWARDS_ADDRESS=0x...
VITE_VEG21_MODE=celo-mainnet
```

### Step 6: Test Small Transactions First
Before announcing:
1. Transfer small amount of tokens
2. Stake small amount
3. Make small donation
4. Verify all transactions on CeloScan

---

## 🏆 Phase 3: Celo Colombia Compliance

### Required Steps for Proof of Ship:

1. **Submit Contract Addresses**
   - Navigate to Celo Colombia dashboard
   - Add verified contract addresses

2. **Link GitHub Repository**
   - Repository: [https://github.com/diegoixbalanque/veg21-dapp](https://github.com/diegoixbalanque/veg21-dapp)
   - Ensure repository is public

3. **Configure Payout Address**
   - Set up dedicated EVM wallet for payouts
   - Recommendation: Use a separate wallet from deployment wallet
   - Add to Celo Colombia dashboard

4. **Integrate DIVVI Identifier** (if required)
   - Follow Celo Colombia admin instructions
   - Add identifier to project configuration

5. **Complete Checklist**
   - ✅ Verified contracts on CeloScan
   - ✅ Public GitHub repository
   - ✅ Working dApp URL
   - ✅ Payout address configured
   - ✅ DIVVI identifier (if applicable)

---

## 📊 Contract Overview

### VEG21Token
- **Type**: ERC20 with extensions
- **Features**: Minting, burning, pausable, access control
- **Initial Supply**: 1,000,000 VEG21
- **Decimals**: 18

### VEG21Staking
- **APR**: 10% (adjustable by owner)
- **Features**: Stake/unstake, claim rewards, time-based calculations
- **Rewards**: Minted VEG21 tokens

### VEG21Donations
- **Features**: Charity registration, donation tracking, token burning
- **Mechanism**: Donated tokens are burned (deflationary)
- **Initial Charities**: 3 pre-registered

### VEG21Rewards
- **Daily Check-In**: +5 VEG21
- **21-Day Completion**: +50 VEG21 bonus
- **Features**: Challenge tracking, verifier management

---

## 🔧 Troubleshooting

### Deployment Fails
- **Insufficient gas**: Add more CELO to deployer wallet
- **RPC timeout**: Wait and retry, or use different RPC endpoint
- **Nonce issues**: Clear pending transactions in MetaMask

### Verification Fails
- **API timeout**: Retry with `--force` flag
- **Constructor arguments**: Ensure exact match with deployment
- **Compiler version**: Verify Hardhat config matches Solidity version

### Transaction Reverts
- **Permission denied**: Check MINTER_ROLE is granted
- **Insufficient balance**: User needs more VEG21/CELO
- **Contract paused**: Unpause using PAUSER_ROLE

---

## 🔒 Security Recommendations

1. **Private Key Management**
   - Never commit `.env` to version control
   - Use hardware wallet for mainnet if possible
   - Separate deployment wallet from operational wallet

2. **Contract Ownership**
   - Transfer ownership to multi-sig after deployment
   - Set up timelock for critical operations
   - Regularly review access control

3. **Monitoring**
   - Set up event monitoring for critical functions
   - Track unusual transaction patterns
   - Monitor contract balances

---

## 📞 Support

- **CeloScan Support**: [https://celoscan.io/contactus](https://celoscan.io/contactus)
- **Celo Faucet**: [https://faucet.celo.org](https://faucet.celo.org)
- **Celo Documentation**: [https://docs.celo.org](https://docs.celo.org)
- **Hardhat Documentation**: [https://hardhat.org/docs](https://hardhat.org/docs)

---

## 📝 Post-Deployment Checklist

- [ ] All contracts deployed and verified
- [ ] Contract addresses saved in `.env`
- [ ] Deployment info saved in `deployments/` directory
- [ ] CeloScan verification complete
- [ ] Frontend tested with real contracts
- [ ] Documentation updated with contract addresses
- [ ] Celo Colombia compliance submitted
- [ ] Community announcement prepared
- [ ] Backup of deployment wallet secure

---

**Last Updated**: October 2025  
**VEG21 Version**: 1.0.0 (Mainnet Launch)
