#!/bin/bash

# Quick build and test script for BountyManager
# Run from WSL: ./build-and-test.sh

echo "🔨 Building BountyManager contracts..."
forge build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🧪 Running tests..."
    forge test -vvv
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ All tests passed!"
        echo ""
        echo "📊 Gas report:"
        forge test --gas-report
        
        echo ""
        echo "🎉 Ready to deploy!"
        echo ""
        echo "Next steps:"
        echo "1. Set up .env file: cp .env.example .env && nano .env"
        echo "2. Get testnet ETH: https://www.coinbase.com/faucets"
        echo "3. Deploy: forge script script/Deploy.s.sol:DeployBountyManager --rpc-url base-sepolia --broadcast --verify -vvvv"
    else
        echo "❌ Tests failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
