// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BountyManager.sol";

/**
 * @title Deploy BountyManager to Base Sepolia
 * @notice Deployment script for testnet
 * 
 * Usage:
 * forge script script/Deploy.s.sol:DeployBountyManager \
 *   --rpc-url base-sepolia \
 *   --broadcast \
 *   --verify \
 *   -vvvv
 */
contract DeployBountyManager is Script {
    function run() external {
        // Load deployment parameters from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeCollector = vm.envAddress("FEE_COLLECTOR");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy BountyManager
        BountyManager bountyManager = new BountyManager(feeCollector);

        // Optional: Whitelist common Base tokens (USDC, DAI, etc.)
        // Uncomment when deploying to mainnet with known token addresses
        
        // Base Sepolia USDC (example - verify actual address)
        // address usdcSepolia = 0x...; // Get from Base docs
        // bountyManager.setTokenWhitelisted(usdcSepolia, true);

        vm.stopBroadcast();

        // Log deployment info
        console.log("====================================");
        console.log("BountyManager deployed to:", address(bountyManager));
        console.log("Fee Collector:", feeCollector);
        console.log("Platform Fee:", bountyManager.platformFeePercent(), "bps (2.5%)");
        console.log("====================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify contract on Basescan");
        console.log("2. Update lib/contracts.ts with address:", address(bountyManager));
        console.log("3. Copy ABI from out/BountyManager.sol/BountyManager.json");
        console.log("4. Test on Base Sepolia before mainnet deployment");
    }
}

/**
 * @title Deploy to Base Mainnet
 * @notice Production deployment script
 * 
 * Usage:
 * forge script script/Deploy.s.sol:DeployBountyManagerMainnet \
 *   --rpc-url base \
 *   --broadcast \
 *   --verify \
 *   -vvvv
 */
contract DeployBountyManagerMainnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeCollector = vm.envAddress("FEE_COLLECTOR");

        vm.startBroadcast(deployerPrivateKey);

        BountyManager bountyManager = new BountyManager(feeCollector);

        // Whitelist Base mainnet tokens
        // Base USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
        // Base USDbC: 0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA
        
        address baseUSDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        bountyManager.setTokenWhitelisted(baseUSDC, true);
        
        address baseUSDbC = 0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA;
        bountyManager.setTokenWhitelisted(baseUSDbC, true);

        vm.stopBroadcast();

        console.log("====================================");
        console.log("BountyManager MAINNET deployed to:", address(bountyManager));
        console.log("Fee Collector:", feeCollector);
        console.log("Whitelisted USDC:", baseUSDC);
        console.log("Whitelisted USDbC:", baseUSDbC);
        console.log("====================================");
    }
}
