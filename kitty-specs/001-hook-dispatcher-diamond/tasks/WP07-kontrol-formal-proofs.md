---
work_package_id: "WP07"
subtasks:
  - "T033"
  - "T034"
  - "T035"
  - "T036"
  - "T037"
  - "T038"
  - "T039"
title: "Kontrol Formal Proofs"
phase: "Phase 3 - Verification"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
dependencies: ["WP04"]
requirement_refs: ["FR-001", "FR-002", "FR-009", "FR-011", "FR-012"]
history:
  - timestamp: "2026-03-06T15:10:20Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP07 – Kontrol Formal Proofs

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check `review_status` above.

---

## Review Feedback

*[Empty initially.]*

---

## Objectives & Success Criteria

- 7 Kontrol proofs pass `kontrol prove`
- Type-level invariants (INV-010, 011, 012) formally verified
- Core system invariants (INV-001, 002, 003, 004) formally verified
- Each proof written, built, and verified ONE AT A TIME (TDD skill requirement)

## Context & Constraints

- **TDD Skill Phase 4**: Write ONE proof → `kontrol build` → `kontrol prove --match-test <name>` → verify → review → THEN next
- **NEVER batch proofs**
- Proof files in `contracts/test/master-hook-pkg/kontrol/`
- Use `KontrolCheats` for symbolic values
- Tests and scripts MAY use inheritance (`is Test, KontrolCheats`) — only exception to SCOP no-inheritance rule

## Subtasks & Detailed Guidance

### Subtask T033 – prove_hookBitmap_masksInvalidBits (INV-010)

- **Purpose**: Verify that `newHookBitmap` masks/rejects bits above MAX_FACETS-1.
- **Steps**:
  1. Create `contracts/test/master-hook-pkg/kontrol/HookBitmapProof.k.sol`
  2. Proof: for all uint16 `raw`, `newHookBitmap(raw)` either succeeds with `unwrap(result) & ~VALID_MASK == 0`, or reverts
  3. `kontrol build && kontrol prove --match-test prove_hookBitmap_masksInvalidBits`
- **Files**: `contracts/test/master-hook-pkg/kontrol/HookBitmapProof.k.sol`

```solidity
function prove_hookBitmap_masksInvalidBits(uint16 raw) public pure {
    if (raw & ~VALID_MASK != 0) {
        vm.expectRevert();
        newHookBitmap(raw);
    } else {
        HookBitmap b = newHookBitmap(raw);
        assert(HookBitmap.unwrap(b) == raw);
    }
}
```

### Subtask T034 – prove_facetIndex_boundedByRegistry (INV-011)

- **Purpose**: Verify `newFacetIndex(i, len)` reverts when `i >= len`.
- **Steps**:
  1. Proof: for all uint8 `index` and `registryLength`, `newFacetIndex` succeeds iff `index < registryLength`
  2. When succeeds: `unwrap(result) == index`
- **Files**: `contracts/test/master-hook-pkg/kontrol/FacetIndexProof.k.sol`

### Subtask T035 – prove_hookPointSelector_exhaustiveMatch (INV-012)

- **Purpose**: Verify only the 10 valid IHooks selectors are accepted.
- **Steps**:
  1. Proof: for all bytes4 `sel`, `newHookPointSelector(sel)` succeeds iff `sel` is one of the 10 valid selectors
  2. Use concrete assertion for each valid selector + symbolic for invalid
- **Files**: `contracts/test/master-hook-pkg/kontrol/HookPointSelectorProof.k.sol`

### Subtask T036 – prove_registerFacet_noDuplicates (INV-002)

- **Purpose**: Verify that registering the same facet twice for the same hook point reverts.
- **Steps**:
  1. Create `contracts/test/master-hook-pkg/kontrol/DispatcherProof.k.sol`
  2. Setup: deploy HookDispatcher + FacetRegistryFacet
  3. Register facet A for selector S — succeeds
  4. Register facet A for selector S again — must revert with DuplicateFacet
- **Files**: `contracts/test/master-hook-pkg/kontrol/DispatcherProof.k.sol`
- **Notes**: This requires deployed contracts, not just pure functions — more complex proof

### Subtask T037 – prove_registerFacet_maxFacetsCap (INV-001)

- **Purpose**: Verify that registering the 17th facet for a hook point reverts.
- **Steps**:
  1. Setup: register 16 distinct facets for the same selector
  2. Attempt to register 17th — must revert with MaxFacetsExceeded
- **Files**: `contracts/test/master-hook-pkg/kontrol/DispatcherProof.k.sol`

### Subtask T038 – prove_dispatch_bitmapCorrectness (INV-003)

- **Purpose**: Verify bitmap dispatch invokes exactly the facets whose bits are set.
- **Steps**:
  1. Setup: register N facets (symbolic N, bounded 1-16)
  2. Dispatch with bitmap B
  3. Assert: executed set == {fi : bit i of B is set AND i < N}
- **Files**: `contracts/test/master-hook-pkg/kontrol/DispatcherProof.k.sol`
- **Notes**: May need to bound N small (e.g., 3-4) for Kontrol to terminate. Fall back to fuzz for larger N.

### Subtask T039 – prove_emptyHookData_allFacets (INV-004)

- **Purpose**: Verify empty hookData dispatches to all registered facets.
- **Steps**:
  1. Setup: register N facets
  2. Dispatch with empty hookData (length 0)
  3. Assert: all N facets executed
- **Files**: `contracts/test/master-hook-pkg/kontrol/DispatcherProof.k.sol`

## Risks & Mitigations

- Kontrol timeout on complex proofs → use `vm.assume()` to bound inputs, reduce N
- Symbolic delegatecall may be infeasible → fall back to fuzz tests (WP08) for those invariants
- Proof with deployed contracts (T036-T039) requires symbolic execution of constructor → may need concrete setup

## Review Guidance

- Each proof reviewed individually after passing
- Verify proof actually tests the claimed invariant (not a tautology)
- Check `vm.assume()` bounds are reasonable (not trivially true)

## Implementation Command

```bash
spec-kitty implement WP07 --base WP04
```

## Activity Log

- 2026-03-06T15:10:20Z – system – lane=planned – Prompt created.
