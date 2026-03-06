---
work_package_id: "WP08"
subtasks:
  - "T040"
  - "T041"
  - "T042"
  - "T043"
  - "T044"
  - "T045"
title: "Fuzz Tests & Static Analysis"
phase: "Phase 3 - Verification"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
dependencies: ["WP05"]
requirement_refs: ["FR-001", "FR-002", "FR-003", "FR-010"]
history:
  - timestamp: "2026-03-06T15:10:20Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP08 – Fuzz Tests & Static Analysis

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check `review_status` above.

---

## Review Feedback

*[Empty initially.]*

---

## Objectives & Success Criteria

- 4 fuzz tests pass `forge test` covering INV-001, 003, 006, 008
- Slither: zero findings on `contracts/src/master-hook-pkg/`
- Semgrep smart-contract rules: zero findings
- Every invariant covered by at least one proof OR fuzz test (Phase 7 gate)

## Context & Constraints

- **TDD Skill Phase 7**: All fuzz + Kontrol + static analysis must pass
- **Fuzz tests**: Use `testFuzz_` prefix, Foundry fuzzer with 256+ runs minimum
- **Static analysis**: Slither + Semgrep per TDD skill Phase 5
- **Mock facets**: Create simple mock contracts that return known values for testing dispatch

## Subtasks & Detailed Guidance

### Subtask T040 – testFuzz_dispatch_bitmapSelectsCorrectFacets (INV-003)

- **Purpose**: Fuzz the bitmap to verify correct facet selection across random bitmaps.
- **Steps**:
  1. Create `contracts/test/master-hook-pkg/fuzz/DispatchFuzz.t.sol`
  2. Deploy full stack: MasterHook + HookDispatcher + FacetRegistryFacet + DispatchStrategyFacet
  3. Register 4 mock facets for `afterSwap` — each returns a distinct marker value
  4. Fuzz: random uint16 bitmap → dispatch → verify executed facets match bitmap bits
  5. Use mock facets that write to transient storage or emit events to track execution
- **Files**: `contracts/test/master-hook-pkg/fuzz/DispatchFuzz.t.sol` (new, ~120 lines)
- **Parallel?**: Yes

### Subtask T041 – testFuzz_criticalFacetRevert_propagates (INV-008)

- **Purpose**: Fuzz that critical facet reverts always propagate, non-critical never do.
- **Steps**:
  1. Create mock facets: one that always reverts, one that succeeds
  2. Register reverting facet as critical → dispatch must revert
  3. Register reverting facet as non-critical → dispatch must succeed (skip it)
  4. Fuzz: random bitmap selecting both reverting and non-reverting facets
- **Files**: `contracts/test/master-hook-pkg/fuzz/DispatchFuzz.t.sol`
- **Parallel?**: Yes

### Subtask T042 – testFuzz_aggregator_invokedOnlyWhenMultipleResults (INV-006)

- **Purpose**: Fuzz that aggregator is called iff >1 facet returns a value.
- **Steps**:
  1. Create a tracking aggregator that records whether it was called
  2. Register N facets, dispatch with various bitmaps
  3. Assert: if only 1 facet selected → aggregator NOT called, result is facet's direct return
  4. If >1 selected → aggregator called with correct results array
- **Files**: `contracts/test/master-hook-pkg/fuzz/AggregatorFuzz.t.sol` (new, ~100 lines)
- **Parallel?**: Yes

### Subtask T043 – testFuzz_registerFacet_maxCap (INV-001)

- **Purpose**: Fuzz that registration always respects the 16-facet cap.
- **Steps**:
  1. Register random number of facets (fuzz count 0-20)
  2. Assert: registrations 0-15 succeed, 16+ revert
  3. Verify registry length never exceeds MAX_FACETS
- **Files**: `contracts/test/master-hook-pkg/fuzz/DispatchFuzz.t.sol`
- **Parallel?**: Yes

### Subtask T044 – Slither static analysis

- **Purpose**: TDD Phase 5/7 — clean static analysis.
- **Steps**:
  1. Run `slither contracts/src/master-hook-pkg/ --filter-paths "test/"`
  2. Triage findings:
     - delegatecall warnings are expected (core architecture) → document as accepted
     - Reentrancy warnings on dispatch loop → verify no state changes between delegatecalls
     - Fix all other findings
  3. Document accepted findings in a `slither-triage.md`
- **Files**: All src files, output to `contracts/reports/slither-triage.md`
- **Parallel?**: Yes (with fuzz tests)

### Subtask T045 – Semgrep smart-contract rules

- **Purpose**: Additional static analysis layer.
- **Steps**:
  1. Run `semgrep --config https://github.com/Decurity/semgrep-smart-contracts --metrics=off contracts/src/master-hook-pkg/`
  2. Fix all findings
  3. Document any accepted findings
- **Files**: All src files
- **Parallel?**: Yes (with Slither)

## Risks & Mitigations

- Slither may flag all delegatecall usage as dangerous → triage and document
- Fuzz tests with full deployment may be slow → use minimal mock setup
- Semgrep rules may have false positives on UDVT patterns → triage

## Review Guidance

- Verify fuzz tests actually exercise the invariant (not just testing happy path)
- Check mock facets are realistic (correct return types, proper delegatecall behavior)
- Verify all Slither findings triaged with rationale
- Confirm every invariant (INV-001 through INV-012) has at least one verification method

## Implementation Command

```bash
spec-kitty implement WP08 --base WP05
```

## Activity Log

- 2026-03-06T15:10:20Z – system – lane=planned – Prompt created.
