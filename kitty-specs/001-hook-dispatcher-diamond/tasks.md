# Work Packages: Hook Dispatcher Diamond

**Inputs**: Design documents from `kitty-specs/001-hook-dispatcher-diamond/`
**Prerequisites**: plan.md (complete), spec.md (complete), invariants.md (12 invariants)

**Tests**: Kontrol formal proofs and fuzz tests are core deliverables (per TDD skill Phase 4/7).

**Organization**: Fine-grained subtasks (`Txxx`) roll up into work packages (`WPxx`). Each work package must be independently deliverable and testable.

---

## Work Package WP01: Type Scaffold Compilation (Priority: P0)

**Goal**: Ensure all 6 type files compile with correct imports. Initialize Compose submodule if needed.
**Independent Test**: `forge build` succeeds with zero errors on type files.
**Prompt**: `tasks/WP01-type-scaffold-compilation.md`
**Estimated Size**: ~250 lines

### Included Subtasks
- [ ] T001 Initialize git submodules (`Compose`, `compose-extensions`) so imports resolve
- [ ] T002 [P] Add remapping for dispatcher types package if needed
- [ ] T003 Verify `HookBitmapMod.sol` compiles — fix any import/pragma issues
- [ ] T004 [P] Verify `FacetIndexMod.sol`, `HookPointSelectorMod.sol` compile
- [ ] T005 [P] Verify `FacetConfigMod.sol`, `IAggregator.sol`, `DispatcherStorageMod.sol` compile
- [ ] T006 Run `forge build` — zero errors on `contracts/src/master-hook-pkg/types/`

### Implementation Notes
- Submodules may need `git submodule update --init --recursive`
- Pragma is `>=0.8.30` — ensure foundry.toml evm_version supports Prague opcodes

### Parallel Opportunities
- T003, T004, T005 are independent file verifications

### Dependencies
- None (starting package)

**Requirement Refs**: FR-008, FR-009

### Risks & Mitigations
- Compose submodule may have breaking changes → pin to known working commit

---

## Work Package WP02: HookDispatcher Diamond Proxy (Priority: P0)

**Goal**: Create the HookDispatcher contract as a Diamond proxy with namespaced storage and fallback routing.
**Independent Test**: HookDispatcher deploys, accepts diamond cuts, routes calls via fallback.
**Prompt**: `tasks/WP02-hook-dispatcher-diamond-proxy.md`
**Estimated Size**: ~400 lines

### Included Subtasks
- [ ] T007 Create `HookDispatcher.sol` — Diamond proxy with `DISPATCHER_STORAGE_POSITION` namespaced storage
- [ ] T008 Implement Diamond fallback using `DiamondMod.diamondFallback()` pattern
- [ ] T009 Add initialization function for DispatcherStorage (set initial state)
- [ ] T010 Implement access control for admin operations (reuse `AccessControlMod` pattern from MasterHook)
- [ ] T011 Run `forge build` — HookDispatcher compiles with Compose Diamond imports

### Implementation Notes
- SCOP: no `is` inheritance (except interfaces if absolutely required for Diamond), no `library`, no `modifier`
- Use inline `if`/`revert` for access checks instead of modifiers
- Storage namespace: `keccak256("hook-bazaar.dispatcher.storage")` — must not collide with MasterHook's `keccak256("hook-bazar.hooks")`

### Parallel Opportunities
- T010 (access control) can proceed once T007 skeleton exists

### Dependencies
- Depends on WP01

**Requirement Refs**: FR-006, FR-008

### Risks & Mitigations
- Nested Diamond (Diamond-within-Diamond) may have Compose compatibility issues → test with minimal facet cut first

---

## Work Package WP03: Facet Registry Admin (Priority: P0)

**Goal**: Implement facet registration, removal, and aggregator assignment — the admin interface for the dispatcher.
**Independent Test**: Register 3 facets for `afterSwap`, verify registry state. Assign aggregator, verify.
**Prompt**: `tasks/WP03-facet-registry-admin.md`
**Estimated Size**: ~450 lines

### Included Subtasks
- [ ] T012 Create `FacetRegistryFacet.sol` — external functions for `registerFacet(bytes4 selector, address facet, bool critical)`
- [ ] T013 Implement duplicate guard using `DispatcherStorage.registeredFacets` mapping (INV-002)
- [ ] T014 Implement max facets cap check — revert if registry length >= MAX_FACETS (INV-001)
- [ ] T015 Implement `removeFacet(bytes4 selector, address facet)` with array compaction
- [ ] T016 Implement `setAggregator(bytes4 selector, IAggregator aggregator)` and `removeAggregator(bytes4 selector)`
- [ ] T017 Implement `getFacetRegistry(bytes4 selector)` and `getAggregator(bytes4 selector)` view functions

