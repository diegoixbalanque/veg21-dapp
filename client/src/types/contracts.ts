// Smart Contract Interface Definitions for VEG21 dApp
// These interfaces define the expected contract methods for eventual blockchain deployment

import { TokenBalance, ClaimableReward, ContributionRecord, StakeRecord, MockTransaction } from '@/lib/mockWeb3';

// Base contract interface for common operations
export interface IBaseContract {
  // Contract initialization
  initialize(): Promise<void>;
  
  // Get contract address
  getAddress(): string;
  
  // Check if contract is deployed and accessible
  isDeployed(): Promise<boolean>;
}

// Staking contract interface
export interface IStaking extends IBaseContract {
  // Stake tokens for rewards (5% APY)
  stakeTokens(amount: number): Promise<MockTransaction>;
  
  // Unstake tokens and claim accumulated rewards
  unstakeTokens(stakeId: string): Promise<MockTransaction>;
  
  // Get all active stakes for user
  getActiveStakes(): Promise<StakeRecord[]>;
  
  // Get all stakes (active and inactive) for user
  getAllStakes(): Promise<StakeRecord[]>;
  
  // Get total amount staked by user
  getTotalStaked(): Promise<number>;
  
  // Get total staking rewards earned by user
  getTotalStakingRewards(): Promise<number>;
  
  // Get current APY rate
  getStakingAPY(): Promise<number>;
  
  // Calculate potential rewards for an amount over time
  calculateRewards(amount: number, durationDays: number): Promise<number>;
}

// Donations contract interface
export interface IDonations extends IBaseContract {
  // Contribute tokens to a charity
  contribute(charityId: string, amount: number): Promise<MockTransaction>;
  
  // Get all contributions made by user
  getContributions(): Promise<ContributionRecord[]>;
  
  // Get total amount contributed by user
  getTotalContributed(): Promise<number>;
  
  // Get contributions for a specific charity
  getContributionsByCharity(charityId: string): Promise<ContributionRecord[]>;
  
  // Get list of supported charities
  getSupportedCharities(): Promise<{ id: string; name: string; description: string }[]>;
  
  // Get total donations across all users for a charity
  getCharityTotalDonations(charityId: string): Promise<number>;
}

// Rewards contract interface
export interface IRewards extends IBaseContract {
  // Claim a specific reward
  claimReward(rewardId: string): Promise<MockTransaction>;
  
  // Get all rewards for user (claimed and unclaimed)
  getAllRewards(): Promise<ClaimableReward[]>;
  
  // Get only claimable (unlocked but not claimed) rewards
  getClaimableRewards(): Promise<ClaimableReward[]>;
  
  // Unlock a reward based on milestone completion
  unlockReward(rewardId: string, milestoneData?: any): Promise<boolean>;
  
  // Get total rewards earned by user
  getTotalEarned(): Promise<number>;
  
  // Create new milestone-based reward
  createMilestoneReward(type: 'milestone' | 'daily' | 'bonus', amount: number, description: string): Promise<string>;
  
  // Check if user has completed specific milestone
  hasMilestoneCompleted(milestoneId: string): Promise<boolean>;
}

// Token contract interface for VEG21 token operations
export interface IToken extends IBaseContract {
  // Get token balance for user
  getBalance(): Promise<TokenBalance>;
  
  // Transfer tokens to another address
  transfer(to: string, amount: number): Promise<MockTransaction>;
  
  // Approve spending allowance for contract
  approve(spender: string, amount: number): Promise<MockTransaction>;
  
  // Get allowance for spender
  getAllowance(spender: string): Promise<number>;
  
  // Get token metadata
  getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
  }>;
}

// Main contract service interface that orchestrates all contracts
export interface IContractService {
  // Contract instances
  staking: IStaking;
  donations: IDonations;
  rewards: IRewards;
  token: IToken;
  
  // Service operations
  initialize(walletAddress: string): Promise<void>;
  isInitialized(): boolean;
  
  // Network and configuration
  getNetworkId(): Promise<number>;
  switchNetwork(networkId: number): Promise<boolean>;
  
  // Transaction utilities
  getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'>;
  waitForTransaction(txHash: string): Promise<MockTransaction>;
  
  // Event listening
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
  
  // State management
  getState(): Promise<{
    balance: TokenBalance;
    stakes: StakeRecord[];
    contributions: ContributionRecord[];
    rewards: ClaimableReward[];
    totalStaked: number;
    totalContributed: number;
    totalEarned: number;
    totalStakingRewards: number;
  }>;
}

// Configuration interface for contract deployment
export interface ContractConfig {
  // Contract addresses
  addresses: {
    staking: string;
    donations: string;
    rewards: string;
    token: string;
  };
  
  // Network configuration
  network: {
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorer: string;
  };
  
  // Contract deployment info
  deployment: {
    blockNumber: number;
    deployer: string;
    timestamp: number;
  };
}

// Service mode enum
export enum ServiceMode {
  MOCK = 'mock',
  CONTRACT = 'contract'
}

// Environment configuration for switching modes
export interface ServiceConfig {
  mode: ServiceMode;
  mockConfig?: any; // Configuration for mock service
  contractConfig?: ContractConfig; // Configuration for contract service
}