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
 * - Dry-run (simulate): npx hardhat run scripts/deploy.ts --network celo-mainnet
 * - Execute (real):     npx hardhat run scripts/deploy.ts --network celo-mainnet --execute
 * - Alfajores:          npx hardhat run scripts/deploy.ts --network celo-alfajores --execute
 * - Local:              npx hardhat run scripts/deploy.ts --network hardhat --execute
 * 
 * Safety: By default, runs in DRY-RUN mode (no transactions broadcast)
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
  dryRun: boolean;
}

async function main() {
  // Check for --execute flag
  const args = process.argv.slice(2);
  const executeFlag = args.includes('--execute');
  const isDryRun = !executeFlag;
  
  console.log("\n🌱 Starting VEG21 Contract Deployment...\n");
  
  if (isDryRun) {
    console.log("⚠️  DRY-RUN MODE ⚠️");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("This is a SIMULATION. No transactions will be broadcast.");
    console.log("To execute real deployment, add --execute flag:");
    console.log("  npx hardhat run scripts/deploy.ts --network <network> --execute");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } else {
    console.log("🚀 EXECUTE MODE - REAL DEPLOYMENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  WARNING: This will deploy contracts to blockchain!");
    console.log("⚠️  Real gas fees will be charged!");
    console.log("⚠️  Contracts are IMMUTABLE once deployed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }
  
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
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (simulation)' : 'EXECUTE (real deployment)'}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  if (balance === 0n) {
    console.error("❌ Error: Deployer account has no balance!");
    if (network.chainId === 44787n) {
      console.log("Get testnet CELO from: https://faucet.celo.org\n");
    } else if (network.chainId === 42220n) {
      console.log("⚠️  MAINNET: Fund your wallet with real CELO!\n");
    }
    process.exit(1);
  }
  
  // Mainnet safety check
  if (!isDryRun && network.chainId === 42220n) {
    console.log("🛑 MAINNET DEPLOYMENT SAFETY CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("You are about to deploy to CELO MAINNET.");
    console.log("This action:");
    console.log("  ✓ Costs real money (gas fees ~2-5 CELO)");
    console.log("  ✓ Creates immutable contracts");
    console.log("  ✓ Cannot be reversed or undone");
    console.log("");
    console.log("Before proceeding, confirm:");
    console.log("  [ ] All contracts tested on Alfajores testnet");
    console.log("  [ ] All contracts verified on testnet CeloScan");
    console.log("  [ ] Manual testing completed successfully");
    console.log("  [ ] Team approval obtained");
    console.log("  [ ] DEPLOYMENT_CHECKLIST.md reviewed");
    console.log("");
    console.log("Continuing in 10 seconds... Press Ctrl+C to abort.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    await new Promise(resolve => setTimeout(resolve, 10000));
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
    },
    dryRun: isDryRun
  };
  
  try {
    if (isDryRun) {
      console.log("📊 Simulating deployment...\n");
    }
    
    // ===== Step 1: Deploy VEG21Token =====
    console.log("1️⃣  Deploying VEG21Token...");
    
    const initialSupply = 1_000_000; // 1 million VEG21 tokens
    const VEG21Token = await ethers.getContractFactory("VEG21Token");
    
    if (isDryRun) {
      // Estimate gas for deployment
      const deployTx = await VEG21Token.getDeployTransaction(initialSupply, deployerAddress);
      const gasEstimate = await ethers.provider.estimateGas(deployTx);
      const gasPrice = (await ethers.provider.getFeeData()).gasPrice || 0n;
      const estimatedCost = gasEstimate * gasPrice;
      
      console.log(`   📊 Gas estimate: ${gasEstimate.toString()}`);
      console.log(`   💰 Estimated cost: ${ethers.formatEther(estimatedCost)} CELO`);
      console.log(`   ✅ VEG21Token deployment simulated (address would be generated)\n`);
      
      deploymentResult.contracts.VEG21Token = "0x0000000000000000000000000000000000000000";
    } else {
      const token = await VEG21Token.deploy(initialSupply, deployerAddress);
      await token.waitForDeployment();
      
      const tokenAddress = await token.getAddress();
      const tokenDeployTx = token.deploymentTransaction();
      
      deploymentResult.contracts.VEG21Token = tokenAddress;
      deploymentResult.transactionHashes.VEG21Token = tokenDeployTx?.hash || "";
      
      console.log(`   ✅ VEG21Token deployed to: ${tokenAddress}`);
      console.log(`   📝 Transaction: ${tokenDeployTx?.hash}\n`);
    }
    
    // ===== Step 2: Deploy VEG21Staking =====
    console.log("2️⃣  Deploying VEG21Staking...");
    
    const VEG21Staking = await ethers.getContractFactory("VEG21Staking");
    const tokenAddress = deploymentResult.contracts.VEG21Token;
    
    if (isDryRun) {
      const deployTx = await VEG21Staking.getDeployTransaction(tokenAddress, deployerAddress);
      const gasEstimate = await ethers.provider.estimateGas(deployTx);
      const gasPrice = (await ethers.provider.getFeeData()).gasPrice || 0n;
      const estimatedCost = gasEstimate * gasPrice;
      
      console.log(`   📊 Gas estimate: ${gasEstimate.toString()}`);
      console.log(`   💰 Estimated cost: ${ethers.formatEther(estimatedCost)} CELO`);
      console.log(`   ✅ VEG21Staking deployment simulated\n`);
      
      deploymentResult.contracts.VEG21Staking = "0x0000000000000000000000000000000000000001";
    } else {
      const staking = await VEG21Staking.deploy(tokenAddress, deployerAddress);
      await staking.waitForDeployment();
      
      const stakingAddress = await staking.getAddress();
      const stakingDeployTx = staking.deploymentTransaction();
      
      deploymentResult.contracts.VEG21Staking = stakingAddress;
      deploymentResult.transactionHashes.VEG21Staking = stakingDeployTx?.hash || "";
      
      console.log(`   ✅ VEG21Staking deployed to: ${stakingAddress}`);
      console.log(`   📝 Transaction: ${stakingDeployTx?.hash}\n`);
    }
    
    // ===== Step 3: Deploy VEG21Donations =====
    console.log("3️⃣  Deploying VEG21Donations...");
    
    const VEG21Donations = await ethers.getContractFactory("VEG21Donations");
    
    if (isDryRun) {
      const deployTx = await VEG21Donations.getDeployTransaction(tokenAddress, deployerAddress);
      const gasEstimate = await ethers.provider.estimateGas(deployTx);
      const gasPrice = (await ethers.provider.getFeeData()).gasPrice || 0n;
      const estimatedCost = gasEstimate * gasPrice;
      
      console.log(`   📊 Gas estimate: ${gasEstimate.toString()}`);
      console.log(`   💰 Estimated cost: ${ethers.formatEther(estimatedCost)} CELO`);
      console.log(`   ✅ VEG21Donations deployment simulated\n`);
      
      deploymentResult.contracts.VEG21Donations = "0x0000000000000000000000000000000000000002";
    } else {
      const donations = await VEG21Donations.deploy(tokenAddress, deployerAddress);
      await donations.waitForDeployment();
      
      const donationsAddress = await donations.getAddress();
      const donationsDeployTx = donations.deploymentTransaction();
      
      deploymentResult.contracts.VEG21Donations = donationsAddress;
      deploymentResult.transactionHashes.VEG21Donations = donationsDeployTx?.hash || "";
      
      console.log(`   ✅ VEG21Donations deployed to: ${donationsAddress}`);
      console.log(`   📝 Transaction: ${donationsDeployTx?.hash}\n`);
    }
    
    // ===== Step 4: Deploy VEG21Rewards =====
    console.log("4️⃣  Deploying VEG21Rewards...");
    
    const VEG21Rewards = await ethers.getContractFactory("VEG21Rewards");
    
    if (isDryRun) {
      const deployTx = await VEG21Rewards.getDeployTransaction(tokenAddress, deployerAddress);
      const gasEstimate = await ethers.provider.estimateGas(deployTx);
      const gasPrice = (await ethers.provider.getFeeData()).gasPrice || 0n;
      const estimatedCost = gasEstimate * gasPrice;
      
      console.log(`   📊 Gas estimate: ${gasEstimate.toString()}`);
      console.log(`   💰 Estimated cost: ${ethers.formatEther(estimatedCost)} CELO`);
      console.log(`   ✅ VEG21Rewards deployment simulated\n`);
      
      deploymentResult.contracts.VEG21Rewards = "0x0000000000000000000000000000000000000003";
    } else {
      const rewards = await VEG21Rewards.deploy(tokenAddress, deployerAddress);
      await rewards.waitForDeployment();
      
      const rewardsAddress = await rewards.getAddress();
      const rewardsDeployTx = rewards.deploymentTransaction();
      
      deploymentResult.contracts.VEG21Rewards = rewardsAddress;
      deploymentResult.transactionHashes.VEG21Rewards = rewardsDeployTx?.hash || "";
      
      console.log(`   ✅ VEG21Rewards deployed to: ${rewardsAddress}`);
      console.log(`   📝 Transaction: ${rewardsDeployTx?.hash}\n`);
    }
    
    // ===== Post-deployment configuration (only if executing) =====
    if (!isDryRun) {
      console.log("5️⃣  Configuring contract permissions...");
      
      const token = await ethers.getContractAt("VEG21Token", deploymentResult.contracts.VEG21Token);
      
      console.log("   Adding VEG21Staking as minter...");
      let tx = await token.addMinter(deploymentResult.contracts.VEG21Staking);
      await tx.wait();
      console.log(`   ✅ Transaction: ${tx.hash}`);
      
      console.log("   Adding VEG21Rewards as minter...");
      tx = await token.addMinter(deploymentResult.contracts.VEG21Rewards);
      await tx.wait();
      console.log(`   ✅ Transaction: ${tx.hash}\n`);
      
      console.log("6️⃣  Registering initial charities...");
      
      const donations = await ethers.getContractAt("VEG21Donations", deploymentResult.contracts.VEG21Donations);
      
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
      console.log("");
    }
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (isDryRun) {
      console.log("✅ Dry-Run Complete!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("No transactions were broadcast. This was a simulation.");
      console.log("");
      console.log("To execute real deployment:");
      console.log(`  npx hardhat run scripts/deploy.ts --network ${network.name} --execute`);
    } else {
      console.log("🎉 Deployment Complete!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
    console.log("\n📝 Contract Addresses:");
    console.log(`VEG21Token:     ${deploymentResult.contracts.VEG21Token}`);
    console.log(`VEG21Staking:   ${deploymentResult.contracts.VEG21Staking}`);
    console.log(`VEG21Donations: ${deploymentResult.contracts.VEG21Donations}`);
    console.log(`VEG21Rewards:   ${deploymentResult.contracts.VEG21Rewards}\n`);
    
    // ===== Save deployment info =====
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const networkName = network.name === "unknown" ? "hardhat" : network.name;
    const filePrefix = isDryRun ? "dry-run" : "deployed";
    const deploymentFile = path.join(deploymentsDir, `${filePrefix}-${networkName}-${network.chainId}.json`);
    
    fs.writeFileSync(
      deploymentFile,
      JSON.stringify(deploymentResult, null, 2)
    );
    
    console.log(`💾 Deployment info saved to: ${deploymentFile}\n`);
    
    // ===== Generate .env file content =====
    if (!isDryRun) {
      const envPrefix = network.chainId === 44787n ? "ALFAJORES" : 
                         network.chainId === 42220n ? "MAINNET" : 
                         "LOCAL";
      
      console.log("📋 Add these to your .env file:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`VITE_CELO_${envPrefix}_TOKEN_ADDRESS=${deploymentResult.contracts.VEG21Token}`);
      console.log(`VITE_CELO_${envPrefix}_STAKING_ADDRESS=${deploymentResult.contracts.VEG21Staking}`);
      console.log(`VITE_CELO_${envPrefix}_DONATIONS_ADDRESS=${deploymentResult.contracts.VEG21Donations}`);
      console.log(`VITE_CELO_${envPrefix}_REWARDS_ADDRESS=${deploymentResult.contracts.VEG21Rewards}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      
      // ===== Verification instructions =====
      if (network.chainId === 44787n || network.chainId === 42220n) {
        console.log("🔍 Contract Verification Commands:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`npx hardhat verify --network ${network.name} ${deploymentResult.contracts.VEG21Token} "${initialSupply}" "${deployerAddress}"`);
        console.log(`npx hardhat verify --network ${network.name} ${deploymentResult.contracts.VEG21Staking} "${deploymentResult.contracts.VEG21Token}" "${deployerAddress}"`);
        console.log(`npx hardhat verify --network ${network.name} ${deploymentResult.contracts.VEG21Donations} "${deploymentResult.contracts.VEG21Token}" "${deployerAddress}"`);
        console.log(`npx hardhat verify --network ${network.name} ${deploymentResult.contracts.VEG21Rewards} "${deploymentResult.contracts.VEG21Token}" "${deployerAddress}"`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        const explorerUrl = network.chainId === 44787n ? 
          "https://alfajores.celoscan.io" : 
          "https://celoscan.io";
        
        console.log("🔗 View on CeloScan:");
        console.log(`${explorerUrl}/address/${deploymentResult.contracts.VEG21Token}`);
        console.log(`${explorerUrl}/address/${deploymentResult.contracts.VEG21Staking}`);
        console.log(`${explorerUrl}/address/${deploymentResult.contracts.VEG21Donations}`);
        console.log(`${explorerUrl}/address/${deploymentResult.contracts.VEG21Rewards}\n`);
      }
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
