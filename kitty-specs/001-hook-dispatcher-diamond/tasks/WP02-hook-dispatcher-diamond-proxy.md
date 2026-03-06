---
work_package_id: "WP02"
subtasks:
  - "T007"
  - "T008"
  - "T009"
  - "T010"
  - "T011"
title: "HookDispatcher Diamond Proxy"
phase: "Phase 0 - Foundation"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
dependencies: ["WP01"]
requirement_refs: ["FR-006", "FR-008"]
history:
  - timestamp: "2026-03-06T15:10:20Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP02 – HookDispatcher Diamond Proxy

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check `review_status` above.

---

## Review Feedback

*[Empty initially.]*

---

## Objectives & Success Criteria

- `HookDispatcher.sol` exists as a Diamond proxy contract
- Uses namespaced storage at `keccak256("hook-bazaar.dispatcher.storage")`
- Diamond fallback routes to registered facets
- Access control restricts admin operations
- `forge build` succeeds

## Context & Constraints

- **Architecture**: HookDispatcher is the INNER Diamond. MasterHook delegatecalls into it. It then delegatecalls to dispatch strategy facets.
- **Storage**: Must NOT collide with MasterHook's `keccak256("hook-bazar.hooks")` namespace
- **SCOP**: No contract inheritance. Use Compose `DiamondMod` via delegatecall/free function patterns, not `is Diamond`
- **Pattern reference**: See `MasterHook.sol` for how Compose Diamond is used — `DiamondMod.diamondFallback()` in fallback, `DiamondMod.addFacets()` for cuts

## Subtasks & Detailed Guidance

### Subtask T007 – Create HookDispatcher.sol Diamond proxy

- **Purpose**: The inner Diamond that routes hook calls to dispatch strategy facets.
- **Steps**:
  1. Create `contracts/src/master-hook-pkg/HookDispatcher.sol`
  2. Import `DiamondMod`, `DiamondCutMod`, `AccessControlMod` from Compose
  3. Import `DispatcherStorageMod` types
  4. Define the contract shell — no inheritance except what Compose requires
  5. Add `fallback() external payable` that calls `DiamondMod.diamondFallback()`
- **Files**: `contracts/src/master-hook-pkg/HookDispatcher.sol` (new, ~80 lines)
- **Parallel?**: No — foundation for T008-T010

### Subtask T008 – Diamond fallback implementation

- **Purpose**: Route incoming hook calls to the correct dispatch strategy facet.
- **Steps**:
  1. The fallback calls `DiamondMod.diamondFallback()` which looks up `msg.sig` in the facet registry
  2. This is the Compose standard pattern — same as MasterHook
  3. Verify the pattern works when called via delegatecall from MasterHook (nested delegatecall)
- **Files**: `contracts/src/master-hook-pkg/HookDispatcher.sol`
- **Parallel?**: No

### Subtask T009 – Initialization function

- **Purpose**: Set up initial state — admin role, empty registries.
- **Steps**:
  1. Add `initialize(address admin)` external function
  2. Use `AccessControlMod.grantRole()` to set admin
  3. No facets registered initially — registries start empty
  4. Guard against re-initialization (use compose-extensions `InitializableBase` pattern)
- **Files**: `contracts/src/master-hook-pkg/HookDispatcher.sol`
- **Parallel?**: No

### Subtask T010 – Access control for admin operations

- **Purpose**: Only protocol admin can register facets, assign aggregators, perform diamond cuts.
- **Steps**:
  1. Define `DISPATCHER_ADMIN` role: `keccak256("dispatcher-admin")`
  2. Add inline auth check function: `function _requireAdmin() internal view { if (!AccessControlMod.hasRole(DISPATCHER_ADMIN, msg.sender)) revert NotAdmin(); }`
  3. This replaces a `modifier` — SCOP compliant
- **Files**: `contracts/src/master-hook-pkg/HookDispatcher.sol`
- **Parallel?**: Yes — once T007 skeleton exists

### Subtask T011 – Build verification

- **Purpose**: Confirm HookDispatcher compiles.
- **Steps**:
  1. `forge build`
  2. Fix any import resolution or Compose API issues
  3. Verify no warnings
- **Files**: All modified files
- **Parallel?**: No — final gate

## Risks & Mitigations

- Compose DiamondMod API may differ from expected — check actual Compose source after submodule init
- Nested Diamond pattern (Diamond-within-Diamond via delegatecall) is unusual — may need custom fallback logic if standard Compose doesn't support it

## Review Guidance

- Verify storage namespace doesn't collide with MasterHook
- Check SCOP: no `is`, no `library`, no `modifier`
- Verify initialization guard prevents re-init

## Implementation Command

```bash
spec-kitty implement WP02 --base WP01
```

## Activity Log

- 2026-03-06T15:10:20Z – system – lane=planned – Prompt created.
