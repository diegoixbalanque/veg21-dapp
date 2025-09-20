import { useState, useEffect, useCallback } from 'react';
import { 
  mockWeb3Service, 
  TokenBalance, 
  ClaimableReward, 
  ContributionRecord, 
  MockTransaction,
  MockWeb3State,
  StakeRecord
} from '@/lib/mockWeb3';
import { contractService } from '@/lib/contractService';
import { ServiceMode, SERVICE_CONFIG } from '@/config/contracts';
import { useToast } from '@/hooks/use-toast';

export interface MockWeb3HookState {
  isInitialized: boolean;
  isLoading: boolean;
  balance: TokenBalance;
  rewards: ClaimableReward[];
  claimableRewards: ClaimableReward[];
  contributions: ContributionRecord[];
  totalEarned: number;
  totalContributed: number;
  totalStaked: number;
  totalStakingRewards: number;
  error: string | null;
}

export interface MockWeb3Operations {
  initialize: (walletAddress: string) => Promise<void>;
  claimReward: (rewardId: string) => Promise<MockTransaction>;
  contribute: (charityId: string, amount: number) => Promise<MockTransaction>;
  unlockReward: (rewardId: string) => boolean;
  // Extended operations for contract integration
  stakeTokens: (amount: number) => Promise<MockTransaction>;
  unstakeTokens: (stakeId: string) => Promise<MockTransaction>;
  getActiveStakes: () => Promise<StakeRecord[]>;
  getAllStakes: () => Promise<StakeRecord[]>;
  getTotalStaked: () => Promise<number>;
  getTotalStakingRewards: () => Promise<number>;
  refreshState: () => void;
  reset: () => void;
  // Service mode management
  getServiceMode: () => ServiceMode;
  switchServiceMode: (mode: ServiceMode) => Promise<void>;
}

export type UseMockWeb3Return = MockWeb3HookState & MockWeb3Operations;

