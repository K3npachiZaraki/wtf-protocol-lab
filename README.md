# WTF Protocol Lab

An independent Solidity/Web3 portfolio project implementing a modular protocol across tokenization, vesting, employer staking, project investment, and escrow/dispute workflows.

> This repository is an independent implementation and is not the World Trade Future production codebase.

## Status

**Portfolio-ready testnet implementation**

- 73 tests passing
- Slither security analysis completed
- Security-focused reentrancy test included
- Deployed to Ethereum Sepolia
- Contracts verified on the Sepolia block explorer
- Architecture, protocol, security, and deployment documentation completed

## Contracts

| Contract | Purpose |
|---|---|
| `WTFToken` | ERC-20 protocol token |
| `VestingWTF` | Token vesting and claims |
| `EmployerStaking` | Employer token staking |
| `ProjectTank` | Investment shares and dividend distribution |
| `WTFEscrow` | Buyer/seller escrow with disputes |
| `WTFCounter` | Foundational contract/example |
| `ReentrantToken` | Malicious token used for reentrancy testing |

## Architecture

The protocol is divided into independent contracts with focused responsibilities:

- Token layer
- Vesting layer
- Staking layer
- Investment/dividend layer
- Escrow and dispute layer

See [`docs/arch.md`](docs/arch.md).

## Security

Security was treated as a first-class development concern.

Current security work includes:

- Access-control tests
- Boundary/input validation
- Double-claim protection
- Double-settlement protection
- Escrow state-machine testing
- Malicious-token reentrancy testing
- Slither static analysis
- Documented security findings and limitations

See [`docs/security-review.md`](docs/security-review.md).

## Testing

Current test result:

**73 passing**

Run locally:

```bash
npm install
npm run compile
npm test