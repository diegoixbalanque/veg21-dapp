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

export interface MockWeb3State {
  isInitialized: boolean;
  balance: TokenBalance;
  rewards: ClaimableReward[];
  contributions: ContributionRecord[];
  totalEarned: number;
  totalContributed: number;
}

export interface MockTransaction {
  id: string;
  type: 'claim_reward' | 'contribute' | 'transfer';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash: string;
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
        id: 'day_7_milestone',
        type: 'milestone',
        amount: 5,
        description: 'Completaste 7 días veganos',
        unlocked: false,
        claimed: false
      },
      {
        id: 'day_14_milestone',
        type: 'milestone',
        amount: 10,
        description: 'Dos semanas de compromiso vegano',
        unlocked: false,
        claimed: false
      },
      {
        id: 'day_21_milestone',
        type: 'milestone',
        amount: 20,
        description: '¡Completaste el desafío de 21 días!',
        unlocked: false,
        claimed: false
      },
      {
        id: 'community_champion',
        type: 'bonus',
        amount: 25,
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
      totalEarned: 0,
      totalContributed: 0
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
          this.state.balance.astr = 0.5;  // Starting ASTR for gas
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
          txHash: this.generateTxHash()
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
          txHash: contribution.txHash
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

  // Add a new transaction (public method for external use)
  addTransaction(type: MockTransaction['type'], amount: number, description?: string): MockTransaction {
    const transaction: MockTransaction = {
      id: `${type}_${Date.now()}`,
      type,
      amount,
      status: 'confirmed',
      timestamp: new Date(),
      txHash: this.generateTxHash()
    };

    this.transactions.push(transaction);
    this.saveTransactionsToStorage();
    this.emit('state_changed', this.state);
    
    return transaction;
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
      totalEarned: 0,
      totalContributed: 0
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