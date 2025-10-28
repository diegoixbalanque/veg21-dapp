// Smart Contract Configuration for VEG21 dApp
// This file manages contract addresses, network settings, and deployment configuration

import { ContractConfig, ServiceConfig, ServiceMode } from '@/types/contracts';

// Re-export for convenience
export { ServiceMode };

// Helper function to get contract addresses from environment
const getEnvAddress = (key: string, fallback: string = '0x0000000000000000000000000000000000000000'): string => {
  if (typeof window !== 'undefined') {
    return (import.meta.env as any)[`VITE_${key}`] || fallback;
  }
  return process.env[key] || fallback;
};

// Celo Alfajores Testnet Configuration (Sprint 5: Testnet deployment)
export const CELO_ALFAJORES_CONFIG: ContractConfig = {
  addresses: {
    token: getEnvAddress('CELO_ALFAJORES_TOKEN_ADDRESS'),
    staking: getEnvAddress('CELO_ALFAJORES_STAKING_ADDRESS'),
    donations: getEnvAddress('CELO_ALFAJORES_DONATIONS_ADDRESS'),
    rewards: getEnvAddress('CELO_ALFAJORES_REWARDS_ADDRESS'),
  },
  network: {
    chainId: 44787, // Celo Alfajores Testnet
    name: 'Celo Alfajores',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    blockExplorer: 'https://alfajores.celoscan.io'
  },
  deployment: {
    blockNumber: 0, // Updated after deployment
    deployer: '0x0000000000000000000000000000000000000000', // Updated after deployment
    timestamp: 0 // Updated after deployment
  }
};

// Celo Mainnet Configuration (Sprint 5: Production deployment)
export const CELO_MAINNET_CONFIG: ContractConfig = {
  addresses: {
    token: getEnvAddress('CELO_MAINNET_TOKEN_ADDRESS'),
    staking: getEnvAddress('CELO_MAINNET_STAKING_ADDRESS'),
    donations: getEnvAddress('CELO_MAINNET_DONATIONS_ADDRESS'),
    rewards: getEnvAddress('CELO_MAINNET_REWARDS_ADDRESS'),
  },
  network: {
    chainId: 42220, // Celo Mainnet
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    blockExplorer: 'https://celoscan.io'
  },
  deployment: {
    blockNumber: 0, // Updated after deployment
    deployer: '0x0000000000000000000000000000000000000000', // Updated after deployment
    timestamp: 0 // Updated after deployment
  }
};

// Astar Network Configuration (Testnet)
export const ASTAR_TESTNET_CONFIG: ContractConfig = {
  addresses: {
    staking: '0x742d35Cc6634C0532925a3b8D62Ac6E7C99191c7', // VEG21 Staking Contract deployed on Shibuya
    donations: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
    rewards: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
    token: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
  },
  network: {
    chainId: 81, // Astar Network Testnet (Shibuya)
    name: 'Astar Shibuya',
    rpcUrl: 'https://evm.shibuya.astar.network',
    blockExplorer: 'https://shibuya.subscan.io'
  },
  deployment: {
    blockNumber: 7234567, // Simulated deployment block on Shibuya
    deployer: '0x8ba1f109551bD432803012645Hac136c40657324', // Simulated deployer address
    timestamp: 1726863600 // September 20, 2025
  }
};

// Astar Network Configuration (Mainnet) 
export const ASTAR_MAINNET_CONFIG: ContractConfig = {
  addresses: {
    staking: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
    donations: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
    rewards: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
    token: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
  },
  network: {
    chainId: 592, // Astar Network Mainnet
    name: 'Astar Network',
    rpcUrl: 'https://evm.astar.network',
    blockExplorer: 'https://astar.subscan.io'
  },
  deployment: {
    blockNumber: 0, // To be updated with actual deployment block
    deployer: '0x0000000000000000000000000000000000000000', // To be updated with deployer address
    timestamp: 0 // To be updated with deployment timestamp
  }
};

// Development configuration for local testing
export const LOCAL_DEV_CONFIG: ContractConfig = {
  addresses: {
    staking: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Local Hardhat deployment address
    donations: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Local Hardhat deployment address
    rewards: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Local Hardhat deployment address
    token: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // Local Hardhat deployment address
  },
  network: {
    chainId: 31337, // Local Hardhat Network
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost:8545' // No block explorer for local
  },
  deployment: {
    blockNumber: 1,
    deployer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Default Hardhat account
    timestamp: Date.now()
  }
};

