// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {BountyManagerV2} from "./BountyManagerV2.sol";

/**
 * @title BountyManager
 * @notice Legacy contract name - Use BountyManagerV2 instead
 * @dev This is just an alias for backwards compatibility
 */
contract BountyManager is BountyManagerV2 {
    constructor(address _feeCollector) BountyManagerV2(_feeCollector) {}
}