### Implementation Notes
- All functions are `external` (SCOP: no `public`)
- Admin auth via inline `if (msg.sender != admin) revert` or `AccessControlMod.requireRole()`
- Array removal: swap-and-pop for O(1) removal, update `registeredFacets` mapping
- Use `HookPointSelector` UDVT for validated selectors in internal logic

### Parallel Opportunities
- T016 (aggregator management) is independent from T012-T015 (facet management)

### Dependencies
- Depends on WP02

**Requirement Refs**: FR-001, FR-005, FR-009, FR-012, FR-013

### Risks & Mitigations
- Array compaction on removal changes indices → bitmap meanings shift. Document this as a known constraint (re-encode bitmaps after removal).

---

## Work Package WP04: Dispatch Strategy Core (Priority: P1) 🎯 MVP

**Goal**: Implement the core dispatch loop — bitmap decode, delegatecall per facet, failure policy, return collection.
**Independent Test**: Register 3 facets, dispatch with bitmap `0b101`, verify only facets 0 and 2 execute.
**Prompt**: `tasks/WP04-dispatch-strategy-core.md`
**Estimated Size**: ~500 lines

### Included Subtasks
- [ ] T018 Create `DispatchStrategyFacet.sol` — skeleton with dispatch entry point
- [ ] T019 Implement bitmap decoding from hookData: extract `HookBitmap` from first 2 bytes, or `allFacetsBitmap()` if empty (INV-004)
- [ ] T020 Implement dispatch loop: iterate registry, check bitmap bit per facet, `delegatecall` selected facets
- [ ] T021 Implement failure policy: critical facet revert → entire dispatch reverts; non-critical → skip and continue (INV-008)
- [ ] T022 Collect return values from executed facets into `bytes[]` array
- [ ] T023 Implement aggregation routing: 0 results → default return, 1 result → return directly, >1 → call aggregator (INV-006), >1 with no aggregator → revert (INV-007)

### Implementation Notes
- The dispatch function receives the full hook callback arguments (PoolKey, etc.) and must forward them via delegatecall
- Use low-level `delegatecall` with try/catch pattern for non-critical facets
- hookData layout: `[2 bytes bitmap][remaining bytes = per-facet data]`
- Return value encoding must match what PoolManager expects (BalanceDelta, BeforeSwapDelta, etc.)

### Parallel Opportunities
- T019 (bitmap decode) and T021 (failure policy) are independent concerns that merge in T020

### Dependencies
- Depends on WP03

**Requirement Refs**: FR-002, FR-003, FR-010, FR-011

### Risks & Mitigations
- Gas cost of dispatch loop with delegatecall is the primary concern → benchmark against SC-006 (≤30% overhead)
- hookData encoding must be backwards-compatible with existing consumers

---

## Work Package WP05: MasterHook Integration (Priority: P1)

**Goal**: Wire HookDispatcher into MasterHook's Diamond as the facet for all 10 hook selectors, replacing the current 1:1 AllHook mapping.
**Independent Test**: MasterHook receives `afterSwap` call, delegatecalls to HookDispatcher, which dispatches to registered facets.
**Prompt**: `tasks/WP05-master-hook-integration.md`
**Estimated Size**: ~350 lines

### Included Subtasks
- [ ] T024 Modify `MasterHook.initialize()` to register HookDispatcher as the facet for all 10 hook selectors (replace AllHook)
- [ ] T025 Modify or deprecate `addHook()` — it becomes `registerFacet()` through the dispatcher
- [ ] T026 Verify two-level delegatecall chain: MasterHook → HookDispatcher → HookFacet preserves `msg.sender` and storage context (INV-009)
- [ ] T027 Ensure existing `ProtocolHookMediator` integration still works (SC-007)
- [ ] T028 Update `HookFacetTemplate.sol` to document dispatcher-compatible storage pattern

### Implementation Notes
- MasterHook's fallback already calls `DiamondMod.diamondFallback()` — registering HookDispatcher as facet means the fallback routes to it
- The dispatcher then does a second delegatecall to the actual hook facets
- All execution remains in MasterHook's storage context
- Existing AccessControl roles must be preserved

### Parallel Opportunities
- T027 (mediator verification) and T028 (template update) are independent

### Dependencies
- Depends on WP04

**Requirement Refs**: FR-007, FR-008

### Risks & Mitigations
- Breaking existing MasterHook functionality is high risk → integration tests critical
- Storage slot collision between MasterHook and Dispatcher namespaces → verify keccak slots don't overlap

---

## Work Package WP06: Reference Aggregators (Priority: P2)

