# WTF Protocol — Contract Summaries

## WTFToken

WTFToken is the protocol's ERC-20 token. It has a fixed initial
supply created at deployment. The initial supply is assigned to
the deployer. No public mint function exists, so additional tokens
cannot be created after deployment. The token supports standard
ERC-20 transfers.

## VestingWTF

VestingWTF manages token grants that become available over time.
Each grant has a beneficiary, amount, start time, cliff and
vesting duration. Tokens cannot be claimed before the cliff.
After the cliff, tokens vest according to the defined schedule.
The beneficiary can claim only the amount that has vested.

## EmployerStaking

EmployerStaking allows employers to deposit WTF tokens as an
economic reputation signal. Each employer has an independently
tracked stake. Staked tokens are held by the contract. Employers
can withdraw their own stake but cannot withdraw another
employer's stake.

## ProjectTank

ProjectTank manages project funding using USDC. Investors deposit
USDC and receive shares representing their participation.
The project owner can deposit dividends. Investors can claim their
share of available dividends based on their ownership.

## WTFEscrow

WTFEscrow holds WTF tokens during a trade. The buyer creates an
escrow specifying the seller, amount and deadline. The buyer can
release the funds to the seller, or receive a refund after the
deadline. Either party can raise a dispute and the authorized
owner can resolve the dispute by releasing the funds either to the
seller or back to the buyer.