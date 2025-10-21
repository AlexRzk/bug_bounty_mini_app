// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Script.sol";
import "../src/BountyManager.sol";

/**
 * @title Deploy BountyManager to Base Sepolia
 * @notice Deployment script for testnet - Use DeployBountyManagerV2.s.sol instead
 * @dev This is the legacy script, kept for backwards compatibility
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
        address feeCollector = vm.envOr("FEE_COLLECTOR", address(0x2C88F1279dff31ce285c3e270E5d59AF203115e0));

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy BountyManager (V2)
        BountyManager bountyManager = new BountyManager(feeCollector);

        vm.stopBroadcast();

        // Log deployment info
        console.log("====================================");
        console.log("BountyManager deployed to:", address(bountyManager));
        console.log("Fee Collector:", feeCollector);
        console.log("Platform Fee:", bountyManager.platformFee(), "bps (2.5%)");
        console.log("====================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify contract on Basescan");
        console.log("2. Update .env.local with address:", address(bountyManager));
        console.log("3. Test on Base Sepolia before mainnet deployment");
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
        address feeCollector = vm.envOr("FEE_COLLECTOR", address(0x2C88F1279dff31ce285c3e270E5d59AF203115e0));

        vm.startBroadcast(deployerPrivateKey);

        BountyManager bountyManager = new BountyManager(feeCollector);

        vm.stopBroadcast();

        console.log("====================================");
        console.log("BountyManager MAINNET deployed to:", address(bountyManager));
        console.log("Fee Collector:", feeCollector);
        console.log("Platform Fee:", bountyManager.platformFee(), "bps");
        console.log("====================================");
        console.log("");
        console.log("IMPORTANT: Update .env.local with:");
        console.log("NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS=", address(bountyManager));
    }
}
