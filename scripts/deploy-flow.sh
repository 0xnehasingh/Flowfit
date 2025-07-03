#!/bin/bash

# FlowFit Deployment Script for Flow Blockchain
# This script deploys the FlowFit Cadence contracts to Flow testnet/mainnet

set -e

echo "🚀 FlowFit Deployment Script"
echo "============================="

# Check if Flow CLI is installed
if ! command -v flow &> /dev/null; then
    echo "❌ Flow CLI is not installed. Please install it first:"
    echo "sh -ci \"\$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)\""
    exit 1
fi

# Check for required environment variables
if [[ -z "$FLOW_NETWORK" ]]; then
    echo "⚠️  FLOW_NETWORK not set. Defaulting to 'testnet'"
    FLOW_NETWORK="testnet"
fi

echo "🌍 Network: $FLOW_NETWORK"
echo "📄 Deploying contracts..."

# Create deployment directory if it doesn't exist
mkdir -p deployment-logs

# Deploy FlowFitToken contract
echo "📦 Deploying FlowFitToken..."
flow accounts add-contract FlowFitToken ./contracts/cadence/contracts/FlowFitToken.cdc \
    --network $FLOW_NETWORK \
    --signer $FLOW_NETWORK-account 2>&1 | tee deployment-logs/flowfit-token-deploy.log

if [ $? -eq 0 ]; then
    echo "✅ FlowFitToken deployed successfully"
else
    echo "❌ FlowFitToken deployment failed"
    exit 1
fi

# Deploy FitnessChallenge contract
echo "📦 Deploying FitnessChallenge..."
flow accounts add-contract FitnessChallenge ./contracts/cadence/contracts/FitnessChallenge.cdc \
    --network $FLOW_NETWORK \
    --signer $FLOW_NETWORK-account 2>&1 | tee deployment-logs/fitness-challenge-deploy.log

if [ $? -eq 0 ]; then
    echo "✅ FitnessChallenge deployed successfully"
else
    echo "❌ FitnessChallenge deployment failed"
    exit 1
fi

# Deploy AchievementNFT contract
echo "📦 Deploying AchievementNFT..."
flow accounts add-contract AchievementNFT ./contracts/cadence/contracts/AchievementNFT.cdc \
    --network $FLOW_NETWORK \
    --signer $FLOW_NETWORK-account 2>&1 | tee deployment-logs/achievement-nft-deploy.log

if [ $? -eq 0 ]; then
    echo "✅ AchievementNFT deployed successfully"
else
    echo "❌ AchievementNFT deployment failed"
    exit 1
fi

echo ""
echo "🎉 All contracts deployed successfully!"
echo "📋 Deployment Summary:"
echo "   - FlowFitToken: ✅"
echo "   - FitnessChallenge: ✅"
echo "   - AchievementNFT: ✅"
echo ""
echo "📂 Deployment logs saved to: deployment-logs/"
echo ""
echo "🔗 Next steps:"
echo "   1. Update contract addresses in frontend/.env.local"
echo "   2. Initialize contracts with admin functions"
echo "   3. Set up partner integrations"
echo "   4. Configure sponsored transaction payer"
echo ""
echo "🌟 FlowFit is now live on Flow $FLOW_NETWORK!" 