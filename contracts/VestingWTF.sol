// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VestingWTF is Ownable, ReentrancyGuard {
    IERC20 public immutable token;

    struct Grant {
        uint256 totalAmount;
        uint256 start;
        uint256 cliffDuration;
        uint256 vestingDuration;
        uint256 claimed;
    }

    mapping(address => Grant) public grants;

    event GrantCreated(
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 start,
        uint256 cliffDuration,
        uint256 vestingDuration
    );

    event TokensClaimed(address indexed beneficiary, uint256 amount);

    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token");
        token = IERC20(tokenAddress);
    }

    function createGrant(
        address beneficiary,
        uint256 totalAmount,
        uint256 start,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(totalAmount > 0, "Amount must be greater than zero");
        require(vestingDuration > 0, "Invalid vesting duration");
        require(cliffDuration <= vestingDuration, "Invalid cliff");

        grants[beneficiary] = Grant({
            totalAmount: totalAmount,
            start: start,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            claimed: 0
        });

        require(
            token.transferFrom(msg.sender, address(this), totalAmount),
            "Token transfer failed"
        );

        emit GrantCreated(
            beneficiary,
            totalAmount,
            start,
            cliffDuration,
            vestingDuration
        );
    }

    function vestedAmount(address beneficiary)
        public
        view
        returns (uint256)
    {
        Grant memory grant = grants[beneficiary];

        if (block.timestamp < grant.start + grant.cliffDuration) {
            return 0;
        }

        if (block.timestamp >= grant.start + grant.vestingDuration) {
            return grant.totalAmount;
        }

        uint256 elapsed = block.timestamp - grant.start;

        return (grant.totalAmount * elapsed) / grant.vestingDuration;
    }

    function claim() external nonReentrant {
        Grant storage grant = grants[msg.sender];

        uint256 vested = vestedAmount(msg.sender);
        uint256 claimable = vested - grant.claimed;

        require(claimable > 0, "Nothing to claim");

        grant.claimed += claimable;

        require(
            token.transfer(msg.sender, claimable),
            "Token transfer failed"
        );

        emit TokensClaimed(msg.sender, claimable);
    }
}