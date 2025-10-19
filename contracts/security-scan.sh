#!/bin/bash
# Security Scan Script for BountyManagerV2
# Runs Slither, Forge tests, gas snapshots, and coverage

echo ""
echo "🔍 Running Security Scans on BountyManagerV2..."
echo "================================================="
echo ""

# Check if slither is installed
echo "Checking dependencies..."
if ! command -v slither &> /dev/null; then
    echo "❌ Slither not found. Installing..."
    echo "Run: pip install slither-analyzer"
    exit 1
else
    echo "✅ Slither found: $(slither --version)"
fi
echo ""

# 1. Slither Analysis
echo "1️⃣  Running Slither Static Analysis..."
echo "   Target: src/BountyManagerV2.sol"
if slither src/BountyManagerV2.sol --filter-paths "openzeppelin|forge-std" --exclude-informational | tee slither-report.txt; then
    echo "   ✅ Slither complete. Report saved: slither-report.txt"
else
    echo "   ⚠️  Slither encountered issues. Check slither-report.txt"
fi
echo ""

# 2. Forge Tests
echo "2️⃣  Running Forge Tests..."
if forge test -vv; then
    echo "   ✅ Forge tests complete"
else
    echo "   ❌ Some tests failed"
fi
echo ""

# 3. Gas Snapshot
echo "3️⃣  Generating Gas Snapshot..."
if forge snapshot --snap .gas-snapshot; then
    echo "   ✅ Gas snapshot saved: .gas-snapshot"
else
    echo "   ⚠️  Gas snapshot failed"
fi
echo ""

# 4. Coverage
echo "4️⃣  Running Coverage Analysis..."
if forge coverage | tee coverage-report.txt; then
    echo "   ✅ Coverage report saved: coverage-report.txt"
else
    echo "   ⚠️  Coverage analysis failed"
fi
echo ""

# Summary
echo "================================================="
echo "🎉 Security Scan Complete!"
echo "================================================="
echo ""
echo "📊 Generated Reports:"
echo "   📄 slither-report.txt       - Slither static analysis"
echo "   📄 coverage-report.txt      - Test coverage details"
echo "   📄 .gas-snapshot            - Gas usage snapshot"
echo ""
echo "🔍 Next Steps:"
echo "   1. Review slither-report.txt for vulnerabilities"
echo "   2. Fix any HIGH or MEDIUM severity issues"
echo "   3. Re-run this script after fixes"
echo "   4. Verify on SolidityScan before deployment"
echo ""
