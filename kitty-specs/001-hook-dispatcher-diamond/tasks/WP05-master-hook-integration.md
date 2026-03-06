---
work_package_id: "WP05"
subtasks:
  - "T024"
  - "T025"
  - "T026"
  - "T027"
  - "T028"
title: "MasterHook Integration"
phase: "Phase 2 - Integration"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
dependencies: ["WP04"]
requirement_refs: ["FR-007", "FR-008"]
history:
  - timestamp: "2026-03-06T15:10:20Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP05 – MasterHook Integration

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check `review_status` above.

---

## Review Feedback

*[Empty initially.]*

---

## Objectives & Success Criteria

- MasterHook registers HookDispatcher as the Diamond facet for all 10 hook selectors
- Two-level delegatecall chain preserves storage context (INV-009)
- Existing ProtocolHookMediator integration works unchanged (SC-007)
- `addHook()` deprecated or rewired to use dispatcher's `registerFacet`

## Context & Constraints

- **Current state**: MasterHook.initialize() registers AllHook for all 10 selectors. addHook() replaces the facet per selector (1:1).
- **New state**: MasterHook.initialize() registers HookDispatcher for all 10 selectors. Hook facets register through the dispatcher, not through diamond cuts.
- **Storage context**: All delegatecall chain shares MasterHook's storage. HookDispatcher uses `keccak256("hook-bazaar.dispatcher.storage")`, MasterHook uses `keccak256("hook-bazar.hooks")` — no collision.

## Subtasks & Detailed Guidance

### Subtask T024 – Modify MasterHook.initialize()

- **Purpose**: Replace AllHook with HookDispatcher as the facet for all 10 hook selectors.
- **Steps**:
  1. Change `initialize(address _poolManager, address _allHookImpl)` → `initialize(address _poolManager, address _dispatcherImpl)`
  2. Register `_dispatcherImpl` for all 10 IHooks selectors via `DiamondMod.addFacets()`
  3. Also register FacetRegistryFacet selectors in the dispatcher's own Diamond
  4. Initialize DispatcherStorage via the dispatcher's init function
- **Files**: `contracts/src/master-hook-pkg/MasterHook.sol`
- **Notes**: AllHook may still be registered as a default hook facet IN the dispatcher registry (not as a Diamond facet)

### Subtask T025 – Deprecate addHook → registerFacet

- **Purpose**: The old 1:1 `addHook()` is replaced by the dispatcher's multi-facet registry.
- **Steps**:
  1. Option A: Remove `addHook()` entirely — breaking change
  2. Option B: Keep `addHook()` as a wrapper that calls `FacetRegistryFacet.registerFacet()` via delegatecall
  3. Recommend Option B for backwards compatibility during migration
  4. Add `@deprecated` natspec comment
  5. Remove `_replaceHookFunctions` and `_addHookFunctions` private functions
- **Files**: `contracts/src/master-hook-pkg/MasterHook.sol`

### Subtask T026 – Verify two-level delegatecall storage context (INV-009)

- **Purpose**: Confirm that `sload(SLOT)` returns the same value whether read from MasterHook, HookDispatcher, or HookFacet context.
- **Steps**:
  1. Write a minimal integration test:
     a. Set a value in MasterHook's DispatcherStorage
     b. delegatecall from MasterHook → HookDispatcher → test facet that reads the same slot
     c. Assert values match
  2. This validates INV-009 end-to-end
- **Files**: `contracts/test/master-hook-pkg/integration/StorageContextTest.t.sol` (new)
- **Notes**: This is the most critical integration test. If storage context breaks, nothing works.

### Subtask T027 – ProtocolHookMediator integration (SC-007)

- **Purpose**: Existing pool creation flow via ProtocolHookMediator must still work.
- **Steps**:
  1. Review `ProtocolHookMediator.reactOnProtocolClient()` — it creates pools with MasterHook address
  2. Verify the PoolManager still calls hook callbacks on MasterHook's address
  3. The change is internal (Diamond routing), external interface unchanged
  4. Write a smoke test: create pool → execute swap → verify hook callbacks fire
- **Files**: `contracts/src/protocol-hook-pkg/ProtocolHookMediator.sol` (read-only), test file
- **Parallel?**: Yes

### Subtask T028 – Update HookFacetTemplate documentation

- **Purpose**: Document how hook facets should be structured for dispatcher compatibility.
- **Steps**:
  1. Update `HookFacetTemplate.sol` comments to explain:
     - Facets are registered in DispatcherStorage, not as Diamond facets
     - Storage must use unique keccak namespace (not collide with dispatcher or MasterHook)
     - Facets receive delegatecall from DispatchStrategy — they run in MasterHook's context
  2. Add example storage namespace pattern
- **Files**: `contracts/src/master-hook-pkg/HookFacetTemplate.sol`
- **Parallel?**: Yes

## Risks & Mitigations

- **Breaking change**: addHook() API change affects existing deployments → use wrapper approach (Option B)
- **Storage collision**: New namespace must not conflict → verify all keccak slots are distinct
- **ProtocolHookMediator**: If it relies on addHook() internally, it needs updating too

## Review Guidance

- Verify all 10 hook selectors registered for HookDispatcher
- Check that addHook wrapper correctly delegates to FacetRegistryFacet
- Verify INV-009 integration test passes
- Confirm no changes to ProtocolHookMediator contract itself

## Implementation Command

```bash
spec-kitty implement WP05 --base WP04
```

## Activity Log

- 2026-03-06T15:10:20Z – system – lane=planned – Prompt created.
