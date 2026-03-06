# Hook Attestation AVS: Verification Without Code Disclosure

> **Status:** Architecture Design
> **Last Updated:** 2025-12-09
> **Prerequisites:** [State-Space Model](../mathematical-models/state-space-model.md)
> **References:** [EigenLayer Middleware](https://github.com/Layr-Labs/eigenlayer-middleware), [Incredible Squaring AVS](https://github.com/Layr-Labs/incredible-squaring-avs)

---

# Terminology
| Concept                      | Meaning                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| **AVS**                      | The service being secured; defines quorums and requirements               |
| **Operator**                 | Entity providing security/work                                            |
| **Quorum**                   | Configuration of what stake types an AVS accepts and how it weights them  |
| **Registering with quorums** | Operators aligning themselves to the AVS's defined security configuration |


| Your Concept                                                                                | Meaning                                                                                                             |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **HookSpec (HaaS)**                                                                         | The “service” definition — analogous to an AVS                                                                      |
| **HookDeveloper**                                                                           | The work-provider — analogous to an operator                                                                        |
| **HookContract**                                                                            | The functional object the developer activates                                                                       |
| **Bonded Participation**                                                                    | Your equivalent of “registration with stake”                                                                        |
| **Execution Bands / Functionality Sets / Capability Groups** *(your equivalent of quorums)* | A grouping/configuration of functional requirements or stake-weighted participation logic defined inside a HookSpec |


- A Researcher is a HookSpec generator role
    -  A Researcher posts HookSpec and compliant with StateSpaceModel and this HookSpec can be fullfilled by Hooks developed by HookDevelopers

- A HookSpec defines a AVS (AVS is verifiable SaaS => HookSpec > HaaS)

- A set of HookContracts is an on-chain AVS component of the HookSpec.
- A HookDeveloper operates HookContracts \in  HooksSpec

- HookDevelopers are operators which services Hooks are compliant with a HooksSpec_X

- A HookLicense is the permission(resgistration) to perform HookContracts \in HooksSpec_X

- HookDeveloper commits to do HookSpec by deploying the HooksContracts \in HookSpec

```solidity
struct HookLicense{
    uint256 licenseId;
    StrategyParams[] HaaS;
    ISocketManager socketManager;    
}
// - A HookLicense has a one-to-one retlation with a IStrategy
contract HaaSVendorManagement{

    struct HaaSVendorManagement{
        IServiceManager vendorManager;
        mapping(uint256 licenceId => IStrategyManager HaaS) hookLicenses;
    }

    function commitTo(
        HookSpec HookServiceSpec,
        ISignatureUtils.SignatureWithSaltAndExpiry termsAndConditionsSig,
        OperatorAccount operatorAccount
    ) external{

        vendorManager.registerOperatorToAVS(
            operatorAccount,
            termsAndConditionsSig
        );
        uint256 licenseId = ERC721Mod.mint();
        hookLicenses[licenseId] = IHookLicense; 

    }
}
```

##  System Architecture Overview
## Market Integration 

- The incorporation of a HooksContracts --> HaaS on pools is funded through funding a HookLicense Escrow-Conditioned Service Delivery (ECSD)

```solidity
contract EscrowCoordinator{

    struct EscrowCoordinatorStorage{
        IMarketOracle marketOracle;
        IStrategyManager depositStage;
        IHaaSVendorManagement vendorManagement;
    }

    function postBond(uint256 licenseId) external {
        (IERC20 paymentToken, uint256 bondAmount) = marketOracle.getBondDetails(licenseId);
        depositStage.deposit(vendorManagement.hookLicenses[licenceId],paymentToken,bondAmount);
    }
}

```
- Once an authorized protocol posts a bond to obtain a HookLicense and thereby gain access to specific pool functionality, the HookDeveloper enters an incentive-aligned engagement by committing functionality to the protocol—effectively a staked registration backed by a performance bond (**Registration With Stake**).

## [Registration With Stake (Quorums)](../../avs-integration/Quorums.md)

- The HookContracts ∈ HookSpec are a collection of modules that all semantically fulfill the HookSpec. Each module has a one-to-one relationship with a Quorum. In other words, each module has a multiplier that determines how much it contributes to the overall HookSpec and at what level of accuracy. Thus, the Quorum numbers represent the number of modules that compose the HookContracts codebase (or GitHub repository) maintained by the HookDeveloper.

```solidity

/**
* @notice In weighing a particular strategy, the amount of underlying asset for that strategy is
* multiplied by its multiplier, then divided by WEIGHTING_DIVISOR
*/
struct StrategyParams {
    IStrategy strategy;
    uint96 multiplier;
}

struct HookLicense{
    uint256 licenseId;
    StrategyParams[] HaaS;    
}
```


- Thus postBond receival on the respective HookLicense associated with HooksContracts the hookDeveloper ... and it's stake is calculated considering the importance (added value) that will provide to the pool relative to the Protocol pool


> HookDevelopers as operators

When HookDevelopers commit bonded participation for a HookContract within a HookSpec (HaaS), they sbmit their code base (from which quorumsAVS specific are calculated) within the HaaS (HookSpec) to register for.



There now exists a relationship between **HookDevelopers**, their **bonded participation**, and how HaaS define the security they want via quorums. 
    - [StakeRegistry]()
    - [IndexRegistry]()
    - [BLSApkRegistry]()

- Since we have a few registries that help our service manage state (both operator and stake state) we need a way to consistently interact with these registries and that's the role of the [RegistryCoordinator](../../avs-integration/RegistryCoordinator.md)

- **HookDevelopers** enter (commit bonded participation)  the system on [RegistryCoordinator](../../avs-integration/RegistryCoordinator.md)

```solidity

contract ClearingHouse{
    struct ClearingHouse{
        IRegistryCoordinator HaaSClearingCoordinator;
        IHaaSHub haasHub;
    }

    function acceptBondedEngagement(SignatureWithSaltAndExpiry memory operatorSignature,uint256 licenseId) external{
        (bytes memory quorumNumbers, IBLSApkRegistry.PubkeyRegistrationParams calldata params) = haasHub.getHaaSEngamentParams(licenseId);
        bytes memory socket = haasHub.getOperatorSocket(licenseId);
        HaaSClearingCoordinator.registerOperator(quorumNumbers, socket,params,operatorSignature);
    } 
}
```

- The HookDeveloper



## HookAttestationAVS (Offchain) 

- From now is a single operator that is paid by a weighted averga of protocol and hook developer bond 

- The HookAttestationAVS is the off-chain component of the HookSpec AVS, it proves the a HookContracts \in HookSpec
    - Verifies that HookContracts \in HokSpec are: 
        - Semantically compatilble with StateSpace model
        - Semantically equivalent with HookSpec
        - Provides a score and metrics


- It verifies hook implementations match their formal specifications **without revealing the source code**. The system enables **Hook developers** to prove their implementations are correct

- It has a I/O module with API endpoints to protocol desginers
    - The inputs are data protocol desginres wnat to prove calimed functionality againts (Thus mdoule needs pto provide sampling , statisical methods)
    - The OUtpues are the HookAttestationVS proof result agains the given data 

---



## 3. Core Components

### 3.1 Hook Specification Document (IPFS)

The hook developer creates a formal specification stored on IPFS:

```markdown
# Hook Specification: DynamicFeeHook v1.0.0

## 1. Hook Identity
- **Hook Address:** 0x... (deployed via Fhenix CoFHE)
- **Callbacks Implemented:** beforeSwap, afterSwap
- **Specification Hash:** QmXyz...

## 2. State Variables

### Hook State (H)
| Variable | Type | Description |
|----------|------|-------------|
| volatilityWindow | uint256 | Rolling window for volatility calculation |
| lastPrice | uint160 | Last recorded sqrtPriceX96 |
| feeMultiplier | uint24 | Dynamic fee adjustment factor |

### Pool State Dependencies (P)
- Reads: TRADER_SQRT_PRICE, TRADER_TICK, TRADER_LP_FEE
- Writes: TRADER_LP_FEE (via beforeSwap return)

## 3. State Transition Functions

### beforeSwap(H, P) → (H', δfee)

$$
\text{volatility} = |\sqrt{P}_{current} - \sqrt{P}_{last}| / \sqrt{P}_{last}
$$

$$
\text{feeMultiplier}' = \min(\text{MAX\_FEE}, \text{baseFee} \times (1 + \text{volatility} \times \text{sensitivity}))
$$

$$
\delta_{fee} = \text{feeMultiplier}' - \phi_{lp}
$$

### Constraints
- `0 <= feeMultiplier' <= MAX_FEE (10000 = 1%)`
- `volatility` computed over `volatilityWindow` blocks
- No state changes if `volatility < MIN_THRESHOLD`

## 4. Invariants

### INV-1: Fee Bounds
$$
\forall t: \text{baseFee} \leq \phi_{lp}(t) \leq \text{MAX\_FEE}
$$

### INV-2: Monotonic Volatility Response
$$
\text{volatility}_1 < \text{volatility}_2 \Rightarrow \phi_{lp,1} \leq \phi_{lp,2}
$$

## 5. Test Vectors

| Pre-State | Input | Expected Post-State |
|-----------|-------|---------------------|
| lastPrice=1e18, fee=3000 | sqrtP=1.01e18 | fee=3030 |
| lastPrice=1e18, fee=3000 | sqrtP=1.10e18 | fee=MAX_FEE |
| lastPrice=1e18, fee=3000 | sqrtP=1.001e18 | fee=3000 (no change) |
```

### 3.2 Task Manager Contract

Based on [Incredible Squaring AVS](https://github.com/Layr-Labs/incredible-squaring-avs/blob/master/contracts/src/IncredibleSquaringTaskManager.sol):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BLSSignatureChecker} from "@eigenlayer-middleware/src/BLSSignatureChecker.sol";
import {OperatorStateRetriever} from "@eigenlayer-middleware/src/OperatorStateRetriever.sol";
import {ISlashingRegistryCoordinator} from "@eigenlayer-middleware/src/interfaces/ISlashingRegistryCoordinator.sol";

/// @title IHookAttestationTaskManager
/// @notice Task manager for hook specification verification
interface IHookAttestationTaskManager {

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event AttestationTaskCreated(
        uint32 indexed taskIndex,
        AttestationTask task
    );

    event AttestationTaskResponded(
        uint32 indexed taskIndex,
        AttestationResponse response,
        AttestationResponseMetadata metadata
    );

    event AttestationChallenged(
        uint32 indexed taskIndex,
        address indexed challenger,
        bool challengeSuccessful
    );

    // ═══════════════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice An attestation task to verify hook specification compliance
    struct AttestationTask {
        /// @dev The hook contract address to verify
        address hook;
        /// @dev IPFS CID of the formal specification
        string specificationURI;
        /// @dev Pool IDs to sample state from
        bytes32[] poolIds;
        /// @dev Callbacks to test
        bytes4[] callbacks;
        /// @dev Number of state samples required
        uint32 sampleCount;
        /// @dev Block when task was created
        uint32 taskCreatedBlock;
        /// @dev Quorum configuration
        bytes quorumNumbers;
        /// @dev Threshold percentage for consensus
        uint32 quorumThresholdPercentage;
    }

    /// @notice Response from operators after verification
    struct AttestationResponse {
        /// @dev Reference to the task being responded to
        uint32 referenceTaskIndex;
        /// @dev Whether the hook passes all spec tests
        bool specCompliant;
        /// @dev Hash of all state samples collected
        bytes32 stateSamplesHash;
        /// @dev Hash of test results
        bytes32 testResultsHash;
        /// @dev Number of invariants verified
        uint32 invariantsVerified;
        /// @dev Number of invariants failed
        uint32 invariantsFailed;
    }

    /// @notice Metadata about the response
    struct AttestationResponseMetadata {
        uint32 taskRespondedBlock;
        bytes32 hashOfNonSigners;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TASK LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Create a new attestation task
    /// @param hook The hook contract to verify
    /// @param specificationURI IPFS URI of formal specification
    /// @param poolIds Pools to sample for verification
    /// @param callbacks Hook callbacks to test
    /// @param sampleCount Number of state samples to collect
    function createAttestationTask(
        address hook,
        string calldata specificationURI,
        bytes32[] calldata poolIds,
        bytes4[] calldata callbacks,
        uint32 sampleCount
    ) external returns (uint32 taskIndex);

    /// @notice Respond to an attestation task
    /// @param task The original task
    /// @param response The verification response
    /// @param nonSignerStakesAndSignature BLS signature data
    function respondToAttestationTask(
        AttestationTask calldata task,
        AttestationResponse calldata response,
        BLSSignatureChecker.NonSignerStakesAndSignature memory nonSignerStakesAndSignature
    ) external;

    /// @notice Challenge an attestation response
    /// @param task The original task
    /// @param response The contested response
    /// @param responseMetadata Response metadata
    /// @param counterSamples State samples proving incorrect verification
    function challengeAttestation(
        AttestationTask calldata task,
        AttestationResponse calldata response,
        AttestationResponseMetadata calldata responseMetadata,
        bytes calldata counterSamples
    ) external;
}
```

### 3.3 Operator Verification Logic (Off-Chain)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     OPERATOR VERIFICATION WORKFLOW                         │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    1. RECEIVE TASK                               │     │
│   │   - Parse AttestationTask from NewTaskCreated event              │     │
│   │   - Fetch specification from IPFS (specificationURI)             │     │
│   │   - Parse spec into structured verification rules                │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                 │                                          │
│                                 ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    2. SAMPLE STATE                               │     │
│   │   FOR each poolId in task.poolIds:                               │     │
│   │     FOR i = 1 to task.sampleCount:                               │     │
│   │       - Sample LP state via IHookStateView                       │     │
│   │       - Sample Trader state via IHookStateView                   │     │
│   │       - Sample Hook state via hook.getHookState()                │     │
│   │       - Record (preState, timestamp, blockNumber)                │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                 │                                          │
│                                 ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    3. EXECUTE CALLBACKS                          │     │
│   │   FOR each callback in task.callbacks:                           │     │
│   │     FOR each preState sample:                                    │     │
│   │       - Generate valid callback input based on spec              │     │
│   │       - Execute callback via PoolManager (simulation)            │     │
│   │       - Capture postState                                        │     │
│   │       - Record StateTransition(preState, input, postState)       │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                 │                                          │
│                                 ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    4. VERIFY AGAINST SPEC                        │     │
│   │   FOR each StateTransition:                                      │     │
│   │     - Extract expected postState from spec equations             │     │
│   │     - Compare actual vs expected within tolerance                │     │
│   │     - Check all declared invariants hold                         │     │
│   │     - Record (passed: bool, deviation: uint256)                  │     │
│   │                                                                  │     │
│   │   IMPORTANT: Operators verify behavior, NOT code                 │     │
│   │   - Code remains encrypted via Fhenix CoFHE                      │     │
│   │   - Only input→output behavior is checked                        │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                 │                                          │
│                                 ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    5. AGGREGATE RESULTS                          │     │
│   │   - Compute stateSamplesHash = keccak256(all samples)            │     │
│   │   - Compute testResultsHash = keccak256(all results)             │     │
│   │   - Count invariantsVerified, invariantsFailed                   │     │
│   │   - Determine specCompliant = (invariantsFailed == 0)            │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                 │                                          │
│                                 ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    6. SIGN & SUBMIT                              │     │
│   │   - Create AttestationResponse                                   │     │
│   │   - Sign response with BLS key                                   │     │
│   │   - Submit to Aggregator                                         │     │
│   │   - Aggregator collects signatures, submits to TaskManager       │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Verification Protocol: How to Prove Without Seeing Code

### 4.1 The Core Insight

The key to verifying hook compliance without seeing source code is **behavioral verification**:

1. The **specification** defines expected input→output relationships
2. Operators **execute the hook** as a black box
3. Operators **compare actual outputs** to spec-defined expected outputs
4. Code remains encrypted; only **behavior** is verified

### 4.2 Mathematical Formalization

Given a hook specification $\mathcal{F} = (f_1, f_2, ..., f_N)$ where each $f_i: (H, P) \rightarrow (H', \Delta)$:

**Verification Condition:**

For sampled states $\{(H_j, P_j)\}_{j=1}^{M}$ and callback $f_i$:

$$
\text{PASS} \iff \forall j: \|f_i^{actual}(H_j, P_j) - f_i^{spec}(H_j, P_j)\| \leq \epsilon
$$

Where:
- $f_i^{actual}$ is the hook's actual behavior (black box execution)
- $f_i^{spec}$ is the expected behavior from specification
- $\epsilon$ is the acceptable deviation (due to gas, rounding, etc.)

### 4.3 State Sampling Strategy

```solidity
/// @title HookStateSampler
/// @notice Collects state samples for verification
/// @dev Used by AVS operators off-chain
contract HookStateSampler {

    struct StateSample {
        /// @dev Block number when sampled
        uint256 blockNumber;
        /// @dev Timestamp when sampled
        uint256 timestamp;
        /// @dev Pool identifier
        bytes32 poolId;
        /// @dev Encoded LP state (LPPositionState[])
        bytes lpState;
        /// @dev Encoded Trader state (TraderState)
        bytes traderState;
        /// @dev Encoded Hook state (hook-specific)
        bytes hookState;
        /// @dev Encoded shared state
        bytes sharedState;
    }

    struct TransitionSample {
        /// @dev State before callback
        StateSample preState;
        /// @dev Callback executed
        bytes4 callback;
        /// @dev Callback input parameters
        bytes input;
        /// @dev State after callback
        StateSample postState;
        /// @dev Gas consumed
        uint256 gasUsed;
        /// @dev Return data from callback
        bytes returnData;
    }

    /// @notice Sample current pool and hook state
    /// @param poolId Pool to sample
    /// @param hook Hook contract
    /// @param stateView State view contract
    /// @return sample The state sample
    function sampleCurrentState(
        bytes32 poolId,
        address hook,
        address stateView
    ) external view returns (StateSample memory sample) {
        sample.blockNumber = block.number;
        sample.timestamp = block.timestamp;
        sample.poolId = poolId;

        // Sample via IHookStateView
        IHookStateView view = IHookStateView(stateView);

        // Get trader state
        TraderState memory traderState = view.getTraderState(PoolId.wrap(poolId));
        sample.traderState = abi.encode(traderState);

        // Get shared state
        (uint256 feeGrowth0, uint256 feeGrowth1) = view.getSharedFeeState(PoolId.wrap(poolId));
        sample.sharedState = abi.encode(feeGrowth0, feeGrowth1);

        // Get hook-specific state
        sample.hookState = view.getHookState(PoolId.wrap(poolId));
    }

    /// @notice Sample a state transition by executing callback
    /// @param poolId Pool to test
    /// @param hook Hook contract
    /// @param callback Callback selector
    /// @param input Callback input
    /// @return transition The transition sample
    function sampleTransition(
        bytes32 poolId,
        address hook,
        bytes4 callback,
        bytes calldata input
    ) external returns (TransitionSample memory transition) {
        // Record pre-state
        transition.preState = this.sampleCurrentState(poolId, hook, address(stateView));
        transition.callback = callback;
        transition.input = input;

        // Execute callback and measure gas
        uint256 gasBefore = gasleft();

        // Note: In practice, this would be done via PoolManager
        // with proper context setup
        (bool success, bytes memory returnData) = hook.call(
            abi.encodeWithSelector(callback, input)
        );

        transition.gasUsed = gasBefore - gasleft();
        transition.returnData = returnData;

        // Record post-state
        transition.postState = this.sampleCurrentState(poolId, hook, address(stateView));
    }
}
```

### 4.4 Specification Compliance Checker

```solidity
/// @title SpecificationComplianceChecker
/// @notice Verifies hook behavior matches specification
/// @dev Run by AVS operators off-chain
library SpecificationComplianceChecker {

    struct ComplianceResult {
        bool compliant;
        uint256 deviationMagnitude;
        bytes32 failedInvariant;
        string failureReason;
    }

    /// @notice Check if a state transition matches specification
    /// @param spec Parsed specification
    /// @param transition Observed transition
    /// @param tolerance Acceptable deviation
    /// @return result Compliance check result
    function checkTransitionCompliance(
        ParsedSpecification memory spec,
        TransitionSample memory transition,
        uint256 tolerance
    ) internal pure returns (ComplianceResult memory result) {
        result.compliant = true;

        // 1. Compute expected post-state from spec equations
        bytes memory expectedPostState = computeExpectedState(
            spec,
            transition.preState,
            transition.callback,
            transition.input
        );

        // 2. Compare actual vs expected
        uint256 deviation = computeDeviation(
            transition.postState.hookState,
            expectedPostState
        );

        if (deviation > tolerance) {
            result.compliant = false;
            result.deviationMagnitude = deviation;
            result.failureReason = "State deviation exceeds tolerance";
            return result;
        }

        // 3. Check all invariants
        for (uint256 i = 0; i < spec.invariants.length; i++) {
            bool invariantHolds = checkInvariant(
                spec.invariants[i],
                transition.preState,
                transition.postState
            );

            if (!invariantHolds) {
                result.compliant = false;
                result.failedInvariant = spec.invariants[i].id;
                result.failureReason = "Invariant violated";
                return result;
            }
        }
    }

    /// @notice Compute expected state from specification equations
    /// @dev This is the core spec-to-verification translation
    function computeExpectedState(
        ParsedSpecification memory spec,
        StateSample memory preState,
        bytes4 callback,
        bytes memory input
    ) internal pure returns (bytes memory expectedState) {
        // Find the transition function for this callback
        TransitionFunction memory fn = findTransitionFunction(spec, callback);

        // Decode pre-state variables needed by the function
        HookState memory H = decodeHookState(preState.hookState);
        TraderState memory P = abi.decode(preState.traderState, (TraderState));

        // Apply the specification's transition equations
        // This is pseudo-code - actual implementation depends on spec format
        //
        // Example for DynamicFeeHook:
        // volatility = |P.sqrtPrice - H.lastPrice| / H.lastPrice
        // H'.feeMultiplier = min(MAX_FEE, baseFee * (1 + volatility * sensitivity))
        // deltaFee = H'.feeMultiplier - P.lpFee

        expectedState = fn.apply(H, P, input);
    }
}
```

---

## 5. Slashing Conditions

Operators can be slashed for:

### 5.1 False Positive (Attesting Non-Compliant Hook)

```solidity
/// @notice Challenge: Hook was attested but doesn't match spec
/// @dev Challenger provides counter-sample proving non-compliance
function challengeFalsePositive(
    AttestationTask calldata task,
    AttestationResponse calldata response,
    TransitionSample calldata counterSample
) external {
    require(response.specCompliant == true, "Response already marked non-compliant");

    // Verify counter-sample is valid
    require(
        verifyTransitionSampleAuthenticity(counterSample, task.taskCreatedBlock),
        "Invalid counter-sample"
    );

    // Check if counter-sample proves non-compliance
    ComplianceResult memory result = SpecificationComplianceChecker.checkTransitionCompliance(
        fetchAndParseSpec(task.specificationURI),
        counterSample,
        COMPLIANCE_TOLERANCE
    );

    if (!result.compliant) {
        // Challenge successful - slash operators who signed the response
        _slashSigningOperators(task, response);
        emit AttestationChallenged(response.referenceTaskIndex, msg.sender, true);
    } else {
        emit AttestationChallenged(response.referenceTaskIndex, msg.sender, false);
    }
}
```

### 5.2 False Negative (Rejecting Compliant Hook)

```solidity
/// @notice Challenge: Hook was rejected but actually matches spec
/// @dev Challenger provides samples proving compliance
function challengeFalseNegative(
    AttestationTask calldata task,
    AttestationResponse calldata response,
    TransitionSample[] calldata complianceSamples
) external {
    require(response.specCompliant == false, "Response already marked compliant");

    // Verify all provided samples show compliance
    ParsedSpecification memory spec = fetchAndParseSpec(task.specificationURI);

    for (uint256 i = 0; i < complianceSamples.length; i++) {
        ComplianceResult memory result = SpecificationComplianceChecker.checkTransitionCompliance(
            spec,
            complianceSamples[i],
            COMPLIANCE_TOLERANCE
        );

        require(result.compliant, "Sample does not prove compliance");
    }

    // Require minimum sample coverage
    require(
        complianceSamples.length >= task.sampleCount,
        "Insufficient compliance evidence"
    );

    // Challenge successful - slash operators who signed the response
    _slashSigningOperators(task, response);
    emit AttestationChallenged(response.referenceTaskIndex, msg.sender, true);
}
```

---

## 6. Integration with Hook Marketplace

### 6.1 Attestation Registry

```solidity
/// @title AttestationRegistry
/// @notice On-chain registry of hook attestations
contract AttestationRegistry {

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

    /// @dev hook address => Attestation
    mapping(address => Attestation) public attestations;

    /// @dev hook address => attestation history
    mapping(address => bytes32[]) public attestationHistory;

    event AttestationRecorded(
        address indexed hook,
        bytes32 indexed attestationId,
        string specificationURI,
        uint256 expiresAt
    );

    event AttestationRevoked(
        address indexed hook,
        bytes32 indexed attestationId,
        string reason
    );

    /// @notice Record a successful attestation
    /// @dev Called by TaskManager after successful response
    function recordAttestation(
        address hook,
        string calldata specificationURI,
        uint32 taskIndex,
        bytes32 responsesHash
    ) external onlyTaskManager {
        bytes32 attestationId = keccak256(abi.encode(
            hook,
            specificationURI,
            taskIndex,
            block.timestamp
        ));

        attestations[hook] = Attestation({
            attestationId: attestationId,
            hook: hook,
            specificationURI: specificationURI,
            isValid: true,
            attestedAt: block.timestamp,
            expiresAt: block.timestamp + ATTESTATION_VALIDITY_PERIOD,
            taskIndex: taskIndex,
            responsesHash: responsesHash
        });

        attestationHistory[hook].push(attestationId);

        emit AttestationRecorded(hook, attestationId, specificationURI, block.timestamp + ATTESTATION_VALIDITY_PERIOD);
    }

    /// @notice Check if a hook has valid attestation
    function isHookAttested(address hook) external view returns (bool) {
        Attestation storage att = attestations[hook];
        return att.isValid && att.expiresAt > block.timestamp;
    }

    /// @notice Get full attestation details
    function getAttestation(address hook) external view returns (Attestation memory) {
        return attestations[hook];
    }
}
```

### 6.2 Hook Market Integration

```solidity
/// @title HookMarket
/// @notice Marketplace for verified hooks
contract HookMarket {

    IAttestationRegistry public immutable attestationRegistry;

    /// @notice List a hook for sale/use
    /// @dev Requires valid attestation
    function listHook(
        address hook,
        uint256 price,
        bytes calldata metadata
    ) external {
        require(
            attestationRegistry.isHookAttested(hook),
            "Hook must have valid attestation"
        );

        // ... listing logic
    }

    /// @notice Deploy a verified hook to a pool
    /// @dev Checks attestation before allowing deployment
    function deployVerifiedHook(
        bytes32 poolId,
        address hook
    ) external {
        require(
            attestationRegistry.isHookAttested(hook),
            "Hook must have valid attestation"
        );

        IAttestationRegistry.Attestation memory att = attestationRegistry.getAttestation(hook);

        // Emit specification URI for integrators to review
        emit HookDeployed(poolId, hook, att.specificationURI);

        // ... deployment logic
    }
}
```

---

## 7. End-to-End Workflow

### 7.1 Hook Developer Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     HOOK DEVELOPER WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: Write Specification                                             │
│  ─────────────────────────────                                          │
│  - Define state variables (H)                                            │
│  - Define state transitions f_i(H, P) → (H', Δ)                         │
│  - Define invariants                                                     │
│  - Create test vectors                                                   │
│  - Upload to IPFS → specificationURI                                     │
│                                                                          │
│  STEP 2: Implement Hook                                                  │
│  ─────────────────────────                                              │
│  - Write Solidity implementation                                         │
│  - Ensure implementation matches specification                           │
│  - Local testing against test vectors                                    │
│                                                                          │
│  STEP 3: Deploy via Fhenix CoFHE                                        │
│  ───────────────────────────────                                        │
│  - Encrypt hook bytecode using Fhenix                                    │
│  - Deploy encrypted contract                                             │
│  - Code is protected from decompilation                                  │
│                                                                          │
│  STEP 4: Request Attestation                                             │
│  ───────────────────────────                                            │
│  HookAttestationTaskManager.createAttestationTask(                       │
│      hook: deployedHookAddress,                                          │
│      specificationURI: "ipfs://Qm...",                                   │
│      poolIds: [testPoolId1, testPoolId2],                                │
│      callbacks: [beforeSwap.selector, afterSwap.selector],               │
│      sampleCount: 100                                                    │
│  )                                                                       │
│                                                                          │
│  STEP 5: Wait for Operator Verification                                  │
│  ──────────────────────────────────────                                 │
│  - Operators sample state from specified pools                           │
│  - Operators execute callbacks as black-box                              │
│  - Operators verify behavior matches spec                                │
│  - Operators sign and submit response                                    │
│                                                                          │
│  STEP 6: Receive Attestation                                             │
│  ───────────────────────────                                            │
│  - If specCompliant == true:                                             │
│    - Attestation recorded in AttestationRegistry                         │
│    - Hook can be listed in HookMarket                                    │
│  - If specCompliant == false:                                            │
│    - Developer reviews failure reasons                                   │
│    - Fix implementation and retry                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Integrator Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     HOOK INTEGRATOR WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: Browse Hook Market                                              │
│  ──────────────────────────                                             │
│  - View available hooks with attestations                                │
│  - Filter by: callback types, attestation status, price                  │
│                                                                          │
│  STEP 2: Review Specification                                            │
│  ────────────────────────────                                           │
│  Attestation att = attestationRegistry.getAttestation(hookAddress);      │
│  - Fetch specification from att.specificationURI                         │
│  - Review:                                                               │
│    - State variables and their meaning                                   │
│    - Transition functions and expected behavior                          │
│    - Invariants that are guaranteed                                      │
│    - Test vectors for validation                                         │
│                                                                          │
│  STEP 3: Verify Attestation                                              │
│  ──────────────────────────                                             │
│  require(attestationRegistry.isHookAttested(hook), "Not attested");      │
│  require(att.expiresAt > block.timestamp, "Attestation expired");        │
│  require(att.taskIndex > 0, "Valid task index");                         │
│                                                                          │
│  STEP 4: Deploy to Pool                                                  │
│  ──────────────────────                                                 │
│  hookMarket.deployVerifiedHook(poolId, hookAddress);                     │
│                                                                          │
│  STEP 5: Trust Guarantees                                                │
│  ────────────────────────                                               │
│  - Hook behavior matches published specification                         │
│  - Operators stake slashable collateral on this claim                    │
│  - Economic security proportional to operator stake                      │
│  - No need to audit source code                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Security Considerations

### 8.1 Attack Vectors & Mitigations

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Spec Gaming** | Developer writes spec that matches malicious behavior | Community review of specs; spec quality scoring |
| **Sample Manipulation** | Hook behaves correctly only for sampled states | Random sampling; cross-operator sample comparison |
| **Operator Collusion** | Operators collude to attest false compliance | Minimum operator count; stake distribution requirements |
| **Time-Based Attacks** | Hook behavior changes after attestation | Attestation expiry; re-attestation requirements |
| **Gas Manipulation** | Hook uses excessive gas in non-sampled paths | Gas bounds in specification; gas monitoring |

### 8.2 Trust Assumptions

1. **Specification Trust**: Integrators must review and understand the specification
2. **Operator Honesty**: Majority of operators are honest (enforced by slashing)
3. **Sample Coverage**: Random sampling provides statistical coverage
4. **Fhenix Security**: Code encryption prevents reverse engineering

---

## 9. References

1. **[EigenLayer Middleware]** Layr-Labs. *eigenlayer-middleware*. https://github.com/Layr-Labs/eigenlayer-middleware

2. **[Incredible Squaring AVS]** Layr-Labs. *incredible-squaring-avs*. https://github.com/Layr-Labs/incredible-squaring-avs

3. **[Hello World AVS]** Layr-Labs. *hello-world-avs*. https://github.com/Layr-Labs/hello-world-avs

4. **[State-Space Model]** Hook Bazaar. *Hook State-Space Model: Dual-Index Architecture*. `docs/hook-pkg/mathematical-models/state-space-model.md`

5. **[arXiv:2512.06203]** Tranquilli & Gupta. *Formal State-Machine Models for Uniswap v3*. https://arxiv.org/abs/2512.06203

6. **[Fhenix CoFHE]** Fhenix Protocol. *CoFHE Documentation*. https://cofhe-docs.fhenix.zone/

---

## 10. Appendix: Contract Deployment Addresses

*To be populated after deployment*

| Contract | Network | Address |
|----------|---------|---------|
| HookAttestationServiceManager | - | - |
| HookAttestationTaskManager | - | - |
| AttestationRegistry | - | - |
| HookStateSampler | - | - |
