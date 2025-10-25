// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {BountyManagerV3} from "../src/BountyManagerV3.sol";

contract DeployBountyManagerV3 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeCollector = vm.envAddress("FEE_COLLECTOR");
        
        console.log("Deploying BountyManagerV3...");
        console.log("Fee Collector:", feeCollector);
        
        vm.startBroadcast(deployerPrivateKey);
        
        BountyManagerV3 bountyManager = new BountyManagerV3(feeCollector);
        
        vm.stopBroadcast();
        
        console.log("BountyManagerV3 deployed at:", address(bountyManager));
        console.log("Selection Period:", bountyManager.SELECTION_PERIOD() / 1 days, "days");
        console.log("Dispute Compensation:", bountyManager.DISPUTE_COMPENSATION(), "%");
    }
}
