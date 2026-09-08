\# SDD — WTF Protocol Standalone Implementation



\## 1. Purpose



Build a standalone implementation of the core WTF protocol

architecture for learning and portfolio development.



This implementation is based on the six-week Solidity Developer

Brief and is not the production WTF codebase.



\---



\## 2. Contracts



\### 2.1 WTFToken



\#### Purpose



Provide the protocol's ERC-20 token.



\#### Requirements



\- Must follow the ERC-20 standard.

\- Must have a fixed initial supply.

\- Must not allow additional tokens to be minted after deployment.

\- Initial supply must be assigned at deployment.

\- Token holders must be able to transfer tokens.



\#### Design



WTFToken inherits ERC-20 functionality from OpenZeppelin.



The initial supply is created during deployment and assigned to

the deployer.



No public mint function is exposed, making the token supply fixed

after deployment.



Standard ERC-20 transfers are supported.



\#### Security



\- No public mint function.

\- Supply cannot be increased after deployment.



\---



\### 2.2 VestingWTF



\#### Purpose



Manage token grants that become claimable over time.



\#### Requirements



\- A beneficiary receives a token grant.

\- Tokens are subject to a cliff.

\- Tokens become claimable after the cliff.

\- Tokens vest linearly after the cliff.

\- The beneficiary can claim vested tokens.

\- Unvested tokens cannot be claimed.

\- Previously claimed tokens cannot be claimed again.



\#### Design



Each vesting grant records:



\- Beneficiary

\- Total token amount

\- Start time

\- Cliff duration

\- Vesting duration

\- Amount already claimed



The contract calculates how many tokens have vested based on

the current blockchain timestamp.



\#### Security



\- Only authorized users can create grants.

\- Beneficiaries can only claim their own vested tokens.

\- Claims cannot exceed the vested amount.

\- The same tokens cannot be claimed twice.



\---



\### 2.3 EmployerStaking



\#### Purpose



Allow employers to stake WTF tokens as an economic reputation signal.



\#### Requirements



\- Employers can deposit WTF tokens into the staking contract.

\- The contract records each employer's stake.

\- Employers can withdraw their stake according to the protocol rules.

\- The contract must accurately track balances.

\- Unauthorized users must not be able to modify another employer's stake.



\#### Design



The contract maintains the amount of WTF tokens staked by each employer.



Staked tokens are transferred from the employer to the staking

contract.



The employer's stake acts as a signal of economic commitment and

reputation.



\#### Security



\- Stake balances must be tracked accurately.

\- Withdrawals cannot exceed the employer's deposited amount.

\- Token transfers must be validated.

\- Users cannot withdraw another employer's stake.



\---



\### 2.4 ProjectTank



\#### Purpose



Manage project funding from investors.



\#### Requirements



\- Investors can provide USDC to a project.

\- Investor contributions are recorded.

\- Investors receive shares representing their participation.

\- The system supports dividend distribution.

\- Investor balances must be tracked accurately.



\#### Design



USDC is used as the funding asset.



The contract records investor contributions and assigns shares

according to the project's rules.



The contract can distribute dividends to eligible shareholders.



\#### Security



\- Only valid investors can receive shares.

\- Contributions must be correctly accounted for.

\- Dividend calculations must use accurate share balances.

\- Unauthorized users cannot modify investor balances.



\---



\### 2.5 WTFEscrow



\#### Purpose



Provide secure trade settlement between a buyer and seller.



\#### Requirements



\- Buyer and seller are identified.

\- WTF tokens can be deposited into escrow.

\- Funds remain locked until settlement conditions are met.

\- Funds can be released according to the agreed conditions.

\- Refunds must be handled correctly.

\- Unauthorized users must not control escrowed funds.

\- Double release must be prevented.



\#### Design



The escrow contract holds WTF tokens while a trade is active.



The contract tracks:



\- Buyer

\- Seller

\- Amount

\- Trade status

\- Deadline



When the required settlement condition is met, the escrowed

tokens are transferred to the appropriate party.



\#### Security



\- Only authorized parties can perform restricted actions.

\- Escrowed funds cannot be withdrawn arbitrarily.

\- A completed escrow cannot be settled again.

\- Refunds cannot exceed the escrowed amount.

\- Reentrancy risks must be considered.

\- State changes must occur before external token transfers where

&#x20; appropriate.



\---



\## 3. Contract Relationships



```text

&#x20;                   WTFToken

&#x20;                      |

&#x20;       +--------------+--------------+

&#x20;       |              |              |

&#x20;       ↓              ↓              ↓

&#x20;  VestingWTF   EmployerStaking   WTFEscrow





&#x20;                   USDC

&#x20;                    |

&#x20;                    ↓

&#x20;               ProjectTank

