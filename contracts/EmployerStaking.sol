// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EmployerStaking is ReentrancyGuard {
    IERC20 public immutable token;

    mapping(address => uint256) public stakes;

    event Staked(address indexed employer, uint256 amount);
    event Withdrawn(address indexed employer, uint256 amount);

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token");
        token = IERC20(tokenAddress);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        stakes[msg.sender] += amount;

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(stakes[msg.sender] >= amount, "Insufficient stake");

        stakes[msg.sender] -= amount;

        require(
            token.transfer(msg.sender, amount),
            "Token transfer failed"
        );

        emit Withdrawn(msg.sender, amount);
    }
}