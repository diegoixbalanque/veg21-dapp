#!/bin/bash

# VEG21 Deployment Configuration Validator
# Checks that all required environment variables are set before deployment

set -e

echo "🔍 VEG21 Deployment Configuration Validator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Found .env file"
else
    echo "❌ ERROR: .env file not found!"
    echo "   Create one by copying .env.example:"
    echo "   cp .env.example .env"
    exit 1
fi

echo ""
echo "📋 Checking configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Track validation status
ERRORS=0
WARNINGS=0

# Check VEG21 Mode
echo "1️⃣  VEG21 Mode"
if [ -z "$VITE_VEG21_MODE" ]; then
    echo "   ⚠️  VITE_VEG21_MODE not set (defaulting to 'demo')"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ Mode: $VITE_VEG21_MODE"
    
    # Validate mode value
    case "$VITE_VEG21_MODE" in
        demo|mock)
            echo "   🎮 Demo/Mock mode - safe for local development"
            ;;
        celo-alfajores|celo-testnet)
            echo "   🧪 Testnet mode - requires testnet CELO"
            ;;
        celo-mainnet|celo)
            echo "   🚀 MAINNET mode - REAL MONEY!"
            echo "   ⚠️  WARNING: Ensure you have completed all testing!"
            ;;
        local)
            echo "   🏠 Local Hardhat network"
            ;;
        *)
            echo "   ❌ Invalid mode: $VITE_VEG21_MODE"
            echo "      Valid options: demo, celo-alfajores, celo-mainnet, local"
            ERRORS=$((ERRORS + 1))
            ;;
    esac
fi
echo ""

# Check Private Key (only for non-demo modes)
echo "2️⃣  Private Key"
if [ "$VITE_VEG21_MODE" = "demo" ] || [ "$VITE_VEG21_MODE" = "mock" ]; then
    echo "   ℹ️  Not required in demo mode"
elif [ -z "$PRIVATE_KEY" ]; then
    echo "   ❌ PRIVATE_KEY not set!"
    echo "      Required for deploying to blockchain"
    ERRORS=$((ERRORS + 1))
else
    # Validate format (64 hex characters)
    if [[ ! "$PRIVATE_KEY" =~ ^[0-9a-fA-F]{64}$ ]]; then
        echo "   ❌ Invalid PRIVATE_KEY format!"
        echo "      Expected: 64 hexadecimal characters (no 0x prefix)"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✅ Private key configured (first 10 chars: ${PRIVATE_KEY:0:10}...)"
    fi
fi
echo ""

# Check RPC URLs
echo "3️⃣  RPC URLs"
if [ "$VITE_VEG21_MODE" = "celo-alfajores" ] || [ "$VITE_VEG21_MODE" = "celo-testnet" ]; then
    if [ -z "$CELO_ALFAJORES_RPC_URL" ]; then
        echo "   ❌ CELO_ALFAJORES_RPC_URL not set!"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✅ Alfajores RPC: $CELO_ALFAJORES_RPC_URL"
    fi
elif [ "$VITE_VEG21_MODE" = "celo-mainnet" ] || [ "$VITE_VEG21_MODE" = "celo" ]; then
    if [ -z "$VITE_CELO_MAINNET_RPC_URL" ]; then
        echo "   ❌ VITE_CELO_MAINNET_RPC_URL not set!"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✅ Mainnet RPC: $VITE_CELO_MAINNET_RPC_URL"
    fi
else
    echo "   ℹ️  Not required in current mode"
fi
echo ""

# Check CeloScan API Key
echo "4️⃣  CeloScan API Key"
if [ "$VITE_VEG21_MODE" = "demo" ] || [ "$VITE_VEG21_MODE" = "mock" ]; then
    echo "   ℹ️  Not required in demo mode"
elif [ -z "$CELOSCAN_API_KEY" ]; then
    echo "   ⚠️  CELOSCAN_API_KEY not set"
    echo "      Recommended for automatic contract verification"
    echo "      Get one at: https://celoscan.io/myapikey"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ CeloScan API key configured"
