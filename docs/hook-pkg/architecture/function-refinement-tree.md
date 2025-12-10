# Hook Bazaar: Function Refinement Tree

> **Document Type:** Functional Decomposition
> **Last Updated:** 2025-12-09
> **Related:** [Mission Statement](./mission-statement.md) | [Goal Tree](./goal-tree.md) | [State-Space Model](../mathematical-models/state-space-model.md)

---

## 1. Overview

This document decomposes the Hook Bazaar system into hierarchical functions, connecting high-level capabilities to concrete mathematical operations and interface definitions.

---

## 2. Top-Level Function Decomposition

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    F0: HOOK BAZAAR SYSTEM                                    │
│                                                                              │
│    Enable trading of verified, IP-protected Uniswap V4 hooks                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                │
│    │      F1       │   │      F2       │   │      F3       │                │
│    │   SPECIFY     │   │    VERIFY     │   │    TRADE      │                │
│    │    HOOKS      │   │    HOOKS      │   │    HOOKS      │                │
│    └───────┬───────┘   └───────┬───────┘   └───────┬───────┘                │
│            │                   │                   │                         │
│            ▼                   ▼                   ▼                         │
│    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                │
│    │ F1.1 Define   │   │ F2.1 Sample   │   │ F3.1 List     │                │
│    │ F1.2 Declare  │   │ F2.2 Execute  │   │ F3.2 Purchase │                │
│    │ F1.3 Validate │   │ F2.3 Compare  │   │ F3.3 Deploy   │                │
│    │ F1.4 Store    │   │ F2.4 Attest   │   │ F3.4 Route    │                │
│    └───────────────┘   └───────────────┘   └───────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. F1: Specify Hooks

