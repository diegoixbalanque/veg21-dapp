# VEG21 Pre-Mainnet QA Checklist

## Overview
This document provides a comprehensive quality assurance checklist to complete **before deploying to Celo mainnet**. All items must be checked and verified to ensure a safe, successful mainnet launch.

---

## 🧪 Smart Contract QA

### Code Review
- [ ] All 4 contracts (Token, Staking, Donations, Rewards) reviewed for logic errors
- [ ] OpenZeppelin library versions are latest stable (v5.x+)
- [ ] No hardcoded addresses or values
- [ ] All require/revert statements have descriptive error messages
- [ ] No console.log statements in production contracts
- [ ] Gas optimization reviewed (no unnecessary storage writes)

### Security Audit
- [ ] Access control reviewed (MINTER_ROLE, PAUSER_ROLE, Ownable)
- [ ] ReentrancyGuard applied to all token transfer functions
- [ ] Integer overflow/underflow protections verified (Solidity 0.8+)
- [ ] No unchecked external calls
- [ ] Emergency pause mechanism tested
- [ ] Token burning mechanism verified (donations)

### Testing Coverage
- [ ] Unit tests written for all contract functions
- [ ] Edge cases tested (zero amounts, max uint256, etc.)
- [ ] Negative test cases (unauthorized access, insufficient balance)
- [ ] Integration tests between contracts (staking → token, rewards → token)
- [ ] Gas usage profiled and optimized

---

## 🌐 Frontend QA

### Wallet Integration
- [ ] MetaMask connection works smoothly
- [ ] Celo network auto-add functionality works
- [ ] Network switching prompts user correctly
- [ ] Account switching detected and handled
- [ ] Wallet disconnect cleans up state
- [ ] Demo mode still accessible (no forced wallet connection)

### Contract Interactions
- [ ] Token balance displayed correctly
- [ ] Transfer tokens works (P2P)
- [ ] Stake tokens works (amount validation, gas estimation)
- [ ] Unstake tokens works (stake ID validation, reward claim)
- [ ] Donate tokens works (charity selection, amount validation)
- [ ] Claim rewards works (unlocked rewards only)

### UI/UX
- [ ] Loading states shown during transactions
- [ ] Success/error toasts displayed with clear messages
- [ ] Transaction hashes linkable to CeloScan
- [ ] Demo mode banner visible when VEG21_MODE=demo
- [ ] Purple UI indicator shows demo vs real mode
- [ ] Mobile responsive (test on iPhone and Android)

### Data Persistence
- [ ] LocalStorage syncs correctly in demo mode
- [ ] Real blockchain data overrides mock data when connected
- [ ] Activity feed shows correct transactions
- [ ] Leaderboard updates based on real on-chain data

---

## 🔗 Testnet Validation (Celo Alfajores)

### Deployment Verification
- [ ] All 4 contracts deployed successfully to Alfajores
- [ ] Contract addresses saved in `.env` and `deployments/celo-alfajores.json`
- [ ] All contracts verified on https://alfajores.celoscan.io
- [ ] Source code visible on CeloScan
- [ ] Constructor arguments match deployment script

### Functional Testing
- [ ] **Token**: Transfer 10 VEG21 between two test wallets
- [ ] **Staking**: Stake 50 VEG21 and verify stake record
- [ ] **Staking**: Wait 24 hours, claim rewards, verify 10% APR calculation
- [ ] **Staking**: Unstake and verify tokens returned to wallet
- [ ] **Donations**: Donate 20 VEG21 to test charity
- [ ] **Donations**: Verify tokens burned (totalSupply decreased)
- [ ] **Rewards**: Unlock milestone reward
- [ ] **Rewards**: Claim reward and verify balance increase

### Event Emission
- [ ] `Transfer` events emitted on token transfers
- [ ] `Staked` events emitted on staking
- [ ] `Unstaked` events emitted on unstaking
- [ ] `DonationMade` events emitted on donations
- [ ] `RewardClaimed` events emitted on reward claims
- [ ] All events visible on CeloScan transaction logs

### Permission Testing
- [ ] Non-owner cannot mint tokens (should revert)
- [ ] Non-minter cannot call restricted functions
- [ ] Owner can pause/unpause in emergency
- [ ] Minter role can be granted/revoked by owner

---

## 📱 End-to-End Testing

### User Journey 1: New User Onboarding
- [ ] Visit website → Connect MetaMask
- [ ] Auto-add Celo Alfajores network
- [ ] View wallet address in header
- [ ] See 0 VEG21 balance initially
- [ ] Complete onboarding flow (select challenge)
- [ ] Unlock first daily reward (+5 VEG21)
- [ ] Claim reward successfully
- [ ] Balance updates to 5 VEG21

### User Journey 2: Staking Workflow
- [ ] User has 100 VEG21 balance
- [ ] Navigate to staking page
- [ ] Enter 50 VEG21 to stake
- [ ] Approve transaction in MetaMask
- [ ] Transaction confirms (check CeloScan link)
- [ ] Staking card shows 50 VEG21 staked
- [ ] Daily rewards accumulate (wait 1 day or simulate)
- [ ] Claim staking rewards
- [ ] Unstake 50 VEG21
- [ ] Balance restored to ~105 VEG21 (with rewards)

### User Journey 3: Donation Flow
- [ ] User has 50 VEG21 balance
- [ ] Navigate to community fund page
- [ ] Select "Vegan Outreach" charity
- [ ] Enter 10 VEG21 donation
- [ ] Approve transaction
- [ ] Transaction confirms
- [ ] Balance decreases to 40 VEG21
- [ ] Leaderboard shows donation
- [ ] Activity feed shows donation event

