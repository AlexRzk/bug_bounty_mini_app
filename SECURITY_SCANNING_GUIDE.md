# Smart Contract Security Scanning Guide

## Overview

This guide shows you how to use **Slither**, **Mythril**, and other tools to scan your smart contracts for vulnerabilities and make them secure before deployment.

---

## Tool 1: Slither (Recommended - Fast & Easy)

### What is Slither?
- Static analysis tool by Trail of Bits
- Fast (runs in seconds)
- Detects 70+ vulnerability patterns
- Works with Foundry/Hardhat/Brownie

### Installation

**Option A: Using pip (Python)**
```bash
# Install Slither
pip install slither-analyzer

# Verify installation
slither --version
```

**Option B: Using pipx (Isolated)**
```bash
# Install pipx
python -m pip install pipx
python -m pipx ensurepath

# Install Slither
pipx install slither-analyzer

# Verify
slither --version
```

### Running Slither on BountyManagerV2

**Navigate to contracts directory:**
```bash
cd c:\Users\olo\Programmes\Bug_bounty_mini_app_base\farcaster-bug-bounty\contracts
```

**Scan the contract:**
```bash
# Basic scan
slither src/BountyManagerV2.sol

# Scan with specific detectors
slither src/BountyManagerV2.sol --detect reentrancy-eth,controlled-delegatecall

# Export results to JSON
slither src/BountyManagerV2.sol --json slither-report.json

# Filter by severity
slither src/BountyManagerV2.sol --filter-paths "openzeppelin|forge-std" --exclude-low --exclude-informational
```

**PowerShell (Windows):**
```powershell
# From contracts directory
Set-Location 'C:\Users\olo\Programmes\Bug_bounty_mini_app_base\farcaster-bug-bounty\contracts'

# Run Slither
slither src/BountyManagerV2.sol
```

**WSL (Linux):**
```bash
cd /mnt/c/Users/olo/Programmes/Bug_bounty_mini_app_base/farcaster-bug-bounty/contracts
slither src/BountyManagerV2.sol
```

### Understanding Slither Output

Slither categorizes issues by severity:

```
🔴 RED (High/Critical):
- Reentrancy vulnerabilities
- Unprotected calls to external contracts
- Incorrect access controls

🟡 YELLOW (Medium):
- Missing zero-address checks
- Unused variables
- Shadowing state variables

🟢 GREEN (Low/Informational):
- Code style issues
- Gas optimizations
- Best practice recommendations
```

### Example Output:
```
BountyManagerV2.createBountyETH(string,string,uint256,string) (src/BountyManagerV2.sol#150-180) 
uses a dangerous strict equality:
    - require(bool,string)(msg.value > 0,Reward must be greater than 0) (src/BountyManagerV2.sol#155)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#dangerous-strict-equalities
```

---

## Tool 2: Mythril (Deep Analysis)

### What is Mythril?
- Symbolic execution tool
- Deeper analysis than Slither (slower)
- Detects complex vulnerabilities
- Uses SMT solver

### Installation

```bash
# Install Mythril
pip install mythril

# Verify
myth version
```

### Running Mythril

```bash
# Analyze contract
myth analyze src/BountyManagerV2.sol --solc-json foundry.toml

# With execution depth
myth analyze src/BountyManagerV2.sol --execution-timeout 300 --max-depth 10

# Export report
myth analyze src/BountyManagerV2.sol -o json > mythril-report.json
```

---

## Tool 3: Foundry Built-in Tests

### Gas Snapshots
```bash
cd contracts
forge snapshot
```

### Fuzz Testing
```bash
# Run fuzz tests (if you have them)
forge test --fuzz-runs 10000

# Invariant testing
forge test --invariant
```

### Coverage
```bash
# Generate coverage report
forge coverage

# HTML report
forge coverage --report lcov
genhtml lcov.info -o coverage/
```

---

## Tool 4: Solhint (Linter)

### Installation
```bash
npm install -g solhint

# Or in project
npm install --save-dev solhint
```

### Running Solhint
```bash
# Scan all contracts
solhint 'contracts/src/**/*.sol'

# Initialize config
solhint --init

# With config
solhint -c .solhint.json 'contracts/src/**/*.sol'
```

---

## Automated Security Scan Script

Create a script to run all tools at once:

**File: `contracts/security-scan.sh`**
```bash
#!/bin/bash

echo "🔍 Running Security Scans on BountyManagerV2..."
echo ""

# 1. Slither
echo "1️⃣  Running Slither..."
slither src/BountyManagerV2.sol --filter-paths "openzeppelin|forge-std" --exclude-low --exclude-informational > slither-report.txt
echo "✅ Slither complete. Report: slither-report.txt"
echo ""

# 2. Forge tests
echo "2️⃣  Running Forge tests..."
forge test -vv
echo "✅ Forge tests complete"
echo ""

# 3. Gas snapshot
echo "3️⃣  Generating gas snapshot..."
forge snapshot --snap .gas-snapshot
echo "✅ Gas snapshot: .gas-snapshot"
echo ""

# 4. Coverage
echo "4️⃣  Running coverage..."
forge coverage > coverage-report.txt
echo "✅ Coverage report: coverage-report.txt"
echo ""

echo "🎉 All scans complete!"
echo ""
echo "📊 Summary:"
echo "- Slither report: slither-report.txt"
echo "- Coverage: coverage-report.txt"
echo "- Gas snapshot: .gas-snapshot"
```

**Make executable:**
```bash
chmod +x contracts/security-scan.sh
```

**Run:**
```bash
cd contracts
./security-scan.sh
```

---

## PowerShell Version (Windows)

