---
work_package_id: "WP06"
subtasks:
  - "T029"
  - "T030"
  - "T031"
  - "T032"
title: "Reference Aggregators"
phase: "Phase 1 - Core Implementation"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
dependencies: ["WP01"]
requirement_refs: ["FR-004"]
history:
  - timestamp: "2026-03-06T15:10:20Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP06 – Reference Aggregators

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check `review_status` above.

---

## Review Feedback

*[Empty initially.]*

---

## Objectives & Success Criteria

- `SumDeltaAggregator.sol` correctly sums BalanceDelta values (SC-003)
- `LastWriteWinsAggregator.sol` returns last facet's value (SC-003)
- `NoOpAggregator.sol` handles void hook points
- Unit tests cover edge cases (overflow, empty, single)

## Context & Constraints

- **IAggregator interface**: `function aggregate(bytes[] calldata results) external pure returns (bytes memory combined)`
- **BalanceDelta**: Uniswap v4 type — `int256` packed as two `int128` (amount0, amount1)
- **Aggregators are stateless**: Pure functions, no storage access, called via `call` not `delegatecall`
- **SCOP**: Aggregator contracts may use `is IAggregator` (interface implementation is acceptable)

## Subtasks & Detailed Guidance

### Subtask T029 – SumDeltaAggregator

- **Purpose**: Sum BalanceDelta return values from multiple facets.
- **Steps**:
  1. Create `contracts/src/master-hook-pkg/aggregators/SumDeltaAggregator.sol`
  2. Implement `aggregate(bytes[] calldata results)`:
     a. Initialize `int256 sum0 = 0, sum1 = 0`
     b. For each result: decode as BalanceDelta, extract amount0 and amount1 (both int128)
     c. Accumulate in int256 to prevent overflow
     d. Safe-cast final sum back to int128 — revert if overflow
     e. Pack and return as BalanceDelta
  3. Handle edge cases:
     - Empty results array → return zero BalanceDelta
     - Single result → return it directly (optimization)
- **Files**: `contracts/src/master-hook-pkg/aggregators/SumDeltaAggregator.sol` (new, ~60 lines)
- **Parallel?**: Yes

### Subtask T030 – LastWriteWinsAggregator

- **Purpose**: Return the last facet's return value. Used for fee overrides in beforeSwap.
- **Steps**:
  1. Create `contracts/src/master-hook-pkg/aggregators/LastWriteWinsAggregator.sol`
  2. Implement `aggregate(bytes[] calldata results)`:
     a. Return `results[results.length - 1]`
     b. Revert on empty array
  3. Simple but important for fee override semantics
- **Files**: `contracts/src/master-hook-pkg/aggregators/LastWriteWinsAggregator.sol` (new, ~25 lines)
- **Parallel?**: Yes

### Subtask T031 – NoOpAggregator

- **Purpose**: For hook points like beforeInitialize that have void-like returns (just bytes4 selector).
- **Steps**:
  1. Create `contracts/src/master-hook-pkg/aggregators/NoOpAggregator.sol`
  2. Implement `aggregate(bytes[] calldata results)`:
     a. Return `results[0]` (first facet's selector return)
     b. All facets should return the same selector — no meaningful aggregation
  3. This is a safety net — ensures multi-facet void hooks don't revert due to missing aggregator
- **Files**: `contracts/src/master-hook-pkg/aggregators/NoOpAggregator.sol` (new, ~20 lines)
- **Parallel?**: Yes

### Subtask T032 – Unit tests for aggregators

- **Purpose**: Verify correctness of all three aggregators.
- **Steps**:
  1. Create `contracts/test/master-hook-pkg/unit/AggregatorTest.t.sol`
  2. Tests for SumDeltaAggregator:
     - Two deltas: (10, -5) + (3, -2) = (13, -7)
     - Single delta: passthrough
     - Empty array: zero delta
     - Overflow: int128 max + 1 reverts
  3. Tests for LastWriteWinsAggregator:
     - Two values: returns second
     - Single value: returns it
     - Empty: reverts
  4. Tests for NoOpAggregator:
     - Returns first result
- **Files**: `contracts/test/master-hook-pkg/unit/AggregatorTest.t.sol` (new, ~100 lines)

## Risks & Mitigations

- int128 overflow during summation → int256 accumulators with safe-cast revert
- BalanceDelta encoding may change between v4 versions → pin v4-core version

## Review Guidance

- Verify SumDelta uses int256 accumulators (not int128)
- Check safe-cast on final result
- Verify LastWriteWins handles edge cases

## Implementation Command

```bash
spec-kitty implement WP06 --base WP01
```

## Activity Log

- 2026-03-06T15:10:20Z – system – lane=planned – Prompt created.
