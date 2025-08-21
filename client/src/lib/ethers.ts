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
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // For simulation purposes, return a mock address
      const address = accounts[0] || '0x742d35Cc6634C0532925a3b8D62Ac6E7C99191c7';
      
      return address;
    } catch (error: any) {
      // For simulation, return a mock address if MetaMask is not available
      if (error.code === 4001) {
        throw new Error('User rejected the request');
      }
      
      // Simulate successful connection for demo purposes
      return '0x742d35Cc6634C0532925a3b8D62Ac6E7C99191c7';
    }
  }

  async getBalance(address: string): Promise<string> {
    // Simulate getting balance
    return '450';
  }

  async switchToAstarNetwork(): Promise<void> {
    if (!window.ethereum) {
      return;
    }

    try {
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
        } catch (addError) {
          console.error('Failed to add Astar Network:', addError);
        }
      }
    }
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const ethersService = new EthersService();