**File: `contracts/security-scan.ps1`**
```powershell
Write-Host "🔍 Running Security Scans on BountyManagerV2..." -ForegroundColor Cyan
Write-Host ""

# 1. Slither
Write-Host "1️⃣  Running Slither..." -ForegroundColor Yellow
slither src/BountyManagerV2.sol --filter-paths "openzeppelin|forge-std" --exclude-low --exclude-informational | Out-File -FilePath slither-report.txt
Write-Host "✅ Slither complete. Report: slither-report.txt" -ForegroundColor Green
Write-Host ""

# 2. Forge tests
Write-Host "2️⃣  Running Forge tests..." -ForegroundColor Yellow
forge test -vv
Write-Host "✅ Forge tests complete" -ForegroundColor Green
Write-Host ""

# 3. Gas snapshot
Write-Host "3️⃣  Generating gas snapshot..." -ForegroundColor Yellow
forge snapshot --snap .gas-snapshot
Write-Host "✅ Gas snapshot: .gas-snapshot" -ForegroundColor Green
Write-Host ""

# 4. Coverage
Write-Host "4️⃣  Running coverage..." -ForegroundColor Yellow
forge coverage | Out-File -FilePath coverage-report.txt
Write-Host "✅ Coverage report: coverage-report.txt" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 All scans complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor White
Write-Host "- Slither report: slither-report.txt"
Write-Host "- Coverage: coverage-report.txt"
Write-Host "- Gas snapshot: .gas-snapshot"
```

**Run:**
```powershell
cd C:\Users\olo\Programmes\Bug_bounty_mini_app_base\farcaster-bug-bounty\contracts
.\security-scan.ps1
```

---

## Quick Start: Scan BountyManagerV2 Now

### Step 1: Install Slither
```bash
pip install slither-analyzer
```

### Step 2: Scan
```bash
cd c:\Users\olo\Programmes\Bug_bounty_mini_app_base\farcaster-bug-bounty\contracts
slither src/BountyManagerV2.sol --exclude-informational
```

### Step 3: Review Output
- **High/Medium** issues: Fix immediately
- **Low** issues: Consider fixing
- **Informational**: Good to know

### Step 4: Fix Issues
Based on Slither findings, update your contract and re-scan until clean.

---

## Common Issues & Fixes

### Issue 1: Reentrancy
```solidity
// ❌ BAD
function withdraw() public {
    uint amount = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] = 0; // State change AFTER external call
}

// ✅ GOOD (CEI Pattern)
function withdraw() public {
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0; // State change BEFORE external call
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}
```

### Issue 2: Unchecked Return Values
```solidity
// ❌ BAD
token.transfer(recipient, amount);

// ✅ GOOD
require(token.transfer(recipient, amount), "Transfer failed");

// ✅ BETTER (OpenZeppelin)
using SafeERC20 for IERC20;
token.safeTransfer(recipient, amount);
```

### Issue 3: Access Control
```solidity
// ❌ BAD
function setFeeCollector(address _collector) public {
    feeCollector = _collector;
}

// ✅ GOOD
function setFeeCollector(address _collector) public onlyOwner {
    require(_collector != address(0), "Zero address");
    feeCollector = _collector;
}
```

---

## CI/CD Integration (GitHub Actions)

**File: `.github/workflows/security-scan.yml`**
```yaml
name: Security Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  slither:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Slither
        run: pip install slither-analyzer
      
      - name: Run Slither
        run: |
          cd contracts
          slither src/BountyManagerV2.sol --exclude-informational --fail-high
      
      - name: Upload results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: slither-report
          path: contracts/slither-report.txt
```

---

## Comparison: Slither vs SolidityScan

| Feature | Slither | SolidityScan |
|---------|---------|--------------|
| **Speed** | ⚡ Fast (seconds) | 🐢 Moderate (minutes) |
| **Deployment** | Local CLI | Web service |
| **Cost** | Free | Free tier available |
| **Depth** | Static analysis | Multi-tool analysis |
| **CI/CD** | Easy | API integration |
| **Best For** | Dev workflow | Pre-deployment audit |

**Recommendation:** Use **both**:
1. **Slither** during development (fast feedback)
2. **SolidityScan** before deployment (comprehensive audit)

---

## Expected Results for BountyManagerV2

After running Slither on your fixed `BountyManagerV2.sol`, you should see:

```
✅ No high or critical issues
✅ CEI pattern enforced
✅ Access controls in place
✅ Safe external calls
⚠️ Some informational warnings (expected)
```

---

## Next Steps

1. **Install Slither:**
   ```bash
   pip install slither-analyzer
   ```

2. **Scan BountyManagerV2:**
   ```bash
   cd contracts
   slither src/BountyManagerV2.sol --exclude-informational
   ```

3. **Review & fix** any high/medium issues

4. **Re-scan** until clean

5. **Deploy** with confidence

6. **Verify on SolidityScan** for final audit

---

## Resources

- **Slither Docs**: https://github.com/crytic/slither
- **Slither Detectors**: https://github.com/crytic/slither/wiki/Detector-Documentation
- **Mythril**: https://github.com/ConsenSys/mythril
- **Smart Contract Best Practices**: https://consensys.github.io/smart-contract-best-practices/
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/

---

## Quick Reference Commands

```bash
# Install
pip install slither-analyzer

# Basic scan
slither src/BountyManagerV2.sol

# Filter noise
slither src/BountyManagerV2.sol --exclude-informational --exclude-low

# Export JSON
slither src/BountyManagerV2.sol --json slither-report.json

# Specific detectors
slither src/BountyManagerV2.sol --detect reentrancy-eth,unprotected-upgrade

# With Foundry
slither . --foundry-out-directory out
```

---

**Ready to scan?** Run the commands above and paste the output here if you need help interpreting the results! 🔍
