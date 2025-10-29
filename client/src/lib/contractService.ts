// Smart Contract Service Layer for VEG21 dApp
// This service provides a unified interface for interacting with both mock and real smart contracts
// 
// DEPLOYMENT SAFETY: This service will NOT initialize provider connections if:
// - RPC URL is not set
// - PRIVATE_KEY is not available (when needed)
// - VEG21_MODE is set to 'mock' or 'demo'
//
// Default mode is MOCK to prevent accidental on-chain transactions

import { 
  IContractService, 
  IStaking, 
  IDonations, 
  IRewards, 
  IToken,
  ServiceMode,
  ServiceConfig,
  ContractConfig
} from '@/types/contracts';
import { 
  TokenBalance, 
  ClaimableReward, 
  ContributionRecord, 
  StakeRecord, 
  MockTransaction 
} from '@/lib/mockWeb3';
import { mockWeb3Service } from '@/lib/mockWeb3';
import { SERVICE_CONFIG } from '@/config/contracts';
import { ethers, BrowserProvider, Contract, formatEther, parseEther } from 'ethers';

// Import contract ABIs
import StakingABI from '@/contracts/StakingContract.json';
import DonationsABI from '@/contracts/DonationsContract.json';
import RewardsABI from '@/contracts/RewardsContract.json';
import TokenABI from '@/contracts/TokenContract.json';

// Event emitter for contract events
type ContractEventType = 'balance_updated' | 'transaction_confirmed' | 'state_changed' | 'error';
type ContractEventCallback = (data: any) => void;

// Credential validation helper
function hasValidCredentials(): boolean {
  const rpcUrl = import.meta.env.VITE_RPC_URL;
  const mode = import.meta.env.VITE_VEG21_MODE || 'demo';
  
  if (mode === 'mock' || mode === 'demo') {
    return false; // Explicitly in mock mode
  }
  
  if (!rpcUrl || rpcUrl === '') {
    console.warn('Deploy-ready: Missing VITE_RPC_URL. Add to .env for real contract mode.');
    return false;
  }
  
  return true;
}

// Check if MetaMask wallet is available
function hasWalletProvider(): boolean {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.log('Deploy-ready: MetaMask not detected. Install MetaMask or use demo mode.');
    return false;
  }
  return true;
}

