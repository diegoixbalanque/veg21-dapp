// Mock Web3 Layer for VEG21 dApp
// This simulates blockchain functionality for development and testing
// Can be replaced with real Web3 providers later

export interface TokenBalance {
  veg21: number;
  astr: number;
}

export interface ClaimableReward {
  id: string;
  type: 'milestone' | 'daily' | 'bonus';
  amount: number;
  description: string;
  unlocked: boolean;
  claimed: boolean;
  unlockedAt?: Date;
  claimedAt?: Date;
}

export interface ContributionRecord {
  id: string;
  charityId: string;
  amount: number;
  timestamp: Date;
  txHash: string; // Mock transaction hash
}

export interface StakeRecord {
  id: string;
  amount: number;
  stakedAt: Date;
  unstakedAt?: Date;
  isActive: boolean;
  rewardsEarned: number;
  txHash: string;
}

export interface MockWeb3State {
  isInitialized: boolean;
  balance: TokenBalance;
  rewards: ClaimableReward[];
  contributions: ContributionRecord[];
  stakes: StakeRecord[];
  totalEarned: number;
  totalContributed: number;
  totalStaked: number;
  totalStakingRewards: number;
}

export interface MockTransaction {
  id: string;
  type: 'claim_reward' | 'contribute' | 'transfer' | 'receive' | 'stake_tokens' | 'unstake_tokens' | 'check_in' | 'validation';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash: string;
  from?: string;
  to?: string;
  metadata?: {
    rewardId?: string;
    charityId?: string;
    stakeId?: string;
    description?: string;
    checkInId?: string;
    userName?: string;
  };
}

// Storage keys for localStorage persistence
const STORAGE_KEYS = {
  WEB3_STATE: 'veg21_mock_web3_state',
  TRANSACTIONS: 'veg21_mock_transactions'
} as const;

// Event emitter for state changes
type MockWeb3EventType = 'balance_updated' | 'reward_claimed' | 'contribution_made' | 'state_changed';
type MockWeb3EventCallback = (data: any) => void;

class MockWeb3Service {
  private state: MockWeb3State;
  private eventListeners: Map<MockWeb3EventType, MockWeb3EventCallback[]> = new Map();
  private transactions: MockTransaction[] = [];

  constructor() {
    this.state = this.loadStateFromStorage();
    this.transactions = this.loadTransactionsFromStorage();
    this.initializeDefaultRewards();
  }

  // Initialize default rewards based on challenge milestones
  private initializeDefaultRewards() {
    const defaultRewards: ClaimableReward[] = [
      {
        id: 'day_1_bonus',
        type: 'milestone',
        amount: 50,
        description: 'Premio por tu primer día vegano',
        unlocked: false,
        claimed: false
      },
      {
        id: 'week_1_milestone',
        type: 'milestone',
        amount: 100,
        description: 'Completaste tu primera semana vegana',
        unlocked: false,
        claimed: false
      },
      {
        id: 'week_2_milestone',
        type: 'milestone',
        amount: 150,
        description: 'Dos semanas de compromiso vegano',
        unlocked: false,
        claimed: false
      },
      {
        id: 'challenge_complete',
        type: 'milestone',
        amount: 300,
        description: '¡Completaste el desafío de 21 días!',
        unlocked: false,
        claimed: false
      },
      {
        id: 'community_champion',
        type: 'bonus',
        amount: 75,
        description: 'Contribuiste a la comunidad vegana',
        unlocked: false,
        claimed: false
      }
    ];

    // Only add default rewards if none exist
    if (this.state.rewards.length === 0) {
      this.state.rewards = defaultRewards;
      this.saveStateToStorage();
    }
  }

