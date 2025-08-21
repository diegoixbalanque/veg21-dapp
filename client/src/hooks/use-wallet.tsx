import { useState, useCallback } from 'react';
import { ethersService } from '@/lib/ethers';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
  });

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const address = await ethersService.connectWallet();
      await ethersService.switchToAstarNetwork();
      
      setWalletState({
        isConnected: true,
        address,
        isConnecting: false,
        error: null,
      });

      return address;
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    formattedAddress: walletState.address ? ethersService.formatAddress(walletState.address) : null,
  };
}