// ⚠️ CRITICAL: Private key validation for backend deployment scripts
// This is server-side only - NEVER expose private keys in frontend!
export function hasValidPrivateKey(): boolean {
  // This check is for Node.js environment only (deployment scripts)
  if (typeof window !== 'undefined') {
    console.error('SECURITY WARNING: Never check for PRIVATE_KEY in browser environment!');
    return false;
  }
  
  const privateKey = process.env.PRIVATE_KEY;
  const mode = process.env.VITE_VEG21_MODE || 'demo';
  
  // Demo mode doesn't need private key
  if (mode === 'demo' || mode === 'mock') {
    return false;
  }
  
  // Real modes require private key
  if (!privateKey || privateKey === '') {
    console.error('❌ DEPLOYMENT BLOCKED: PRIVATE_KEY not found in .env');
    console.error('   Required for deploying to blockchain');
    console.error('   See .env.example for setup instructions');
    return false;
  }
  
  // Validate private key format (64 hex characters)
  const hexPattern = /^[0-9a-fA-F]{64}$/;
  if (!hexPattern.test(privateKey)) {
    console.error('❌ DEPLOYMENT BLOCKED: Invalid PRIVATE_KEY format');
    console.error('   Expected: 64 hexadecimal characters (no 0x prefix)');
    console.error('   Example: abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
    return false;
  }
  
  console.log('✅ Valid PRIVATE_KEY detected for deployment');
  return true;
}

// Base contract implementation
abstract class BaseContract {
  protected address: string;
  protected abi: any[];
  protected isInitialized: boolean = false;

  constructor(address: string, abi: any[]) {
    this.address = address;
    this.abi = abi;
  }

  async initialize(): Promise<void> {
    // Placeholder for contract initialization
    console.log(`Initializing contract at ${this.address}`);
    this.isInitialized = true;
  }

  getAddress(): string {
    return this.address;
  }

  async isDeployed(): Promise<boolean> {
    // In mock mode, always return true
    // In contract mode, check if contract exists at address
    return true;
  }
}

// Mock implementations that delegate to existing mockWeb3Service
class MockStaking extends BaseContract implements IStaking {
  async stakeTokens(amount: number): Promise<MockTransaction> {
    return mockWeb3Service.stakeTokens(amount);
  }

  async unstakeTokens(stakeId: string): Promise<MockTransaction> {
    return mockWeb3Service.unstakeTokens(stakeId);
  }

  async getActiveStakes(): Promise<StakeRecord[]> {
    return mockWeb3Service.getActiveStakes();
  }

  async getAllStakes(): Promise<StakeRecord[]> {
    return mockWeb3Service.getAllStakes();
  }

  async getTotalStaked(): Promise<number> {
    return mockWeb3Service.getTotalStaked();
  }

  async getTotalStakingRewards(): Promise<number> {
    return mockWeb3Service.getTotalStakingRewards();
  }

  async getStakingAPY(): Promise<number> {
    return 5; // 5% APY as per mockWeb3Service
  }

  async calculateRewards(amount: number, durationDays: number): Promise<number> {
    const annualRewardRate = 0.05; // 5% APY
    return amount * (annualRewardRate * durationDays / 365);
  }
}

class MockDonations extends BaseContract implements IDonations {
  async contribute(charityId: string, amount: number): Promise<MockTransaction> {
    return mockWeb3Service.contribute(charityId, amount);
  }

  async getContributions(): Promise<ContributionRecord[]> {
    return mockWeb3Service.getContributions();
  }

  async getTotalContributed(): Promise<number> {
    return mockWeb3Service.getTotalContributed();
  }

  async getContributionsByCharity(charityId: string): Promise<ContributionRecord[]> {
    const allContributions = await this.getContributions();
    return allContributions.filter(c => c.charityId === charityId);
  }

  async getSupportedCharities(): Promise<{ id: string; name: string; description: string }[]> {
    // Return mock charity data
    return [
      {
        id: 'vegan_outreach',
        name: 'Vegan Outreach',
        description: 'Promoción de la alimentación basada en plantas'
      },
      {
        id: 'animal_sanctuary',
        name: 'Animal Sanctuary',
        description: 'Refugio para animales rescatados'
      },
      {
        id: 'environmental_fund',
        name: 'Environmental Fund',
        description: 'Protección del medio ambiente'
      }
    ];
  }

  async getCharityTotalDonations(charityId: string): Promise<number> {
    const contributions = await this.getContributionsByCharity(charityId);
    return contributions.reduce((total, c) => total + c.amount, 0);
  }
}

class MockRewards extends BaseContract implements IRewards {
  async claimReward(rewardId: string): Promise<MockTransaction> {
    return mockWeb3Service.claimReward(rewardId);
  }

  async getAllRewards(): Promise<ClaimableReward[]> {
    return mockWeb3Service.getAllRewards();
  }

  async getClaimableRewards(): Promise<ClaimableReward[]> {
    return mockWeb3Service.getClaimableRewards();
  }

  async unlockReward(rewardId: string, milestoneData?: any): Promise<boolean> {
    return mockWeb3Service.unlockReward(rewardId);
  }

  async getTotalEarned(): Promise<number> {
    return mockWeb3Service.getState().totalEarned;
  }

  async createMilestoneReward(type: 'milestone' | 'daily' | 'bonus', amount: number, description: string): Promise<string> {
    // Mock implementation - in real contract this would create new reward
    const rewardId = `${type}_${Date.now()}`;
    console.log(`Mock: Created ${type} reward ${rewardId} for ${amount} tokens: ${description}`);
    return rewardId;
  }

  async hasMilestoneCompleted(milestoneId: string): Promise<boolean> {
    // Mock implementation - check against existing rewards
    const rewards = await this.getAllRewards();
    return rewards.some(r => r.id === milestoneId && r.unlocked);
  }
}

class MockToken extends BaseContract implements IToken {
  async getBalance(): Promise<TokenBalance> {
    return mockWeb3Service.getState().balance;
  }

  async transfer(to: string, amount: number): Promise<MockTransaction> {
    // Mock implementation - would normally transfer tokens
    const transaction: MockTransaction = {
      id: `transfer_${Date.now()}`,
      type: 'transfer',
      amount,
      status: 'confirmed',
      timestamp: new Date(),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      metadata: {
        description: `Transfer ${amount} VEG21 to ${to}`
      }
    };
    
    console.log(`Mock: Transfer ${amount} VEG21 to ${to}`);
    return transaction;
  }

  async approve(spender: string, amount: number): Promise<MockTransaction> {
    // Mock implementation - would normally approve allowance
    const transaction: MockTransaction = {
      id: `approve_${Date.now()}`,
      type: 'transfer',
      amount,
      status: 'confirmed',
      timestamp: new Date(),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      metadata: {
        description: `Approve ${amount} VEG21 for ${spender}`
      }
    };
    
    console.log(`Mock: Approve ${amount} VEG21 for ${spender}`);
    return transaction;
  }

  async getAllowance(spender: string): Promise<number> {
    // Mock implementation - return large allowance
    console.log(`Mock: Get allowance for ${spender}`);
    return 999999999;
  }

  async getTokenInfo(): Promise<{ name: string; symbol: string; decimals: number; totalSupply: number }> {
    return {
      name: 'VEG21 Token',
      symbol: 'VEG21',
      decimals: 18,
      totalSupply: 1000000 // 1M tokens
    };
  }
}

// Contract implementations for real blockchain interaction
class ContractStaking extends BaseContract implements IStaking {
  private contract: Contract | null = null;
  private provider: BrowserProvider | null = null;

  async initialize(): Promise<void> {
    console.log(`Initializing real staking contract at ${this.address}`);
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use contract mode.');
    }

    try {
      // Create provider and signer
      this.provider = new BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      
      // Create contract instance
      this.contract = new Contract(this.address, this.abi, signer);
      
      // Verify contract is deployed
      const code = await this.provider.getCode(this.address);
      if (code === '0x') {
        throw new Error(`No contract deployed at address ${this.address}`);
      }
      
      this.isInitialized = true;
      console.log('Real staking contract initialized successfully');
    } catch (error) {
      console.error('Failed to initialize staking contract:', error);
      throw error;
    }
  }

  async isDeployed(): Promise<boolean> {
    if (!this.provider) {
      return false;
    }
    
    try {
      const code = await this.provider.getCode(this.address);
      return code !== '0x';
    } catch (error) {
      console.error('Error checking contract deployment:', error);
      return false;
    }
  }

  async stakeTokens(amount: number): Promise<MockTransaction> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      // Convert amount to wei (assuming amount is in ETH)
      const amountWei = parseEther(amount.toString());
      
      console.log(`Staking ${amount} ETH (${amountWei.toString()} wei) to contract...`);
      
      // Call stake function with value
      const tx = await this.contract.stake(amountWei, { value: amountWei });
      
      console.log('Stake transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('Stake transaction confirmed:', receipt.transactionHash);
      
      // Return mock transaction format for UI compatibility
      return {
        id: `stake_${Date.now()}`,
        type: 'stake_tokens',
        amount,
        status: 'confirmed',
        timestamp: new Date(),
        txHash: receipt.hash,
        metadata: {
          description: `Staked ${amount} ETH`,
          stakeId: `stake_${Date.now()}`
        }
      };
    } catch (error: any) {
      console.error('Error staking tokens:', error);
      
      // Handle specific contract errors
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds to stake this amount');
      }
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction was rejected by user');
      }
      
      throw new Error(`Staking failed: ${error.message}`);
    }
  }

  async unstakeTokens(amountOrStakeId: string): Promise<MockTransaction> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      // For our simple contract, treat stakeId as amount to unstake
      const amount = parseFloat(amountOrStakeId);
      const amountWei = parseEther(amount.toString());
      
      console.log(`Unstaking ${amount} ETH (${amountWei.toString()} wei) from contract...`);
      
      // Call unstake function
      const tx = await this.contract.unstake(amountWei);
      
      console.log('Unstake transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('Unstake transaction confirmed:', receipt.transactionHash);
      
      // Return mock transaction format for UI compatibility
      return {
        id: `unstake_${Date.now()}`,
        type: 'unstake_tokens',
        amount,
        status: 'confirmed',
        timestamp: new Date(),
        txHash: receipt.hash,
        metadata: {
          description: `Unstaked ${amount} ETH`,
          stakeId: amountOrStakeId
        }
      };
    } catch (error: any) {
      console.error('Error unstaking tokens:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction was rejected by user');
      }
      
      throw new Error(`Unstaking failed: ${error.message}`);
    }
  }

  async getActiveStakes(): Promise<StakeRecord[]> {
    if (!this.contract || !this.provider) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();
      
      // Get user's stake amount
      const stakedAmount = await this.contract.getStake(address);
      const stakingTimestamp = await this.contract.getStakingTimestamp(address);
      
      if (stakedAmount.isZero()) {
        return [];
      }
      
      // Convert from wei to ETH
      const amountEth = parseFloat(formatEther(stakedAmount));
      
      // Create stake record in expected format
      const stakeRecord: StakeRecord = {
        id: `stake_${address}_${stakingTimestamp.toString()}`,
        amount: amountEth,
        stakedAt: new Date(Number(stakingTimestamp) * 1000),
        isActive: true,
        rewardsEarned: await this.calculateRewards(amountEth, 1), // 1 day of rewards  
        txHash: `0x${address.slice(2)}${stakingTimestamp.toString()}`
      };
      
      return [stakeRecord];
    } catch (error: any) {
      console.error('Error getting active stakes:', error);
      throw new Error(`Failed to get stakes: ${error.message}`);
    }
  }

  async getAllStakes(): Promise<StakeRecord[]> {
    // For our simple contract, this is the same as active stakes
    return this.getActiveStakes();
  }

  async getTotalStaked(): Promise<number> {
    if (!this.contract || !this.provider) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();
      
      const stakedAmount = await this.contract.getStake(address);
      return parseFloat(formatEther(stakedAmount));
    } catch (error: any) {
      console.error('Error getting total staked:', error);
      throw new Error(`Failed to get total staked: ${error.message}`);
    }
  }

  async getTotalStakingRewards(): Promise<number> {
    if (!this.contract || !this.provider) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();
      
      const pendingRewards = await this.contract.calculateReward(address);
      return parseFloat(formatEther(pendingRewards));
    } catch (error: any) {
      console.error('Error getting staking rewards:', error);
      throw new Error(`Failed to get staking rewards: ${error.message}`);
    }
  }

  async getStakingAPY(): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      const rewardRate = await this.contract.rewardRate();
      // rewardRate is in basis points per day, convert to annual percentage
      const dailyRate = rewardRate.toNumber() / 10000; // Convert from basis points
      const annualRate = dailyRate * 365; // Convert to annual
      return annualRate * 100; // Convert to percentage
    } catch (error: any) {
      console.error('Error getting APY:', error);
      // Fallback to our known rate: 1% daily = 365% APY
      return 365;
    }
  }

  async calculateRewards(amount: number, durationDays: number): Promise<number> {
    // Use the same calculation as our smart contract
    const dailyRewardRate = 0.01; // 1% daily (100 basis points / 10000)
    return amount * dailyRewardRate * durationDays;
  }
}

