# SDD-001: WTFCounter

## 1. Purpose

WTFCounter is a minimal Solidity contract used to validate the project's
development, testing, and deployment workflow.

It maintains a counter and provides a controlled reset operation.

## 2. Scope

### In scope

- Store a counter value.
- Identify the contract owner.
- Allow any account to increment the counter.
- Allow only the owner to reset the counter.
- Emit an event when the counter is incremented.

### Out of scope

- Ownership transfer.
- Pausing.
- Upgradeability.
- Access control on increment.
- Token functionality.
- External contract interactions.

## 3. Actors

### Owner

The account that deploys the contract.

The owner is permitted to reset the counter.

### Public user

Any Ethereum account.

A public user may increment the counter.

## 4. State

### count

Type: uint256

Initial value: 0.

Represents the current counter value.

### owner

Type: address

Set to msg.sender during deployment.

Represents the account authorized to reset the counter.

## 5. Functional Requirements

### REQ-COUNTER-001 — Initial state

When the contract is deployed:

- `count` MUST equal `0`.
- `owner` MUST equal the deploying account.

### REQ-COUNTER-002 — Increment

Any account MUST be able to call `increment()`.

Each successful call MUST increase `count` by exactly `1`.

### REQ-COUNTER-003 — Increment event

Each successful call to `increment()` MUST emit `CountIncremented`.

The event MUST contain:

- the caller's address
- the new counter value

### REQ-COUNTER-004 — Owner reset

The owner MUST be able to call `reset()`.

A successful reset MUST set `count` to `0`.

### REQ-COUNTER-005 — Unauthorized reset

An account other than the owner MUST NOT be able to reset the counter.

The transaction MUST revert.

## 6. Security Requirements

- Reset MUST enforce owner authorization.
- The contract MUST NOT expose a function allowing arbitrary accounts
  to modify ownership.
- No external contract calls are required.
- Arithmetic MUST use Solidity 0.8.x checked arithmetic.

## 7. Acceptance Criteria

The implementation is accepted when:

- [ ] The contract compiles successfully.
- [ ] The initial owner is correct.
- [ ] The initial count is zero.
- [ ] A user can increment the counter.
- [ ] Increment increases the value by exactly one.
- [ ] Increment emits the correct event.
- [ ] Owner can reset the counter.
- [ ] Non-owner reset attempts revert.
- [ ] All automated tests pass.

## 8. Test Traceability

| Requirement | Test |
|---|---|
| REQ-COUNTER-001 | sets the deployer as owner / starts at zero |
| REQ-COUNTER-002 | increments the counter and emits an event |
| REQ-COUNTER-003 | increments the counter and emits an event |
| REQ-COUNTER-004 | allows only the owner to reset |
| REQ-COUNTER-005 | rejects reset from a non-owner |

## 9. Implementation Status

Status: Implemented.

Local compilation: PASS.

Local tests: 5/5 PASS.

Sepolia deployment: Pending.