// Environment-based configuration mapping
const CONTRACT_CONFIGS: Record<string, ContractConfig> = {
  development: LOCAL_DEV_CONFIG,
  testnet: CELO_ALFAJORES_CONFIG, // Default testnet is now Celo Alfajores
  mainnet: CELO_MAINNET_CONFIG, // Default mainnet is now Celo
  local: LOCAL_DEV_CONFIG,
  'celo-testnet': CELO_ALFAJORES_CONFIG,
  'celo-alfajores': CELO_ALFAJORES_CONFIG,
  'celo-mainnet': CELO_MAINNET_CONFIG,
  'celo': CELO_MAINNET_CONFIG,
  'astar-testnet': ASTAR_TESTNET_CONFIG,
  'astar-shibuya': ASTAR_TESTNET_CONFIG,
  'astar-mainnet': ASTAR_MAINNET_CONFIG
};

// Get environment variables with defaults
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use import.meta.env
    return (import.meta.env as any)[`VITE_${key}`] || defaultValue;
  }
  // Server-side: use process.env
  return process.env[key] || defaultValue;
};

// Service configuration factory
export function createServiceConfig(): ServiceConfig {
  // VEG21_MODE is the primary mode selector (Sprint 4)
  // Possible values: 'demo', 'celo-testnet', 'astar-testnet', 'mainnet'
  const veg21Mode = getEnvVar('VEG21_MODE', 'demo');
  
  // Legacy support for existing environment variables
  const mockMode = getEnvVar('MOCK_MODE', 'true') === 'true';
  const environment = getEnvVar('ENVIRONMENT', 'development');
  const hybridMode = getEnvVar('HYBRID_MODE', 'true') === 'true';
  
  let mode: ServiceMode;
  let contractConfig: ContractConfig;
  
  // VEG21_MODE takes precedence over legacy variables
  switch (veg21Mode.toLowerCase()) {
    case 'demo':
    case 'mock':
      // Demo mode: pure simulation, no blockchain interaction
      mode = ServiceMode.MOCK;
      contractConfig = CELO_ALFAJORES_CONFIG; // Target network for future migration
      break;
      
    case 'celo-testnet':
    case 'celo-alfajores':
      // Celo testnet mode: real blockchain (Sprint 5)
      mode = ServiceMode.CONTRACT;
      contractConfig = CELO_ALFAJORES_CONFIG;
      break;
      
    case 'celo-mainnet':
    case 'celo':
      // Celo mainnet mode: production blockchain (Sprint 5)
      mode = ServiceMode.CONTRACT;
      contractConfig = CELO_MAINNET_CONFIG;
      break;
      
    case 'astar-testnet':
    case 'astar-shibuya':
      // Astar testnet mode: real blockchain (legacy)
      mode = ServiceMode.CONTRACT;
      contractConfig = ASTAR_TESTNET_CONFIG;
      break;
      
    case 'astar-mainnet':
      // Astar mainnet mode: production blockchain (legacy)
      mode = ServiceMode.CONTRACT;
      contractConfig = ASTAR_MAINNET_CONFIG;
      break;
      
    case 'hybrid':
      // Hybrid mode: mix of mock and real (legacy)
      mode = ServiceMode.HYBRID;
      contractConfig = ASTAR_TESTNET_CONFIG;
      break;
      
    case 'mainnet':
      // Mainnet mode: defaults to Celo production blockchain
      mode = ServiceMode.CONTRACT;
      contractConfig = CELO_MAINNET_CONFIG;
      break;
      
    default:
      // Fallback to legacy mode selection
      if (mockMode && !hybridMode) {
        mode = ServiceMode.MOCK;
      } else if (!mockMode && !hybridMode) {
        mode = ServiceMode.CONTRACT;
      } else {
        mode = ServiceMode.HYBRID;
      }
      contractConfig = CONTRACT_CONFIGS[environment] || LOCAL_DEV_CONFIG;
  }
  
  return {
    mode,
    mockConfig: {
      // Mock-specific configuration
      enablePersistence: true,
      simulateNetworkDelay: true,
      defaultBalance: {
        veg21: 1000,
        astr: 0.5
      }
    },
    contractConfig,
    hybridConfig: {
      // Sprint 9: Only staking module uses real contracts
      useRealStaking: true,
      useRealDonations: false,
      useRealRewards: false,
      useRealToken: false
    }
  };
}