### User Journey 4: Challenge Completion
- [ ] User completes 21 daily check-ins
- [ ] Unlock "Challenge Complete" reward (+50 VEG21)
- [ ] Claim completion bonus
- [ ] Balance increases by 50 VEG21
- [ ] Profile shows completed challenge badge
- [ ] Leaderboard rank updates

---

## 🚨 Error Handling

### Network Errors
- [ ] App shows error if user on wrong network (not Celo)
- [ ] Prompt to switch to Celo network appears
- [ ] App recovers gracefully if network switch fails
- [ ] RPC errors handled (fallback RPC or retry logic)

### Transaction Errors
- [ ] Insufficient gas: Clear error message + link to buy CELO
- [ ] Insufficient balance: Disable submit button, show warning
- [ ] User rejection: Toast says "Transaction cancelled by user"
- [ ] Transaction failed: Show error from contract revert message
- [ ] Pending transactions: Show loading spinner, disable double-submit

### Edge Cases
- [ ] Zero amount inputs: Validation prevents submission
- [ ] Max uint256: Large number inputs handled safely
- [ ] Disconnected wallet: App redirects to connect wallet page
- [ ] Stale data: Polling updates balances every 15 seconds

---

## 📊 Performance

### Load Times
- [ ] Homepage loads in < 2 seconds
- [ ] Contract data fetches in < 3 seconds
- [ ] Transaction confirmation in < 10 seconds (average)
- [ ] Image assets lazy-loaded
- [ ] Bundle size optimized (< 500KB gzipped)

### Scalability
- [ ] Activity feed handles 1000+ transactions
- [ ] Leaderboard handles 500+ users
- [ ] Staking page handles 100+ active stakes
- [ ] No memory leaks in long-running sessions

---

## 🔐 Security Review

### Frontend Security
- [ ] No API keys exposed in frontend code
- [ ] Contract addresses loaded from environment variables
- [ ] No hardcoded private keys (obviously!)
- [ ] XSS protection (React handles this automatically)
- [ ] CORS configured correctly for API calls

### Contract Security
- [ ] Access control tested thoroughly
- [ ] Reentrancy guards on all critical functions
- [ ] Integer arithmetic safe (Solidity 0.8+)
- [ ] Emergency pause tested
- [ ] Ownership transfer tested (if needed)

### Environment Configuration
- [ ] `.env` file NOT committed to Git
- [ ] `.gitignore` includes `.env` and `deployments/`
- [ ] Environment variables validated on app start
- [ ] Placeholder contract addresses used in demo mode

---

## 📝 Documentation Review

### Code Documentation
- [ ] All contracts have NatSpec comments (@dev, @param, @return)
- [ ] Complex functions explained with inline comments
- [ ] README has clear setup instructions
- [ ] DEPLOYMENT_CHECKLIST.md is accurate and complete
- [ ] API documentation exists (if applicable)

### User Documentation
- [ ] User guide explains how to connect wallet
- [ ] FAQ covers common issues
- [ ] Tutorial videos/GIFs for key flows
- [ ] Help links in app navigate to correct docs

---

## 🎯 Mainnet Readiness Gates

### Gate 1: Technical Readiness
- [ ] ✅ 100% test coverage on Alfajores
- [ ] ✅ All contracts verified
- [ ] ✅ No critical bugs found
- [ ] ✅ Performance meets targets
- [ ] ✅ Security review passed

### Gate 2: Operational Readiness
- [ ] ✅ Deployment wallet funded (5-10 CELO)
- [ ] ✅ Deployment script tested (dry-run mode)
- [ ] ✅ Monitoring/alerting configured
- [ ] ✅ Rollback plan documented
- [ ] ✅ Team trained on deployment process

### Gate 3: Business Readiness
- [ ] ✅ Celo Colombia submission prepared
- [ ] ✅ Social media announcement drafted
- [ ] ✅ Community notified of launch date
- [ ] ✅ Support channels ready (Discord, Telegram)
- [ ] ✅ Legal/compliance reviewed (if applicable)

---

## ✅ Final Sign-Off

Before deploying to mainnet, all team members must sign off:

- [ ] **Developer**: Technical QA complete, no known issues
- [ ] **Tester**: All test cases passed, edge cases covered
- [ ] **Designer**: UI/UX reviewed and approved
- [ ] **Product**: Feature parity confirmed, roadmap aligned
- [ ] **Legal**: Terms reviewed, compliance checked (if applicable)

**Deployment Approval Date**: ________________

**Approved By**: ________________

---

## 🚀 Post-Deployment Validation

### Immediate Checks (Within 1 Hour)
- [ ] All 4 contracts verified on mainnet CeloScan
- [ ] Frontend connects to mainnet contracts
- [ ] Test transaction successful (small amount)
- [ ] No errors in browser console
- [ ] No errors in server logs

### 24-Hour Monitoring
- [ ] Monitor first 100 transactions
- [ ] Check for unusual activity
- [ ] Verify gas costs are as expected
- [ ] Confirm no security issues
- [ ] User feedback positive

### Week 1 Checklist
- [ ] Transaction volume growing steadily
- [ ] No critical bugs reported
- [ ] Community engagement high
- [ ] Celo Colombia Proof of Ship approved
- [ ] Press/media coverage (if applicable)

---

**Remember: Mainnet deployment is irreversible. When in doubt, test more on Alfajores!**

*Last updated: October 2025*
*VEG21 - Making Veganism Fun and Rewarding*
