# Hook State-Space Model: Dual-Index Architecture

> **Status:** Research Foundation
> **Last Updated:** 2025-12-09
> **References:** [arXiv:2512.06203](https://arxiv.org/abs/2512.06203), [arXiv:2103.12732](https://arxiv.org/abs/2103.12732), [arXiv:2103.00540](https://arxiv.org/abs/2103.00540)

## 1. Overview

This document formalizes the state-space model for Uniswap V4 hooks using a **dual-index architecture** that separates state variables by primary user interaction patterns:

- **LP Index ($\mathcal{S}_{LP}$)**: State accessed/modified by liquidity providers
- **Trader Index ($\mathcal{S}_T$)**: State accessed/modified by traders/swappers

This partitioning enables:
1. Efficient state queries per user type
2. Clear hook callback → state mapping
3. Formal verification of hook invariants
4. Gas-optimized storage patterns

---

## 2. State Vector Definitions

### 2.1 Complete Pool State

Following [Tranquilli & Gupta, 2025](https://arxiv.org/abs/2512.06203), Definition 1:

```
Pool Configuration: cfg = (ic, X, Y, Lact, L, Fx, Fy)
```

We decompose this into three partitions:

$$
\mathcal{S} = \mathcal{S}_{LP} \times \mathcal{S}_T \times \mathcal{S}_{shared}
$$

### 2.2 LP State Index ($\mathcal{S}_{LP}$)

Variables primarily accessed by liquidity providers:

| Variable | Type | Description | IStateView Getter |
|----------|------|-------------|-------------------|
| $L_k$ | `uint128` | Position liquidity | `getPositionLiquidity()` |
| $t_l^k$ | `int24` | Lower tick bound | `getPositionInfo()` |
| $t_u^k$ | `int24` | Upper tick bound | `getPositionInfo()` |
| $f_{0,k}^{in}$ | `uint256` | Fee growth inside (token0) | `getPositionInfo()` |
| $f_{1,k}^{in}$ | `uint256` | Fee growth inside (token1) | `getPositionInfo()` |
| $L_g^{tick}$ | `uint128` | Gross liquidity at tick | `getTickLiquidity()` |
| $L_n^{tick}$ | `int128` | Net liquidity at tick | `getTickLiquidity()` |
| $f_0^{out,tick}$ | `uint256` | Fee growth outside (token0) | `getTickFeeGrowthOutside()` |
| $f_1^{out,tick}$ | `uint256` | Fee growth outside (token1) | `getTickFeeGrowthOutside()` |

**Formal Definition:**

$$
\mathcal{S}_{LP} = \bigcup_{k \in \mathcal{I}} \{(L_k, t_l^k, t_u^k, f_{0,k}^{in}, f_{1,k}^{in})\} \cup \bigcup_{i \in \text{Tick}} \{(L_g^i, L_n^i, f_0^{out,i}, f_1^{out,i})\}
$$

**Solidity Struct Mapping:**

```solidity
/// @notice LP-indexed state for a position
/// @dev Maps to IStateView.getPositionInfo()
struct LPPositionState {
    uint128 liquidity;        // L_k
    int24 tickLower;          // t_l^k
    int24 tickUpper;          // t_u^k
    uint256 feeGrowthInside0; // f_{0,k}^{in}
    uint256 feeGrowthInside1; // f_{1,k}^{in}
}

/// @notice LP-indexed state for a tick
/// @dev Maps to IStateView.getTickInfo()
struct LPTickState {
    uint128 liquidityGross;      // L_g^{tick}
    int128 liquidityNet;         // L_n^{tick}
    uint256 feeGrowthOutside0;   // f_0^{out,tick}
    uint256 feeGrowthOutside1;   // f_1^{out,tick}
}
```

### 2.3 Trader State Index ($\mathcal{S}_T$)

Variables primarily accessed by traders during swaps:

| Variable | Type | Description | IStateView Getter |
|----------|------|-------------|-------------------|
| $\sqrt{P}$ | `uint160` | Current sqrt price (Q64.96) | `getSlot0()` |
| $t_c$ | `int24` | Current tick | `getSlot0()` |
| $\phi_{lp}$ | `uint24` | LP fee (swap fee) | `getSlot0()` |
| $\phi_{proto}$ | `uint24` | Protocol fee | `getSlot0()` |
| $L_{act}$ | `uint128` | Active liquidity | `getLiquidity()` |
| $B_{tick}$ | `uint256` | Tick bitmap | `getTickBitmap()` |

**Formal Definition:**

$$
\mathcal{S}_T = (\sqrt{P}, t_c, \phi_{lp}, \phi_{proto}, L_{act}, B_{tick})
$$

**Solidity Struct Mapping:**

```solidity
/// @notice Trader-indexed state (Slot0 + active liquidity)
/// @dev Maps to IStateView.getSlot0() and getLiquidity()
struct TraderState {
    uint160 sqrtPriceX96;  // sqrt(P) in Q64.96
    int24 tick;            // t_c - current tick
    uint24 lpFee;          // phi_lp - fee paid to LPs
    uint24 protocolFee;    // phi_proto - protocol fee
    uint128 liquidity;     // L_act - active liquidity for swaps
}

/// @notice Extended trader state with routing info
struct TraderStateExtended {
    TraderState core;
    uint256 tickBitmap;    // B_tick - for finding next initialized tick
}
```

### 2.4 Shared State ($\mathcal{S}_{shared}$)

Variables accessed by both LPs and traders:

| Variable | Type | Description | IStateView Getter |
|----------|------|-------------|-------------------|
| $f_0^{global}$ | `uint256` | Global fee growth (token0) | `getFeeGrowthGlobals()` |
| $f_1^{global}$ | `uint256` | Global fee growth (token1) | `getFeeGrowthGlobals()` |

**Formal Definition:**

$$
\mathcal{S}_{shared} = (f_0^{global}, f_1^{global})
$$

**Derived Invariant** (from [arXiv:2512.06203](https://arxiv.org/abs/2512.06203), Definition 2):

$$
K_i(X, Y, L_{act}) := X \cdot Y
$$

Where $X, Y$ are virtual reserves computed from $L_{act}$ and $\sqrt{P}$.

---

## 3. State Transition System

### 3.1 Transition Types

Following [Tranquilli & Gupta, 2025](https://arxiv.org/abs/2512.06203), Section III-B:

```
Transitions := SWAP(δ) | MINT(k, ...) | BURN(k) | CROSS(±)
```

### 3.2 Hook Callback → State Mapping

| Hook Callback | Transition Type | Primary Index | Secondary Index | State Changes |
|---------------|-----------------|---------------|-----------------|---------------|
| `beforeSwap` | SWAP | $\mathcal{S}_T$ | read $\mathcal{S}_{LP}$ | May modify fee, block swap |
| `afterSwap` | SWAP | $\mathcal{S}_T$, $\mathcal{S}_{shared}$ | - | Fee accounting, delta modifications |
| `beforeAddLiquidity` | MINT | $\mathcal{S}_{LP}$ | - | Validation, custom accounting |
| `afterAddLiquidity` | MINT | $\mathcal{S}_{LP}$ | $\mathcal{S}_T$ ($L_{act}$) | Position creation, liquidity update |
| `beforeRemoveLiquidity` | BURN | $\mathcal{S}_{LP}$ | - | Validation, lock checks |
| `afterRemoveLiquidity` | BURN | $\mathcal{S}_{LP}$ | $\mathcal{S}_T$ ($L_{act}$) | Position removal, fee collection |
| `beforeDonate` | - | $\mathcal{S}_{shared}$ | - | Custom donation logic |
| `afterDonate` | - | $\mathcal{S}_{shared}$ | - | Fee distribution |

### 3.3 Formal Transition Rules

**SWAP Transition (within tick):**

From [arXiv:2512.06203](https://arxiv.org/abs/2512.06203), Section III-B:

```
Given cfg with tick ic and Lact > 0:

X' = X + δx
Y' = Y - ⌊φ(δx, Lact, ic)⌋
ic' = ic
Lact' = Lact
```

**Solidity Implementation Pattern:**

```solidity
/// @notice State changes for a swap within a single tick
/// @dev Implements the discretized constant-product update
/// @param state Current trader state
/// @param deltaX Input amount of token0
/// @return newState Updated trader state
/// @return deltaY Output amount of token1
function applySwapTransition(
    TraderState memory state,
    int256 deltaX
) internal pure returns (TraderState memory newState, int256 deltaY) {
    // K = X * Y (virtual reserves from L and sqrtP)
    // X' = X + δx
    // Y' = ⌊K / X'⌋

    uint160 sqrtPriceNext = SqrtPriceMath.getNextSqrtPriceFromInput(
        state.sqrtPriceX96,
        state.liquidity,
        uint256(deltaX),
        true // zeroForOne
    );

    newState = TraderState({
        sqrtPriceX96: sqrtPriceNext,
        tick: TickMath.getTickAtSqrtPrice(sqrtPriceNext),
        lpFee: state.lpFee,
        protocolFee: state.protocolFee,
        liquidity: state.liquidity
    });

    deltaY = SqrtPriceMath.getAmount1Delta(
        state.sqrtPriceX96,
        sqrtPriceNext,
        state.liquidity,
        false // roundUp
    );
}
```

**CROSS Transition (tick crossing):**

```
If swap drives price to P_{ic+1}:

ic' = ic + 1
Lact' = Lact + ΔL_{ic+1}
X' = X  (unchanged)
Y' = Y  (unchanged)
```

**Solidity Implementation Pattern:**

```solidity
/// @notice State changes when crossing a tick boundary
/// @dev Updates active liquidity based on net liquidity at tick
/// @param state Current trader state
/// @param tickNext The tick being crossed into
/// @param liquidityNet Net liquidity change at the tick boundary
/// @return newState Updated trader state
function applyTickCrossTransition(
    TraderState memory state,
    int24 tickNext,
    int128 liquidityNet
) internal pure returns (TraderState memory newState) {
    // Lact' = Lact + ΔL_{tick}
    // Sign depends on direction: add when crossing up, subtract when crossing down

    bool crossingUp = tickNext > state.tick;
    int128 liquidityDelta = crossingUp ? liquidityNet : -liquidityNet;

    newState = TraderState({
        sqrtPriceX96: TickMath.getSqrtPriceAtTick(tickNext),
        tick: tickNext,
        lpFee: state.lpFee,
        protocolFee: state.protocolFee,
        liquidity: LiquidityMath.addDelta(state.liquidity, liquidityDelta)
    });
}
```

---

## 4. Invariant Properties

### 4.1 Tick-wise Constant Product Invariant

From [arXiv:2512.06203](https://arxiv.org/abs/2512.06203), Lemma 1:

**Single-Swap Bound:**

$$
K - X' \leq K' \leq K
$$

Where $K = X \cdot Y$ and $K' = X' \cdot Y'$.

**Multi-Swap Bound (Theorem 1):**

For a sequence of $n$ swaps with $X_j \leq B$ at each step:

$$
|K_n - K_0| \leq n \cdot B
$$

**Solidity Invariant Check:**

```solidity
/// @notice Verifies the constant product invariant holds within epsilon
/// @dev Based on arXiv:2512.06203 Theorem 1
/// @param k0 Initial product K = X * Y
/// @param kN Final product after n swaps
/// @param n Number of swaps executed
/// @param maxReserve Maximum reserve bound B
/// @return valid True if invariant holds
function checkProductInvariant(
    uint256 k0,
    uint256 kN,
    uint256 n,
    uint256 maxReserve
) internal pure returns (bool valid) {
    // |K_n - K_0| <= n * B
    uint256 epsilon = n * maxReserve;

    if (kN <= k0) {
        return (k0 - kN) <= epsilon;
    } else {
        // K should never increase (rounding always reduces)
        return false;
    }
}
```

### 4.2 Cross-Tick k-Invariance

From [arXiv:2512.06203](https://arxiv.org/abs/2512.06203), Definition 3:

A CLAMM satisfies **cross-tick k-invariance** if:

$$
|K_{i_c}(X, Y, L_{act}) - k| \leq \epsilon
$$

for all reachable configurations and some constant $k$, $\epsilon \geq 0$.

### 4.3 LP State Consistency Invariants

```solidity
/// @notice Invariants that must hold for LP state consistency
interface ILPStateInvariants {
    /// @dev Sum of position liquidities in range equals active liquidity
    /// Σ L_k (where t_l^k <= t_c < t_u^k) == L_act
    function invariantActiveLiquiditySum(PoolId poolId) external view returns (bool);

    /// @dev Gross liquidity at tick equals sum of all positions touching that tick
    /// L_g^{tick} == Σ L_k (where t_l^k == tick OR t_u^k == tick)
    function invariantGrossLiquiditySum(PoolId poolId, int24 tick) external view returns (bool);

    /// @dev Fee growth inside is bounded by global fee growth
    /// f_{0,k}^{in} <= f_0^{global} for all positions k
    function invariantFeeGrowthBounded(PoolId poolId, bytes32 positionId) external view returns (bool);
}
```

---

## 5. Hook State View Interface

### 5.1 Proposed IHookStateView

Extending `IStateView` for hook-specific state:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";

/// @title IHookStateView
/// @notice Interface for querying hook-specific state partitioned by user type
/// @dev Extends the concept from IStateView with hook state variables
/// @custom:reference arXiv:2512.06203 - Formal State-Machine Models for Uniswap v3
interface IHookStateView {

    // ============ LP Index Queries ============

    /// @notice Get LP-relevant state for a specific position
    /// @param poolId The pool identifier
    /// @param owner Position owner
    /// @param tickLower Lower tick bound
    /// @param tickUpper Upper tick bound
    /// @param salt Position salt
    /// @return state The LP position state struct
    function getLPPositionState(
        PoolId poolId,
        address owner,
        int24 tickLower,
        int24 tickUpper,
        bytes32 salt
    ) external view returns (LPPositionState memory state);

    /// @notice Get LP-relevant state for a tick
    /// @param poolId The pool identifier
    /// @param tick The tick index
    /// @return state The LP tick state struct
    function getLPTickState(
        PoolId poolId,
        int24 tick
    ) external view returns (LPTickState memory state);

    /// @notice Batch query LP states for multiple positions
    /// @param poolId The pool identifier
    /// @param positionIds Array of position identifiers
    /// @return states Array of LP position states
    function batchGetLPPositionStates(
        PoolId poolId,
        bytes32[] calldata positionIds
    ) external view returns (LPPositionState[] memory states);

    // ============ Trader Index Queries ============

    /// @notice Get all trader-relevant state in a single call
    /// @param poolId The pool identifier
    /// @return state The trader state struct
    function getTraderState(
        PoolId poolId
    ) external view returns (TraderState memory state);

    /// @notice Get extended trader state including routing info
    /// @param poolId The pool identifier
    /// @param tickBitmapIndex The word position in tick bitmap
    /// @return state The extended trader state struct
    function getTraderStateExtended(
        PoolId poolId,
        int16 tickBitmapIndex
    ) external view returns (TraderStateExtended memory state);

    // ============ Shared State Queries ============

    /// @notice Get global fee growth state
    /// @param poolId The pool identifier
    /// @return feeGrowthGlobal0 Global fee growth for token0
    /// @return feeGrowthGlobal1 Global fee growth for token1
    function getSharedFeeState(
        PoolId poolId
    ) external view returns (uint256 feeGrowthGlobal0, uint256 feeGrowthGlobal1);

    // ============ Hook-Specific State ============

    /// @notice Get hook-specific state variables
    /// @dev H in the notation (f_{it}(H, P))
    /// @param poolId The pool identifier
    /// @return hookState Encoded hook state
    function getHookState(
        PoolId poolId
    ) external view returns (bytes memory hookState);

    /// @notice Get hook state for a specific position
    /// @param poolId The pool identifier
    /// @param positionId The position identifier
    /// @return hookPositionState Encoded hook state for position
    function getHookPositionState(
        PoolId poolId,
        bytes32 positionId
    ) external view returns (bytes memory hookPositionState);
}

/// @notice LP-indexed state for a position
struct LPPositionState {
    uint128 liquidity;
    int24 tickLower;
    int24 tickUpper;
    uint256 feeGrowthInside0LastX128;
    uint256 feeGrowthInside1LastX128;
}

/// @notice LP-indexed state for a tick
struct LPTickState {
    uint128 liquidityGross;
    int128 liquidityNet;
    uint256 feeGrowthOutside0X128;
    uint256 feeGrowthOutside1X128;
}

/// @notice Trader-indexed state
struct TraderState {
    uint160 sqrtPriceX96;
    int24 tick;
    uint24 lpFee;
    uint24 protocolFee;
    uint128 liquidity;
}

/// @notice Extended trader state with routing info
struct TraderStateExtended {
    TraderState core;
    uint256 tickBitmap;
}
```

---

## 6. Hook Specification Framework

### 6.1 Hook as Dynamic System

From the project notes, a hook is specified as:

$$
(f_{it}(H, P))_{i=1}^{N}
$$

Where:
- $f_i$ is the $i$-th hook callback function
- $H$ is the hook state (exposed via `IHookStateView.getHookState()`)
- $P$ is the pool state ($\mathcal{S}_{LP} \cup \mathcal{S}_T \cup \mathcal{S}_{shared}$)
- $N$ is the number of implemented callbacks

### 6.2 Hook Specification Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";

/// @title IHookSpecification
/// @notice Interface for declaring hook behavior as a formal specification
/// @dev Enables verification and attestation without code disclosure
/// @custom:reference Project NOTES.md - Hook specification framework
interface IHookSpecification {

    /// @notice Declares which state variables the hook reads
    /// @return lpStateVars Bitmask of LP state variables accessed
    /// @return traderStateVars Bitmask of trader state variables accessed
    /// @return sharedStateVars Bitmask of shared state variables accessed
    function declareStateReads() external pure returns (
        uint256 lpStateVars,
        uint256 traderStateVars,
        uint256 sharedStateVars
    );

    /// @notice Declares which state variables the hook writes
    /// @return hookStateVars Bitmask of hook state variables modified
    function declareStateWrites() external pure returns (uint256 hookStateVars);

    /// @notice Declares invariants the hook maintains
    /// @return invariantIds Array of invariant identifiers
    function declareInvariants() external pure returns (bytes32[] memory invariantIds);

    /// @notice Returns the IPFS hash of the formal specification document
    /// @dev Document contains system of equations in LaTeX/markdown format
    /// @return specHash IPFS CID of specification document
    function specificationURI() external pure returns (string memory specHash);

    /// @notice Returns state transition bounds for verification
    /// @param callback The callback being analyzed
    /// @return maxStateChange Maximum state change magnitude
    /// @return affectedVariables Variables potentially modified
    function transitionBounds(bytes4 callback) external pure returns (
        uint256 maxStateChange,
        bytes32[] memory affectedVariables
    );
}

/// @notice State variable identifiers for bitmask operations
library StateVarIds {
    // LP State Variables (bits 0-31)
    uint256 constant LP_LIQUIDITY = 1 << 0;
    uint256 constant LP_TICK_LOWER = 1 << 1;
    uint256 constant LP_TICK_UPPER = 1 << 2;
    uint256 constant LP_FEE_GROWTH_INSIDE_0 = 1 << 3;
    uint256 constant LP_FEE_GROWTH_INSIDE_1 = 1 << 4;
    uint256 constant LP_LIQUIDITY_GROSS = 1 << 5;
    uint256 constant LP_LIQUIDITY_NET = 1 << 6;
    uint256 constant LP_FEE_GROWTH_OUTSIDE_0 = 1 << 7;
    uint256 constant LP_FEE_GROWTH_OUTSIDE_1 = 1 << 8;

    // Trader State Variables (bits 0-31)
    uint256 constant TRADER_SQRT_PRICE = 1 << 0;
    uint256 constant TRADER_TICK = 1 << 1;
    uint256 constant TRADER_LP_FEE = 1 << 2;
    uint256 constant TRADER_PROTOCOL_FEE = 1 << 3;
    uint256 constant TRADER_LIQUIDITY = 1 << 4;
    uint256 constant TRADER_TICK_BITMAP = 1 << 5;

    // Shared State Variables (bits 0-31)
    uint256 constant SHARED_FEE_GROWTH_GLOBAL_0 = 1 << 0;
    uint256 constant SHARED_FEE_GROWTH_GLOBAL_1 = 1 << 1;
}
```

---

## 7. Verification Integration

### 7.1 Connecting to EigenLayer AVS

For attestation without code disclosure:

```solidity
/// @title IHookAttestationAVS
/// @notice Interface for EigenLayer AVS that verifies hook specifications
/// @custom:reference EigenLayer middleware contracts
interface IHookAttestationAVS {

    /// @notice Submit hook specification for verification
    /// @param hook Address of the hook contract
    /// @param specURI IPFS URI of formal specification
    /// @param sampleData Fuzzer-generated test data
    /// @return attestationId Unique identifier for this attestation request
    function requestAttestation(
        address hook,
        string calldata specURI,
        bytes calldata sampleData
    ) external returns (bytes32 attestationId);

    /// @notice Check if a hook has valid attestation
    /// @param hook Address of the hook contract
    /// @return isValid True if hook has valid attestation
    /// @return attestationId The attestation identifier
    /// @return expiresAt Timestamp when attestation expires
    function getAttestation(address hook) external view returns (
        bool isValid,
        bytes32 attestationId,
        uint256 expiresAt
    );

    /// @notice Verify state transition matches specification
    /// @param hook Address of the hook
    /// @param preState State before hook execution
    /// @param postState State after hook execution
    /// @param callback The callback that was executed
    /// @return valid True if transition matches spec
    function verifyTransition(
        address hook,
        bytes calldata preState,
        bytes calldata postState,
        bytes4 callback
    ) external view returns (bool valid);
}
```

### 7.2 State Sampling for Fuzzer

```solidity
/// @title IHookStateSampler
/// @notice Interface for sampling hook state for verification
/// @dev Used by fuzzer service to collect data for attestation
interface IHookStateSampler {

    /// @notice Sample current state snapshot
    /// @param poolId The pool to sample
    /// @return lpState Encoded LP state
    /// @return traderState Encoded trader state
    /// @return hookState Encoded hook-specific state
    /// @return timestamp Block timestamp of sample
    function sampleState(PoolId poolId) external view returns (
        bytes memory lpState,
        bytes memory traderState,
        bytes memory hookState,
        uint256 timestamp
    );

    /// @notice Sample state transition
    /// @param poolId The pool
    /// @param callback The callback to execute
    /// @param calldata_ The callback parameters
    /// @return preState State before
    /// @return postState State after
    /// @return gasUsed Gas consumed
    function sampleTransition(
        PoolId poolId,
        bytes4 callback,
        bytes calldata calldata_
    ) external returns (
        bytes memory preState,
        bytes memory postState,
        uint256 gasUsed
    );
}
```

---

## 8. References

1. **[arXiv:2512.06203]** Tranquilli, J., & Gupta, N. (2025). *Formal State-Machine Models for Uniswap v3 Concentrated-Liquidity AMMs: Priced Timed Automata, Finite-State Transducers, and Provable Rounding Bounds*. https://arxiv.org/abs/2512.06203

2. **[arXiv:2103.12732]** Xu, J., Paruch, K., Cousaert, S., & Feng, Y. (2021). *SoK: Decentralized Exchanges (DEX) with Automated Market Maker (AMM) Protocols*. https://arxiv.org/abs/2103.12732

3. **[arXiv:2103.00540]** Tolmach, P., Li, Y., Lin, S.-W., & Liu, Y. (2021). *Formal Analysis of Composable DeFi Protocols*. https://arxiv.org/abs/2103.00540

4. **[arXiv:2205.08904]** Heimbach, L., Schertenleib, E., & Wattenhofer, R. (2022). *Risks and Returns of Uniswap V3 Liquidity Providers*. https://arxiv.org/abs/2205.08904

5. **[Uniswap V4]** Adams, H. et al. *Uniswap V4 Core*. https://github.com/Uniswap/v4-core

6. **[IStateView]** Uniswap V4 Periphery. `contracts/lib/v4-periphery/src/interfaces/IStateView.sol`

---

## 9. Appendix: State Variable Quick Reference

### IStateView → Dual Index Mapping

| IStateView Method | Returns | LP Index | Trader Index | Shared |
|-------------------|---------|:--------:|:------------:|:------:|
| `getSlot0()` | sqrtPriceX96, tick, protocolFee, lpFee | | X | |
| `getTickInfo()` | liquidityGross, liquidityNet, feeGrowthOutside0, feeGrowthOutside1 | X | | |
| `getTickLiquidity()` | liquidityGross, liquidityNet | X | | |
| `getTickFeeGrowthOutside()` | feeGrowthOutside0, feeGrowthOutside1 | X | | |
| `getFeeGrowthGlobals()` | feeGrowthGlobal0, feeGrowthGlobal1 | | | X |
| `getLiquidity()` | liquidity | | X | |
| `getTickBitmap()` | tickBitmap | | X | |
| `getPositionInfo()` | liquidity, feeGrowthInside0, feeGrowthInside1 | X | | |
| `getPositionLiquidity()` | liquidity | X | | |
| `getFeeGrowthInside()` | feeGrowthInside0, feeGrowthInside1 | X | | |
