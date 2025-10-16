# JSON BOM Fix

## Problem
ABI JSON files contained BOM (Byte Order Mark) characters that caused build errors:
```
Unable to make a module from invalid JSON: expected value at line 1 column 1
```

## Solution Applied
1. Cleaned both `lib/bounty-manager-abi.json` and `bounty-abi.json` to remove BOM
2. Created `scripts/clean-json.js` utility for future use
3. Cleared `.next` cache to remove cached invalid JSON

## How to Clean JSON Files

### Manual PowerShell Method
```powershell
Get-Content .\lib\bounty-manager-abi.json -Raw | Set-Content -NoNewline .\lib\bounty-manager-abi-clean.json -Encoding UTF8
Move-Item -Force .\lib\bounty-manager-abi-clean.json .\lib\bounty-manager-abi.json
```

### Automated Script (Recommended)
```bash
node scripts/clean-json.js lib/bounty-manager-abi.json bounty-abi.json
```

## After Updating ABI Files

Always run the cleaning script after copying ABI from Foundry:

```powershell
# 1. Copy ABI from contracts/out
Copy-Item .\contracts\out\BountyManager.sol\BountyManager.json .\lib\bounty-manager-abi.json

# 2. Clean the JSON
node scripts/clean-json.js lib/bounty-manager-abi.json

# 3. Clear Next.js cache
Remove-Item -Recurse -Force .next

# 4. Restart dev server
npm run dev
```

## Prevention
- Always use UTF-8 encoding without BOM when editing JSON files
- VS Code: Set "files.encoding": "utf8" in settings
- After copying from Windows apps, run the clean-json script
