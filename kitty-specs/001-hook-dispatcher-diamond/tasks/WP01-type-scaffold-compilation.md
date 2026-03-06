---
work_package_id: "WP01"
subtasks:
  - "T001"
  - "T002"
  - "T003"
  - "T004"
  - "T005"
  - "T006"
title: "Type Scaffold Compilation"
phase: "Phase 0 - Foundation"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
dependencies: []
requirement_refs: ["FR-008", "FR-009"]
history:
  - timestamp: "2026-03-06T15:10:20Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP01 – Type Scaffold Compilation

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check `review_status` above.
- **Mark as acknowledged**: Update `review_status: acknowledged` when addressing feedback.

---

## Review Feedback

*[Empty initially.]*

---

## Objectives & Success Criteria

- All 6 type files in `contracts/src/master-hook-pkg/types/` compile with `forge build`
- Git submodules initialized so Compose and v4-core imports resolve
- Zero compilation errors, zero warnings on type files

## Context & Constraints

- **Spec**: `kitty-specs/001-hook-dispatcher-diamond/spec.md`
- **Plan**: `kitty-specs/001-hook-dispatcher-diamond/plan.md`
- **Invariants**: `specs/hook-dispatcher-diamond/invariants.md`
- **SCOP**: No `library` keyword, no inheritance, no `modifier` — file-level free functions only
- **Pragma**: `>=0.8.30` (Prague EVM)
- **Remappings**: `Compose/=contracts/lib/compose-extensions/lib/Compose/src/`, `@uniswap/v4-core/=contracts/lib/v4-periphery/lib/v4-core/`

## Subtasks & Detailed Guidance

### Subtask T001 – Initialize git submodules

- **Purpose**: Compose and compose-extensions submodules are empty directories. Without them, imports fail.
- **Steps**:
  1. Run `git submodule update --init --recursive` from repo root
  2. Verify `contracts/lib/compose-extensions/lib/Compose/src/diamond/DiamondMod.sol` exists
  3. Verify `contracts/lib/v4-periphery/lib/v4-core/src/interfaces/IHooks.sol` exists
- **Files**: `.gitmodules`, `contracts/lib/`
- **Parallel?**: No — must complete before T003-T005

### Subtask T002 – Add remapping for dispatcher types if needed

- **Purpose**: Verify existing remappings cover the new type imports. Add if missing.
- **Steps**:
  1. Check `remappings.txt` and `foundry.toml` remappings for coverage
  2. Types use `@uniswap/v4-core/src/interfaces/IHooks.sol` — already mapped
  3. Types use no Compose imports (only DispatcherStorageMod uses raw structs)
  4. If any import fails, add the needed remapping
- **Files**: `remappings.txt`, `foundry.toml`
- **Parallel?**: Yes

### Subtask T003 – Verify HookBitmapMod.sol compiles

- **Purpose**: Core UDVT for facet selection. INV-010 enforcement.
- **Steps**:
  1. `forge build --match-path contracts/src/master-hook-pkg/types/HookBitmapMod.sol`
  2. Verify no errors. Check that `using {isSet, popcount, isEmpty, rawBits} for HookBitmap global;` works with pragma >=0.8.30
  3. Fix any issues with free function syntax or UDVT operator binding
- **Files**: `contracts/src/master-hook-pkg/types/HookBitmapMod.sol`
- **Parallel?**: Yes

### Subtask T004 – Verify FacetIndexMod.sol and HookPointSelectorMod.sol compile

- **Purpose**: Bounded index (INV-011) and validated selector (INV-012) types.
- **Steps**:
  1. Build both files
  2. `HookPointSelectorMod.sol` imports `IHooks` — verify the import resolves
  3. Check that the exhaustive match in `_isValidHookSelector` compiles (10 if-return statements)
- **Files**: `contracts/src/master-hook-pkg/types/FacetIndexMod.sol`, `contracts/src/master-hook-pkg/types/HookPointSelectorMod.sol`
- **Parallel?**: Yes

### Subtask T005 – Verify FacetConfigMod.sol, IAggregator.sol, DispatcherStorageMod.sol compile

- **Purpose**: Struct, interface, and storage definitions that the dispatcher depends on.
- **Steps**:
  1. Build all three files
  2. `DispatcherStorageMod.sol` imports from sibling type files — verify relative imports work
  3. Check that `FacetConfig[]` in mapping compiles (struct array in mapping)
  4. Verify `IAggregator` interface compiles as a standalone interface
- **Files**: `contracts/src/master-hook-pkg/types/FacetConfigMod.sol`, `contracts/src/master-hook-pkg/types/IAggregator.sol`, `contracts/src/master-hook-pkg/types/DispatcherStorageMod.sol`
- **Parallel?**: Yes

### Subtask T006 – Full forge build on type directory

- **Purpose**: Confirm all type files compile together with no conflicts.
- **Steps**:
  1. Run `forge build` from repo root
  2. Verify zero errors in `contracts/src/master-hook-pkg/types/`
  3. Check that existing files (`HookSelectors.sol`) still compile
  4. Document any warnings for follow-up
- **Files**: All files in `contracts/src/master-hook-pkg/types/`
- **Parallel?**: No — final gate

## Risks & Mitigations

- Compose submodule may be at incompatible version → check Compose version matches what MasterHook.sol expects
- Free function `using ... for ... global` syntax requires Solidity >=0.8.13 — pragma >=0.8.30 covers this

## Review Guidance

- Verify SCOP compliance: no `library`, no inheritance, no `modifier` in type files
- Check that UDVTs have opaque construction (no public `wrap()`)
- Verify validated factories revert on invalid input

## Implementation Command

```bash
spec-kitty implement WP01
```

## Activity Log

- 2026-03-06T15:10:20Z – system – lane=planned – Prompt created.
