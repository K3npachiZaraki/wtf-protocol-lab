// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEscrowReentry {
    function release(uint256 escrowId) external;
}

contract ReentrantToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public escrow;
    uint256 public escrowId;
    bool public attack;

    function setAttack(address _escrow, uint256 _escrowId) external {
        escrow = _escrow;
        escrowId = _escrowId;
        attack = true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(
            allowance[from][msg.sender] >= amount,
            "Insufficient allowance"
        );

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;

        return true;
    }

    function transfer(
        address to,
        uint256 amount
    ) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        if (attack) {
            attack = false;
            IEscrowReentry(escrow).release(escrowId);
        }

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        return true;
    }
}