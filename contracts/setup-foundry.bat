@echo off
echo ================================================
echo Foundry Smart Contract Setup for Windows
echo ================================================
echo.

echo This script will help you set up Foundry for smart contract development.
echo.

echo Step 1: Install Foundry in WSL
echo --------------------------------
echo Please run the following commands in WSL:
echo.
echo   wsl
echo   curl -L https://foundry.paradigm.xyz ^| bash
echo   foundryup
echo   cd /mnt/c/Users/olo/Programmes/Bug_bounty_mini_app_base/farcaster-bug-bounty/contracts
echo   forge init --no-commit --force
echo   forge install OpenZeppelin/openzeppelin-contracts --no-commit
echo.

echo Step 2: After installing, you can build and test:
echo ------------------------------------------------
echo   forge build
echo   forge test
echo.

echo Step 3: To deploy to Base Sepolia:
echo ----------------------------------
echo   forge script script/Deploy.s.sol:DeployScript --rpc-url base-sepolia --broadcast
echo.

echo ================================================
echo For detailed instructions, see:
echo - contracts/README.md
echo - DEVELOPMENT_GUIDE.md
echo ================================================
echo.

pause
