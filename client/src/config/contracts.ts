// Smart Contract Configuration for VEG21 dApp
// This file manages contract addresses, network settings, and deployment configuration

import { ContractConfig, ServiceConfig, ServiceMode } from '@/types/contracts';

// Astar Network Configuration (Testnet)
export const ASTAR_TESTNET_CONFIG: ContractConfig = {
  addresses: {
    staking: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
    donations: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
    rewards: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
    token: '0x0000000000000000000000000000000000000000', // Placeholder - to be updated with actual deployment
  },
  network: {
    chainId: 81, // Astar Network Testnet (Shibuya)
    name: 'Astar Testnet',
    rpcUrl: 'https://evm.shibuya.astar.network',
    blockExplorer: 'https://shibuya.subscan.io'
  },
  deployment: {
    blockNumber: 0, // To be updated with actual deployment block
    deployer: '0x0000000000000000000000000000000000000000', // To be updated with deployer address
    timestamp: 0 // To be updated with deployment timestamp
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
  testnet: ASTAR_TESTNET_CONFIG,
  mainnet: ASTAR_MAINNET_CONFIG,
  local: LOCAL_DEV_CONFIG
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
  const mockMode = getEnvVar('MOCK_MODE', 'true') === 'true';
  const environment = getEnvVar('ENVIRONMENT', 'development');
  
  return {
    mode: mockMode ? ServiceMode.MOCK : ServiceMode.CONTRACT,
    mockConfig: {
      // Mock-specific configuration
      enablePersistence: true,
      simulateNetworkDelay: true,
      defaultBalance: {
        veg21: 1000,
        astr: 0.5
      }
    },
    contractConfig: CONTRACT_CONFIGS[environment] || LOCAL_DEV_CONFIG
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
export { ServiceMode };