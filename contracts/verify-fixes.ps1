#!/usr/bin/env pwsh
# Quick verification script to confirm security fixes

Write-Host ""
Write-Host "🔍 Verifying Security Fixes..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check that fixes are in place
Write-Host "1️⃣  Checking gas limit removal..." -ForegroundColor Yellow
$gasLimitCheck = Select-String -Path "src/BountyManagerV2.sol" -Pattern "feeCollector.*call.*gas: 10000"
if ($gasLimitCheck) {
    Write-Host "   ❌ Gas limit still present!" -ForegroundColor Red
} else {
    Write-Host "   ✅ Gas limit removed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "2️⃣  Checking variable shadowing fix..." -ForegroundColor Yellow
$shadowCheck = Select-String -Path "src/BountyManagerV2.sol" -Pattern "setTokenWhitelisted.*bool _status"
if ($shadowCheck) {
    Write-Host "   ❌ Variable shadowing still present!" -ForegroundColor Red
} else {
    Write-Host "   ✅ Variable renamed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host ""
