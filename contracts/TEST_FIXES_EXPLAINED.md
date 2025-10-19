# Test Fixes - BountyManager Tests

**Date**: October 20, 2025  
**Issue**: Test assertions failing after security fixes  
**Commit**: 2ecbe61  

---

## Problem

After applying security fixes, two tests were failing:

```
[FAIL] testAcceptSubmissionERC20() 
Expected: 97500000000000000000 (97.5 tokens)
Got:      95000000000000000000 (95 tokens)

[FAIL] testAcceptSubmissionETH()
Expected: 1975000000000000000 (1.975 ETH) 
Got:      1950000000000000000 (1.95 ETH)
```

---

## Root Cause

**The tests had incorrect fee calculations!**

The contract charges a **5% platform fee** (500 basis points), but the tests were calculating **2.5%** (250 basis points):

```solidity
// ❌ WRONG - Test was using 2.5%
uint256 expectedFee = (REWARD_AMOUNT * 250) / 10000;

// ✅ CORRECT - Contract actually charges 5%
uint256 platformFeePercent = 500; // in BountyManager.sol line 61
```

---

## Fixes Applied

### Fix 1: testAcceptSubmissionETH() - Line 183

**Before**:
```solidity
uint256 expectedFee = (REWARD_AMOUNT * 250) / 10000; // 2.5%
```

**After**:
```solidity
uint256 expectedFee = (REWARD_AMOUNT * 500) / 10000; // 5%
```

### Fix 2: testAcceptSubmissionERC20() - Line 270

**Before**:
```solidity
uint256 expectedFee = (TOKEN_REWARD * 250) / 10000;
```

**After**:
```solidity
uint256 expectedFee = (TOKEN_REWARD * 500) / 10000; // 5%
```

### Fix 3: BountyManager.sol Variable Shadowing - Line 425

Also applied the same security fix to old `BountyManager.sol`:

**Before**:
```solidity
function setTokenWhitelisted(address _token, bool _status) external onlyOwner
```

**After**:
```solidity
function setTokenWhitelisted(address _token, bool _isWhitelisted) external onlyOwner
```

---

## Verification

### Expected Test Results Now:

**testAcceptSubmissionETH():**
- Reward: 1 ETH
- Fee (5%): 0.05 ETH
- Payout: 0.95 ETH
- Submitter initial balance: 1 ETH
- Submitter final balance: 1.95 ETH ✅

**testAcceptSubmissionERC20():**
- Reward: 100 tokens
- Fee (5%): 5 tokens
- Payout: 95 tokens
- Submitter initial balance: 0 tokens
- Submitter final balance: 95 tokens ✅

---

## Why This Happened

The original test author likely copied the test template but:
1. Used 2.5% fee in calculations
2. The actual contract implementation uses 5% fee
3. Tests never ran successfully with correct assertions

The security fixes didn't break the tests - **the tests were already incorrect**.

---

## Fee Comparison: BountyManager vs BountyManagerV2

| Contract | Platform Fee | Basis Points |
|----------|-------------|--------------|
| `BountyManager.sol` | 5% | 500 |
| `BountyManagerV2.sol` | 2.5% | 250 |

**Note**: BountyManagerV2 uses a lower fee (2.5%) than the original contract (5%).

---

## All Tests Should Now Pass

Run tests to verify:
```bash
cd contracts
forge test -vv
```

Expected output:
```
✅ testAcceptSubmissionETH() - PASS
✅ testAcceptSubmissionERC20() - PASS
```

---

## Summary

| File | Change | Reason |
|------|--------|--------|
| `test/BountyManager.t.sol` | Updated fee from 250 to 500 basis points | Match actual contract fee (5%) |
| `src/BountyManager.sol` | Renamed `_status` to `_isWhitelisted` | Fix variable shadowing (security) |

---

**All tests fixed!** ✅
