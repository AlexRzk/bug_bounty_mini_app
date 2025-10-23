// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {BountyManagerV2} from "../src/BountyManagerV2.sol";

/**
 * @title Deploy BountyManagerV2 to Base Mainnet
 * @notice Production deployment script for Base mainnet
 * @dev Usage:
 *   forge script script/DeployBountyManagerV2.s.sol:DeployBountyManagerV2 \
 *   --rpc-url base \
 *   --broadcast \
 *   --verify \
 *   -vvvv
 */
contract DeployBountyManagerV2 is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get fee collector from environment or use default
        address feeCollector = vm.envOr("FEE_COLLECTOR", address(0x2C88F1279dff31ce285c3e270E5d59AF203115e0));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the new contract
        BountyManagerV2 bountyManager = new BountyManagerV2(feeCollector);
        
        vm.stopBroadcast();
        
        // Log the deployed address
        console2.log("========================================");
        console2.log("BountyManagerV2 deployed to Base Mainnet");
        console2.log("Contract Address:", address(bountyManager));
        console2.log("Fee Collector:", feeCollector);
        console2.log("========================================");
        console2.log("Next steps:");
        console2.log("1. Verify contract on Basescan");
        console2.log("2. Update contract address in your frontend config");
        console2.log("3. Update ABI files if contract interface changed");
    }
}
