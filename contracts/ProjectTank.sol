// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectTank is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    uint256 public totalShares;
    uint256 public accDividendPerShare;

    mapping(address => uint256) public shares;
    mapping(address => uint256) public rewardDebt;

    event Invested(address indexed investor, uint256 amount, uint256 shares);
    event DividendsDeposited(uint256 amount);
    event DividendsClaimed(address indexed investor, uint256 amount);

    constructor(address usdcAddress) Ownable(msg.sender) {
        require(usdcAddress != address(0), "Invalid USDC");
        usdc = IERC20(usdcAddress);
    }

    function invest(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );

        uint256 newShares = amount;

        shares[msg.sender] += newShares;
        totalShares += newShares;

        rewardDebt[msg.sender] =
            (shares[msg.sender] * accDividendPerShare) /
            1e18;

        emit Invested(msg.sender, amount, newShares);
    }

    function depositDividends(uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        require(amount > 0, "Amount must be greater than zero");
        require(totalShares > 0, "No investors");

        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );

        accDividendPerShare += (amount * 1e18) / totalShares;

        emit DividendsDeposited(amount);
    }

    function claimDividends() external nonReentrant {
        uint256 accumulated =
            (shares[msg.sender] * accDividendPerShare) /
            1e18;

        uint256 claimable = accumulated - rewardDebt[msg.sender];

        require(claimable > 0, "Nothing to claim");

        rewardDebt[msg.sender] = accumulated;

        require(
            usdc.transfer(msg.sender, claimable),
            "USDC transfer failed"
        );

        emit DividendsClaimed(msg.sender, claimable);
    }
}