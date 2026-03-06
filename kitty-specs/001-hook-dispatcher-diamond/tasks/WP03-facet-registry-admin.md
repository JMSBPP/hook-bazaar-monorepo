---
work_package_id: "WP03"
subtasks:
  - "T012"
  - "T013"
  - "T014"
  - "T015"
  - "T016"
  - "T017"
title: "Facet Registry Admin"
phase: "Phase 1 - Core Implementation"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
dependencies: ["WP02"]
requirement_refs: ["FR-001", "FR-005", "FR-009", "FR-012", "FR-013"]
history:
  - timestamp: "2026-03-06T15:10:20Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP03 – Facet Registry Admin

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check `review_status` above.

---

## Review Feedback

*[Empty initially.]*

---

## Objectives & Success Criteria

- `FacetRegistryFacet.sol` implements register, remove, and aggregator management
- INV-001 enforced: registry length ≤ MAX_FACETS (16)
- INV-002 enforced: no duplicate facet addresses per hook point
- All functions are `external` (SCOP: no `public`)
- Admin-only access via inline auth checks

## Context & Constraints

- **Invariants**: INV-001 (max facets), INV-002 (no duplicates)
- **Storage**: Uses `DispatcherStorageMod.getDispatcherStorage()` for all state access
- **Types**: `HookPointSelector` validates selectors, `FacetConfig` wraps address+critical flag
- **SCOP**: File-level free functions for helpers, inline auth checks, no modifier/library

## Subtasks & Detailed Guidance

### Subtask T012 – Create FacetRegistryFacet.sol with registerFacet

- **Purpose**: Admin registers a hook facet for a specific hook point.
- **Steps**:
  1. Create `contracts/src/master-hook-pkg/FacetRegistryFacet.sol`
  2. Function signature: `function registerFacet(bytes4 selector, address facet, bool critical) external`
  3. Validate selector using `newHookPointSelector(selector)` — reverts on invalid (INV-012)
  4. Create `FacetConfig` using `newFacetConfig(facet, critical)` — reverts on zero address
  5. Check duplicate guard: `if (isFacetRegistered(selector, facet)) revert DuplicateFacet()`
  6. Check max cap: `if (registryLength(selector) >= MAX_FACETS) revert MaxFacetsExceeded()`
  7. Push to registry array, set `registeredFacets[selector][facet] = true`
  8. Emit event: `FacetRegistered(selector, facet, critical)`
- **Files**: `contracts/src/master-hook-pkg/FacetRegistryFacet.sol` (new, ~120 lines)

### Subtask T013 – Implement duplicate guard (INV-002)

- **Purpose**: Prevent the same facet address from being registered twice for the same hook point.
- **Steps**:
  1. Use `DispatcherStorage.registeredFacets[selector][facet]` mapping
  2. Check before push in `registerFacet`
  3. Clear on removal in `removeFacet`
- **Files**: `contracts/src/master-hook-pkg/FacetRegistryFacet.sol`
- **Notes**: The mapping provides O(1) duplicate check vs O(n) array scan

### Subtask T014 – Implement max facets cap (INV-001)

- **Purpose**: Registry length per hook point never exceeds 16.
- **Steps**:
  1. Check `registryLength(selector) >= MAX_FACETS` before push
  2. Revert with `DispatcherStorageMod__MaxFacetsExceeded(selector, registryLength(selector))`
- **Files**: `contracts/src/master-hook-pkg/FacetRegistryFacet.sol`

### Subtask T015 – Implement removeFacet with array compaction

- **Purpose**: Remove a facet from the registry, maintaining array density.
- **Steps**:
  1. Function signature: `function removeFacet(bytes4 selector, address facet) external`
  2. Validate admin auth
  3. Check `isFacetRegistered(selector, facet)` — revert if not
  4. Find index in array (linear scan, max 16 elements)
  5. Swap with last element, pop
  6. Clear `registeredFacets[selector][facet] = false`
  7. Emit `FacetRemoved(selector, facet)`
- **Files**: `contracts/src/master-hook-pkg/FacetRegistryFacet.sol`
- **Edge cases**: Removing the only facet → array becomes empty. Removing last element → no swap needed.
- **Notes**: Swap-and-pop changes indices. Existing bitmaps referencing removed indices become stale. Document this as a known constraint.

### Subtask T016 – Implement setAggregator and removeAggregator

- **Purpose**: Admin assigns pluggable aggregator contracts per hook point (INV-006/007).
- **Steps**:
  1. `function setAggregator(bytes4 selector, address aggregator) external`
  2. Validate selector via `newHookPointSelector`
  3. Store in `$.aggregatorRegistry[selector] = IAggregator(aggregator)`
  4. `function removeAggregator(bytes4 selector) external`
  5. Set `$.aggregatorRegistry[selector] = IAggregator(address(0))`
  6. Emit events
- **Files**: `contracts/src/master-hook-pkg/FacetRegistryFacet.sol`
- **Parallel?**: Yes — independent from facet registration logic

### Subtask T017 – Implement view functions

- **Purpose**: Read-only access to registry state for UIs, tests, and other contracts.
- **Steps**:
  1. `function getFacetCount(bytes4 selector) external view returns (uint8)`
  2. `function getFacetAt(bytes4 selector, uint8 index) external view returns (address facet, bool critical)`
  3. `function getAggregator(bytes4 selector) external view returns (address)`
  4. `function isFacetRegistered(bytes4 selector, address facet) external view returns (bool)`
- **Files**: `contracts/src/master-hook-pkg/FacetRegistryFacet.sol`
- **Parallel?**: Yes

## Risks & Mitigations

- Swap-and-pop removal changes bitmap semantics → document that bitmaps are positional, removal invalidates cached bitmaps
- Admin key compromise → outside scope, but note that AccessControl role can be revoked

## Review Guidance

- Verify INV-001 and INV-002 enforcement in registerFacet
- Check swap-and-pop correctness in removeFacet (edge cases: single element, last element)
- Verify all functions are `external`, not `public`

## Implementation Command

```bash
spec-kitty implement WP03 --base WP02
```

## Activity Log

- 2026-03-06T15:10:20Z – system – lane=planned – Prompt created.
