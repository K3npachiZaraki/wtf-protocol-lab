WTF Protocol Lab



Protocol Documentation  |  Independent Solidity/Web3 Portfolio Project



An independent implementation of a modular smart-contract protocol covering token management, vesting, employer staking, project investment/dividends, and token escrow with dispute resolution.



1\. Overview



WTF Protocol Lab is an independent Solidity/Web3 portfolio implementation covering a set of core protocol primitives:



WTFToken — ERC-20 token



VestingWTF — token vesting and claiming



EmployerStaking — employer token staking



ProjectTank — project investment and dividend distribution



WTFEscrow — token escrow with refunds and dispute resolution



WTFCounter — basic ownership and state-management example



This repository is an independent implementation and is not the World Trade Future production codebase.



2\. Actors



Owner — Performs privileged operations such as creating vesting grants, depositing project dividends, and resolving escrow disputes.



Token Holder — Holds and transfers WTF and can interact with protocol components that accept WTF.



Employer — Can stake WTF and later withdraw their available stake.



Investor — Funds a project through ProjectTank and receives a proportional entitlement to deposited dividends.



Buyer — Deposits tokens into an escrow and can release funds to the seller or request a refund after the deadline.



Seller — Receives escrow funds when released or when a dispute is resolved in the seller's favor.



3\. Protocol Components



WTFToken



The protocol's ERC-20 token and underlying token used by staking, vesting, and escrow components.



EmployerStaking



Allows employers to lock WTF tokens and later withdraw their available stake. It prevents zero-value operations and withdrawals above the recorded stake.



ProjectTank



Provides investment and dividend distribution using USDC. Investors receive shares and dividends are distributed according to share ownership.



VestingWTF



Provides owner-created token grants with start, cliff, vesting duration, and claim accounting.



WTFEscrow



Provides buyer/seller token escrow with release, deadline refunds, disputes, and owner resolution.



4\. Token Flows



WTF Token



Token Holder

&#x20;    |

&#x20;    | WTF

&#x20;    v

EmployerStaking

&#x20;    |

&#x20;    | withdrawal

&#x20;    v

Employer



Owner

&#x20; |

&#x20; | WTF

&#x20; v

VestingWTF

&#x20; |

&#x20; | vested WTF

&#x20; v

Beneficiary



Buyer

&#x20; |

&#x20; | WTF

&#x20; v

WTFEscrow

&#x20; |

&#x20; +-------> Seller

&#x20; |

&#x20; +-------> Buyer (refund)



5\. Investment and Dividend Flow



Investor

&#x20;  |

&#x20;  | USDC

&#x20;  v

ProjectTank

&#x20;  |

&#x20;  | shares

&#x20;  v

Investor



Owner

&#x20; |

&#x20; | USDC dividends

&#x20; v

ProjectTank

&#x20; |

&#x20; +---- Investor A

&#x20; +---- Investor B

&#x20; +---- Investor C



Dividend entitlement is proportional to investor share ownership. Shares created by later investments do not receive dividends deposited before those shares existed.



6\. Vesting Model



The vesting schedule is based on elapsed time.



Before cliff:

Claimable = 0



During vesting:

Vested Amount =

&#x20;   Total Amount × Elapsed Time

&#x20;   ----------------------------

&#x20;      Vesting Duration



After vesting duration:

Vested Amount = Total Grant



Claimable =

&#x20;   Vested Amount - Previously Claimed



The contract validates a non-zero beneficiary and grant amount, a positive vesting duration, and a cliff that does not exceed the vesting duration.



7\. Staking Model



stakes\[employer] = amount currently staked



Employer

&#x20;  |

&#x20;  | WTF

&#x20;  v

EmployerStaking

&#x20;  |

&#x20;  | +amount

&#x20;  v

Employer stake balance



EmployerStaking

&#x20;  |

&#x20;  | -amount

&#x20;  v

Employer



Each employer has an independent stake balance. An employer cannot withdraw more than the amount recorded for that employer.



8\. Escrow Lifecycle



Created / Funded

&#x20;      |

&#x20;      +------> Released

&#x20;      |

&#x20;      +------> Refunded

&#x20;      |

&#x20;      +------> Disputed

&#x20;                   |

&#x20;                   +----> Resolved for Buyer

&#x20;                   |

&#x20;                   +----> Resolved for Seller



Settlement is terminal. Once an escrow has been released, refunded, or resolved, it cannot be settled again.



9\. Access Control



VestingWTF — only the owner can create grants.



ProjectTank — only the owner can deposit dividends.



WTFEscrow — only the owner can resolve disputes.



User-facing operations remain restricted by participant identity and escrow/protocol state.



10\. Security Model



Boundary validation for zero addresses, zero amounts, invalid durations, deadlines, participants, and contract state.



Reentrancy protection using OpenZeppelin ReentrancyGuard where appropriate.



A malicious token implementation is included to exercise the escrow reentrancy defense.



Escrow settlement is state-based to prevent double settlement and invalid transitions.



ProjectTank maintains individual dividend accounting to isolate investor entitlements.



11\. Testing



The current local test suite reports:



73 passing



Tests cover successful operations, invalid inputs, access control, accounting, state transitions, edge cases, dividend distribution, vesting behavior, escrow disputes, settlement, and reentrancy protection.



12\. Static Security Analysis



The contracts have been analyzed using Slither. The review was used to identify potential reentrancy concerns, timestamp usage, missing validation, compiler-version concerns, naming issues, and inheritance recommendations. Findings were reviewed in the context of the intended contract behavior.



13\. Deployment



The protocol has been deployed to Ethereum Sepolia for development and demonstration purposes.



WTFToken



EmployerStaking



ProjectTank



VestingWTF



WTFEscrow



WTFCounter



Contract addresses and verification information are maintained as part of the deployment documentation. Sepolia deployments are testnet deployments and should not be treated as production deployments.



14\. Scope and Limitations



Portfolio and learning implementation; not production financial infrastructure.



Economic parameters are simplified.



Governance is simplified and the owner represents centralized administrative authority.



Project investment mechanics are simplified.



No production frontend or production key-management system is included.



A professional third-party audit is not claimed.



15\. Design Principles



Tests before feature work.



Explicit requirements and boundary validation.



Clear state transitions.



Least-privilege access control.



Reentrancy awareness.



Security findings are documented rather than hidden.



Simple and auditable contract logic.



Testnet-first deployment.



No claim of affiliation with the World Trade Future production codebase.



16\. Overall Architecture



&#x20;                        WTF Protocol Lab

&#x20;                              |

&#x20;         +--------------------+--------------------+

&#x20;         |                    |                    |

&#x20;         v                    v                    v

&#x20;     WTFToken           ProjectTank         EmployerStaking

&#x20;         |                    |                    |

&#x20;         v                    v                    v

&#x20;    VestingWTF          USDC / Shares          WTF Stakes

&#x20;         |

&#x20;         v

&#x20;    Beneficiaries



&#x20;                        WTFEscrow

&#x20;                            |

&#x20;                 +----------+----------+

&#x20;                 |                     |

&#x20;               Buyer                  Seller

&#x20;                 |

&#x20;                 v

&#x20;            WTF Tokens

&#x20;                 |

&#x20;                 v

&#x20;         Release / Refund

&#x20;                 |

&#x20;                 v

&#x20;            Disputes



17\. Current Status



Smart contracts implemented



73 local tests passing



Security-focused tests implemented



Slither analysis performed



Sepolia deployment completed



Contracts verified on the block explorer



Architecture documentation completed



Protocol documentation completed



Remaining project work is focused on final security documentation, deployment documentation, README/portfolio presentation, and final project review.

