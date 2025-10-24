// Celo Network Configuration for VEG21 dApp
// This file defines Celo Alfajores testnet parameters for Milestone 2 blockchain integration

export interface ChainConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  displayName: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
}

// Celo Alfajores Testnet Configuration
export const CELO_ALFAJORES: ChainConfig = {
  chainId: 44787,
  chainIdHex: '0xaef3',
  name: 'celo-alfajores',
  displayName: 'Celo Alfajores Testnet',
  rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  blockExplorer: 'https://alfajores.celoscan.io',
  nativeCurrency: {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18
  },
  isTestnet: true
};

// Celo Mainnet Configuration (for future use)
export const CELO_MAINNET: ChainConfig = {
  chainId: 42220,
  chainIdHex: '0xa4ec',
  name: 'celo',
  displayName: 'Celo Mainnet',
  rpcUrl: 'https://forno.celo.org',
  blockExplorer: 'https://celoscan.io',
  nativeCurrency: {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18
  },
  isTestnet: false
};

// Astar Shibuya Testnet Configuration (existing network from Sprint 9)
export const ASTAR_SHIBUYA: ChainConfig = {
  chainId: 81,
  chainIdHex: '0x51',
  name: 'astar-shibuya',
  displayName: 'Astar Shibuya Testnet',
  rpcUrl: 'https://evm.shibuya.astar.network',
  blockExplorer: 'https://shibuya.subscan.io',
  nativeCurrency: {
    name: 'Shibuya',
    symbol: 'SBY',
    decimals: 18
  },
  isTestnet: true
};

// Network registry
export const SUPPORTED_NETWORKS: Record<string, ChainConfig> = {
  'celo-alfajores': CELO_ALFAJORES,
  'celo': CELO_MAINNET,
  'astar-shibuya': ASTAR_SHIBUYA
};

// Get network configuration by chain ID
export function getNetworkByChainId(chainId: number): ChainConfig | null {
  const networks = Object.values(SUPPORTED_NETWORKS);
  return networks.find(network => network.chainId === chainId) || null;
}

// Get network configuration by name
export function getNetworkByName(name: string): ChainConfig | null {
  return SUPPORTED_NETWORKS[name] || null;
}

// Validate if chain is supported
export function isSupportedChain(chainId: number): boolean {
  return getNetworkByChainId(chainId) !== null;
}

// Get RPC URL for a specific network
export function getRpcUrl(chainId: number): string | null {
  const network = getNetworkByChainId(chainId);
  return network ? network.rpcUrl : null;
}

// Get block explorer URL for a specific network
export function getExplorerUrl(chainId: number): string | null {
  const network = getNetworkByChainId(chainId);
  return network ? network.blockExplorer : null;
}

// Format explorer URL for transaction
export function getTransactionExplorerUrl(chainId: number, txHash: string): string | null {
  const explorerUrl = getExplorerUrl(chainId);
  return explorerUrl ? `${explorerUrl}/tx/${txHash}` : null;
}

// Format explorer URL for address
export function getAddressExplorerUrl(chainId: number, address: string): string | null {
  const explorerUrl = getExplorerUrl(chainId);
  return explorerUrl ? `${explorerUrl}/address/${address}` : null;
}

// Default network based on environment
export function getDefaultNetwork(): ChainConfig {
  const mode = import.meta.env.VITE_VEG21_MODE || 'demo';
  
  switch (mode) {
    case 'celo-testnet':
      return CELO_ALFAJORES;
    case 'astar-testnet':
      return ASTAR_SHIBUYA;
    case 'celo-mainnet':
      return CELO_MAINNET;
    default:
      // In demo mode, return Celo Alfajores as the target network for future migration
      return CELO_ALFAJORES;
  }
}

// Network switching helper (for MetaMask)
export async function switchToNetwork(chainConfig: ChainConfig): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('MetaMask not detected');
    return false;
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainConfig.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // Network doesn't exist in MetaMask, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainConfig.chainIdHex,
              chainName: chainConfig.displayName,
              nativeCurrency: chainConfig.nativeCurrency,
              rpcUrls: [chainConfig.rpcUrl],
              blockExplorerUrls: [chainConfig.blockExplorer],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add network:', addError);
        return false;
      }
    }
    console.error('Failed to switch network:', switchError);
    return false;
  }
}

// Export default network
export const DEFAULT_NETWORK = getDefaultNetwork();
