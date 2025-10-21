#!/bin/bash
# Helper script to flatten BountyManagerV2 for SolidityScan verification

set -e

REPO_ROOT="/mnt/c/Users/olo/Programmes/Bug_bounty_mini_app_base/farcaster-bug-bounty"
CONTRACTS_DIR="$REPO_ROOT/contracts"
OUTPUT_FILE="$CONTRACTS_DIR/BountyManagerV2_flattened.sol"

echo "📦 Flattening BountyManagerV2.sol for SolidityScan verification..."
echo ""

if [ ! -d "$CONTRACTS_DIR" ]; then
    echo "❌ Error: Contracts directory not found at $CONTRACTS_DIR"
    exit 1
fi

cd "$CONTRACTS_DIR"

# Run forge flatten
forge flatten src/BountyManagerV2.sol > "$OUTPUT_FILE"

echo "✅ Contract flattened successfully!"
echo "📄 Output file: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "1. Go to: https://solidityscan.com"
echo "2. Enter contract address: 0x3e2ca92C48FE3BbF0c83c6E69DcE680BA63C193B"
echo "3. Select chain: Base Sepolia (84532)"
echo "4. Copy contents of $OUTPUT_FILE"
echo "5. Paste into SolidityScan verification form"
echo "6. Select Compiler: 0.8.20, Optimization: Enabled (200 runs)"
echo "7. Click 'Verify'"
echo ""
echo "Expected results: Score 95+/100 (up from 61.46)"
