import { useState, useCallback } from 'react';
import { ethersService } from '@/lib/ethers';
import { useToast } from '@/hooks/use-toast';

export interface WalletError {
  code: string;
  message: string;
  type: 'user_rejected' | 'network_error' | 'installation_required' | 'unknown' | 'switch_network_failed';
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: WalletError | null;
}

export function useWallet() {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
  });

  const showErrorToast = useCallback((error: WalletError) => {
    toast({
      title: "Error de Conexión de Wallet",
      description: error.message,
      variant: "destructive",
    });
  }, [toast]);

  const getErrorFromException = useCallback((error: any): WalletError => {
    if (error.code === 4001) {
      return {
        code: '4001',
        message: 'Conexión cancelada por el usuario. Por favor, aprueba la conexión en MetaMask.',
        type: 'user_rejected'
      };
    }
    
    if (error.code === 4902) {
      return {
        code: '4902',
        message: 'Red no encontrada. Se intentará agregar la red Astar automáticamente.',
        type: 'switch_network_failed'
      };
    }
    
    if (error.message?.includes('MetaMask is not installed')) {
      return {
        code: 'NO_WALLET',
        message: 'MetaMask no está instalado. Por favor, instala MetaMask para continuar.',
        type: 'installation_required'
      };
    }
    
    if (error.message?.includes('network') || error.message?.includes('connection')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Error de conexión de red. Verifica tu conexión a internet y prueba de nuevo.',
        type: 'network_error'
      };
    }
    
    return {
      code: error.code || 'UNKNOWN',
      message: error.message || 'Error desconocido al conectar la wallet. Por favor, intenta de nuevo.',
      type: 'unknown'
    };
  }, []);

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const address = await ethersService.connectWallet();
      
      // Show success message for wallet connection
      toast({
        title: "Wallet Conectada",
        description: "Tu wallet se ha conectado exitosamente.",
        variant: "default",
      });
      
      try {
        await ethersService.switchToAstarNetwork();
        
        // Show success message for network switch
        toast({
          title: "Red Astar Conectada",
          description: "Cambiaste exitosamente a la red Astar.",
          variant: "default",
        });
      } catch (networkError: any) {
        // Handle network switch errors gracefully
        const error = getErrorFromException(networkError);
        console.warn('Network switch failed:', error);
        
        // Don't fail wallet connection if network switch fails
        if (error.type === 'switch_network_failed') {
          toast({
            title: "Advertencia de Red",
            description: "Wallet conectada, pero no se pudo cambiar a la red Astar. Puedes cambiar manualmente.",
            variant: "default",
          });
        }
      }
      
      setWalletState({
        isConnected: true,
        address,
        isConnecting: false,
        error: null,
      });

      return address;
    } catch (error: any) {
      const walletError = getErrorFromException(error);
      
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: walletError,
      }));
      
      showErrorToast(walletError);
      throw error;
    }
  }, [toast, getErrorFromException, showErrorToast]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
    });
    
    toast({
      title: "Wallet Desconectada",
      description: "Tu wallet se ha desconectado exitosamente.",
      variant: "default",
    });
  }, [toast]);
  
  const retryConnection = useCallback(async () => {
    if (walletState.error?.type === 'installation_required') {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    
    try {
      await connectWallet();
    } catch (error) {
      console.error('Retry connection failed:', error);
    }
  }, [walletState.error?.type, connectWallet]);
  
  const clearError = useCallback(() => {
    setWalletState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    retryConnection,
    clearError,
    formattedAddress: walletState.address ? ethersService.formatAddress(walletState.address) : null,
  };
}
