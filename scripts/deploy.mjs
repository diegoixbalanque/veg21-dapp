process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// scripts/deploy.mjs
import hardhat from "hardhat";
const { ethers } = hardhat;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  const executeFlag = args.includes("--execute");
  const isDryRun = !executeFlag;

  console.log("\n🌱 Starting VEG21 Contract Deployment...\n");

  if (isDryRun) {
    console.log("⚠️  DRY-RUN MODE ⚠️");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("This is a SIMULATION. No transactions will be broadcast.");
    console.log("To execute real deployment, add --execute flag:");
    console.log("  npx hardhat run scripts/deploy.mjs --network <network> --execute");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } else {
    console.log("🚀 EXECUTE MODE - REAL DEPLOYMENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  WARNING: This will deploy contracts to blockchain!");
    console.log("⚠️  Real gas fees will be charged!");
    console.log("⚠️  Contracts are IMMUTABLE once deployed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  const network = await ethers.provider.getNetwork();

  console.log("📋 Deployment Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Balance: ${ethers.formatEther(balance)} CELO`);
  console.log(`Mode: ${isDryRun ? "DRY-RUN (simulation)" : "EXECUTE (real deployment)"}`);
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

  // SAFETY CHECK for mainnet
  if (!isDryRun && network.chainId === 42220n) {
    console.log("🛑 MAINNET DEPLOYMENT SAFETY CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("You are about to deploy to CELO MAINNET.");
    console.log("Continuing in 10 seconds... Press Ctrl+C to abort.\n");
    await new Promise((r) => setTimeout(r, 10000));
  }

  const deploymentResult = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    contracts: {},
    transactionHashes: {},
    dryRun: isDryRun,
  };

  const deployOrSimulate = async (name, factoryArgs = []) => {
    console.log(`\n🧩 Deploying ${name}...`);
    const Factory = await ethers.getContractFactory(name);

    if (isDryRun) {
      const deployTx = await Factory.getDeployTransaction(...factoryArgs);
      const gasEstimate = await ethers.provider.estimateGas(deployTx);
      const gasPrice = (await ethers.provider.getFeeData()).gasPrice || 0n;
      const estimatedCost = gasEstimate * gasPrice;
      console.log(`   📊 Gas estimate: ${gasEstimate}`);
      console.log(`   💰 Estimated cost: ${ethers.formatEther(estimatedCost)} CELO`);
      deploymentResult.contracts[name] = "0x0000000000000000000000000000000000000000";
      return;
    }

    const instance = await Factory.deploy(...factoryArgs);
    await instance.waitForDeployment();

    const address = await instance.getAddress();
    const tx = instance.deploymentTransaction();

    deploymentResult.contracts[name] = address;
    deploymentResult.transactionHashes[name] = tx?.hash || "";

    console.log(`   ✅ ${name} deployed to: ${address}`);
    console.log(`   📝 TX: ${tx?.hash}`);
  };

  const initialSupply = 1_000_000;
  await deployOrSimulate("VEG21Token", [initialSupply, deployerAddress]);
  const tokenAddress = deploymentResult.contracts["VEG21Token"];
  await deployOrSimulate("VEG21Staking", [tokenAddress, deployerAddress]);
  await deployOrSimulate("VEG21Donations", [tokenAddress, deployerAddress]);
  await deployOrSimulate("VEG21Rewards", [tokenAddress, deployerAddress]);

  const deploymentsDir = path.join(__dirname, "../deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const filePrefix = isDryRun ? "dry-run" : "deployed";
  const filePath = path.join(deploymentsDir, `${filePrefix}-${network.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentResult, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filePath}`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
