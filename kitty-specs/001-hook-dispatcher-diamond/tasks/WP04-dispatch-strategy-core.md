---
work_package_id: "WP04"
subtasks:
  - "T018"
  - "T019"
  - "T020"
  - "T021"
  - "T022"
  - "T023"
title: "Dispatch Strategy Core"
phase: "Phase 1 - Core Implementation"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
dependencies: ["WP03"]
requirement_refs: ["FR-002", "FR-003", "FR-010", "FR-011"]
history:
  - timestamp: "2026-03-06T15:10:20Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP04 – Dispatch Strategy Core

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check `review_status` above.

---

## Review Feedback

*[Empty initially.]*

---

## Objectives & Success Criteria

- `DispatchStrategyFacet.sol` implements the full dispatch loop
- Bitmap decoding from hookData selects correct facets (INV-003)
- Empty hookData dispatches to all registered facets (INV-004)
- Critical/non-critical failure policy works (INV-008)
- Aggregation routing: 1 result → direct, >1 → aggregator, >1 no aggregator → revert (INV-006/007)

## Context & Constraints

- **Architecture**: This facet is registered in the HookDispatcher Diamond. When MasterHook receives `afterSwap(...)`, the fallback delegatecalls to HookDispatcher, which routes to this facet.
- **hookData layout**: `[2 bytes HookBitmap][remaining bytes = forwarded hookData to facets]`
- **Delegatecall chain**: MasterHook storage context → HookDispatcher code → DispatchStrategy code → HookFacet code. All share MasterHook's storage.
- **Return values**: Must match PoolManager expectations — `BalanceDelta` for afterSwap/afterAddLiquidity/afterRemoveLiquidity, `(bytes4, BeforeSwapDelta, uint24)` for beforeSwap, `bytes4` for others.

## Subtasks & Detailed Guidance

### Subtask T018 – Create DispatchStrategyFacet.sol skeleton

- **Purpose**: Entry point for hook dispatch.
- **Steps**:
  1. Create `contracts/src/master-hook-pkg/DispatchStrategyFacet.sol`
  2. Import types: `HookBitmap`, `FacetConfig`, `DispatcherStorageMod` functions
  3. Define the contract — no inheritance (SCOP)
  4. Add internal helper stubs for bitmap decode, dispatch loop, aggregation
  5. The entry point is the hook callback itself (e.g., `afterSwap` selector routed here by Diamond)
- **Files**: `contracts/src/master-hook-pkg/DispatchStrategyFacet.sol` (new, ~200 lines)
- **Notes**: This facet needs to handle ALL 10 hook selectors. Options: (a) 10 separate external functions matching IHooks, or (b) a single internal dispatch function called from each. Option (b) is cleaner.

### Subtask T019 – Bitmap decoding from hookData

- **Purpose**: Extract the HookBitmap from hookData, or default to allFacetsBitmap.
- **Steps**:
  1. If `hookData.length == 0` → return `allFacetsBitmap()` (INV-004)
  2. If `hookData.length >= 2` → extract first 2 bytes as `uint16`, create via `newHookBitmap(raw)`
  3. Remaining bytes (`hookData[2:]`) are forwarded to facets as their hookData
  4. If bitmap is `0` (empty) → no facets execute, return default values
- **Files**: `contracts/src/master-hook-pkg/DispatchStrategyFacet.sol`
- **Parallel?**: Yes — pure decode logic

```solidity
function _decodeBitmap(bytes calldata hookData) internal pure returns (HookBitmap bitmap, bytes calldata facetData) {
    if (hookData.length == 0) {
        return (allFacetsBitmap(), hookData);
    }
    uint16 raw = uint16(bytes2(hookData[:2]));
    bitmap = newHookBitmap(raw);
    facetData = hookData[2:];
}
```

### Subtask T020 – Dispatch loop with delegatecall

