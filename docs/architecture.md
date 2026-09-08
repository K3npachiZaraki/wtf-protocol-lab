WTF Protocol Lab — Architecture



Overview



WTF Protocol Lab is a modular Solidity/Web3 protocol implementation built around the WTF ERC-20 token.



The system separates token custody, employer staking, employee vesting, project investment, and trade settlement into independent smart contracts.



The contracts are designed to be independently testable while interacting through the ERC-20 token interface.



System Architecture



&#x20;                        ┌─────────────────┐

&#x20;                        │    WTFToken     │

&#x20;                        │    ERC-20       │

&#x20;                        └────────┬────────┘

&#x20;                                 │

&#x20;             ┌───────────────────┼───────────────────┐

&#x20;             │                   │                   │

&#x20;             ▼                   ▼                   ▼

&#x20;    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐

&#x20;    │ EmployerStaking │ │   VestingWTF    │ │   WTFEscrow     │

&#x20;    │                 │ │                 │ │                 │

&#x20;    │ Employer stake  │ │ Token grants    │ │ Trade settlement│

&#x20;    └─────────────────┘ └─────────────────┘ │ + disputes      │

&#x20;                                            └─────────────────┘



&#x20;                        ┌─────────────────┐

&#x20;                        │   ProjectTank   │

&#x20;                        │                 │

&#x20;                        │ Investment +    │

&#x20;                        │ dividends       │

&#x20;                        └────────┬────────┘

&#x20;                                 │

&#x20;                                 ▼

&#x20;                              USDC



Contracts



WTFToken



WTFToken.sol implements the protocol's ERC-20 token.



Responsibilities:



Define the WTF token.



Establish the initial token supply.



Assign the initial supply to the deployer.



Provide standard ERC-20 transfers and allowances.



The token does not implement protocol business logic. Other contracts interact with it through the ERC-20 interface.



EmployerStaking



EmployerStaking.sol allows employers to lock WTF tokens.



Flow:



Employer

&#x20;  │

&#x20;  │ approve()

&#x20;  ▼

EmployerStaking

&#x20;  │

&#x20;  ├── records stake

&#x20;  │

&#x20;  └── holds WTF



An employer calls stake(amount) after approving the staking contract.



The contract records the employer's balance in:



stakes\[address]



An employer can later call withdraw(amount) subject to their recorded stake.



ReentrancyGuard protects both state-changing entry points.



VestingWTF



VestingWTF.sol manages token grants with a cliff and linear vesting period.



Flow:



Owner

&#x20; │

&#x20; │ createGrant()

&#x20; ▼

VestingWTF

&#x20; │

&#x20; ├── holds WTF

&#x20; │

&#x20; └── records Grant

&#x20;          │

&#x20;          ▼

&#x20;      Beneficiary

&#x20;          │

&#x20;          │ claim()

&#x20;          ▼

&#x20;         WTF



Each grant contains:



total amount



start timestamp



cliff duration



vesting duration



amount already claimed



Before the cliff, the vested amount is zero.



During the vesting period, the vested amount increases linearly.



After the vesting period completes, the entire grant becomes vested.



Claims are protected against reentrancy and double claiming.



ProjectTank



ProjectTank.sol manages investor funding and dividend distribution.



Investors deposit USDC and receive shares.



Investor

&#x20;  │

&#x20;  │ invest()

&#x20;  ▼

ProjectTank

&#x20;  │

&#x20;  ├── USDC custody

&#x20;  ├── investor shares

&#x20;  └── totalShares

&#x20;          ▲

&#x20;          │

&#x20;     Owner deposits

&#x20;      dividends



Dividend accounting uses an accumulated dividend-per-share model.



The contract tracks:



shares\[investor]



totalShares



accDividendPerShare



rewardDebt\[investor]



This allows dividends to be distributed proportionally according to investor shares while preventing newly acquired shares from receiving previously deposited dividends.



WTFEscrow



WTFEscrow.sol provides token-based trade settlement.



The basic lifecycle is:



&#x20;                ┌──────────────┐

&#x20;                │    Funded    │

&#x20;                └──────┬───────┘

&#x20;                       │

&#x20;            ┌──────────┼──────────┐

&#x20;            │          │          │

&#x20;            ▼          ▼          ▼

&#x20;         Release     Refund     Dispute

&#x20;            │          │          │

&#x20;            ▼          ▼          ▼

&#x20;         Settled    Settled    Resolved



The buyer creates an escrow and deposits tokens into the contract.



The buyer can release funds to the seller.



After the deadline, the buyer can refund the locked funds.



Either escrow party can raise a dispute while the escrow is active.



The owner/arbitrator can resolve a dispute in favour of either the buyer or seller.



State transitions prevent an escrow from being settled more than once.



ReentrancyGuard protects token-release operations.



Trust Boundaries



ERC-20 token



The protocol depends on the correctness of the ERC-20 implementation used by each contract.



Owner-controlled operations



The following contracts contain privileged operations:



VestingWTF — grant creation



ProjectTank — dividend deposits



WTFEscrow — dispute resolution



These permissions represent explicit administrative trust assumptions.



Time



Vesting and escrow deadlines depend on block.timestamp.



Timestamp-based logic is appropriate for these coarse-grained time windows, but should not be treated as an exact source of time.



External token calls



The protocol performs ERC-20 transfer and transferFrom calls.



State-changing functions that transfer tokens are therefore treated as external-call boundaries.



Security Architecture



The project uses several defensive mechanisms:



OpenZeppelin Ownable for privileged functions.



OpenZeppelin ReentrancyGuard for sensitive token flows.



Explicit zero-address validation.



Explicit zero-amount validation.



State checks before withdrawals and settlement.



Tests for unauthorized callers.



Tests for invalid lifecycle transitions.



Dedicated ReentrantToken test contract for adversarial reentrancy testing.



Slither static analysis.



The reentrancy test specifically attempts to call escrow release() again from inside a token transfer, verifying that the escrow cannot be re-entered.



Testing Architecture



The project uses Hardhat and TypeScript tests.



Test coverage includes:



happy-path behaviour



zero-value inputs



invalid addresses



unauthorized access



repeated claims



repeated settlement



deadline enforcement



proportional dividend distribution



vesting calculations



reentrancy attempts



Current test status:



73 tests passing.



Coverage:



Statements: 98.8%



Branches: 79.84%



Functions: 100%



Lines: 97.41%



Deployment Architecture



The contracts have been deployed to Ethereum Sepolia.



Deployment is automated through:



scripts/deploy.ts



The deployment sequence deploys the WTF token first and then deploys the protocol contracts using the token address where required.



The project also contains the original WTFCounter deployment used during the foundation stage.



Development Philosophy



The project follows:



Tests before feature work.



Explicit validation at contract boundaries.



Security testing alongside functional testing.



Small, independently understandable contracts.



Automated static analysis.



Testnet deployment before any consideration of mainnet deployment.



This architecture is intended as a learning and portfolio implementation. It is not presented as production code for the World Trade Future protocol.