**Goal**: Implement two reference IAggregator implementations — SumDeltaAggregator and LastWriteWinsAggregator.
**Independent Test**: SumDeltaAggregator correctly sums two BalanceDeltas. LastWriteWinsAggregator returns last value.
**Prompt**: `tasks/WP06-reference-aggregators.md`
**Estimated Size**: ~300 lines

### Included Subtasks
- [ ] T029 Create `SumDeltaAggregator.sol` — sums BalanceDelta values using int256 accumulators with safe-cast (SC-003)
- [ ] T030 Create `LastWriteWinsAggregator.sol` — returns last facet's return value (SC-003)
- [ ] T031 [P] Create `NoOpAggregator.sol` — for void hook points (beforeInitialize, etc.) that have no meaningful return
- [ ] T032 Add unit tests for each aggregator with edge cases (overflow, empty array, single element)

### Implementation Notes
- Aggregators are stateless pure functions — no storage access needed
- SumDelta must use int256 accumulators and safe-cast to int128 on final result (edge case from spec)
- BalanceDelta is `int256` packed as two `int128` values — aggregator must unpack, sum, repack

### Parallel Opportunities
- T029, T030, T031 are fully independent

### Dependencies
- Depends on WP01 (type definitions only, no dispatcher dependency)

**Requirement Refs**: FR-004

### Risks & Mitigations
- int128 overflow during summation → use int256 intermediate and revert on overflow at cast

---

## Work Package WP07: Kontrol Formal Proofs (Priority: P1)

**Goal**: Write Kontrol proofs for type-level invariants (INV-010, INV-011, INV-012) and core system invariants.
**Independent Test**: `kontrol build && kontrol prove` passes for all proofs.
**Prompt**: `tasks/WP07-kontrol-formal-proofs.md`
**Estimated Size**: ~500 lines

### Included Subtasks
- [ ] T033 Write `prove_hookBitmap_masksInvalidBits` — INV-010
- [ ] T034 Write `prove_facetIndex_boundedByRegistry` — INV-011
- [ ] T035 Write `prove_hookPointSelector_exhaustiveMatch` — INV-012
- [ ] T036 Write `prove_registerFacet_noDuplicates` — INV-002
- [ ] T037 Write `prove_registerFacet_maxFacetsCap` — INV-001
- [ ] T038 Write `prove_dispatch_bitmapCorrectness` — INV-003
- [ ] T039 Write `prove_emptyHookData_allFacets` — INV-004

### Implementation Notes
- Each proof is a Foundry test with `prove_` prefix in `contracts/test/master-hook-pkg/kontrol/`
- Use `KontrolCheats` for symbolic values
- Build ONE proof at a time: `kontrol build` → `kontrol prove --match-test <name>`
- Per TDD skill: write one, verify, get review, then next

### Parallel Opportunities
- Type proofs (T033-T035) are independent from system proofs (T036-T039)

### Dependencies
- Depends on WP04 (needs dispatch implementation for system proofs)
- T033-T035 can start after WP01

**Requirement Refs**: FR-001, FR-002, FR-009, FR-011, FR-012

### Risks & Mitigations
- Kontrol may timeout on complex proofs → use `vm.assume()` to bound symbolic inputs
- Symbolic delegatecall proofs may be infeasible → fall back to fuzz tests for those invariants

---

## Work Package WP08: Fuzz Tests & Static Analysis (Priority: P2)

**Goal**: Fuzz tests for dispatch correctness and aggregation. Clean Slither + Semgrep on full codebase.
**Independent Test**: `forge test` passes all fuzz tests. Slither + Semgrep report zero findings.
**Prompt**: `tasks/WP08-fuzz-tests-static-analysis.md`
**Estimated Size**: ~400 lines

### Included Subtasks
- [ ] T040 Write `testFuzz_dispatch_bitmapSelectsCorrectFacets` — INV-003
- [ ] T041 Write `testFuzz_criticalFacetRevert_propagates` — INV-008
- [ ] T042 Write `testFuzz_aggregator_invokedOnlyWhenMultipleResults` — INV-006
- [ ] T043 Write `testFuzz_registerFacet_maxCap` — INV-001
- [ ] T044 Run `slither contracts/src/master-hook-pkg/ --filter-paths "test/"` — fix all findings
- [ ] T045 Run semgrep smart-contract rules — fix all findings

### Implementation Notes
- Fuzz tests in `contracts/test/master-hook-pkg/fuzz/`
- Use mock facets that return known values for testing dispatch
- Static analysis must be clean before feature is considered done (TDD Phase 7)

### Parallel Opportunities
- T040-T043 (fuzz tests) can run in parallel with T044-T045 (static analysis)

