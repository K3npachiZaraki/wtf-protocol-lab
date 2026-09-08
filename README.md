# WTF Protocol Lab

An independent Solidity/Web3 portfolio project implementing a six-week smart-contract development specification.

> This repository is an independent implementation and is not the World Trade Future production codebase.

## Current Status

### Week 1 — Foundation
- [x] WTFCounter contract
- [x] Local unit tests
- [x] Sepolia deployment
- [x] Deployment address documented

### Week 2 — WTF Token & Vesting
- [x] WTFToken
- [x] VestingWTF
- [x] Unit tests
- [x] Sepolia deployment
- [x] Contract verification

### Week 3 — Employer Staking & Project Funding
- [x] EmployerStaking
- [x] ProjectTank
- [x] Unit tests
- [x] Security-focused tests
- [x] Sepolia deployment
- [x] Contract verification

### Week 4 — Escrow & Dispute Mechanism
- [x] WTFEscrow
- [x] Buyer/seller settlement
- [x] Refund mechanism
- [x] Dispute mechanism
- [x] Reentrancy protection
- [x] Reentrancy attack test
- [x] Sepolia deployment
- [x] Contract verification

### Security & Testing
- [x] 73 automated tests passing
- [x] 100% function coverage
- [x] 98.8% statement coverage
- [x] 97.41% line coverage
- [x] Slither static analysis
- [x] Reentrancy attack testing
- [x] Access-control testing
- [x] Boundary-condition testing

## Sepolia Deployment

All contracts below were deployed to Ethereum Sepolia.

| Contract | Address |
|---|---|
| WTFToken | `0xeA9A940890FD1F70cA06DDFCE4A825Aa358b5187` |
| EmployerStaking | `0xb73D03856Ac7f60bf795e8E76cD6124E26FeF339` |
| ProjectTank | `0x61c2370EEA53f6BA4eEcc8B6A9474a99150cCa4a` |
| VestingWTF | `0x38a6dC5e9203b3c2DDCF80caD6e98d3b02e70A88` |
| WTFEscrow | `0xcF819D71f655ADa6871ebA81279abBf81D89eE75` |
| WTFCounter | `0xb6e20814C913C81ECE72F213f8eBFA3A93A24567` |

### Block Explorer

Contracts are deployed on:

https://sepolia.etherscan.io/

Verified contracts can be inspected directly through their contract addresses.

## Architecture

The protocol is composed of several independent Solidity contracts:

### WTFToken

ERC-20 token used throughout the protocol.

Responsibilities:
- ERC-20 transfers
- Token balances
- Initial token supply

### VestingWTF

Token vesting contract supporting:

- Beneficiary grants
- Configurable start time
- Cliff period
- Linear vesting
- Partial claims
- Completed vesting
- Owner-controlled grant creation

### EmployerStaking

Employer staking mechanism.

Responsibilities:
- Stake WTF tokens
- Track individual employer stakes
- Withdraw staked tokens
- Prevent zero-value operations
- Protect against reentrancy

### ProjectTank

Project investment and dividend distribution mechanism.

Responsibilities:
- Investor deposits
- Share accounting
- Multiple investments
- Dividend deposits
- Proportional dividend distribution
- Dividend accounting for new investors
- Claim protection

### WTFEscrow

Buyer/seller escrow mechanism.

Responsibilities:
- Create escrow agreements
- Lock buyer funds
- Buyer release
- Deadline refunds
- Buyer/seller disputes
- Owner dispute resolution
- Settlement protection
- Reentrancy protection

### WTFCounter

Simple ownership/access-control foundation contract used during the initial protocol implementation.

## Testing

Run the complete test suite:

```bash
npx hardhat test