### 3.1 Function Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  F1: SPECIFY HOOKS                                                           │
│                                                                              │
│  Transform hook requirements into formal mathematical specifications         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  F1.1: Define State Variables                                                │
│  ════════════════════════════                                               │
│  │                                                                          │
│  ├── F1.1.1: defineHookState(hookId) → H                                    │
│  │   │                                                                      │
│  │   │   Define the hook-specific state variables                           │
│  │   │                                                                      │
│  │   │   Input:  hookId: bytes32                                            │
│  │   │   Output: H = {h_1, h_2, ..., h_n} where h_i ∈ Type_i                │
│  │   │                                                                      │
│  │   │   Example:                                                           │
│  │   │   H_DynamicFee = {                                                   │
│  │   │       volatilityWindow: uint256,                                     │
│  │   │       lastPrice: uint160,                                            │
│  │   │       feeMultiplier: uint24                                          │
│  │   │   }                                                                  │
│  │   │                                                                      │
│  │   └── Interface: IHookSpecification.declareStateWrites()                 │
│  │                                                                          │
│  ├── F1.1.2: declarePoolStateReads() → (S_LP, S_T, S_shared)                │
│  │   │                                                                      │
│  │   │   Declare which pool state variables the hook reads                  │
│  │   │                                                                      │
│  │   │   Output: Bitmasks indicating accessed variables                     │
│  │   │                                                                      │
│  │   │   S_LP ⊆ {L_k, t_l, t_u, f_0^in, f_1^in, L_g, L_n, ...}             │
│  │   │   S_T  ⊆ {√P, t_c, φ_lp, φ_proto, L_act, B_tick}                    │
│  │   │   S_shared ⊆ {f_0^global, f_1^global}                                │
│  │   │                                                                      │
│  │   └── Interface: IHookSpecification.declareStateReads()                  │
│  │                                                                          │
│  └── F1.1.3: mapToStateView() → IHookStateView calls                        │
│      │                                                                      │
│      │   Map formal variables to concrete getter functions                  │
│      │                                                                      │
│      │   √P → IStateView.getSlot0().sqrtPriceX96                            │
│      │   L_k → IStateView.getPositionLiquidity()                            │
│      │   ...                                                                │
│      │                                                                      │
│      └── Reference: state-space-model.md Section 9                          │
│                                                                              │
│  F1.2: Declare Transition Functions                                          │
│  ══════════════════════════════════                                         │
│  │                                                                          │
│  ├── F1.2.1: specifyCallback(callback) → f_i(H, P) → (H', Δ)                │
│  │   │                                                                      │
│  │   │   Define state transition for a specific callback                    │
│  │   │                                                                      │
│  │   │   Input:  callback ∈ {beforeSwap, afterSwap, beforeMint, ...}        │
│  │   │   Output: Transition function specification                          │
│  │   │                                                                      │
│  │   │   Mathematical Form:                                                 │
│  │   │   f_i: (H × P × Input_i) → (H' × Δ_i)                                │
│  │   │                                                                      │
│  │   │   where:                                                             │
│  │   │   - H is hook state before                                           │
│  │   │   - P is pool state (read-only for hook)                             │
│  │   │   - Input_i is callback-specific input                               │
│  │   │   - H' is hook state after                                           │
│  │   │   - Δ_i is return delta (fee override, etc.)                         │
│  │   │                                                                      │
│  │   └── Interface: IHookSpecification.transitionBounds()                   │
│  │                                                                          │
│  ├── F1.2.2: specifyBeforeSwap(H, P, swapParams) → (H', δ_fee)              │
│  │   │                                                                      │
│  │   │   Concrete specification for beforeSwap callback                     │
│  │   │                                                                      │
│  │   │   Inputs:                                                            │
│  │   │   - H: Current hook state                                            │
│  │   │   - P.sqrtPriceX96: Current price                                    │
│  │   │   - P.tick: Current tick                                             │
│  │   │   - P.lpFee: Current LP fee                                          │
│  │   │   - swapParams: (zeroForOne, amountSpecified, ...)                   │
│  │   │                                                                      │
│  │   │   Outputs:                                                           │
│  │   │   - H': Updated hook state                                           │
│  │   │   - δ_fee: Fee adjustment (can be 0)                                 │
│  │   │                                                                      │
│  │   │   Example (DynamicFeeHook):                                          │
│  │   │   ┌─────────────────────────────────────────────────────────┐       │
│  │   │   │ volatility = |P.sqrtPriceX96 - H.lastPrice| / H.lastPrice│       │
│  │   │   │ H'.feeMultiplier = min(MAX_FEE, baseFee × (1 + v × k))   │       │
│  │   │   │ H'.lastPrice = P.sqrtPriceX96                            │       │
│  │   │   │ δ_fee = H'.feeMultiplier - P.lpFee                       │       │
│  │   │   └─────────────────────────────────────────────────────────┘       │
│  │   │                                                                      │
│  │   └── Reference: IHooks.beforeSwap()                                     │
│  │                                                                          │
│  ├── F1.2.3: specifyAfterSwap(H, P, swapResult) → (H', δ_amounts)           │
│  │   │                                                                      │
│  │   │   Concrete specification for afterSwap callback                      │
│  │   │                                                                      │
│  │   │   Inputs:                                                            │
│  │   │   - H: Current hook state (post-beforeSwap)                          │
│  │   │   - P: Pool state after swap execution                               │
│  │   │   - swapResult: (amount0, amount1, sqrtPriceAfter, ...)              │
│  │   │                                                                      │
│  │   │   Outputs:                                                           │
│  │   │   - H': Final hook state                                             │
│  │   │   - δ_amounts: Amount adjustments (usually 0)                        │
│  │   │                                                                      │
│  │   └── Reference: IHooks.afterSwap()                                      │
│  │                                                                          │
│  └── F1.2.4: specifyLiquidityCallbacks(...)                                 │
│      │                                                                      │
│      │   Similar structure for:                                             │
│      │   - beforeAddLiquidity / afterAddLiquidity                           │
│      │   - beforeRemoveLiquidity / afterRemoveLiquidity                     │
│      │   - beforeDonate / afterDonate                                       │
│      │                                                                      │
│      └── Each follows f_i(H, P, Input) → (H', Δ) pattern                    │
│                                                                              │
│  F1.3: Declare Invariants                                                    │
│  ════════════════════════                                                   │
│  │                                                                          │
│  ├── F1.3.1: declareStateInvariant(inv_id) → φ(H)                           │
│  │   │                                                                      │
│  │   │   Invariant over hook state only                                     │
│  │   │                                                                      │
│  │   │   Form: φ(H) ≡ predicate that must hold ∀ reachable H                │
│  │   │                                                                      │
│  │   │   Example:                                                           │
│  │   │   INV-FEE-BOUNDS: 0 ≤ H.feeMultiplier ≤ MAX_FEE                      │
│  │   │                                                                      │
│  │   └── Interface: IHookSpecification.declareInvariants()                  │
│  │                                                                          │
│  ├── F1.3.2: declareTransitionInvariant(callback) → ψ(H, H', P)             │
│  │   │                                                                      │
│  │   │   Invariant relating pre and post states                             │
│  │   │                                                                      │
│  │   │   Form: ψ(H, H', P) ≡ relationship that must hold                    │
│  │   │                                                                      │
│  │   │   Example:                                                           │
│  │   │   INV-MONOTONIC: volatility₁ < volatility₂ ⟹ fee₁ ≤ fee₂            │
│  │   │                                                                      │
│  │   └── Used in behavioral verification                                    │
│  │                                                                          │
│  └── F1.3.3: declarePoolInvariant() → χ(P, H)                               │
│      │                                                                      │
│      │   Invariant relating pool state to hook state                        │
│      │                                                                      │
│      │   Example (from arXiv:2512.06203):                                   │
│      │   INV-PRODUCT: |K_n - K_0| ≤ n × B                                   │
│      │   where K = X × Y (constant product)                                 │
│      │                                                                      │
│      └── Reference: state-space-model.md Section 4                          │
│                                                                              │
│  F1.4: Store Specification                                                   │
│  ═════════════════════════                                                  │
│  │                                                                          │
│  ├── F1.4.1: serializeSpec(spec) → bytes                                    │
│  │   │                                                                      │
│  │   │   Convert specification to storable format                           │
│  │   │                                                                      │
│  │   │   Output: Markdown + LaTeX document                                  │
│  │   │                                                                      │
│  │   └── Format: See specification-template.md (to be created)              │
│  │                                                                          │
│  ├── F1.4.2: uploadToIPFS(specBytes) → CID                                  │
│  │   │                                                                      │
│  │   │   Store specification on IPFS                                        │
│  │   │                                                                      │
│  │   │   Output: Content Identifier (CID) string                            │
│  │   │                                                                      │
│  │   └── Example: "ipfs://QmXyz..."                                         │
│  │                                                                          │
│  └── F1.4.3: linkToHook(hookAddress, specCID) → void                        │
│      │                                                                      │
│      │   Associate specification with deployed hook                         │
│      │                                                                      │
│      │   On-chain: hook.specificationURI = specCID                          │
│      │                                                                      │
│      └── Interface: IHookSpecification.specificationURI()                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. F2: Verify Hooks

### 4.1 Function Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  F2: VERIFY HOOKS                                                            │
│                                                                              │
│  Prove hook implementation matches specification without code disclosure     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  F2.1: Sample State                                                          │
│  ══════════════════                                                         │
│  │                                                                          │
│  ├── F2.1.1: samplePoolState(poolId) → StateSample                          │
│  │   │                                                                      │
│  │   │   Capture current pool state snapshot                                │
│  │   │                                                                      │
│  │   │   Output: StateSample = {                                            │
│  │   │       blockNumber: uint256,                                          │
│  │   │       timestamp: uint256,                                            │
│  │   │       poolId: bytes32,                                               │
│  │   │       lpState: bytes,      // encoded LPPositionState[]              │
│  │   │       traderState: bytes,  // encoded TraderState                    │
│  │   │       hookState: bytes,    // encoded hook-specific state            │
│  │   │       sharedState: bytes   // encoded fee growth                     │
│  │   │   }                                                                  │
│  │   │                                                                      │
│  │   └── Uses: IHookStateView.getTraderState(), etc.                        │
│  │                                                                          │
│  ├── F2.1.2: sampleHookState(hook, poolId) → bytes                          │
│  │   │                                                                      │
│  │   │   Capture hook-specific state                                        │
│  │   │                                                                      │
│  │   │   Output: Encoded H values                                           │
│  │   │                                                                      │
│  │   └── Uses: IHookStateView.getHookState()                                │
│  │                                                                          │
│  └── F2.1.3: generateSampleSet(poolIds, n) → StateSample[]                  │
│      │                                                                      │
│      │   Generate n samples across specified pools                          │
│      │                                                                      │
│      │   Strategy:                                                          │
│      │   - Random block selection within recent window                      │
│      │   - Diverse pool states (different liquidity, prices)                │
│      │   - Edge cases (near tick boundaries, low liquidity)                 │
│      │                                                                      │
│      └── Used by: AVS operators                                             │
│                                                                              │
│  F2.2: Execute Callbacks                                                     │
│  ═══════════════════════                                                    │
│  │                                                                          │
│  ├── F2.2.1: executeCallback(hook, callback, input) → (output, gasUsed)     │
│  │   │                                                                      │
│  │   │   Execute hook callback as black box                                 │
│  │   │                                                                      │
│  │   │   Input:                                                             │
│  │   │   - hook: address (encrypted bytecode)                               │
│  │   │   - callback: bytes4 selector                                        │
│  │   │   - input: bytes (callback parameters)                               │
│  │   │                                                                      │
│  │   │   Output:                                                            │
│  │   │   - output: bytes (return data)                                      │
│  │   │   - gasUsed: uint256                                                 │
│  │   │                                                                      │
│  │   │   Note: Code remains encrypted; only behavior observed               │
│  │   │                                                                      │
│  │   └── Execution via: PoolManager simulation or direct call               │
│  │                                                                          │
│  ├── F2.2.2: recordTransition(pre, callback, input, post) → TransitionSample│
│  │   │                                                                      │
│  │   │   Record complete state transition                                   │
│  │   │                                                                      │
│  │   │   Output: TransitionSample = {                                       │
│  │   │       preState: StateSample,                                         │
│  │   │       callback: bytes4,                                              │
│  │   │       input: bytes,                                                  │
│  │   │       postState: StateSample,                                        │
│  │   │       gasUsed: uint256,                                              │
│  │   │       returnData: bytes                                              │
│  │   │   }                                                                  │
│  │   │                                                                      │
│  │   └── Used for: Verification comparison                                  │
│  │                                                                          │
│  └── F2.2.3: batchExecute(hook, callbacks[], inputs[]) → TransitionSample[] │
│      │                                                                      │
│      │   Execute multiple callbacks for comprehensive testing               │
│      │                                                                      │
│      └── Used by: AVS operators for task completion                         │
│                                                                              │
│  F2.3: Compare Against Specification                                         │
│  ═══════════════════════════════════                                        │
│  │                                                                          │
│  ├── F2.3.1: parseSpecification(specURI) → ParsedSpec                       │
│  │   │                                                                      │
│  │   │   Load and parse specification from IPFS                             │
│  │   │                                                                      │
│  │   │   Output: ParsedSpec = {                                             │
│  │   │       stateVars: StateVarDef[],                                      │
│  │   │       transitions: TransitionDef[],                                  │
│  │   │       invariants: InvariantDef[],                                    │
│  │   │       testVectors: TestVector[]                                      │
│  │   │   }                                                                  │
│  │   │                                                                      │
│  │   └── Parsing: Markdown → structured objects                             │
│  │                                                                          │
│  ├── F2.3.2: computeExpectedOutput(spec, preState, callback, input) → bytes │
│  │   │                                                                      │
│  │   │   Calculate expected output from specification                       │
│  │   │                                                                      │
│  │   │   Process:                                                           │
│  │   │   1. Find transition function f_i for callback                       │
│  │   │   2. Decode preState into (H, P)                                     │
│  │   │   3. Apply f_i(H, P, input) equations                                │
│  │   │   4. Encode expected (H', Δ) as bytes                                │
│  │   │                                                                      │
│  │   │   This is the CORE of spec-to-verification translation               │
│  │   │                                                                      │
│  │   └── Mathematical: f_i^spec(H, P, input) → (H', Δ)                      │
│  │                                                                          │
│  ├── F2.3.3: compareOutputs(actual, expected, ε) → ComparisonResult         │
│  │   │                                                                      │
│  │   │   Compare actual hook output to expected                             │
│  │   │                                                                      │
│  │   │   Input:                                                             │
│  │   │   - actual: bytes (from executeCallback)                             │
│  │   │   - expected: bytes (from computeExpectedOutput)                     │
│  │   │   - ε: uint256 (tolerance for rounding)                              │
│  │   │                                                                      │
│  │   │   Output: ComparisonResult = {                                       │
│  │   │       matches: bool,                                                 │
│  │   │       deviation: uint256,                                            │
│  │   │       fieldDeviations: mapping(field → deviation)                    │
│  │   │   }                                                                  │
│  │   │                                                                      │
│  │   │   Condition: matches = (deviation ≤ ε)                               │
│  │   │                                                                      │
│  │   └── Accounts for: Rounding, gas limits, ordering                       │
│  │                                                                          │
│  └── F2.3.4: checkInvariants(spec, pre, post) → InvariantResult[]           │
│      │                                                                      │
│      │   Verify all declared invariants hold                                │
│      │                                                                      │
│      │   For each invariant φ ∈ spec.invariants:                            │
│      │       result[φ.id] = evaluate(φ, pre, post)                          │
│      │                                                                      │
│      │   Output: Array of (invariantId, holds: bool, reason: string)        │
│      │                                                                      │
│      └── Used for: Comprehensive compliance check                           │
│                                                                              │
│  F2.4: Attest Compliance                                                     │
│  ═══════════════════════                                                    │
│  │                                                                          │
│  ├── F2.4.1: aggregateResults(comparisons[], invariants[]) → AttestResult   │
│  │   │                                                                      │
│  │   │   Combine all verification results                                   │
│  │   │                                                                      │
│  │   │   Output: AttestResult = {                                           │
│  │   │       specCompliant: bool,                                           │
│  │   │       totalSamples: uint32,                                          │
│  │   │       passingsamples: uint32,                                        │
│  │   │       invariantsChecked: uint32,                                     │
│  │   │       invariantsPassed: uint32,                                      │
│  │   │       stateSamplesHash: bytes32,                                     │
│  │   │       testResultsHash: bytes32                                       │
│  │   │   }                                                                  │
│  │   │                                                                      │
│  │   │   specCompliant = (passingSamples == totalSamples) &&                │
│  │   │                   (invariantsPassed == invariantsChecked)            │
│  │   │                                                                      │
│  │   └── Used by: AVS operators                                             │
│  │                                                                          │
│  ├── F2.4.2: signAttestation(result, operatorKey) → Signature               │
│  │   │                                                                      │
│  │   │   Sign attestation result with BLS key                               │
│  │   │                                                                      │
│  │   │   signature = BLS.sign(operatorKey, hash(result))                    │
│  │   │                                                                      │
│  │   └── Used for: Aggregated signature submission                          │
│  │                                                                          │
│  ├── F2.4.3: submitResponse(task, result, signatures) → void                │
│  │   │                                                                      │
│  │   │   Submit aggregated response to TaskManager                          │
│  │   │                                                                      │
│  │   │   On-chain: TaskManager.respondToAttestationTask(...)                │
│  │   │                                                                      │
│  │   └── Emits: AttestationTaskResponded event                              │
│  │                                                                          │
│  └── F2.4.4: recordAttestation(hook, specURI, taskIndex) → attestationId    │
│      │                                                                      │
│      │   Record successful attestation on-chain                             │
│      │                                                                      │
│      │   On-chain: AttestationRegistry.recordAttestation(...)               │
│      │                                                                      │
│      │   Output: attestationId = keccak256(hook, specURI, taskIndex, now)   │
│      │                                                                      │
│      └── Enables: Marketplace listing                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. F3: Trade Hooks

### 5.1 Function Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  F3: TRADE HOOKS                                                             │
│                                                                              │
│  Enable discovery, purchase, and deployment of verified hooks                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  F3.1: List Hooks                                                            │
│  ════════════════                                                           │
│  │                                                                          │
│  ├── F3.1.1: mintHookNFT(hook, specURI, metadata) → tokenId                 │
│  │   │                                                                      │
│  │   │   Create NFT representing hook ownership                             │
│  │   │                                                                      │
│  │   │   Requires: Valid attestation for hook                               │
│  │   │                                                                      │
│  │   │   Output: ERC-721 token with:                                        │
│  │   │   - hook address                                                     │
│  │   │   - specification URI                                                │
│  │   │   - attestation ID                                                   │
│  │   │   - metadata URI                                                     │
│  │   │                                                                      │
│  │   └── Contract: HookNFTRegistry.mint()                                   │
│  │                                                                          │
│  ├── F3.1.2: createListing(tokenId, price, terms) → listingId               │
│  │   │                                                                      │
│  │   │   List hook for sale in marketplace                                  │
│  │   │                                                                      │
│  │   │   Listing types:                                                     │
│  │   │   - SALE: One-time transfer of ownership                             │
│  │   │   - LICENSE: Per-use or subscription fee                             │
│  │   │   - FREE: Open source with optional donation                         │
│  │   │                                                                      │
│  │   └── Contract: HookMarket.list()                                        │
│  │                                                                          │
│  └── F3.1.3: updateListing(listingId, newPrice, newTerms) → void            │
│      │                                                                      │
│      │   Modify existing listing                                            │
│      │                                                                      │
│      └── Contract: HookMarket.update()                                      │
│                                                                              │
│  F3.2: Purchase Hooks                                                        │
│  ════════════════════                                                       │
│  │                                                                          │
│  ├── F3.2.1: queryListings(filters) → Listing[]                             │
│  │   │                                                                      │
│  │   │   Search available hooks                                             │
│  │   │                                                                      │
│  │   │   Filters:                                                           │
│  │   │   - callbacks: bytes4[] (implemented callbacks)                      │
│  │   │   - priceRange: (min, max)                                           │
│  │   │   - attestationStatus: enum                                          │
│  │   │   - category: string                                                 │
│  │   │                                                                      │
│  │   └── Off-chain: Indexer + on-chain verification                         │
│  │                                                                          │
│  ├── F3.2.2: verifyAttestation(hook) → AttestationInfo                      │
│  │   │                                                                      │
│  │   │   Check attestation validity before purchase                         │
│  │   │                                                                      │
│  │   │   Output: AttestationInfo = {                                        │
│  │   │       isValid: bool,                                                 │
│  │   │       attestationId: bytes32,                                        │
│  │   │       expiresAt: uint256,                                            │
│  │   │       specificationURI: string                                       │
│  │   │   }                                                                  │
│  │   │                                                                      │
│  │   └── Contract: AttestationRegistry.getAttestation()                     │
│  │                                                                          │
│  └── F3.2.3: purchaseHook(listingId, payment) → receipt                     │
│      │                                                                      │
│      │   Complete hook purchase/license                                     │
│      │                                                                      │
│      │   Process:                                                           │
│      │   1. Verify attestation still valid                                  │
│      │   2. Transfer payment to seller                                      │
│      │   3. If SALE: Transfer NFT ownership                                 │
│      │   4. If LICENSE: Grant usage rights                                  │
│      │   5. Emit purchase event                                             │
│      │                                                                      │
│      └── Contract: HookMarket.purchase()                                    │
│                                                                              │
│  F3.3: Deploy Hooks                                                          │
│  ══════════════════                                                         │
│  │                                                                          │
│  ├── F3.3.1: registerHookForPool(poolId, hook) → void                       │
│  │   │                                                                      │
│  │   │   Associate hook with a pool via MasterHook                          │
│  │   │                                                                      │
│  │   │   Requires:                                                          │
│  │   │   - Caller has usage rights (owner or licensee)                      │
│  │   │   - Hook has valid attestation                                       │
│  │   │   - Pool exists                                                      │
│  │   │                                                                      │
│  │   └── Contract: ProtocolHookMediator.registerHook()                      │
│  │                                                                          │
│  ├── F3.3.2: initializePoolWithHook(params, hook) → poolId                  │
│  │   │                                                                      │
│  │   │   Create new pool with verified hook                                 │
│  │   │                                                                      │
│  │   │   Process:                                                           │
│  │   │   1. Verify hook attestation                                         │
│  │   │   2. Call PoolManager.initialize() with MasterHook                   │
│  │   │   3. Register specific hook in MasterHook                            │
│  │   │                                                                      │
│  │   └── Uses: Uniswap V4 PoolManager                                       │
│  │                                                                          │
│  └── F3.3.3: composeHooks(poolId, hooks[]) → void                           │
│      │                                                                      │
│      │   Chain multiple hooks for a pool                                    │
│      │                                                                      │
│      │   Execution order defined by MasterHook                              │
│      │   Each hook must have valid attestation                              │
│      │                                                                      │
│      └── Contract: MasterHook.setHookChain()                                │
│                                                                              │
│  F3.4: Route Callbacks                                                       │
│  ═════════════════════                                                      │
│  │                                                                          │
│  ├── F3.4.1: routeCallback(poolId, callback, data) → result                 │
│  │   │                                                                      │
│  │   │   MasterHook routes callback to registered hook(s)                   │
│  │   │                                                                      │
│  │   │   Process:                                                           │
│  │   │   1. Look up registered hooks for poolId                             │
│  │   │   2. For each hook in chain:                                         │
│  │   │      - Execute callback                                              │
│  │   │      - Aggregate results                                             │
│  │   │   3. Return combined result to PoolManager                           │
│  │   │                                                                      │
│  │   └── Contract: MasterHook (Diamond facet)                               │
│  │                                                                          │
│  ├── F3.4.2: aggregateDeltas(deltas[]) → combinedDelta                      │
│  │   │                                                                      │
│  │   │   Combine return values from chained hooks                           │
│  │   │                                                                      │
│  │   │   Strategy depends on callback type:                                 │
│  │   │   - beforeSwap: Last non-zero fee wins, or sum                       │
│  │   │   - afterSwap: Sum of amount deltas                                  │
│  │   │   - etc.                                                             │
│  │   │                                                                      │
│  │   └── Defined in: Hook composition rules                                 │
│  │                                                                          │
│  └── F3.4.3: handleHookFailure(poolId, hook, error) → fallback              │
│      │                                                                      │
│      │   Handle hook execution failures                                     │
│      │                                                                      │
│      │   Options:                                                           │
│      │   - REVERT: Entire transaction fails                                 │
│      │   - SKIP: Continue without hook                                      │
│      │   - FALLBACK: Use default behavior                                   │
│      │                                                                      │
│      └── Configurable per pool                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Cross-Cutting Functions

### 6.1 State Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FC.1: STATE MANAGEMENT                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FC.1.1: encodeState(state) → bytes                                          │
│  ─────────────────────────────────                                          │
│  │                                                                          │
│  │  Convert typed state structs to bytes for hashing/storage                │
│  │                                                                          │
│  │  Used by: F2.1 (sampling), F2.3 (comparison)                             │
│  │                                                                          │
│  └── Implementation: abi.encode(state)                                      │
│                                                                              │
│  FC.1.2: decodeState(bytes, stateType) → state                               │
│  ──────────────────────────────────────────────                             │
│  │                                                                          │
│  │  Reconstruct typed state from bytes                                      │
│  │                                                                          │
│  │  Used by: F2.3 (spec computation)                                        │
│  │                                                                          │
│  └── Implementation: abi.decode(bytes, (Type))                              │
│                                                                              │
│  FC.1.3: hashState(state) → bytes32                                          │
│  ──────────────────────────────────                                         │
│  │                                                                          │
│  │  Compute deterministic hash of state                                     │
│  │                                                                          │
│  │  Used by: F2.4 (attestation recording)                                   │
│  │                                                                          │
│  └── Implementation: keccak256(encodeState(state))                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Cryptographic Functions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FC.2: CRYPTOGRAPHIC FUNCTIONS                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FC.2.1: encryptBytecode(bytecode, key) → encryptedBytecode                  │
│  ──────────────────────────────────────────────────────────                 │
│  │                                                                          │
│  │  Encrypt hook bytecode via Fhenix CoFHE                                  │
│  │                                                                          │
│  │  Used by: Hook deployment                                                │
│  │                                                                          │
│  └── Technology: Fhenix CoFHE                                               │
│                                                                              │
│  FC.2.2: signBLS(message, privateKey) → signature                            │
│  ─────────────────────────────────────────────────                          │
│  │                                                                          │
│  │  Sign message with BLS private key                                       │
│  │                                                                          │
│  │  Used by: F2.4.2 (operator signatures)                                   │
│  │                                                                          │
│  └── Technology: EigenLayer BLS library                                     │
│                                                                              │
│  FC.2.3: verifyBLSAggregate(message, pubkeys[], aggSig) → bool               │
│  ──────────────────────────────────────────────────────────────             │
│  │                                                                          │
│  │  Verify aggregated BLS signature                                         │
│  │                                                                          │
│  │  Used by: TaskManager response verification                              │
│  │                                                                          │
│  └── Contract: BLSSignatureChecker                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Function-to-Interface Mapping

| Function | Interface/Contract | Method |
|----------|-------------------|--------|
| F1.1.1 | `IHookSpecification` | `declareStateWrites()` |
| F1.1.2 | `IHookSpecification` | `declareStateReads()` |
| F1.3.1 | `IHookSpecification` | `declareInvariants()` |
| F1.4.3 | `IHookSpecification` | `specificationURI()` |
| F2.1.1 | `IHookStateView` | `getTraderState()`, `getLPPositionState()` |
| F2.1.2 | `IHookStateView` | `getHookState()` |
| F2.4.3 | `IHookAttestationTaskManager` | `respondToAttestationTask()` |
| F2.4.4 | `IAttestationRegistry` | `recordAttestation()` |
| F3.1.1 | `IHookNFTRegistry` | `mint()` |
| F3.1.2 | `IHookMarket` | `list()` |
| F3.2.2 | `IAttestationRegistry` | `getAttestation()` |
| F3.2.3 | `IHookMarket` | `purchase()` |
| F3.3.1 | `IProtocolHookMediator` | `registerHook()` |
| F3.4.1 | `IMasterHook` | `beforeSwap()`, etc. |

---

## 8. Mathematical Foundation Mapping

| Function | Mathematical Concept | Reference |
|----------|---------------------|-----------|
| F1.1.1-3 | State space $\mathcal{S} = \mathcal{S}_{LP} \times \mathcal{S}_T \times \mathcal{S}_{shared}$ | state-space-model.md §2 |
| F1.2.1-4 | Transition functions $f_i: (H \times P) \rightarrow (H' \times \Delta)$ | state-space-model.md §3 |
| F1.3.1-3 | Invariants $\phi(H)$, $\psi(H, H', P)$, $\chi(P, H)$ | state-space-model.md §4 |
| F2.3.2 | Expected output $f_i^{spec}(H, P, input)$ | avs-verification-system.md §4.2 |
| F2.3.3 | Tolerance $\|f^{actual} - f^{spec}\| \leq \epsilon$ | avs-verification-system.md §4.2 |
| F2.3.4 | Invariant verification $\forall \phi: \phi(H, P) = \text{true}$ | state-space-model.md §4 |

---

## 9. Next Steps

Based on this decomposition, the priority implementation order is:

1. **Specification Template (F1.4)**: Create concrete template developers can fill in
2. **Spec Parser (F2.3.1)**: Build tool to parse specifications into verification rules
3. **Expected Output Calculator (F2.3.2)**: Core spec-to-verification translation
4. **State Sampler (F2.1)**: Implement sampling utilities
5. **Comparison Logic (F2.3.3-4)**: Build verification comparison functions
