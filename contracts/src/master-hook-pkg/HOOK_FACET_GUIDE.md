# Hook Facet Developer Guide

## Overview

A **HookFacet** is an external hook implementation contract registered in the HookDispatcher's facet registry. When a Uniswap v4 hook callback fires (e.g., `afterSwap`), the dispatch chain is:

```
PoolManager → MasterHook (outer Diamond) → HookDispatcher (inner Diamond) → DispatchStrategyFacet → YOUR HookFacet
```

All execution happens via `delegatecall`, meaning your facet runs in **MasterHook's storage context**.

## Requirements for a Valid HookFacet

### 1. Storage Namespace (CRITICAL)

Your facet MUST use a **unique keccak-based storage namespace** to prevent collisions in the delegatecall chain.

**Reserved namespaces (DO NOT USE):**
- `keccak256("hook-bazar.hooks")` — MasterHook
- `keccak256("hook-bazaar.dispatcher.storage")` — HookDispatcher
- `keccak256("hook-bazaar.haas.storage")` — HaaS system

**Pattern:**
```solidity
bytes32 constant MY_STORAGE_POSITION = keccak256("hook-bazaar.facets.<your-facet-name>.storage");

struct MyFacetStorage {
    // your state here
}

function _getStorage() internal pure returns (MyFacetStorage storage $) {
    bytes32 position = MY_STORAGE_POSITION;
    assembly {
        $.slot := position
    }
}
```

### 2. Hook Function Signatures

Your facet implements one or more IHooks callback functions. The function signatures MUST match exactly:

| Hook Point | Signature | Return Type |
|---|---|---|
| beforeInitialize | `beforeInitialize(address, PoolKey, uint160)` | `bytes4` |
| afterInitialize | `afterInitialize(address, PoolKey, uint160, int24)` | `bytes4` |
| beforeAddLiquidity | `beforeAddLiquidity(address, PoolKey, ModifyLiquidityParams, bytes)` | `bytes4` |
| afterAddLiquidity | `afterAddLiquidity(address, PoolKey, ModifyLiquidityParams, BalanceDelta, BalanceDelta, bytes)` | `(bytes4, BalanceDelta)` |
| beforeRemoveLiquidity | `beforeRemoveLiquidity(address, PoolKey, ModifyLiquidityParams, bytes)` | `bytes4` |
| afterRemoveLiquidity | `afterRemoveLiquidity(address, PoolKey, ModifyLiquidityParams, BalanceDelta, BalanceDelta, bytes)` | `(bytes4, BalanceDelta)` |
| beforeSwap | `beforeSwap(address, PoolKey, SwapParams, bytes)` | `(bytes4, BeforeSwapDelta, uint24)` |
| afterSwap | `afterSwap(address, PoolKey, SwapParams, BalanceDelta, bytes)` | `(bytes4, int128)` |
| beforeDonate | `beforeDonate(address, PoolKey, uint256, uint256, bytes)` | `bytes4` |
| afterDonate | `afterDonate(address, PoolKey, uint256, uint256, bytes)` | `bytes4` |

**Note:** The `bytes hookData` parameter you receive has the bitmap prefix ALREADY STRIPPED by the dispatcher. You receive only the facet-relevant portion.

### 3. Registration

Your facet is registered by the protocol admin via the FacetRegistryFacet:

```solidity
// Admin registers your facet for specific hook points
FacetRegistryFacet.registerFacet(
    IHooks.afterSwap.selector,   // hook point
    address(yourFacet),           // facet address
    true                          // critical: true = revert on failure, false = skip
);
```

- **Max 16 facets** per hook point
- **No duplicate addresses** per hook point
- One facet can be registered for multiple hook points

### 4. Critical vs Non-Critical

When registered:
- **`critical = true`**: If your facet reverts, the ENTIRE hook dispatch reverts. Use for essential logic (fee calculations, security checks).
- **`critical = false`**: If your facet reverts, it's skipped and dispatch continues. Use for optional analytics, logging, or best-effort features.

### 5. Return Values and Aggregation

If multiple facets are registered for the same hook point:
- Their return values are combined by a pluggable **IAggregator** contract
- **SumDeltaAggregator**: Sums BalanceDelta values (for afterSwap, afterAddLiquidity, etc.)
- **LastWriteWinsAggregator**: Uses last facet's return (for fee overrides in beforeSwap)
- **NoOpAggregator**: For void hook points (beforeInitialize, etc.)

If only your facet is registered, your return value is used directly (no aggregation).

### 6. SCOP Constraints

The codebase follows SCOP (Single Contract Operation Philosophy):
- **No contract inheritance** (`is`) in production contracts — use file-level free functions
- **No `library` keyword** — use Mod files with `using ... for ... global`
- **No `modifier` keyword** — use inline `if`/`revert` checks
- **No `public` functions** in contracts — only `external` and `internal`
- **No ternary operator** — use `if`/`else`

Tests and scripts are exempt from these rules.

### 7. Access Control

Your facet runs in MasterHook's storage context, so you can read MasterHook's AccessControl state:
```solidity
import "Compose/access/AccessControl/AccessControlMod.sol" as AccessControlMod;

// Inside your facet function:
if (!AccessControlMod.hasRole(SOME_ROLE, msg.sender)) revert Unauthorized();
```

`msg.sender` in the delegatecall chain is the original caller (PoolManager for hook callbacks).

## Bitmap Selection

Callers select which facets fire per hook call via a bitmap in `hookData`:

```
hookData layout: [2 bytes bitmap][remaining bytes forwarded to facets]
```

- Bit 0 = facet at registry index 0, Bit 1 = index 1, etc.
- Empty hookData = all registered facets fire
- Bitmap `0b101` with 3 registered facets = facets 0 and 2 fire, facet 1 skipped

## Example Minimal Facet

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

contract MyCounterFacet {
    bytes32 constant STORAGE_POS = keccak256("hook-bazaar.facets.my-counter.storage");

    struct CounterStorage {
        mapping(bytes32 => uint256) swapCounts;
    }

    function _store() internal pure returns (CounterStorage storage $) {
        bytes32 pos = STORAGE_POS;
        assembly { $.slot := pos }
    }

    function afterSwap(
        address,
        PoolKey calldata key,
        SwapParams calldata,
        BalanceDelta,
        bytes calldata
    ) external returns (bytes4, int128) {
        _store().swapCounts[keccak256(abi.encode(key))]++;
        return (IHooks.afterSwap.selector, int128(0));
    }
}
```

## References

- **Spec**: `kitty-specs/001-hook-dispatcher-diamond/spec.md`
- **Invariants**: `specs/hook-dispatcher-diamond/invariants.md` (12 invariants)
- **Plan**: `kitty-specs/001-hook-dispatcher-diamond/plan.md`
- **Work Packages**: `kitty-specs/001-hook-dispatcher-diamond/tasks/WP01-WP08`
- **Types**: `contracts/src/master-hook-pkg/types/` (HookBitmap, FacetIndex, HookPointSelector, FacetConfig, IAggregator, DispatcherStorage)
- **Upstream Issues**: https://github.com/hook-bazaar/monorepo/issues (issues #34-#41)
