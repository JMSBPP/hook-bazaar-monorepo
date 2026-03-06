# hooks-operator-avs: Solution Specification

## Problem Description

Hook integrators need trustless guarantees that hook implementations conform to advertised specifications. Traditional audits are:
- Point-in-time (don't catch runtime violations)
- Expensive (prohibitive for small hooks)
- Opaque (integrators must trust auditor reputation)

The system requires:
- Continuous behavioral verification against specifications
- Economic accountability via staked collateral
- Challenge mechanisms for false attestations
- Decentralized operator network for sampling

## Solution Overview

The `hooks-operator-avs` package implements an EigenLayer AVS for hook specification verification:

```mermaid
flowchart TB
    subgraph Context["hooks-operator-avs Context"]
        HookAttestationTaskManager["HookAttestationTaskManager<br/>(Task Coordination)"]
        HookAttestationServiceManager["HookAttestationServiceManager<br/>(Operator Management)"]
        AttestationRegistry["AttestationRegistry<br/>(Attestation Storage)"]
        HaaSVendorManagement["HaaSVendorManagement<br/>(License NFTs)"]
        ClearingHouse["ClearingHouse<br/>(Bonded Engagement)"]
        EscrowCoordinator["EscrowCoordinator<br/>(Bond Management)"]
        HookStateSampler["HookStateSampler<br/>(On-chain Sampling)"]
    end

    subgraph OffChain["Off-Chain Components"]
        OperatorRuntime["Operator Runtime<br/>(TypeScript)"]
        SpecParser["Spec Parser"]
        ComplianceChecker["Compliance Checker"]
        StateSampler["State Sampler"]
    end

    HookDeveloper["Hook Developer"] -->|"commitToHookSpec"| HaaSVendorManagement
    HookDeveloper -->|"postBond"| EscrowCoordinator
    HookDeveloper -->|"acceptBondedEngagement"| ClearingHouse

    Requester["Attestation Requester"] -->|"createAttestationTask"| HookAttestationTaskManager

    OperatorRuntime -->|"listen events"| HookAttestationTaskManager
    OperatorRuntime -->|"fetch spec"| IPFS["IPFS"]
    OperatorRuntime -->|"sample state"| HookStateSampler
    OperatorRuntime -->|"respondToAttestationTask"| HookAttestationTaskManager

    HookAttestationTaskManager -->|"recordAttestation"| AttestationRegistry
    HookAttestationTaskManager -->|"slashOperator"| HookAttestationServiceManager

    HookAttestationServiceManager -->|"register/deregister"| EigenLayer["EigenLayer AVSDirectory"]
    ClearingHouse -->|"register"| RegistryCoordinator["RegistryCoordinator"]
    EscrowCoordinator -->|"deposit"| StrategyManager["StrategyManager"]
```

## Component Responsibilities

| Contract | Source | Responsibility |
|----------|--------|----------------|
| `HookAttestationTaskManager` | [src/hooks-operator-avs/HookAttestationTaskManager.sol](../../contracts/src/hooks-operator-avs/HookAttestationTaskManager.sol) | Task creation, response handling, challenge processing |
| `HookAttestationServiceManager` | [src/hooks-operator-avs/HookAttestationServiceManager.sol](../../contracts/src/hooks-operator-avs/HookAttestationServiceManager.sol) | Operator registration, stake management, slashing |
| `AttestationRegistry` | [src/hooks-operator-avs/AttestationRegistry.sol](../../contracts/src/hooks-operator-avs/AttestationRegistry.sol) | Attestation storage, validity, revocation |
| `HaaSVendorManagement` | [src/hooks-operator-avs/HaaSVendorManagement.sol](../../contracts/src/hooks-operator-avs/HaaSVendorManagement.sol) | HookLicense NFT minting, developer registration |
| `ClearingHouse` | [src/hooks-operator-avs/ClearingHouse.sol](../../contracts/src/hooks-operator-avs/ClearingHouse.sol) | Bonded engagement acceptance/termination |
| `EscrowCoordinator` | [src/hooks-operator-avs/EscrowCoordinator.sol](../../contracts/src/hooks-operator-avs/EscrowCoordinator.sol) | Bond posting, release, slashing |
| `HookStateSampler` | [src/hooks-operator-avs/HookStateSampler.sol](../../contracts/src/hooks-operator-avs/HookStateSampler.sol) | On-chain state sampling for hooks |

## Off-Chain Operator Components

| Module | Source | Responsibility |
|--------|--------|----------------|
| `HookAttestationAVS` | [operator/src/HookAttestationAVS.ts](../../operator/src/HookAttestationAVS.ts) | Main runtime, event listener, response submission |
| `processor` | [operator/src/processor.ts](../../operator/src/processor.ts) | Task processing orchestration |
| `specParser` | [operator/src/specParser.ts](../../operator/src/specParser.ts) | Specification fetching and parsing |
| `complianceChecker` | [operator/src/complianceChecker.ts](../../operator/src/complianceChecker.ts) | State sample verification against spec |
| `stateSampler` | [operator/src/stateSampler.ts](../../operator/src/stateSampler.ts) | State collection from hooks |

## Attestation Task Workflow

```mermaid
sequenceDiagram
    participant Requester
    participant TaskManager as HookAttestationTaskManager
    participant Operator as Operator Runtime
    participant Hook as Hook Contract
    participant Spec as IPFS (Specification)
    participant Registry as AttestationRegistry

    %% Task Creation
    Requester->>TaskManager: createAttestationTask(hook, specURI, poolIds, callbacks, sampleCount)
    TaskManager-->>TaskManager: store task, emit AttestationTaskCreated

    %% Operator Processing
    Operator->>TaskManager: listen AttestationTaskCreated
    TaskManager-->>Operator: task details

    Operator->>Spec: fetch specification
    Spec-->>Operator: HookSpecification JSON

    loop For each pool x callback
        Operator->>Hook: sample pre-state
        Hook-->>Operator: state variables
        Note over Operator: Execute callback (simulated)
        Operator->>Hook: sample post-state
        Hook-->>Operator: state variables
        Operator-->>Operator: verify against spec invariants
    end

    %% Response Submission
    alt All samples compliant
        Operator->>TaskManager: respondToAttestationTask(task, response{specCompliant: true}, signature)
        TaskManager->>Registry: recordAttestation(hook, specURI, taskIndex, responseHash)
        Registry-->>Registry: store attestation with 30-day expiry
        TaskManager-->>Requester: TaskCompleted(taskIndex, true)
    else Non-compliant samples found
        Operator->>TaskManager: respondToAttestationTask(task, response{specCompliant: false}, signature)
        TaskManager-->>Requester: TaskCompleted(taskIndex, false)
    end
```

## Challenge Mechanism

```mermaid
sequenceDiagram
    participant Challenger
    participant TaskManager as HookAttestationTaskManager
    participant Registry as AttestationRegistry
    participant ServiceManager as HookAttestationServiceManager

    %% False Positive Challenge
    alt Challenge False Positive (hook attested but non-compliant)
        Challenger->>TaskManager: challengeFalsePositive(task, response, counterSample)
        TaskManager-->>TaskManager: verify counterSample proves non-compliance
        alt Challenge successful
            TaskManager->>Registry: revokeAttestation(hook, "Challenge successful")
            TaskManager->>ServiceManager: slashOperator(operator, FALSE_POSITIVE, evidence)
            TaskManager-->>Challenger: AttestationChallenged(taskIndex, challenger, true)
        else Challenge failed
            TaskManager-->>Challenger: AttestationChallenged(taskIndex, challenger, false)
        end
    end

    %% False Negative Challenge
    alt Challenge False Negative (hook rejected but compliant)
        Challenger->>TaskManager: challengeFalseNegative(task, response, complianceSamples)
        TaskManager-->>TaskManager: verify samples prove compliance
        alt Challenge successful
            TaskManager->>Registry: recordAttestation(hook, specURI, taskIndex, hash)
            TaskManager->>ServiceManager: slashOperator(operator, FALSE_NEGATIVE, evidence)
            TaskManager-->>Challenger: AttestationChallenged(taskIndex, challenger, true)
        else Challenge failed
            TaskManager-->>Challenger: AttestationChallenged(taskIndex, challenger, false)
        end
    end
```

## State Transition Diagram: Attestation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> NoAttestation: Hook deployed

    NoAttestation --> TaskPending: createAttestationTask()

    TaskPending --> TaskResponded: respondToAttestationTask()
    TaskPending --> TaskExpired: TASK_RESPONSE_WINDOW_BLOCK exceeded

    TaskResponded --> Attested: specCompliant = true
    TaskResponded --> NotAttested: specCompliant = false

    Attested --> ChallengePeriod: within TASK_CHALLENGE_WINDOW_BLOCK
    ChallengePeriod --> AttestationValid: no successful challenge
    ChallengePeriod --> AttestationRevoked: challengeFalsePositive() succeeds

    AttestationValid --> AttestationExpired: 30 days elapsed
    AttestationExpired --> TaskPending: renewAttestation() requested

    NotAttested --> TaskPending: challengeFalseNegative() succeeds
```

## Slashing Conditions

| Offense | Slash Percentage | Condition |
|---------|-----------------|-----------|
| `OPERATOR_COLLUSION` | 100% | Multiple operators coordinate false attestations |
| `FALSE_POSITIVE` | 50% | Attested non-compliant hook as compliant |
| `FALSE_NEGATIVE` | 30% | Rejected compliant hook as non-compliant |
| `SAMPLE_MANIPULATION` | 20% | Tampered with state sampling |

## Bonded Engagement Flow

```mermaid
sequenceDiagram
    participant Developer as Hook Developer
    participant Vendor as HaaSVendorManagement
    participant Escrow as EscrowCoordinator
    participant Clearing as ClearingHouse
    participant Registry as RegistryCoordinator

    %% Developer Registration
    Developer->>Vendor: commitToHookSpec(specURI, signature, operatorAccount)
    Vendor-->>Developer: licenseId (NFT minted)

    %% Bond Posting
    Developer->>Escrow: postBond(licenseId)
    Note over Escrow: Transfer tokens, deposit to strategy
    Escrow-->>Developer: BondPosted event

    %% Engagement Acceptance
    Developer->>Clearing: acceptBondedEngagement(signature, licenseId)
    Clearing->>Vendor: validate license, get params
    Clearing->>Registry: registerOperator(quorumNumbers, socket, params)
    Clearing-->>Developer: BondedEngagementAccepted event

    %% Service Delivery
    Note over Developer: Provide HaaS services

    %% Termination
    alt Successful completion
        Developer->>Clearing: terminateBondedEngagement(licenseId, reason)
        Clearing->>Registry: deregisterOperator(quorumNumbers)
        Note over Escrow: Bond locked for 7 days
        Developer->>Escrow: releaseBond(licenseId)
        Escrow-->>Developer: Bond returned
    else Non-compliance
        Note over Escrow: Owner calls slashBond
        Escrow-->>Developer: Partial/full bond slashed
    end
```

## Data Structures

```solidity
// AttestationTask
struct AttestationTask {
    address hook;
    string specificationURI;
    bytes32[] poolIds;
    bytes4[] callbacks;
    uint32 sampleCount;
    uint32 taskCreatedBlock;
    bytes quorumNumbers;
    uint32 quorumThresholdPercentage;
}

// Attestation
struct Attestation {
    bytes32 attestationId;
    address hook;
    string specificationURI;
    bool isValid;
    uint256 attestedAt;
    uint256 expiresAt;
    uint32 taskIndex;
    bytes32 responsesHash;
}

// HookLicense
struct HookLicense {
    uint256 licenseId;
    StrategyParams[] haasStrategies;
    address socketManager;
}

// BondDetails
struct BondDetails {
    IERC20 paymentToken;
    uint256 bondAmount;
    uint256 depositedAmount;
    address depositor;
    uint256 lockedUntil;
    bool isActive;
}
```

## Constants

| Constant | Value | Contract |
|----------|-------|----------|
| `TASK_RESPONSE_WINDOW_BLOCK` | 100 blocks | HookAttestationTaskManager |
| `TASK_CHALLENGE_WINDOW_BLOCK` | 200 blocks | HookAttestationTaskManager |
| `COMPLIANCE_TOLERANCE` | 100 bps (1%) | HookAttestationTaskManager |
| `ATTESTATION_VALIDITY_PERIOD` | 30 days | AttestationRegistry |
| `BOND_LOCK_PERIOD` | 7 days | EscrowCoordinator |
