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
        return accounts[0];
      }

      // Request account access
      const requestedAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (requestedAccounts.length === 0) {
        throw new Error('No accounts found');
      }

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

  async switchToAstarNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed!');
    }

    try {
      // First check current network
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      });
      
      // If already on Astar network, no need to switch
      if (currentChainId === '0x250') {
        return;
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x250' }], // Astar Network
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
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
  
  isAstarNetwork(chainId: string): boolean {
    return chainId === '0x250';
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const ethersService = new EthersService();
