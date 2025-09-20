import { useState, useEffect, useCallback } from 'react';
import { 
  mockWeb3Service, 
  TokenBalance, 
  ClaimableReward, 
  ContributionRecord, 
  MockTransaction,
  MockWeb3State 
} from '@/lib/mockWeb3';
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
  refreshState: () => void;
  reset: () => void;
}

export type UseMockWeb3Return = MockWeb3HookState & MockWeb3Operations;

export function useMockWeb3(): UseMockWeb3Return {
  const { toast } = useToast();
  
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

  // Update state from mock service
  const updateStateFromService = useCallback(() => {
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
  }, []);

  // Initialize the mock Web3 service
  const initialize = useCallback(async (walletAddress: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await mockWeb3Service.initialize(walletAddress);
      updateStateFromService();
      
      toast({
        title: "Web3 Inicializado",
        description: "Tu wallet está lista para interactuar con VEG21.",
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
  }, [updateStateFromService, toast]);

  // Claim a reward
  const claimReward = useCallback(async (rewardId: string): Promise<MockTransaction> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const transaction = await mockWeb3Service.claimReward(rewardId);
      updateStateFromService();
      
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
  }, [updateStateFromService, toast, state.rewards]);

  // Make a contribution to charity
  const contribute = useCallback(async (charityId: string, amount: number): Promise<MockTransaction> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const transaction = await mockWeb3Service.contribute(charityId, amount);
      updateStateFromService();
      
      toast({
        title: "¡Contribución Exitosa!",
        description: `Has donado ${amount} VEG21 tokens a la causa. ¡Gracias por tu generosidad!`,
        variant: "default",
      });
      
      return transaction;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al realizar contribución';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Error en Contribución",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [updateStateFromService, toast]);

  // Unlock a reward (typically called when milestones are reached)
  const unlockReward = useCallback((rewardId: string): boolean => {
    const success = mockWeb3Service.unlockReward(rewardId);
    
    if (success) {
      updateStateFromService();
      
      const reward = mockWeb3Service.getAllRewards().find(r => r.id === rewardId);
      if (reward) {
        toast({
          title: "¡Nueva Recompensa Desbloqueada!",
          description: `${reward.description} - ${reward.amount} VEG21 tokens disponibles para reclamar.`,
          variant: "default",
        });
      }
    }
    
    return success;
  }, [updateStateFromService, toast]);

  // Refresh state from service
  const refreshState = useCallback(() => {
    updateStateFromService();
  }, [updateStateFromService]);

  // Reset all data (for testing/demo)
  const reset = useCallback(() => {
    mockWeb3Service.reset();
    updateStateFromService();
    
    toast({
      title: "Datos Reiniciados",
      description: "Todos los datos de Web3 han sido reiniciados.",
      variant: "default",
    });
  }, [updateStateFromService, toast]);

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