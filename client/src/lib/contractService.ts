// Smart Contract Service Layer for VEG21 dApp
// This service provides a unified interface for interacting with both mock and real smart contracts

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

// Import contract ABIs
import StakingABI from '@/contracts/StakingContract.json';
import DonationsABI from '@/contracts/DonationsContract.json';
import RewardsABI from '@/contracts/RewardsContract.json';
import TokenABI from '@/contracts/TokenContract.json';

// Event emitter for contract events
type ContractEventType = 'balance_updated' | 'transaction_confirmed' | 'state_changed' | 'error';
type ContractEventCallback = (data: any) => void;

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
  // TODO: Implement real contract interactions using ethers.js or web3.js
  async stakeTokens(amount: number): Promise<MockTransaction> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async unstakeTokens(stakeId: string): Promise<MockTransaction> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getActiveStakes(): Promise<StakeRecord[]> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getAllStakes(): Promise<StakeRecord[]> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getTotalStaked(): Promise<number> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getTotalStakingRewards(): Promise<number> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getStakingAPY(): Promise<number> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async calculateRewards(amount: number, durationDays: number): Promise<number> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
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
  // TODO: Implement real contract interactions
  async getBalance(): Promise<TokenBalance> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async transfer(to: string, amount: number): Promise<MockTransaction> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async approve(spender: string, amount: number): Promise<MockTransaction> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getAllowance(spender: string): Promise<number> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
  }

  async getTokenInfo(): Promise<{ name: string; symbol: string; decimals: number; totalSupply: number }> {
    throw new Error('Real contract implementation not yet available. Use mock mode for now.');
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