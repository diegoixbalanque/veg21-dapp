# VEG21 Smart Contract Deployment Checklist

## ⚠️ Pre-Deployment Requirements

### 1. Wallet Setup
- [ ] Create a **dedicated deployment wallet** (never use your personal wallet)
- [ ] Save the wallet's private key securely (use a password manager)
- [ ] **NEVER** commit the private key to Git or share it

### 2. Testnet Funding (Celo Alfajores)
- [ ] Visit Celo Alfajores Faucet: https://faucet.celo.org
- [ ] Request testnet CELO tokens for your deployment wallet
- [ ] Verify you have at least 2-3 CELO for gas fees
- [ ] Check balance: `npx hardhat run scripts/checkBalance.js --network celo-alfajores`

### 3. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set `PRIVATE_KEY=<your_deployment_wallet_private_key>` (no 0x prefix)
- [ ] Set `CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org`
- [ ] Set `CELOSCAN_API_KEY=<your_celoscan_api_key>` (get from https://celoscan.io/myapikey)
- [ ] **Verify `.env` is in `.gitignore`**

---

## 🧪 Testnet Deployment (Celo Alfajores - Chain ID 44787)

### Step 1: Dry-Run Deploy (No On-Chain Transactions)
```bash
# This simulates deployment without broadcasting transactions
npx hardhat run scripts/deploy.ts --network celo-alfajores

# Check the output in deployments/dry-run/celo-alfajores.json
cat deployments/dry-run/celo-alfajores.json
```

**Expected Output:**
- ✅ Deployment simulation complete
- ✅ Gas estimates provided
- ✅ Contract addresses (simulated)
- ❌ No real transactions sent

### Step 2: Execute Real Deployment
```bash
# WARNING: This will spend real testnet gas!
npx hardhat run scripts/deploy.ts --network celo-alfajores --execute

# Estimated gas cost: ~0.5-1.0 CELO (~$0 on testnet)
# Deployment time: 2-5 minutes
```

**Deployment Order:**
1. VEG21Token.sol → Token address
2. VEG21Staking.sol → Staking address
3. VEG21Donations.sol → Donations address
4. VEG21Rewards.sol → Rewards address

**Post-Deployment:**
- [ ] Save all contract addresses from console output
- [ ] Verify deployment JSON created: `deployments/celo-alfajores.json`
- [ ] Copy contract addresses to `.env`:
  ```
  VITE_CELO_ALFAJORES_TOKEN_ADDRESS=0x...
  VITE_CELO_ALFAJORES_STAKING_ADDRESS=0x...
  VITE_CELO_ALFAJORES_DONATIONS_ADDRESS=0x...
  VITE_CELO_ALFAJORES_REWARDS_ADDRESS=0x...
  ```

### Step 3: Verify Contracts on CeloScan
```bash
# Verify all contracts automatically
npx hardhat run scripts/verify.ts --network celo-alfajores

# Or verify individually (if auto-verification fails)
npx hardhat verify --network celo-alfajores <TOKEN_ADDRESS> 1000000 <DEPLOYER_ADDRESS>
npx hardhat verify --network celo-alfajores <STAKING_ADDRESS> <TOKEN_ADDRESS>
npx hardhat verify --network celo-alfajores <DONATIONS_ADDRESS> <TOKEN_ADDRESS>
npx hardhat verify --network celo-alfajores <REWARDS_ADDRESS> <TOKEN_ADDRESS>
```

**Verification Checklist:**
- [ ] All 4 contracts show "Verified" on https://alfajores.celoscan.io
- [ ] Contract source code is visible
- [ ] Constructor arguments match deployment
- [ ] Contract names are correct

### Step 4: Test Contract Functions
```bash
# Open Hardhat console on Alfajores
npx hardhat console --network celo-alfajores

# Inside console:
const Token = await ethers.getContractFactory("VEG21Token");
const token = await Token.attach("<TOKEN_ADDRESS>");
const balance = await token.balanceOf("<DEPLOYER_ADDRESS>");
console.log("Token balance:", ethers.formatEther(balance));
```

**Testing Checklist:**
- [ ] Token balance check works
- [ ] Transfer 1 VEG21 to test address
- [ ] Stake 10 VEG21 tokens
- [ ] Claim staking rewards after 1 day
- [ ] Donate 5 VEG21 to test charity

---

## 🚀 Mainnet Deployment (Celo Mainnet - Chain ID 42220)

### ⚠️ CRITICAL WARNINGS
- **Mainnet deployment is IRREVERSIBLE**
- **Triple-check all contract code**
- **Test EVERYTHING on Alfajores first**
- **Mainnet gas costs real money (~$5-20 total)**

### Mainnet Pre-Flight Checklist
- [ ] ✅ 100% test pass rate on Alfajores
- [ ] ✅ All contracts verified on Alfajores CeloScan
- [ ] ✅ Manual testing completed (stake, donate, rewards)
- [ ] ✅ Frontend tested with Alfajores contracts
- [ ] ✅ Playwright E2E tests passing
- [ ] ✅ Security audit completed (if budget allows)
- [ ] ✅ Deployment wallet funded with 5-10 CELO mainnet tokens
- [ ] ✅ Team approval for mainnet launch

### Mainnet Deployment Steps

1. **Update Environment for Mainnet**
```bash
# In .env
PRIVATE_KEY=<mainnet_deployment_wallet_private_key>
CELO_MAINNET_RPC_URL=https://forno.celo.org
VITE_VEG21_MODE=celo-mainnet
```

2. **Check Gas Prices**
```bash
# Visit CeloScan gas tracker: https://celoscan.io/gastracker
# Deploy during low-gas periods to save money
```

3. **Dry-Run Mainnet Deploy**
```bash
npx hardhat run scripts/deploy.ts --network celo-mainnet
# Review gas estimates carefully!
```

4. **Execute Mainnet Deployment**
```bash
# ⚠️ THIS IS IRREVERSIBLE ⚠️
npx hardhat run scripts/deploy.ts --network celo-mainnet --execute

# Estimated gas cost: ~2-5 CELO (~$1-3 USD at current prices)
# Deployment time: 3-7 minutes
```

5. **Verify on Mainnet CeloScan**
```bash
npx hardhat run scripts/verify.ts --network celo-mainnet
```

6. **Update Frontend Configuration**
```bash
# In .env
VITE_CELO_MAINNET_TOKEN_ADDRESS=0x...
VITE_CELO_MAINNET_STAKING_ADDRESS=0x...
VITE_CELO_MAINNET_DONATIONS_ADDRESS=0x...
VITE_CELO_MAINNET_REWARDS_ADDRESS=0x...
```

7. **Test First Transaction on Mainnet**
```bash
# Transfer small amount first (1 VEG21) to verify everything works
# Check transaction on https://celoscan.io
```

8. **Announce Launch**
- [ ] Update README with mainnet contract links
- [ ] Post on social media
- [ ] Update project documentation
- [ ] Submit to Celo Colombia dashboard (Proof of Ship)

---

## 🔒 Security Best Practices

### Private Key Management
- ✅ **DO**: Use a dedicated deployment wallet
- ✅ **DO**: Store private key in password manager
- ✅ **DO**: Use hardware wallet for mainnet (if possible)
- ❌ **DON'T**: Commit `.env` to Git
- ❌ **DON'T**: Share private key with anyone
- ❌ **DON'T**: Use the same wallet for testing and production

### Contract Security
- Contracts use OpenZeppelin audited libraries
- Access control via role-based permissions (MINTER_ROLE, PAUSER_ROLE)
- ReentrancyGuard on all token transfer functions
- Emergency pause functionality for critical issues

### Post-Deployment Monitoring
- [ ] Set up CeloScan alerts for contract interactions
- [ ] Monitor first 100 transactions closely
- [ ] Check for unusual activity or errors
- [ ] Have rollback plan (though contracts are immutable)

---

## 🐛 Troubleshooting

### "Insufficient funds for gas"
- Solution: Add more CELO to deployment wallet
- Testnet: Visit faucet.celo.org
- Mainnet: Buy CELO on exchange and transfer

### "Verification failed"
- Solution 1: Retry with `--force` flag
- Solution 2: Manual verification via CeloScan UI
- Solution 3: Wait 5 minutes and try again (API timeout)

### "Nonce too low" or "Replacement transaction underpriced"
- Solution: Clear pending transactions in MetaMask
- Or wait for previous transaction to confirm

### "Contract deployment failed"
- Check: Do you have enough gas?
- Check: Is RPC URL correct?
- Check: Is private key formatted correctly (no 0x prefix)?

---

## 📚 Resources

- Celo Documentation: https://docs.celo.org
- Celo Faucet (Alfajores): https://faucet.celo.org
- CeloScan Testnet: https://alfajores.celoscan.io
- CeloScan Mainnet: https://celoscan.io
- Hardhat Documentation: https://hardhat.org/docs
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts

---

## ✅ Final Checklist Before Going Live

- [ ] All contracts verified on mainnet CeloScan
- [ ] Frontend connected to mainnet contracts
- [ ] Test transactions successful
- [ ] Documentation updated
- [ ] Social media announcement ready
- [ ] Backup plan in place
- [ ] Celo Colombia Proof of Ship submitted

**When ready, switch VEG21_MODE to production:**
```bash
# In .env
VITE_VEG21_MODE=celo-mainnet
```

---

*Last updated: October 2025*
*VEG21 - Gamifying Vegan Lifestyle on Celo Blockchain*