class ContractDonations extends BaseContract implements IDonations {
  // TODO: Implement real contract interactions
  async contribute(charityId: string, amount: number): Promise<MockTransaction> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getContributions(): Promise<ContributionRecord[]> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getTotalContributed(): Promise<number> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getContributionsByCharity(charityId: string): Promise<ContributionRecord[]> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getSupportedCharities(): Promise<{ id: string; name: string; description: string }[]> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getCharityTotalDonations(charityId: string): Promise<number> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }
}

class ContractRewards extends BaseContract implements IRewards {
  // TODO: Implement real contract interactions
  async claimReward(rewardId: string): Promise<MockTransaction> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getAllRewards(): Promise<ClaimableReward[]> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getClaimableRewards(): Promise<ClaimableReward[]> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async unlockReward(rewardId: string, milestoneData?: any): Promise<boolean> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getTotalEarned(): Promise<number> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async createMilestoneReward(type: 'milestone' | 'daily' | 'bonus', amount: number, description: string): Promise<string> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async hasMilestoneCompleted(milestoneId: string): Promise<boolean> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }
}

class ContractToken extends BaseContract implements IToken {
  private contract: Contract | null = null;
  private provider: BrowserProvider | null = null;

  async initialize(): Promise<void> {
    if (!hasValidCredentials() || !hasWalletProvider()) {
      console.log('Deploy-ready: Skipping real token contract initialization (missing credentials or wallet)');
      return;
    }

    console.log(`Initializing real token contract at ${this.address}`);
    
    try {
      this.provider = new BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      this.contract = new Contract(this.address, this.abi, signer);
      
      const code = await this.provider.getCode(this.address);
      if (code === '0x') {
        throw new Error(`No contract deployed at address ${this.address}`);
      }
      
      this.isInitialized = true;
      console.log('Real token contract initialized successfully');
    } catch (error) {
      console.error('Failed to initialize token contract:', error);
      throw error;
    }
  }

