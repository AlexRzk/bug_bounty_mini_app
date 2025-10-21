#!/usr/bin/env pwsh
# Security Scan Script for BountyManagerV2
# Runs Slither, Forge tests, gas snapshots, and coverage

Write-Host ""
Write-Host "🔍 Running Security Scans on BountyManagerV2..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if slither is installed
Write-Host "Checking dependencies..." -ForegroundColor White
try {
    $slitherVersion = slither --version 2>&1
    Write-Host "✅ Slither found: $slitherVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Slither not found. Installing..." -ForegroundColor Red
    Write-Host "Run: pip install slither-analyzer" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 1. Slither Analysis
Write-Host "1️⃣  Running Slither Static Analysis..." -ForegroundColor Yellow
Write-Host "   Target: src/BountyManagerV2.sol" -ForegroundColor Gray
try {
    slither src/BountyManagerV2.sol --filter-paths "openzeppelin|forge-std" --exclude-informational | Tee-Object -FilePath slither-report.txt
    Write-Host "   ✅ Slither complete. Report saved: slither-report.txt" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Slither encountered issues. Check slither-report.txt" -ForegroundColor Yellow
}
Write-Host ""

# 2. Forge Tests
Write-Host "2️⃣  Running Forge Tests..." -ForegroundColor Yellow
try {
    forge test -vv
    Write-Host "   ✅ Forge tests complete" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Some tests failed" -ForegroundColor Red
}
Write-Host ""

# 3. Gas Snapshot
Write-Host "3️⃣  Generating Gas Snapshot..." -ForegroundColor Yellow
try {
    forge snapshot --snap .gas-snapshot
    Write-Host "   ✅ Gas snapshot saved: .gas-snapshot" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Gas snapshot failed" -ForegroundColor Yellow
}
Write-Host ""

# 4. Coverage
Write-Host "4️⃣  Running Coverage Analysis..." -ForegroundColor Yellow
try {
    forge coverage | Tee-Object -FilePath coverage-report.txt
    Write-Host "   ✅ Coverage report saved: coverage-report.txt" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Coverage analysis failed" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🎉 Security Scan Complete!" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Generated Reports:" -ForegroundColor White
Write-Host "   📄 slither-report.txt       - Slither static analysis" -ForegroundColor Gray
Write-Host "   📄 coverage-report.txt      - Test coverage details" -ForegroundColor Gray
Write-Host "   📄 .gas-snapshot            - Gas usage snapshot" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "   1. Review slither-report.txt for vulnerabilities" -ForegroundColor Gray
Write-Host "   2. Fix any HIGH or MEDIUM severity issues" -ForegroundColor Gray
Write-Host "   3. Re-run this script after fixes" -ForegroundColor Gray
Write-Host "   4. Verify on SolidityScan before deployment" -ForegroundColor Gray
Write-Host ""
