## Week 1 — Sepolia Deployment

WTFCounter deployed successfully to Ethereum Sepolia.

**Contract:** `WTFCounter`

**Address:** `0x20390cA594F03F70526663778d9d0251F3cbced9`

**Network:** Ethereum Sepolia

# WTF Protocol Lab

An independent Solidity/Web3 portfolio project inspired by a six-week smart-contract development specification.

> This repository is an independent implementation and is not the World Trade Future production codebase.

## Current status

### Week 1 — Foundation
- [x] WTFCounter contract
- [x] Local unit tests
- [ ] Sepolia deployment
- [ ] Deployment address documented

### Planned
- [ ] WTFToken
- [ ] VestingWTF
- [ ] EmployerStaking
- [ ] ProjectTank
- [ ] WTFEscrow
- [ ] Escrow security review
- [ ] Dispute mechanism
- [ ] Slither / Mythril review
- [ ] Coverage report

## Setup

Requires Node.js 18+.

```bash
npm install
npm run compile
npm test
```

## Sepolia deployment

Copy `.env.example` to `.env` and configure a Sepolia RPC URL and a funded testnet private key.

Then:

```bash
npm run deploy:counter
```

Never commit `.env` or a real private key.

## Project principles

- Tests before feature work.
- Security findings are documented with reproduction steps.
- Contract behavior is derived from explicit requirements and tested at the boundary.
- No claim is made that this repository is affiliated with or deployed by World Trade Future.