- **Purpose**: Iterate registry, delegatecall selected facets.
- **Steps**:
  1. Get `registryLength(msg.sig)` — the hook point selector is `msg.sig`
  2. For `i = 0` to `registryLength - 1`:
     a. If `bitmap.isSet(uint8(i))` → delegatecall to `getFacetConfig(msg.sig, i).facet`
     b. Build calldata: same as original call but with `facetData` replacing hookData
  3. Collect results in `bytes[] memory results`
  4. The delegatecall must forward all original arguments (sender, key, params, hookData)
- **Files**: `contracts/src/master-hook-pkg/DispatchStrategyFacet.sol`
- **Notes**: Use assembly `delegatecall` for gas efficiency, or `address.delegatecall(abi.encodeWithSelector(...))` for clarity. Start with high-level, optimize later.

### Subtask T021 – Failure policy (critical/non-critical)

- **Purpose**: INV-008 — critical facet revert → entire dispatch reverts; non-critical → skip.
- **Steps**:
  1. Wrap delegatecall in try/catch (or check success bool from low-level call)
  2. If `!success && getFacetConfig(msg.sig, i).critical` → `revert` with original error data
  3. If `!success && !getFacetConfig(msg.sig, i).critical` → continue loop, don't add to results
  4. If `success` → decode return data, add to results array
- **Files**: `contracts/src/master-hook-pkg/DispatchStrategyFacet.sol`
- **Parallel?**: Yes — independent concern from bitmap decode

```solidity
(bool success, bytes memory returnData) = config.facet.delegatecall(callData);
if (!success) {
    if (config.critical) {
        assembly { revert(add(returnData, 0x20), mload(returnData)) }
    }
    // non-critical: skip
    continue;
}
results[resultCount] = returnData;
resultCount++;
```

### Subtask T022 – Return value collection

- **Purpose**: Collect bytes[] array of return values from executed facets.
- **Steps**:
  1. Pre-allocate `bytes[] memory results = new bytes[](bitmap.popcount())`
  2. Track `resultCount` as facets execute (may be less than popcount if non-critical facets revert)
  3. Trim array to actual `resultCount` before passing to aggregation
- **Files**: `contracts/src/master-hook-pkg/DispatchStrategyFacet.sol`

### Subtask T023 – Aggregation routing

- **Purpose**: INV-006 (aggregator iff >1 result), INV-007 (missing aggregator reverts).
- **Steps**:
  1. If `resultCount == 0` → return default value for the hook point (e.g., `bytes4(0)` for beforeInitialize)
  2. If `resultCount == 1` → return `results[0]` directly
  3. If `resultCount > 1`:
     a. Load aggregator: `IAggregator agg = getAggregator(msg.sig)`
     b. If `address(agg) == address(0)` → `revert NoAggregatorForMultiResult(msg.sig)` (INV-007)
     c. Call `agg.aggregate(results)` and return combined value
- **Files**: `contracts/src/master-hook-pkg/DispatchStrategyFacet.sol`
- **Notes**: The aggregator is called via `call` not `delegatecall` — aggregators are stateless and don't need storage access. This is intentional.

## Risks & Mitigations

- **Gas cost**: Each delegatecall costs ~2600 gas base + execution. With 16 facets, overhead is significant → benchmark against SC-006
- **hookData encoding**: Changing the first 2 bytes to bitmap may break existing hookData consumers → document migration path
- **Return type variance**: Different hook points return different types. The dispatch loop must handle this generically (raw bytes).

## Review Guidance

- Verify bitmap decode handles edge cases: empty hookData, hookData shorter than 2 bytes
- Check that critical revert propagates original error data (not a wrapper error)
- Verify aggregator is called via `call` (not delegatecall)
- Check gas: is the results array allocation efficient?

## Implementation Command

```bash
spec-kitty implement WP04 --base WP03
```

## Activity Log

- 2026-03-06T15:10:20Z – system – lane=planned – Prompt created.