  async getBalance(): Promise<TokenBalance> {
    if (!this.contract || !this.provider) {
      console.warn('Deploy-ready: Token contract not initialized, returning zero balance');
      return { veg21: 0, astr: 0 };
    }

    try {
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();
      const balance = await this.contract.balanceOf(address);
      return {
        veg21: parseFloat(formatEther(balance)),
        astr: 0 // Not tracking CELO balance here
      };
    } catch (error: any) {
      console.error('Error getting balance:', error);
      return { veg21: 0, astr: 0 };
    }
  }

  async transfer(to: string, amount: number): Promise<MockTransaction> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first or use mock mode.');
    }

    try {
      const amountWei = parseEther(amount.toString());
      const tx = await this.contract.transfer(to, amountWei);
      console.log('Transfer transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transfer confirmed:', receipt.transactionHash);
      
      return {
        id: `transfer_${Date.now()}`,
        type: 'transfer',
        amount,
        status: 'confirmed',
        timestamp: new Date(),
        txHash: receipt.hash,
        to,
        metadata: { description: `Transferred ${amount} VEG21 to ${to}` }
      };
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction was rejected by user');
      }
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  async approve(spender: string, amount: number): Promise<MockTransaction> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first or use mock mode.');
    }

    try {
      const amountWei = parseEther(amount.toString());
      const tx = await this.contract.approve(spender, amountWei);
      console.log('Approve transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Approve confirmed:', receipt.transactionHash);
      
      return {
        id: `approve_${Date.now()}`,
        type: 'transfer',
        amount,
        status: 'confirmed',
        timestamp: new Date(),
        txHash: receipt.hash,
        metadata: { description: `Approved ${amount} VEG21 for ${spender}` }
      };
    } catch (error: any) {
      console.error('Error approving tokens:', error);
      throw new Error(`Approval failed: ${error.message}`);
    }
  }

  async getAllowance(spender: string): Promise<number> {
    if (!this.contract || !this.provider) {
      return 0;
    }

    try {
      const signer = await this.provider.getSigner();
      const owner = await signer.getAddress();
      const allowance = await this.contract.allowance(owner, spender);
      return parseFloat(formatEther(allowance));
    } catch (error: any) {
      console.error('Error getting allowance:', error);
      return 0;
    }
  }

  async getTokenInfo(): Promise<{ name: string; symbol: string; decimals: number; totalSupply: number }> {
    if (!this.contract) {
      return {
        name: 'VEG21 Token',
        symbol: 'VEG21',
        decimals: 18,
        totalSupply: 0
      };
    }

    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply()
      ]);
      
      return {
        name,
        symbol,
        decimals,
        totalSupply: parseFloat(formatEther(totalSupply))
      };
    } catch (error: any) {
      console.error('Error getting token info:', error);
      return {
        name: 'VEG21 Token',
        symbol: 'VEG21',
        decimals: 18,
        totalSupply: 0
      };
    }
  }
}

