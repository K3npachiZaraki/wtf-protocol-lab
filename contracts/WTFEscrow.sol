// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WTFEscrow is Ownable, ReentrancyGuard {
    IERC20 public immutable token;

    enum Status {
        None,
        Funded,
        Released,
        Refunded,
        Disputed
    }

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        uint256 deadline;
        Status status;
    }

    uint256 public nextEscrowId;

    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 deadline
    );

    event Released(uint256 indexed escrowId);
    event Refunded(uint256 indexed escrowId);
    event DisputeRaised(uint256 indexed escrowId);
    event DisputeResolved(uint256 indexed escrowId, bool releaseToSeller);

    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token");
        token = IERC20(tokenAddress);
    }

    function createEscrow(
        address seller,
        uint256 amount,
        uint256 deadline
    ) external nonReentrant returns (uint256) {
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Buyer cannot be seller");
        require(amount > 0, "Amount must be greater than zero");
        require(deadline > block.timestamp, "Invalid deadline");

        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        uint256 escrowId = nextEscrowId++;

        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            deadline: deadline,
            status: Status.Funded
        });

        emit EscrowCreated(
            escrowId,
            msg.sender,
            seller,
            amount,
            deadline
        );

        return escrowId;
    }

    function release(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.status == Status.Funded, "Invalid status");
        require(msg.sender == escrow.buyer, "Only buyer");
        
        escrow.status = Status.Released;

        require(
            token.transfer(escrow.seller, escrow.amount),
            "Token transfer failed"
        );

        emit Released(escrowId);
    }

    function refund(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.status == Status.Funded, "Invalid status");
        require(msg.sender == escrow.buyer, "Only buyer");
        require(block.timestamp >= escrow.deadline, "Deadline not reached");

        escrow.status = Status.Refunded;

        require(
            token.transfer(escrow.buyer, escrow.amount),
            "Token transfer failed"
        );

        emit Refunded(escrowId);
    }

    function raiseDispute(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.status == Status.Funded, "Invalid status");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not a party"
        );

        escrow.status = Status.Disputed;

        emit DisputeRaised(escrowId);
    }

    function resolveDispute(
        uint256 escrowId,
        bool releaseToSeller
    ) external onlyOwner nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.status == Status.Disputed, "Not disputed");

        if (releaseToSeller) {
            escrow.status = Status.Released;

            require(
                token.transfer(escrow.seller, escrow.amount),
                "Token transfer failed"
            );
        } else {
            escrow.status = Status.Refunded;

            require(
                token.transfer(escrow.buyer, escrow.amount),
                "Token transfer failed"
            );
        }

        emit DisputeResolved(escrowId, releaseToSeller);
    }
}