// Get current contract configuration
export function getContractConfig(environment?: string): ContractConfig {
  const env = environment || getEnvVar('ENVIRONMENT', 'development');
  return CONTRACT_CONFIGS[env] || LOCAL_DEV_CONFIG;
}

// Get network configuration by chain ID
export function getNetworkByChainId(chainId: number): ContractConfig | null {
  const configs = Object.values(CONTRACT_CONFIGS);
  return configs.find(config => config.network.chainId === chainId) || null;
}

// Validate contract addresses
export function validateContractAddresses(config: ContractConfig): boolean {
  const { addresses } = config;
  const nullAddress = '0x0000000000000000000000000000000000000000';
  
  // Check if any addresses are still placeholder null addresses
  const hasNullAddresses = Object.values(addresses).some(address => address === nullAddress);
  
  if (hasNullAddresses) {
    console.warn('Contract configuration contains placeholder addresses. Please update with actual deployed contract addresses.');
    return false;
  }
  
  // Validate address format (basic check)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  const validAddresses = Object.values(addresses).every(address => addressRegex.test(address));
  
  if (!validAddresses) {
    console.error('Invalid contract address format detected');
    return false;
  }
  
  return true;
}

// Update contract addresses (for runtime configuration)
export function updateContractAddresses(
  environment: string,
  addresses: Partial<ContractConfig['addresses']>
): void {
  const config = CONTRACT_CONFIGS[environment];
  if (config) {
    config.addresses = { ...config.addresses, ...addresses };
    console.log(`Updated contract addresses for ${environment}:`, addresses);
  }
}

// Contract deployment utilities
export const DEPLOYMENT_UTILS = {
  // Generate deployment script template
  generateDeploymentScript: (network: string) => {
    const config = getContractConfig(network);
    return `
// VEG21 Contract Deployment Script for ${config.network.name}
// Network: ${config.network.name} (Chain ID: ${config.network.chainId})
// RPC URL: ${config.network.rpcUrl}

async function deployVEG21Contracts() {
  // 1. Deploy VEG21 Token Contract
  const tokenContract = await deployContract('VEG21Token', [
    'VEG21 Token',
    'VEG21',
    ethers.utils.parseEther('1000000') // 1M total supply
  ]);
  
  // 2. Deploy Staking Contract
  const stakingContract = await deployContract('VEG21Staking', [
    tokenContract.address
  ]);
  
  // 3. Deploy Donations Contract
  const donationsContract = await deployContract('VEG21Donations', [
    tokenContract.address
  ]);
  
  // 4. Deploy Rewards Contract
  const rewardsContract = await deployContract('VEG21Rewards', [
    tokenContract.address
  ]);
  
  console.log('Deployment Summary:');
  console.log('Token:', tokenContract.address);
  console.log('Staking:', stakingContract.address);
  console.log('Donations:', donationsContract.address);
  console.log('Rewards:', rewardsContract.address);
}
`;
  },
  
  // Verification script template
  generateVerificationScript: (network: string) => {
    const config = getContractConfig(network);
    return `
// Contract Verification Script for ${config.network.name}
// Update the addresses below with your deployed contract addresses

const contractAddresses = {
  token: '${config.addresses.token}',
  staking: '${config.addresses.staking}',
  donations: '${config.addresses.donations}',
  rewards: '${config.addresses.rewards}'
};

// Run verification commands
npx hardhat verify --network ${network} \${contractAddresses.token} "VEG21 Token" "VEG21" "1000000000000000000000000"
npx hardhat verify --network ${network} \${contractAddresses.staking} \${contractAddresses.token}
npx hardhat verify --network ${network} \${contractAddresses.donations} \${contractAddresses.token}  
npx hardhat verify --network ${network} \${contractAddresses.rewards} \${contractAddresses.token}
`;
  }
};

// Export the current service configuration
export const SERVICE_CONFIG = createServiceConfig();

// Type exports for external use
export type { ContractConfig, ServiceConfig };