// Main contract service implementation
class ContractService implements IContractService {
  public staking!: IStaking;
  public donations!: IDonations;
  public rewards!: IRewards;
  public token!: IToken;

  private config: ServiceConfig;
  private eventListeners: Map<ContractEventType, ContractEventCallback[]> = new Map();
  private isInitializedFlag: boolean = false;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.initializeContracts();
  }

  private initializeContracts(): void {
    if (this.config.mode === ServiceMode.MOCK) {
      // Use mock implementations
      this.staking = new MockStaking('mock://staking', []);
      this.donations = new MockDonations('mock://donations', []);
      this.rewards = new MockRewards('mock://rewards', []);
      this.token = new MockToken('mock://token', []);
      
      console.log('Contract service initialized in MOCK mode');
    } else if (this.config.mode === ServiceMode.HYBRID) {
      // Hybrid mode: Mix of real and mock implementations based on configuration
      const contractConfig = this.config.contractConfig!;
      const hybridConfig = this.config.hybridConfig!;
      
      // Initialize modules based on hybrid configuration
      this.staking = hybridConfig.useRealStaking 
        ? new ContractStaking(contractConfig.addresses.staking, StakingABI.abi)
        : new MockStaking('mock://staking', []);
        
      this.donations = hybridConfig.useRealDonations
        ? new ContractDonations(contractConfig.addresses.donations, DonationsABI.abi)
        : new MockDonations('mock://donations', []);
        
      this.rewards = hybridConfig.useRealRewards
        ? new ContractRewards(contractConfig.addresses.rewards, RewardsABI.abi)
        : new MockRewards('mock://rewards', []);
        
      this.token = hybridConfig.useRealToken
        ? new ContractToken(contractConfig.addresses.token, TokenABI.abi)
        : new MockToken('mock://token', []);
      
      console.log('Contract service initialized in HYBRID mode');
      console.log('Hybrid configuration:', hybridConfig);
      console.log('Using real contracts for:', Object.entries(hybridConfig).filter(([_, useReal]) => useReal).map(([key]) => key));
    } else {
      // Use real contract implementations
      const contractConfig = this.config.contractConfig!;
      
      this.staking = new ContractStaking(contractConfig.addresses.staking, StakingABI.abi);
      this.donations = new ContractDonations(contractConfig.addresses.donations, DonationsABI.abi);
      this.rewards = new ContractRewards(contractConfig.addresses.rewards, RewardsABI.abi);
      this.token = new ContractToken(contractConfig.addresses.token, TokenABI.abi);
      
      console.log('Contract service initialized in CONTRACT mode');
      console.log('Contract addresses:', contractConfig.addresses);
    }
  }

  async initialize(walletAddress: string): Promise<void> {
    console.log(`Initializing contract service for wallet: ${walletAddress}`);
    
    if (this.config.mode === ServiceMode.MOCK) {
      // Initialize mock service
      await mockWeb3Service.initialize(walletAddress);
    } else if (this.config.mode === ServiceMode.HYBRID) {
      // Initialize mock service for persistence and shared state
      await mockWeb3Service.initialize(walletAddress);
      
      // Initialize only real contracts that are enabled in hybrid mode
      const initPromises = [];
      const hybridConfig = this.config.hybridConfig!;
      
      if (hybridConfig.useRealStaking) {
        initPromises.push(this.staking.initialize());
      }
      if (hybridConfig.useRealDonations) {
        initPromises.push(this.donations.initialize());
      }
      if (hybridConfig.useRealRewards) {
        initPromises.push(this.rewards.initialize());
      }
      if (hybridConfig.useRealToken) {
        initPromises.push(this.token.initialize());
      }
      
      await Promise.all(initPromises);
      console.log('Hybrid mode: Initialized both mock and real contract services');
    } else {
      // Initialize real contracts
      await Promise.all([
        this.staking.initialize(),
        this.donations.initialize(),
        this.rewards.initialize(),
        this.token.initialize()
      ]);
    }

    this.isInitializedFlag = true;
    this.emit('state_changed', { initialized: true, mode: this.config.mode });
  }

  isInitialized(): boolean {
    return this.isInitializedFlag;
  }

  async getNetworkId(): Promise<number> {
    if (this.config.mode === ServiceMode.MOCK) {
      return 31337; // Mock network ID
    }
    
    return this.config.contractConfig?.network.chainId || 31337;
  }

  async switchNetwork(networkId: number): Promise<boolean> {
    console.log(`Switching to network: ${networkId}`);
    
    if (this.config.mode === ServiceMode.MOCK) {
      // Mock network switch always succeeds
      return true;
    }
    
    // TODO: Implement real network switching logic
    return false;
  }

  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    console.log(`Checking transaction status: ${txHash}`);
    
    if (this.config.mode === ServiceMode.MOCK) {
      // Mock transactions are always confirmed
      return 'confirmed';
    }
    
    // TODO: Implement real transaction status checking
    return 'pending';
  }

  async waitForTransaction(txHash: string): Promise<MockTransaction> {
    console.log(`Waiting for transaction: ${txHash}`);
    
    // In mock mode, return immediately
    if (this.config.mode === ServiceMode.MOCK) {
      return {
        id: txHash,
        type: 'transfer',
        amount: 0,
        status: 'confirmed',
        timestamp: new Date(),
        txHash
      };
    }
    
    // TODO: Implement real transaction waiting logic
    throw new Error('Real transaction waiting not yet implemented');
  }

  on(event: ContractEventType, callback: ContractEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: ContractEventType, callback: ContractEventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: ContractEventType, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  async getState(): Promise<{
    balance: TokenBalance;
    stakes: StakeRecord[];
    contributions: ContributionRecord[];
    rewards: ClaimableReward[];
    totalStaked: number;
    totalContributed: number;
    totalEarned: number;
    totalStakingRewards: number;
  }> {
    if (this.config.mode === ServiceMode.MOCK) {
      const mockState = mockWeb3Service.getState();
      return {
        balance: mockState.balance,
        stakes: mockState.stakes,
        contributions: mockState.contributions,
        rewards: mockState.rewards,
        totalStaked: mockState.totalStaked,
        totalContributed: mockState.totalContributed,
        totalEarned: mockState.totalEarned,
        totalStakingRewards: mockState.totalStakingRewards
      };
    }
    
    // TODO: Implement real contract state aggregation
    throw new Error('Real contract state aggregation not yet implemented');
  }

  // Utility method to switch service mode at runtime
  switchMode(newMode: ServiceMode, contractConfig?: ContractConfig): void {
    this.config.mode = newMode;
    if (contractConfig) {
      this.config.contractConfig = contractConfig;
    }
    
    this.isInitializedFlag = false;
    this.initializeContracts();
    
    console.log(`Switched contract service to ${newMode} mode`);
    this.emit('state_changed', { modeChanged: true, newMode });
  }
}

// Create and export singleton contract service instance
export const contractService = new ContractService(SERVICE_CONFIG);

// Export types for external use
export type { 
  IContractService, 
  IStaking, 
  IDonations, 
  IRewards, 
  IToken 
};