  // Load state from localStorage or return default state
  private loadStateFromStorage(): MockWeb3State {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WEB3_STATE);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure dates are properly parsed
        parsed.rewards = parsed.rewards?.map((reward: any) => ({
          ...reward,
          unlockedAt: reward.unlockedAt ? new Date(reward.unlockedAt) : undefined,
          claimedAt: reward.claimedAt ? new Date(reward.claimedAt) : undefined
        })) || [];
        parsed.contributions = parsed.contributions?.map((contribution: any) => ({
          ...contribution,
          timestamp: new Date(contribution.timestamp)
        })) || [];
        parsed.stakes = parsed.stakes?.map((stake: any) => ({
          ...stake,
          stakedAt: new Date(stake.stakedAt),
          unstakedAt: stake.unstakedAt ? new Date(stake.unstakedAt) : undefined
        })) || [];
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load Web3 state from storage:', error);
    }

    // Return default state
    return {
      isInitialized: false,
      balance: { veg21: 0, astr: 0 },
      rewards: [],
      contributions: [],
      stakes: [],
      totalEarned: 0,
      totalContributed: 0,
      totalStaked: 0,
      totalStakingRewards: 0
    };
  }

  // Load transactions from localStorage
  private loadTransactionsFromStorage(): MockTransaction[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load transactions from storage:', error);
    }
    return [];
  }

  // Save state to localStorage
  private saveStateToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.WEB3_STATE, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save Web3 state to storage:', error);
    }
  }

  // Save transactions to localStorage
  private saveTransactionsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    } catch (error) {
      console.warn('Failed to save transactions to storage:', error);
    }
  }

  // Generate a mock transaction hash
  private generateTxHash(): string {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  // Event system for UI updates
  on(event: MockWeb3EventType, callback: MockWeb3EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: MockWeb3EventType, callback: MockWeb3EventCallback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: MockWeb3EventType, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Initialize the mock Web3 service with starting balance
  async initialize(walletAddress: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.state.isInitialized) {
          // Give new users starting tokens
          this.state.balance.veg21 = 100; // Starting VEG21 tokens
          this.state.balance.astr = 0.5;  // Starting gas balance (displayed as VEG21 in UI)
          this.state.isInitialized = true;
          this.saveStateToStorage();
        }
        this.emit('state_changed', this.state);
        resolve();
      }, 1000); // Simulate network delay
    });
  }

  // Get current state
  getState(): MockWeb3State {
    return { ...this.state };
  }

  // Get current balance
  getBalance(): TokenBalance {
    return { ...this.state.balance };
  }

  // Get claimable rewards
  getClaimableRewards(): ClaimableReward[] {
    return this.state.rewards.filter(reward => reward.unlocked && !reward.claimed);
  }

  // Get all rewards (for UI display)
  getAllRewards(): ClaimableReward[] {
    return [...this.state.rewards];
  }

  // Unlock reward based on challenge progress
  unlockReward(rewardId: string): boolean {
    const reward = this.state.rewards.find(r => r.id === rewardId);
    if (reward && !reward.unlocked) {
      reward.unlocked = true;
      reward.unlockedAt = new Date();
      this.saveStateToStorage();
      this.emit('state_changed', this.state);
      return true;
    }
    return false;
  }

  // Claim a reward
  async claimReward(rewardId: string): Promise<MockTransaction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const reward = this.state.rewards.find(r => r.id === rewardId);
        
        if (!reward) {
          reject(new Error('Recompensa no encontrada'));
          return;
        }

        if (!reward.unlocked) {
          reject(new Error('Recompensa no desbloqueada'));
          return;
        }

        if (reward.claimed) {
          reject(new Error('Recompensa ya reclamada'));
          return;
        }

        // Mark reward as claimed
        reward.claimed = true;
        reward.claimedAt = new Date();

        // Update balance
        this.state.balance.veg21 += reward.amount;
        this.state.totalEarned += reward.amount;

        // Create transaction record
        const transaction: MockTransaction = {
          id: `claim_${Date.now()}`,
          type: 'claim_reward',
          amount: reward.amount,
          status: 'confirmed',
          timestamp: new Date(),
          txHash: this.generateTxHash(),
          metadata: {
            rewardId: reward.id,
            description: reward.description
          }
        };

        this.transactions.push(transaction);
        this.saveStateToStorage();
        this.saveTransactionsToStorage();

        this.emit('balance_updated', this.state.balance);
        this.emit('reward_claimed', { reward, transaction });
        this.emit('state_changed', this.state);

        resolve(transaction);
      }, 2000); // Simulate blockchain confirmation time
    });
  }

  // Make a contribution to charity
  async contribute(charityId: string, amount: number): Promise<MockTransaction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount <= 0) {
          reject(new Error('El monto debe ser mayor a 0'));
          return;
        }

        if (this.state.balance.veg21 < amount) {
          reject(new Error('Saldo insuficiente'));
          return;
        }

        // Deduct from balance
        this.state.balance.veg21 -= amount;
        this.state.totalContributed += amount;

        // Create contribution record
        const contribution: ContributionRecord = {
          id: `contrib_${Date.now()}`,
          charityId,
          amount,
          timestamp: new Date(),
          txHash: this.generateTxHash()
        };

        // Create transaction record
        const transaction: MockTransaction = {
          id: `contrib_tx_${Date.now()}`,
          type: 'contribute',
          amount,
          status: 'confirmed',
          timestamp: new Date(),
          txHash: contribution.txHash,
          metadata: {
            charityId: charityId,
            description: `Donación a organización benéfica`
          }
        };

        this.state.contributions.push(contribution);
        this.transactions.push(transaction);

        this.saveStateToStorage();
        this.saveTransactionsToStorage();

        this.emit('balance_updated', this.state.balance);
        this.emit('contribution_made', { contribution, transaction });
        this.emit('state_changed', this.state);

        resolve(transaction);
      }, 2000);
    });
  }

  // Transfer tokens to another address
  async transferTokens(toAddress: string, amount: number, description?: string): Promise<MockTransaction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount <= 0) {
          reject(new Error('El monto debe ser mayor a 0'));
          return;
        }

        if (this.state.balance.veg21 < amount) {
          reject(new Error('Saldo insuficiente'));
          return;
        }

        if (!toAddress || toAddress.length < 10) {
          reject(new Error('Dirección de destino inválida'));
          return;
        }

        // Deduct from balance
        this.state.balance.veg21 -= amount;

        // Create transaction record
        const transaction: MockTransaction = {
          id: `transfer_${Date.now()}`,
          type: 'transfer',
          amount,
          status: 'confirmed',
          timestamp: new Date(),
          txHash: this.generateTxHash(),
          to: toAddress,
          metadata: {
            description: description || `Transferencia a ${toAddress.slice(0, 8)}...${toAddress.slice(-6)}`
          }
        };

        this.transactions.push(transaction);
        this.saveStateToStorage();
        this.saveTransactionsToStorage();

        this.emit('balance_updated', this.state.balance);
        this.emit('state_changed', this.state);

        resolve(transaction);
      }, 2000);
    });
  }

  // Record receiving tokens (for display purposes)
  recordReceive(fromAddress: string, amount: number, description?: string): MockTransaction {
    // Add to balance
    this.state.balance.veg21 += amount;
    this.state.totalEarned += amount;

    // Create transaction record
    const transaction: MockTransaction = {
      id: `receive_${Date.now()}`,
      type: 'receive',
      amount,
      status: 'confirmed',
      timestamp: new Date(),
      txHash: this.generateTxHash(),
      from: fromAddress,
      metadata: {
        description: description || `Recibido de ${fromAddress.slice(0, 8)}...${fromAddress.slice(-6)}`
      }
    };

    this.transactions.push(transaction);
    this.saveStateToStorage();
    this.saveTransactionsToStorage();

    this.emit('balance_updated', this.state.balance);
    this.emit('state_changed', this.state);

    return transaction;
  }

  // Get user's contribution history
  getContributions(): ContributionRecord[] {
    return [...this.state.contributions];
  }

  // Get total contributed amount
  getTotalContributed(): number {
    return this.state.totalContributed;
  }

  // Get transaction history
  getTransactions(): MockTransaction[] {
    return [...this.transactions];
  }

  // Get all transactions (alias for veg21_tx_history compatibility)
  getAllTransactions(): MockTransaction[] {
    return [...this.transactions];
  }

  // Stake tokens for rewards
  async stakeTokens(amount: number): Promise<MockTransaction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount <= 0) {
          reject(new Error('El monto debe ser mayor a 0'));
          return;
        }

        if (this.state.balance.veg21 < amount) {
          reject(new Error('Saldo insuficiente para apostar'));
          return;
        }

        // Deduct from balance
        this.state.balance.veg21 -= amount;
        this.state.totalStaked += amount;

        // Create stake record
        const stake: StakeRecord = {
          id: `stake_${Date.now()}`,
          amount,
          stakedAt: new Date(),
          isActive: true,
          rewardsEarned: 0,
          txHash: this.generateTxHash()
        };

        // Create transaction record
        const transaction: MockTransaction = {
          id: `stake_tx_${Date.now()}`,
          type: 'stake_tokens',
          amount,
          status: 'confirmed',
          timestamp: new Date(),
          txHash: stake.txHash,
          metadata: {
            stakeId: stake.id,
            description: `Tokens apostados para ganar recompensas (5% APY)`
          }
        };

        this.state.stakes.push(stake);
        this.transactions.push(transaction);

        this.saveStateToStorage();
        this.saveTransactionsToStorage();

        this.emit('balance_updated', this.state.balance);
        this.emit('state_changed', this.state);

        resolve(transaction);
      }, 2000);
    });
  }

  // Unstake tokens and claim rewards
  async unstakeTokens(stakeId: string): Promise<MockTransaction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const stake = this.state.stakes.find(s => s.id === stakeId && s.isActive);
        
        if (!stake) {
          reject(new Error('Apuesta no encontrada o ya retirada'));
          return;
        }

        // Calculate staking rewards (5% APY, pro-rated for time staked)
        const stakingDurationMs = Date.now() - stake.stakedAt.getTime();
        const stakingDurationDays = stakingDurationMs / (1000 * 60 * 60 * 24);
        const annualRewardRate = 0.05; // 5% APY
        const rewardsEarned = stake.amount * (annualRewardRate * stakingDurationDays / 365);

        // Mark stake as inactive
        stake.isActive = false;
        stake.unstakedAt = new Date();
        stake.rewardsEarned = rewardsEarned;

        // Return staked amount plus rewards
        const totalReturn = stake.amount + rewardsEarned;
        this.state.balance.veg21 += totalReturn;
        this.state.totalStaked -= stake.amount;
        this.state.totalStakingRewards += rewardsEarned;
        this.state.totalEarned += rewardsEarned;

        // Create transaction record
        const transaction: MockTransaction = {
          id: `unstake_tx_${Date.now()}`,
          type: 'unstake_tokens',
          amount: totalReturn,
          status: 'confirmed',
          timestamp: new Date(),
          txHash: this.generateTxHash(),
          metadata: {
            stakeId: stake.id,
            description: `Tokens retirados con ${formatTokenAmount(rewardsEarned, 2)} VEG21 de recompensas`
          }
        };

        this.transactions.push(transaction);

        this.saveStateToStorage();
        this.saveTransactionsToStorage();

        this.emit('balance_updated', this.state.balance);
        this.emit('state_changed', this.state);

        resolve(transaction);
      }, 2000);
    });
  }

  // Get active stakes
  getActiveStakes(): StakeRecord[] {
    return this.state.stakes.filter(stake => stake.isActive);
  }

  // Get all stakes (including inactive)
  getAllStakes(): StakeRecord[] {
    return [...this.state.stakes];
  }

  // Get total staked amount
  getTotalStaked(): number {
    return this.state.totalStaked;
  }

  // Get total staking rewards earned
  getTotalStakingRewards(): number {
    return this.state.totalStakingRewards;
  }

  // Reset all data (for testing/demo purposes)
  reset(): void {
    localStorage.removeItem(STORAGE_KEYS.WEB3_STATE);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    this.state = {
      isInitialized: false,
      balance: { veg21: 0, astr: 0 },
      rewards: [],
      contributions: [],
      stakes: [],
      totalEarned: 0,
      totalContributed: 0,
      totalStaked: 0,
      totalStakingRewards: 0
    };
    this.transactions = [];
    this.initializeDefaultRewards();
    this.emit('state_changed', this.state);
  }
}

// Export singleton instance
export const mockWeb3Service = new MockWeb3Service();

// Utility functions for formatting
export const formatTokenAmount = (amount: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

export const formatTxHash = (hash: string): string => {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};