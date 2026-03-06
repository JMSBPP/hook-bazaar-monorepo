# Hook Dispatcher Diamond — Invariants

**Feature**: 001-hook-dispatcher-diamond
**Created**: 2026-03-06
**Phase**: Type-Driven Development — Phase 2
**Count**: 12 invariants (5 system-level, 4 function-level, 3 type-level)

---

## System-Level Invariants

| Field | Value |
|---|---|
| ID | INV-001 |
| Description | Facet registry length per hook point never exceeds MAX_FACETS (16) |
| Category | System-level |
| Hoare Triple | `{registry[selector].length == N}` → `registerFacet(selector, facet)` → `{registry[selector].length == N+1 AND N+1 <= MAX_FACETS}` |
| Affected | DispatchStrategy, FacetRegistryMod |
| Verification | Kontrol proof + fuzz test |

---

| Field | Value |
|---|---|
| ID | INV-002 |
| Description | No duplicate facet addresses within the same hook point registry |
| Category | System-level |
| Hoare Triple | `{forall i,j in registry[selector]: i != j => registry[selector][i] != registry[selector][j]}` → `registerFacet(selector, facet)` → `{same uniqueness property holds}` |
| Affected | DispatchStrategy, FacetRegistryMod |
| Verification | Kontrol proof |

---

| Field | Value |
|---|---|
| ID | INV-003 |
| Description | Bitmap dispatch invokes exactly the set of facets whose corresponding bits are set, in registry order |
| Category | System-level |
| Hoare Triple | `{bitmap == B AND registry[selector] == [f0, f1, ..., fN]}` → `dispatch(selector, bitmap, hookData)` → `{executed == [fi : bit i of B is set], in ascending index order}` |
| Affected | DispatchStrategy |
| Verification | Kontrol proof + fuzz test |

---

| Field | Value |
|---|---|
| ID | INV-004 |
| Description | Empty hookData (no bitmap) dispatches to all registered facets for the hook point |
| Category | System-level |
| Hoare Triple | `{hookData.length == 0 AND registry[selector].length == N}` → `dispatch(selector, hookData)` → `{executed.length == N AND executed == registry[selector]}` |
| Affected | DispatchStrategy |
| Verification | Kontrol proof |

---

| Field | Value |
|---|---|
| ID | INV-005 |
| Description | Diamond cut on HookDispatcher preserves facet registry and aggregator registry state |
| Category | System-level |
| Hoare Triple | `{registry == R AND aggregators == A}` → `diamondCut(dispatcherFacetCuts)` → `{registry == R AND aggregators == A}` |
| Affected | HookDispatcher Diamond, DiamondCutMod |
| Verification | Kontrol proof |

---

## Function-Level Invariants

| Field | Value |
|---|---|
| ID | INV-006 |
| Description | Aggregator is invoked if and only if more than one facet returns a value for a hook point |
| Category | Function-level |
| Hoare Triple | `{executed.length == 1}` → `aggregateReturns(selector, results)` → `{return == results[0], aggregator NOT called}` AND `{executed.length > 1 AND aggregator[selector] == agg}` → `aggregateReturns(selector, results)` → `{return == agg.aggregate(results)}` |
| Affected | DispatchStrategy, IAggregator |
| Verification | Kontrol proof + fuzz test |

---

| Field | Value |
|---|---|
| ID | INV-007 |
| Description | When multiple facets return values and no aggregator is assigned, the dispatch reverts |
| Category | Function-level |
| Hoare Triple | `{executed.length > 1 AND aggregator[selector] == address(0)}` → `aggregateReturns(selector, results)` → `{REVERT}` |
| Affected | DispatchStrategy |
| Verification | Kontrol proof |

---

| Field | Value |
|---|---|
| ID | INV-008 |
| Description | A non-critical facet revert does not revert the entire dispatch; a critical facet revert does |
| Category | Function-level |
| Hoare Triple | `{facetConfig[f].critical == false}` → `delegatecall(f, data) REVERTS` → `{dispatch continues, f skipped}` AND `{facetConfig[f].critical == true}` → `delegatecall(f, data) REVERTS` → `{entire dispatch REVERTS}` |
| Affected | DispatchStrategy |
| Verification | Kontrol proof + fuzz test |

---

| Field | Value |
|---|---|
| ID | INV-009 |
| Description | Two-level delegatecall preserves storage context: MasterHook.slot == Dispatcher.slot == Facet.slot |
| Category | Function-level |
| Hoare Triple | `{sload(SLOT) == V in MasterHook context}` → `MasterHook.delegatecall(Dispatcher) → Dispatcher.delegatecall(Facet) → Facet.sload(SLOT)` → `{returned value == V}` |
| Affected | MasterHook, HookDispatcher, all HookFacets |
| Verification | Kontrol proof (storage identity across delegatecall chain) |

---

## Type-Level Invariants (Enforced by Construction)

| Field | Value |
|---|---|
| ID | INV-010 |
| Description | HookBitmap type is a uint16 UDVT where only bits 0..MAX_FACETS-1 are meaningful; higher bits are masked to zero on construction |
| Category | Type-level |
| Hoare Triple | `{raw is any uint16}` → `HookBitmap.from(raw)` → `{HookBitmap.unwrap(result) & ~VALID_MASK == 0}` |
| Affected | HookBitmapMod |
| Verification | Enforced by factory (no public wrap) |

---

| Field | Value |
|---|---|
| ID | INV-011 |
| Description | FacetIndex type is a uint8 UDVT that is always less than the registry length for its hook point |
| Category | Type-level |
| Hoare Triple | `{registry[selector].length == N}` → `FacetIndex.from(i, selector)` → `{FacetIndex.unwrap(result) < N}` |
| Affected | FacetIndexMod |
| Verification | Enforced by validated factory |

---

| Field | Value |
|---|---|
| ID | INV-012 |
| Description | HookPointSelector type only wraps one of the 10 valid IHooks callback selectors; invalid selectors are rejected at construction |
| Category | Type-level |
| Hoare Triple | `{raw is any bytes4}` → `HookPointSelector.from(raw)` → `{raw in {beforeInitialize.selector, afterInitialize.selector, ..., afterDonate.selector} OR REVERT}` |
| Affected | HookPointSelectorMod |
| Verification | Enforced by validated factory (exhaustive match) |

---

## Invariant Coverage Matrix

| Invariant | Kontrol Proof | Fuzz Test | Type Enforcement |
|---|---|---|---|
| INV-001 (max facets) | x | x | |
| INV-002 (no duplicates) | x | | |
| INV-003 (bitmap dispatch) | x | x | |
| INV-004 (empty hookData) | x | | |
| INV-005 (diamond cut preserves) | x | | |
| INV-006 (aggregator invocation) | x | x | |
| INV-007 (missing aggregator reverts) | x | | |
| INV-008 (critical/non-critical) | x | x | |
| INV-009 (storage context) | x | | |
| INV-010 (bitmap type) | | | x |
| INV-011 (facet index type) | | | x |
| INV-012 (hook point selector type) | | | x |
