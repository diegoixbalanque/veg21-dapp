// Deployment script for VEG21 Staking Contract on Astar Shibuya Testnet
// This script would be used with Hardhat or similar deployment framework

const hre = require("hardhat");

async function main() {
  console.log("Deploying VEG21 Staking Contract to Shibuya testnet...");
  
  // Get the contract factory
  const VEG21Staking = await hre.ethers.getContractFactory("VEG21Staking");
  
  // Deploy the contract
  const stakingContract = await VEG21Staking.deploy();
  
  // Wait for deployment
  await stakingContract.deployed();
  
  console.log("VEG21 Staking Contract deployed to:", stakingContract.address);
  console.log("Transaction hash:", stakingContract.deployTransaction.hash);
  
  // Wait for a few confirmations
  console.log("Waiting for block confirmations...");
  await stakingContract.deployTransaction.wait(5);
  
  console.log("Contract verified and ready to use!");
  
  // Log contract info
  console.log("\nContract deployment details:");
  console.log("- Network: Astar Shibuya Testnet");
  console.log("- Contract Address:", stakingContract.address);
  console.log("- Gas Used:", stakingContract.deployTransaction.gasLimit.toString());
  console.log("- Gas Price:", stakingContract.deployTransaction.gasPrice.toString());
  
  return {
    address: stakingContract.address,
    contract: stakingContract
  };
}

// Shibuya Testnet Configuration
const SHIBUYA_CONFIG = {
  name: "Astar Shibuya Testnet",
  chainId: 81,
  rpcUrl: "https://evm.shibuya.astar.network",
  blockExplorer: "https://shibuya.subscan.io",
  currency: {
    name: "Shibuya",
    symbol: "SBY", 
    decimals: 18
  }
};

// Example usage with Hardhat
async function deployWithHardhat() {
  try {
    const result = await main();
    
    console.log("\n✅ Deployment successful!");
    console.log("📝 Save this contract address for frontend integration:");
    console.log(`   SHIBUYA_STAKING_ADDRESS = "${result.address}"`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

module.exports = { 
  main, 
  deployWithHardhat,
  SHIBUYA_CONFIG 
};