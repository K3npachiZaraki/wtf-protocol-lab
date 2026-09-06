// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WTFCounter
/// @notice Minimal contract used to validate the local Solidity toolchain.
contract WTFCounter {
    uint256 public count;
    address public owner;

    event CountIncremented(address indexed by, uint256 newCount);

    constructor() {
        owner = msg.sender;
    }

    function increment() external {
        count += 1;
        emit CountIncremented(msg.sender, count);
    }

    function reset() external {
        require(msg.sender == owner, "Only owner can reset");
        count = 0;
    }
}
