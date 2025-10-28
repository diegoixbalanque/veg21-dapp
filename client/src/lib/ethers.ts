import { getDefaultNetwork, switchToNetwork, type ChainConfig } from '@/config/chainConfig';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class EthersService {
  private provider: any;
  private signer: any;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed!');
    }

    try {
      // Check if MetaMask is unlocked
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      
      // If already connected, return the existing account
      if (accounts.length > 0) {
        console.log('Wallet already connected:', accounts[0]);
        return accounts[0];
      }

      // Request account access
      const requestedAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (requestedAccounts.length === 0) {
        throw new Error('No accounts found');
      }

      console.log('Wallet connected successfully:', requestedAccounts[0]);
      return requestedAccounts[0];
    } catch (error: any) {
      // Handle specific MetaMask error codes
      if (error.code === 4001) {
        throw error; // User rejected the request
      }
      
      if (error.code === -32002) {
        throw new Error('MetaMask is already processing a request. Please check MetaMask.');
      }
      
      // For simulation purposes in development, return a mock address
      if (import.meta.env.DEV && !window.ethereum) {
        console.warn('Development mode: Simulating wallet connection');
        return '0x742d35Cc6634C0532925a3b8D62Ac6E7C99191c7';
      }
      
      throw error;
    }
  }

  async getBalance(address: string): Promise<string> {
    // Simulate getting balance
    return '450';
  }

  /**
   * Switch to the configured VEG21 network based on VEG21_MODE
   * Supports Celo (Alfajores, Mainnet) and legacy Astar networks
   */
  async switchToConfiguredNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed!');
    }

    const network = getDefaultNetwork();
    console.log('Switching to configured network:', network.displayName, `(${network.chainId})`);

    try {
      // Check current network
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      });
      
      const currentChainIdDec = parseInt(currentChainId, 16);
      
      // Already on correct network
      if (currentChainIdDec === network.chainId) {
        console.log('Already on correct network');
        return;
      }

      // Use the switchToNetwork helper from chainConfig
      const success = await switchToNetwork(network);
      
      if (!success) {
        throw new Error(`Failed to switch to ${network.displayName}`);
      }
      
      console.log(`Successfully switched to ${network.displayName}`);
    } catch (error: any) {
      console.error('Network switch error:', error);
      
      // Re-throw with more context
      if (error.code === 4001) {
        throw new Error('User rejected network switch request');
      }
      
      throw error;
    }
  }

  /**
   * Legacy method for Astar network switching (backward compatibility)
   */
  async switchToAstarNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed!');
    }

    try {
      // First check current network
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      });
      
      // Check for both mainnet (0x250) and testnet (0x51) Astar networks
      if (currentChainId === '0x250' || currentChainId === '0x51') {
        return;
      }

      // For development, prefer Shibuya testnet
      const isDevelopment = import.meta.env.DEV;
      const targetChainId = isDevelopment ? '0x51' : '0x250'; // Shibuya testnet for dev, mainnet for prod

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const isDevelopment = import.meta.env.DEV;
          
          if (isDevelopment) {
            // Add Shibuya testnet
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x51',
                  chainName: 'Astar Shibuya Testnet',
                  nativeCurrency: {
                    name: 'Shibuya',
                    symbol: 'SBY',
                    decimals: 18,
                  },
                  rpcUrls: ['https://evm.shibuya.astar.network'],
                  blockExplorerUrls: ['https://shibuya.subscan.io'],
                },
              ],
            });
          } else {
            // Add Astar mainnet
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x250',
                  chainName: 'Astar Network',
                  nativeCurrency: {
                    name: 'ASTR',
                    symbol: 'ASTR',
                    decimals: 18,
                  },
                  rpcUrls: ['https://evm.astar.network'],
                  blockExplorerUrls: ['https://astar.subscan.io'],
                },
              ],
            });
          }
        } catch (addError: any) {
          console.error('Failed to add Astar Network:', addError);
          throw new Error(`Failed to add Astar Network: ${addError.message}`);
        }
      } else if (switchError.code === 4001) {
        throw new Error('User rejected network switch request');
      } else {
        throw switchError;
      }
    }
  }
  
  async getCurrentNetwork(): Promise<string> {
    if (!window.ethereum) {
      return 'unknown';
    }
    
    try {
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });
      return chainId;
    } catch (error) {
      console.error('Failed to get current network:', error);
      return 'unknown';
    }
  }
  
  async getCurrentChainId(): Promise<number | null> {
    if (!window.ethereum) {
      return null;
    }
    
    try {
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });
      return parseInt(chainId, 16);
    } catch (error) {
      console.error('Failed to get current chain ID:', error);
      return null;
    }
  }
  
  isAstarNetwork(chainId: string): boolean {
    return chainId === '0x250' || chainId === '0x51'; // Mainnet or Shibuya testnet
  }
  
  isCeloNetwork(chainId: string): boolean {
    return chainId === '0xa4ec' || chainId === '0xaef3'; // Celo Mainnet (42220) or Alfajores (44787)
  }
  
  /**
   * Listen for account changes (wallet disconnect or account switch)
   */
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (!window.ethereum) return;
    
    window.ethereum.on('accountsChanged', callback);
  }
  
  /**
   * Listen for network/chain changes
   */
  onChainChanged(callback: (chainId: string) => void): void {
    if (!window.ethereum) return;
    
    window.ethereum.on('chainChanged', callback);
  }
  
  /**
   * Remove event listeners
   */
  removeAllListeners(): void {
    if (!window.ethereum) return;
    
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const ethersService = new EthersService();
