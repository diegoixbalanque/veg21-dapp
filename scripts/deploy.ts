import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * VEG21 Contract Deployment Script
 * 
 * Deploys all VEG21 contracts to the selected network:
 * 1. VEG21Token (ERC20)
 * 2. VEG21Staking
 * 3. VEG21Donations  
 * 4. VEG21Rewards
 * 
 * Usage:
 * - Alfajores: npx hardhat run scripts/deploy.ts --network celo-alfajores
 * - Mainnet: npx hardhat run scripts/deploy.ts --network celo-mainnet
 * - Local: npx hardhat run scripts/deploy.ts --network hardhat
 */

interface DeploymentResult {
  network: string;
  chainId: number;
  deployer: string;
  timestamp: string;
  contracts: {
    VEG21Token: string;
    VEG21Staking: string;
    VEG21Donations: string;
    VEG21Rewards: string;
  };
  transactionHashes: {
    VEG21Token: string;
    VEG21Staking: string;
    VEG21Donations: string;
    VEG21Rewards: string;
  };
}

async function main() {
  console.log("\n🌱 Starting VEG21 Contract Deployment...\n");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 Deployment Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ${network.chainId === 42220n || network.chainId === 44787n ? 'CELO' : 'ETH'}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  if (balance === 0n) {
    console.error("❌ Error: Deployer account has no balance!");
    console.log("Get testnet CELO from: https://faucet.celo.org\n");
    process.exit(1);
  }
  
  const deploymentResult: DeploymentResult = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    contracts: {
      VEG21Token: "",
      VEG21Staking: "",
      VEG21Donations: "",
      VEG21Rewards: ""
    },
    transactionHashes: {
      VEG21Token: "",
      VEG21Staking: "",
      VEG21Donations: "",
      VEG21Rewards: ""
    }
  };
  
  try {
    // ===== Step 1: Deploy VEG21Token =====
    console.log("1️⃣  Deploying VEG21Token...");
    
    const initialSupply = 1_000_000; // 1 million VEG21 tokens
    const VEG21Token = await ethers.getContractFactory("VEG21Token");
    const token = await VEG21Token.deploy(initialSupply, deployerAddress);
    await token.waitForDeployment();
    
    const tokenAddress = await token.getAddress();
    const tokenDeployTx = token.deploymentTransaction();
    
    deploymentResult.contracts.VEG21Token = tokenAddress;
    deploymentResult.transactionHashes.VEG21Token = tokenDeployTx?.hash || "";
    
    console.log(`✅ VEG21Token deployed to: ${tokenAddress}`);
    console.log(`   Transaction: ${tokenDeployTx?.hash}\n`);
    
    // ===== Step 2: Deploy VEG21Staking =====
    console.log("2️⃣  Deploying VEG21Staking...");
    
    const VEG21Staking = await ethers.getContractFactory("VEG21Staking");
    const staking = await VEG21Staking.deploy(tokenAddress, deployerAddress);
    await staking.waitForDeployment();
    
    const stakingAddress = await staking.getAddress();
    const stakingDeployTx = staking.deploymentTransaction();
    
    deploymentResult.contracts.VEG21Staking = stakingAddress;
    deploymentResult.transactionHashes.VEG21Staking = stakingDeployTx?.hash || "";
    
    console.log(`✅ VEG21Staking deployed to: ${stakingAddress}`);
    console.log(`   Transaction: ${stakingDeployTx?.hash}\n`);
    
    // ===== Step 3: Deploy VEG21Donations =====
    console.log("3️⃣  Deploying VEG21Donations...");
    
    const VEG21Donations = await ethers.getContractFactory("VEG21Donations");
    const donations = await VEG21Donations.deploy(tokenAddress, deployerAddress);
    await donations.waitForDeployment();
    
    const donationsAddress = await donations.getAddress();
    const donationsDeployTx = donations.deploymentTransaction();
    
    deploymentResult.contracts.VEG21Donations = donationsAddress;
    deploymentResult.transactionHashes.VEG21Donations = donationsDeployTx?.hash || "";
    
    console.log(`✅ VEG21Donations deployed to: ${donationsAddress}`);
    console.log(`   Transaction: ${donationsDeployTx?.hash}\n`);
    
    // ===== Step 4: Deploy VEG21Rewards =====
    console.log("4️⃣  Deploying VEG21Rewards...");
    
    const VEG21Rewards = await ethers.getContractFactory("VEG21Rewards");
    const rewards = await VEG21Rewards.deploy(tokenAddress, deployerAddress);
    await rewards.waitForDeployment();
    
    const rewardsAddress = await rewards.getAddress();
    const rewardsDeployTx = rewards.deploymentTransaction();
    
    deploymentResult.contracts.VEG21Rewards = rewardsAddress;
    deploymentResult.transactionHashes.VEG21Rewards = rewardsDeployTx?.hash || "";
    
    console.log(`✅ VEG21Rewards deployed to: ${rewardsAddress}`);
    console.log(`   Transaction: ${rewardsDeployTx?.hash}\n`);
    
    // ===== Step 5: Set up permissions =====
    console.log("5️⃣  Configuring contract permissions...");
    
    console.log("   Adding VEG21Staking as minter...");
    let tx = await token.addMinter(stakingAddress);
    await tx.wait();
    console.log(`   ✅ Transaction: ${tx.hash}`);
    
    console.log("   Adding VEG21Rewards as minter...");
    tx = await token.addMinter(rewardsAddress);
    await tx.wait();
    console.log(`   ✅ Transaction: ${tx.hash}\n`);
    
    // ===== Step 6: Register initial charities =====
    console.log("6️⃣  Registering initial charities...");
    
    const charities = [
      {
        name: "The Vegan Society",
        description: "Promoting veganism worldwide since 1944",
        wallet: "0x1234567890123456789012345678901234567890"
      },
      {
        name: "Animal Equality",
        description: "Working to end animal exploitation",
        wallet: "0x2345678901234567890123456789012345678901"
      },
      {
        name: "Good Food Institute",
        description: "Advancing alternative protein innovation",
        wallet: "0x3456789012345678901234567890123456789012"
      }
    ];
    
    for (const charity of charities) {
      tx = await donations.registerCharity(charity.name, charity.description, charity.wallet);
      await tx.wait();
      console.log(`   ✅ Registered: ${charity.name}`);
    }
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Deployment Complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("📝 Contract Addresses:");
    console.log(`VEG21Token:     ${tokenAddress}`);
    console.log(`VEG21Staking:   ${stakingAddress}`);
    console.log(`VEG21Donations: ${donationsAddress}`);
    console.log(`VEG21Rewards:   ${rewardsAddress}\n`);
    
    // ===== Step 7: Save deployment info =====
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const networkName = network.name === "unknown" ? "hardhat" : network.name;
    const deploymentFile = path.join(deploymentsDir, `${networkName}-${network.chainId}.json`);
    
    fs.writeFileSync(
      deploymentFile,
      JSON.stringify(deploymentResult, null, 2)
    );
    
    console.log(`💾 Deployment info saved to: ${deploymentFile}\n`);
    
    // ===== Step 8: Generate .env file content =====
    const envPrefix = network.chainId === 44787n ? "ALFAJORES" : 
                       network.chainId === 42220n ? "MAINNET" : 
                       "LOCAL";
    
    console.log("📋 Add these to your .env file:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`VITE_CELO_${envPrefix}_TOKEN_ADDRESS=${tokenAddress}`);
    console.log(`VITE_CELO_${envPrefix}_STAKING_ADDRESS=${stakingAddress}`);
    console.log(`VITE_CELO_${envPrefix}_DONATIONS_ADDRESS=${donationsAddress}`);
    console.log(`VITE_CELO_${envPrefix}_REWARDS_ADDRESS=${rewardsAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // ===== Step 9: Verification instructions =====
    if (network.chainId === 44787n || network.chainId === 42220n) {
      console.log("🔍 Contract Verification Commands:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`npx hardhat verify --network ${network.name} ${tokenAddress} "${initialSupply}" "${deployerAddress}"`);
      console.log(`npx hardhat verify --network ${network.name} ${stakingAddress} "${tokenAddress}" "${deployerAddress}"`);
      console.log(`npx hardhat verify --network ${network.name} ${donationsAddress} "${tokenAddress}" "${deployerAddress}"`);
      console.log(`npx hardhat verify --network ${network.name} ${rewardsAddress} "${tokenAddress}" "${deployerAddress}"`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      
      const explorerUrl = network.chainId === 44787n ? 
        "https://alfajores.celoscan.io" : 
        "https://celoscan.io";
      
      console.log("🔗 View on CeloScan:");
      console.log(`${explorerUrl}/address/${tokenAddress}`);
      console.log(`${explorerUrl}/address/${stakingAddress}`);
      console.log(`${explorerUrl}/address/${donationsAddress}`);
      console.log(`${explorerUrl}/address/${rewardsAddress}\n`);
    }
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