export function useMockWeb3(): UseMockWeb3Return {
  const { toast } = useToast();
  const [currentServiceMode, setCurrentServiceMode] = useState<ServiceMode>(SERVICE_CONFIG.mode);
  
  const [state, setState] = useState<MockWeb3HookState>({
    isInitialized: false,
    isLoading: false,
    balance: { veg21: 0, astr: 0 },
    rewards: [],
    claimableRewards: [],
    contributions: [],
    totalEarned: 0,
    totalContributed: 0,
    totalStaked: 0,
    totalStakingRewards: 0,
    error: null
  });

  // Update state from active service (mock or contract)
  const updateStateFromService = useCallback(async () => {
    try {
      if (currentServiceMode === ServiceMode.MOCK) {
        const serviceState = mockWeb3Service.getState();
        setState(prev => ({
          ...prev,
          isInitialized: serviceState.isInitialized,
          balance: serviceState.balance,
          rewards: serviceState.rewards,
          claimableRewards: mockWeb3Service.getClaimableRewards(),
          contributions: serviceState.contributions,
          totalEarned: serviceState.totalEarned,
          totalContributed: serviceState.totalContributed,
          totalStaked: serviceState.totalStaked,
          totalStakingRewards: serviceState.totalStakingRewards,
          error: null
        }));
      } else if (currentServiceMode === ServiceMode.HYBRID) {
        // Hybrid mode: Use mock service for shared state but individual contract calls for specific modules
        const serviceState = mockWeb3Service.getState();
        
        // Get real staking data if using real staking contracts
        let totalStaked = serviceState.totalStaked;
        let totalStakingRewards = serviceState.totalStakingRewards;
        
        try {
          if (contractService.isInitialized()) {
            totalStaked = await contractService.staking.getTotalStaked();
            totalStakingRewards = await contractService.staking.getTotalStakingRewards();
          }
        } catch (stakingError) {
          console.warn('Failed to get real staking data, using mock:', stakingError);
        }
        
        setState(prev => ({
          ...prev,
          isInitialized: serviceState.isInitialized,
          balance: serviceState.balance,
          rewards: serviceState.rewards,
          claimableRewards: mockWeb3Service.getClaimableRewards(),
          contributions: serviceState.contributions,
          totalEarned: serviceState.totalEarned,
          totalContributed: serviceState.totalContributed,
          totalStaked: totalStaked,
          totalStakingRewards: totalStakingRewards,
          error: null
        }));
      } else {
        // Use contract service for real blockchain interaction
        const contractState = await contractService.getState();
        setState(prev => ({
          ...prev,
          isInitialized: contractService.isInitialized(),
          balance: contractState.balance,
          rewards: contractState.rewards,
          claimableRewards: contractState.rewards.filter(r => r.unlocked && !r.claimed),
          contributions: contractState.contributions,
          totalEarned: contractState.totalEarned,
          totalContributed: contractState.totalContributed,
          totalStaked: contractState.totalStaked,
          totalStakingRewards: contractState.totalStakingRewards,
          error: null
        }));
      }
    } catch (error: any) {
      console.error('Failed to update state from service:', error);
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [currentServiceMode]);

  // Initialize the Web3 service (mock or contract based)
  const initialize = useCallback(async (walletAddress: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (currentServiceMode === ServiceMode.MOCK) {
        await mockWeb3Service.initialize(walletAddress);
      } else {
        await contractService.initialize(walletAddress);
      }
      
      await updateStateFromService();
      
      toast({
        title: "Web3 Inicializado",
        description: `Tu wallet está lista para interactuar con VEG21 (${currentServiceMode} mode).`,
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al inicializar Web3';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Error de Inicialización",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentServiceMode, updateStateFromService, toast]);

  // Claim a reward using active service
  const claimReward = useCallback(async (rewardId: string): Promise<MockTransaction> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let transaction: MockTransaction;
      
      if (currentServiceMode === ServiceMode.MOCK) {
        transaction = await mockWeb3Service.claimReward(rewardId);
      } else {
        transaction = await contractService.rewards.claimReward(rewardId);
      }
      
      await updateStateFromService();
      
      const reward = state.rewards.find(r => r.id === rewardId);
      const rewardName = reward?.description || 'recompensa';
      
      toast({
        title: "¡Recompensa Reclamada!",
        description: `Has recibido ${transaction.amount} VEG21 tokens por ${rewardName}.`,
        variant: "default",
      });
      
      return transaction;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al reclamar recompensa';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Error al Reclamar",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentServiceMode, updateStateFromService, toast, state.rewards]);

  // Contribute to charity fund using active service
  const contribute = useCallback(async (charityId: string, amount: number): Promise<MockTransaction> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let transaction: MockTransaction;
      
      if (currentServiceMode === ServiceMode.MOCK) {
        transaction = await mockWeb3Service.contribute(charityId, amount);
      } else {
        transaction = await contractService.donations.contribute(charityId, amount);
      }
      
      await updateStateFromService();
      
      toast({
        title: "¡Donación Exitosa! 🌱",
        description: `Has contribuido ${amount} VEG21 tokens al fondo benéfico.`,
        variant: "default",
      });
      
      return transaction;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al realizar la donación';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Error en la Donación",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentServiceMode, updateStateFromService, toast]);

  // Unlock a reward (typically called when milestones are reached)
  const unlockReward = useCallback((rewardId: string): boolean => {
    let success: boolean;
    
    if (currentServiceMode === ServiceMode.MOCK) {
      success = mockWeb3Service.unlockReward(rewardId);
    } else {
      // For contract mode, this would need to be implemented
      console.warn('Unlock reward not yet implemented in contract mode');
      success = false;
    }
    
    if (success) {
      updateStateFromService();
      
      const reward = state.rewards.find(r => r.id === rewardId);
      if (reward) {
        toast({
          title: "¡Nueva Recompensa Desbloqueada!",
          description: `${reward.description} - ${reward.amount} VEG21 tokens disponibles para reclamar.`,
          variant: "default",
        });
      }
    }
    
    return success;
  }, [currentServiceMode, updateStateFromService, toast, state.rewards]);

  // Staking operations using active service
  const stakeTokens = useCallback(async (amount: number): Promise<MockTransaction> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let transaction: MockTransaction;
      
      if (currentServiceMode === ServiceMode.MOCK) {
        transaction = await mockWeb3Service.stakeTokens(amount);
      } else {
        transaction = await contractService.staking.stakeTokens(amount);
      }
      
      await updateStateFromService();
      
      toast({
        title: "¡Tokens Apostados!",
        description: `Has apostado ${amount} VEG21 tokens para ganar recompensas.`,
        variant: "default",
      });
      
      return transaction;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al apostar tokens';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Error al Apostar",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentServiceMode, updateStateFromService, toast]);

  const unstakeTokens = useCallback(async (stakeId: string): Promise<MockTransaction> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let transaction: MockTransaction;
      
      if (currentServiceMode === ServiceMode.MOCK) {
        transaction = await mockWeb3Service.unstakeTokens(stakeId);
      } else {
        transaction = await contractService.staking.unstakeTokens(stakeId);
      }
      
      await updateStateFromService();
      
      toast({
        title: "¡Tokens Retirados!",
        description: `Has retirado tus tokens apostados con recompensas.`,
        variant: "default",
      });
      
      return transaction;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al retirar tokens';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Error al Retirar",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentServiceMode, updateStateFromService, toast]);

  const getActiveStakes = useCallback(async (): Promise<StakeRecord[]> => {
    if (currentServiceMode === ServiceMode.MOCK) {
      return mockWeb3Service.getActiveStakes();
    } else {
      return await contractService.staking.getActiveStakes();
    }
  }, [currentServiceMode]);

  const getAllStakes = useCallback(async (): Promise<StakeRecord[]> => {
    if (currentServiceMode === ServiceMode.MOCK) {
      return mockWeb3Service.getAllStakes();
    } else {
      return await contractService.staking.getAllStakes();
    }
  }, [currentServiceMode]);

  const getTotalStaked = useCallback(async (): Promise<number> => {
    if (currentServiceMode === ServiceMode.MOCK) {
      return mockWeb3Service.getTotalStaked();
    } else {
      return await contractService.staking.getTotalStaked();
    }
  }, [currentServiceMode]);

  const getTotalStakingRewards = useCallback(async (): Promise<number> => {
    if (currentServiceMode === ServiceMode.MOCK) {
      return mockWeb3Service.getTotalStakingRewards();
    } else {
      return await contractService.staking.getTotalStakingRewards();
    }
  }, [currentServiceMode]);

  // Service mode management
  const getServiceMode = useCallback((): ServiceMode => {
    return currentServiceMode;
  }, [currentServiceMode]);

  const switchServiceMode = useCallback(async (mode: ServiceMode): Promise<void> => {
    setCurrentServiceMode(mode);
    
    // Reinitialize with new mode if already initialized
    if (state.isInitialized) {
      const walletAddress = localStorage.getItem('veg21_wallet');
      if (walletAddress) {
        const parsedWallet = JSON.parse(walletAddress);
        if (parsedWallet.address) {
          await initialize(parsedWallet.address);
        }
      }
    }
    
    toast({
      title: "Modo de Servicio Cambiado",
      description: `Cambiado a modo ${mode.toUpperCase()}`,
      variant: "default",
    });
  }, [state.isInitialized, initialize, toast]);

  // Refresh state from service
  const refreshState = useCallback(() => {
    updateStateFromService();
  }, [updateStateFromService]);

  // Reset all data (for testing/demo)
  const reset = useCallback(() => {
    if (currentServiceMode === ServiceMode.MOCK) {
      mockWeb3Service.reset();
    }
    updateStateFromService();
    
    toast({
      title: "Datos Reiniciados",
      description: "Todos los datos de Web3 han sido reiniciados.",
      variant: "default",
    });
  }, [currentServiceMode, updateStateFromService, toast]);

  // Set up event listeners for service updates
  useEffect(() => {
    const handleStateChange = () => {
      updateStateFromService();
    };

    const handleBalanceUpdate = (balance: TokenBalance) => {
      setState(prev => ({ ...prev, balance }));
    };

    const handleRewardClaimed = (data: { reward: ClaimableReward; transaction: MockTransaction }) => {
      // State will be updated by handleStateChange, but we can add specific logic here if needed
    };

    const handleContributionMade = (data: { contribution: ContributionRecord; transaction: MockTransaction }) => {
      // State will be updated by handleStateChange, but we can add specific logic here if needed
    };

    // Subscribe to service events
    mockWeb3Service.on('state_changed', handleStateChange);
    mockWeb3Service.on('balance_updated', handleBalanceUpdate);
    mockWeb3Service.on('reward_claimed', handleRewardClaimed);
    mockWeb3Service.on('contribution_made', handleContributionMade);

    // Initialize state from service
    updateStateFromService();

    // Cleanup
    return () => {
      mockWeb3Service.off('state_changed', handleStateChange);
      mockWeb3Service.off('balance_updated', handleBalanceUpdate);
      mockWeb3Service.off('reward_claimed', handleRewardClaimed);
      mockWeb3Service.off('contribution_made', handleContributionMade);
    };
  }, [updateStateFromService]);

  return {
    ...state,
    initialize,
    claimReward,
    contribute,
    unlockReward,
    stakeTokens,
    unstakeTokens,
    getActiveStakes,
    getAllStakes,
    getTotalStaked,
    getTotalStakingRewards,
    getServiceMode,
    switchServiceMode,
    refreshState,
    reset
  };
}

// Utility hooks for specific use cases

// Hook for balance display components
export function useTokenBalance() {
  const { balance, isLoading } = useMockWeb3();
  return { balance, isLoading };
}

// Hook for reward claiming components
export function useRewardClaiming() {
  const { claimableRewards, claimReward, isLoading, error } = useMockWeb3();
  return { claimableRewards, claimReward, isLoading, error };
}

// Hook for contribution tracking components
export function useContributions() {
  const { contributions, contribute, totalContributed, isLoading, error } = useMockWeb3();
  return { contributions, contribute, totalContributed, isLoading, error };
}