fi
echo ""

# Check Deployer Address
echo "5️⃣  Deployer Address"
if [ -z "$VITE_DEPLOYER_PUBLIC_ADDRESS" ]; then
    echo "   ⚠️  VITE_DEPLOYER_PUBLIC_ADDRESS not set"
    echo "      This is the public address for your PRIVATE_KEY"
    WARNINGS=$((WARNINGS + 1))
else
    # Validate Ethereum address format
    if [[ ! "$VITE_DEPLOYER_PUBLIC_ADDRESS" =~ ^0x[0-9a-fA-F]{40}$ ]]; then
        echo "   ❌ Invalid address format!"
        echo "      Expected: 0x followed by 40 hex characters"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✅ Deployer address: $VITE_DEPLOYER_PUBLIC_ADDRESS"
    fi
fi
echo ""

# Check Contract Addresses (if already deployed)
echo "6️⃣  Deployed Contract Addresses"
if [ "$VITE_VEG21_MODE" = "celo-alfajores" ]; then
    if [ -z "$VITE_CELO_ALFAJORES_TOKEN_ADDRESS" ]; then
        echo "   ℹ️  Alfajores contracts not yet deployed"
    else
        echo "   ✅ Token: $VITE_CELO_ALFAJORES_TOKEN_ADDRESS"
        echo "   ✅ Staking: $VITE_CELO_ALFAJORES_STAKING_ADDRESS"
        echo "   ✅ Donations: $VITE_CELO_ALFAJORES_DONATIONS_ADDRESS"
        echo "   ✅ Rewards: $VITE_CELO_ALFAJORES_REWARDS_ADDRESS"
    fi
elif [ "$VITE_VEG21_MODE" = "celo-mainnet" ]; then
    if [ -z "$VITE_CELO_MAINNET_TOKEN_ADDRESS" ]; then
        echo "   ℹ️  Mainnet contracts not yet deployed"
    else
        echo "   ✅ Token: $VITE_CELO_MAINNET_TOKEN_ADDRESS"
        echo "   ✅ Staking: $VITE_CELO_MAINNET_STAKING_ADDRESS"
        echo "   ✅ Donations: $VITE_CELO_MAINNET_DONATIONS_ADDRESS"
        echo "   ✅ Rewards: $VITE_CELO_MAINNET_REWARDS_ADDRESS"
    fi
else
    echo "   ℹ️  Not applicable in current mode"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed!"
    echo "   Your configuration is ready for deployment."
    echo ""
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Configuration has $WARNINGS warning(s)"
    echo "   You can proceed, but review the warnings above."
    echo ""
else
    echo "❌ Configuration has $ERRORS error(s) and $WARNINGS warning(s)"
    echo "   Fix the errors before deploying."
    echo ""
    exit 1
fi

# Deployment readiness check
if [ "$VITE_VEG21_MODE" != "demo" ] && [ "$VITE_VEG21_MODE" != "mock" ]; then
    echo "🚀 Deployment Commands:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$VITE_VEG21_MODE" = "celo-alfajores" ]; then
        echo "Dry-run (simulate):"
        echo "  npx hardhat run scripts/deploy.ts --network celo-alfajores"
        echo ""
        echo "Execute (real deployment):"
        echo "  npx hardhat run scripts/deploy.ts --network celo-alfajores --execute"
    elif [ "$VITE_VEG21_MODE" = "celo-mainnet" ]; then
        echo "⚠️  MAINNET DEPLOYMENT ⚠️"
        echo ""
        echo "Dry-run (simulate):"
        echo "  npx hardhat run scripts/deploy.ts --network celo-mainnet"
        echo ""
        echo "Execute (REAL - USE WITH CAUTION):"
        echo "  npx hardhat run scripts/deploy.ts --network celo-mainnet --execute"
        echo ""
        echo "⚠️  Before mainnet deployment:"
        echo "   1. Review DEPLOYMENT_CHECKLIST.md"
        echo "   2. Complete testing on Alfajores"
        echo "   3. Obtain team approval"
    fi
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuration validation complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
