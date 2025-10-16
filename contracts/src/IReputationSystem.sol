// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IReputationSystem
 * @dev Interface for ReputationSystem integration with BountyManager
 */
interface IReputationSystem {
    function recordSubmission(address _reporter) external;
    
    function recordAcceptedSubmission(
        address _reporter,
        uint256 _amount
    ) external;
    
    function recordBountyCreated(
        address _creator,
        uint256 _amount
    ) external;
    
    function recordBountyCompleted(
        address _creator,
        uint256 _responseTime
    ) external;
}
