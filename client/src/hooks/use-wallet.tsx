import { useState, useCallback, useEffect } from 'react';
import { ethersService } from '@/lib/ethers';
import { useToast } from '@/hooks/use-toast';
import { useMockWeb3 } from '@/hooks/use-mock-web3';
import { getDefaultNetwork } from '@/config/chainConfig';

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
  const mockWeb3 = useMockWeb3();
  
  // Check if demo mode is active
  const isDemoMode = useCallback((): boolean => {
    try {
      return localStorage.getItem('veg21_demo') === 'true';
    } catch {
      return false;
    }
  }, []);

  // Initialize wallet state from localStorage
  const initializeWalletState = useCallback((): WalletState => {
    try {
      // Check for demo mode first
      if (isDemoMode()) {
        console.log('Initializing demo wallet mode');
        return {
          isConnected: true,
          address: '0xDEMO1234567890abcdef1234567890abcdef1234',
          isConnecting: false,
          error: null,
        };
      }
      
      const storedWallet = localStorage.getItem('veg21_wallet');
      if (storedWallet) {
        const walletData = JSON.parse(storedWallet);
        if (walletData.address) {
          console.log('Initializing wallet from localStorage:', walletData.address);
          return {
            isConnected: true,
            address: walletData.address,
            isConnecting: false,
            error: null,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to parse wallet data from localStorage:', error);
    }
    
    return {
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
    };
  }, [isDemoMode]);

  const [walletState, setWalletState] = useState<WalletState>(initializeWalletState);

  // Listen for localStorage changes to keep wallet state in sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'veg21_wallet' || e.key === 'veg21_demo') {
        const newState = initializeWalletState();
        console.log('Wallet localStorage changed, updating state:', newState);
        setWalletState(newState);
        
        // Initialize mock Web3 if wallet is connected
        if (newState.isConnected && newState.address) {
          mockWeb3.initialize(newState.address).catch(error => {
            console.warn('Failed to initialize mock Web3 from storage change:', error);
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initializeWalletState, mockWeb3]);

  // Initialize mock Web3 if wallet is already connected on mount
  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      console.log('Initializing mock Web3 for connected wallet:', walletState.address);
      mockWeb3.initialize(walletState.address).catch(error => {
        console.warn('Failed to initialize mock Web3 on mount:', error);
      });
    }
  }, []);

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
      let address: string;
      
      // Check if we're in mock mode
      const serviceMode = mockWeb3.getServiceMode();
      if (serviceMode === 'mock') {
        // Use mock wallet connection
        console.log('Using mock wallet connection in mock mode');
        address = '0x742d35Cc6634C0532925a3b8D62Ac6E7C99191c7'; // Mock address
      } else {
        // Use real wallet connection
        console.log('Using real wallet connection in contract mode');
        address = await ethersService.connectWallet();
      }
      
      // Show success message for wallet connection
      toast({
        title: "Wallet Conectada",
        description: "Tu wallet se ha conectado exitosamente.",
        variant: "default",
      });
      
      // Only switch network if we're not in mock mode
      if (serviceMode !== 'mock') {
        try {
          const network = getDefaultNetwork();
          await ethersService.switchToConfiguredNetwork();
          
          // Show success message for network switch
          toast({
            title: `Red ${network.displayName} Conectada`,
            description: `Cambiaste exitosamente a la red ${network.displayName}.`,
            variant: "default",
          });
        } catch (networkError: any) {
          // Handle network switch errors gracefully
          const error = getErrorFromException(networkError);
          console.warn('Network switch failed:', error);
          
          const network = getDefaultNetwork();
          
          // Don't fail wallet connection if network switch fails
          if (error.type === 'switch_network_failed') {
            toast({
              title: "Advertencia de Red",
              description: `Wallet conectada, pero no se pudo cambiar a la red ${network.displayName}. Puedes cambiar manualmente.`,
              variant: "default",
            });
          }
        }
      } else {
        // In mock mode, show mock network message
        const network = getDefaultNetwork();
        toast({
          title: "Red Simulada Conectada",
          description: `Conectado a ${network.displayName} (modo demo).`,
          variant: "default",
        });
      }
      
      const newWalletState = {
        isConnected: true,
        address,
        isConnecting: false,
        error: null,
      };
      
      setWalletState(newWalletState);
      
      // Save wallet state to localStorage
      try {
        const network = getDefaultNetwork();
        localStorage.setItem('veg21_wallet', JSON.stringify({
          address,
          connected: true,
          network: serviceMode === 'mock' ? network.name + '-mock' : network.name
        }));
        console.log('Wallet state saved to localStorage:', address, `(${serviceMode} mode on ${network.name})`);
      } catch (error) {
        console.warn('Failed to save wallet to localStorage:', error);
      }
      
      // Initialize mock Web3 service for the connected wallet
      try {
        await mockWeb3.initialize(address);
      } catch (mockWeb3Error) {
        console.warn('Failed to initialize mock Web3:', mockWeb3Error);
        // Don't fail wallet connection if mock Web3 fails
      }

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

  const connectDemo = useCallback(async () => {
    console.log('Connecting demo wallet');
    
    const demoAddress = '0xDEMO1234567890abcdef1234567890abcdef1234';
    
    setWalletState({
      isConnected: true,
      address: demoAddress,
      isConnecting: false,
      error: null,
    });
    
    // Save demo mode to localStorage
    try {
      localStorage.setItem('veg21_demo', 'true');
      localStorage.setItem('veg21_wallet', JSON.stringify({
        address: demoAddress,
        connected: true,
        network: 'demo'
      }));
      console.log('Demo wallet saved to localStorage');
    } catch (error) {
      console.warn('Failed to save demo wallet to localStorage:', error);
    }
    
    // Initialize mock Web3 service for demo wallet
    try {
      await mockWeb3.initialize(demoAddress);
    } catch (mockWeb3Error) {
      console.warn('Failed to initialize mock Web3 for demo:', mockWeb3Error);
    }
    
    toast({
      title: "Wallet Demo Conectada",
      description: "Estás usando una wallet de demostración. ¡Explora todas las funciones!",
      variant: "default",
    });
  }, [toast, mockWeb3]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
    });
    
    // Clear wallet and demo mode from localStorage
    try {
      localStorage.removeItem('veg21_wallet');
      localStorage.removeItem('veg21_demo');
      console.log('Wallet and demo mode removed from localStorage');
    } catch (error) {
      console.warn('Failed to remove wallet from localStorage:', error);
    }
    
    // Remove event listeners
    ethersService.removeAllListeners();
    
    toast({
      title: "Wallet Desconectada",
      description: "Tu wallet se ha desconectado exitosamente.",
      variant: "default",
    });
  }, [toast]);
  
  // Listen for account changes (wallet disconnect or account switch)
  useEffect(() => {
    if (!walletState.isConnected || isDemoMode()) {
      return;
    }
    
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      
      if (accounts.length === 0) {
        // User disconnected wallet
        console.log('User disconnected wallet');
        disconnectWallet();
      } else if (accounts[0] !== walletState.address) {
        // User switched accounts
        console.log('User switched accounts to:', accounts[0]);
        setWalletState(prev => ({ ...prev, address: accounts[0] }));
        
        // Update localStorage
        try {
          const network = getDefaultNetwork();
          localStorage.setItem('veg21_wallet', JSON.stringify({
            address: accounts[0],
            connected: true,
            network: network.name
          }));
        } catch (error) {
          console.warn('Failed to update wallet in localStorage:', error);
        }
        
        // Re-initialize mock Web3 with new address
        mockWeb3.initialize(accounts[0]).catch(error => {
          console.warn('Failed to re-initialize mock Web3:', error);
        });
        
        toast({
          title: "Cuenta Cambiada",
          description: `Cambiaste a una nueva cuenta: ${ethersService.formatAddress(accounts[0])}`,
          variant: "default",
        });
      }
    };
    
    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed to:', chainId);
      const chainIdDec = parseInt(chainId, 16);
      const network = getDefaultNetwork();
      
      if (chainIdDec !== network.chainId) {
        toast({
          title: "Red Cambiada",
          description: `La red cambió. Por favor, cambia de vuelta a ${network.displayName} para usar VEG21.`,
          variant: "destructive",
        });
      }
    };
    
    // Add event listeners
    ethersService.onAccountsChanged(handleAccountsChanged);
    ethersService.onChainChanged(handleChainChanged);
    
    // Cleanup on unmount
    return () => {
      ethersService.removeAllListeners();
    };
  }, [walletState.isConnected, walletState.address, isDemoMode, disconnectWallet, toast, mockWeb3]);
  
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
    connectDemo,
    disconnectWallet,
    retryConnection,
    clearError,
    isDemoMode: isDemoMode(),
    formattedAddress: walletState.address ? ethersService.formatAddress(walletState.address) : null,
    // Expose mock Web3 functionality
    mockWeb3,
  };
}