### Dependencies
- Depends on WP05 (full integration needed for meaningful fuzz tests)

**Requirement Refs**: FR-001, FR-002, FR-003, FR-010

### Risks & Mitigations
- Slither may flag delegatecall patterns as dangerous → triage and document accepted findings

---

## Dependency & Execution Summary

- **Sequence**: WP01 → WP02 → WP03 → WP04 → WP05 → WP08
- **Parallel tracks**: WP06 (aggregators) can start after WP01. WP07 type proofs (T033-T035) can start after WP01.
- **MVP Scope**: WP01 + WP02 + WP03 + WP04 = type scaffold + dispatcher + registry + dispatch loop

```
WP01 (types) ──→ WP02 (dispatcher) ──→ WP03 (registry) ──→ WP04 (dispatch) ──→ WP05 (integration) ──→ WP08 (verify)
      │                                                            │
      ├──→ WP06 (aggregators) ─────────────────────────────────────┘
      └──→ WP07 (proofs, type subset T033-T035)
                                            WP04 ──→ WP07 (system proofs T036-T039)
```

---

## Subtask Index (Reference)

| Subtask ID | Summary | Work Package | Priority | Parallel? |
|------------|---------|--------------|----------|-----------|
| T001 | Init git submodules | WP01 | P0 | No |
| T002 | Add remapping if needed | WP01 | P0 | Yes |
| T003 | Verify HookBitmapMod compiles | WP01 | P0 | Yes |
| T004 | Verify FacetIndexMod, HookPointSelectorMod compile | WP01 | P0 | Yes |
| T005 | Verify FacetConfigMod, IAggregator, DispatcherStorageMod compile | WP01 | P0 | Yes |
| T006 | Full forge build on types | WP01 | P0 | No |
| T007 | Create HookDispatcher.sol Diamond proxy | WP02 | P0 | No |
| T008 | Diamond fallback implementation | WP02 | P0 | No |
| T009 | Initialization function | WP02 | P0 | No |
| T010 | Access control | WP02 | P0 | Yes |
| T011 | Build verification | WP02 | P0 | No |
| T012 | registerFacet external function | WP03 | P0 | No |
| T013 | Duplicate guard | WP03 | P0 | No |
| T014 | Max facets cap | WP03 | P0 | No |
| T015 | removeFacet with array compaction | WP03 | P0 | No |
| T016 | setAggregator / removeAggregator | WP03 | P0 | Yes |
| T017 | View functions | WP03 | P0 | Yes |
| T018 | DispatchStrategyFacet skeleton | WP04 | P1 | No |
| T019 | Bitmap decode from hookData | WP04 | P1 | Yes |
| T020 | Dispatch loop with delegatecall | WP04 | P1 | No |
| T021 | Failure policy (critical/non-critical) | WP04 | P1 | Yes |
| T022 | Return value collection | WP04 | P1 | No |
| T023 | Aggregation routing | WP04 | P1 | No |
| T024 | Modify MasterHook.initialize | WP05 | P1 | No |
| T025 | Deprecate addHook → registerFacet | WP05 | P1 | No |
| T026 | Verify two-level delegatecall chain | WP05 | P1 | No |
| T027 | ProtocolHookMediator integration | WP05 | P1 | Yes |
| T028 | Update HookFacetTemplate docs | WP05 | P1 | Yes |
| T029 | SumDeltaAggregator | WP06 | P2 | Yes |
| T030 | LastWriteWinsAggregator | WP06 | P2 | Yes |
| T031 | NoOpAggregator | WP06 | P2 | Yes |
| T032 | Aggregator unit tests | WP06 | P2 | No |
| T033 | prove_hookBitmap_masksInvalidBits | WP07 | P1 | Yes |
| T034 | prove_facetIndex_boundedByRegistry | WP07 | P1 | Yes |
| T035 | prove_hookPointSelector_exhaustiveMatch | WP07 | P1 | Yes |
| T036 | prove_registerFacet_noDuplicates | WP07 | P1 | No |
| T037 | prove_registerFacet_maxFacetsCap | WP07 | P1 | No |
| T038 | prove_dispatch_bitmapCorrectness | WP07 | P1 | No |
| T039 | prove_emptyHookData_allFacets | WP07 | P1 | No |
| T040 | testFuzz dispatch bitmap | WP08 | P2 | Yes |
| T041 | testFuzz critical revert | WP08 | P2 | Yes |
| T042 | testFuzz aggregator invocation | WP08 | P2 | Yes |
| T043 | testFuzz registerFacet cap | WP08 | P2 | Yes |
| T044 | Slither analysis | WP08 | P2 | Yes |
| T045 | Semgrep analysis | WP08 | P2 | Yes |
