# Implementation Plan: Hook Dispatcher Diamond

**Branch**: `uhi7` | **Date**: 2026-03-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `kitty-specs/001-hook-dispatcher-diamond/spec.md`

## Summary

Build a two-level Diamond architecture where MasterHook delegatecalls into a HookDispatcher (itself a Diamond) that routes Uniswap v4 hook callbacks to multiple HookFacets via bitmap selection from hookData, with pluggable IAggregator contracts per hook point for combining return values.

## Technical Context

**Language/Version**: Solidity >=0.8.30 (Prague EVM, transient storage support)
**Primary Dependencies**: Compose/DiamondMod, compose-extensions, Uniswap v4-core (IHooks, PoolKey, BalanceDelta, BeforeSwapDelta)
**Storage**: Namespaced Diamond storage (keccak-based slot positioning) — `keccak256("hook-bazaar.dispatcher.storage")`
**Testing**: Foundry (forge test), Kontrol (formal verification), Slither + Semgrep (static analysis)
**Target Platform**: EVM (Prague) — deployed alongside Uniswap v4 PoolManager
**Project Type**: Smart contract package within monorepo (`contracts/src/master-hook-pkg/`)
**Performance Goals**: Gas overhead of dispatcher layer ≤30% vs direct single-facet execution (SC-006)
**Constraints**: Max 16 facets per hook point (uint16 bitmap), two-level delegatecall chain must preserve storage context (INV-009), SCOP compliance (no inheritance, no library, no modifier in contracts)
**Scale/Scope**: 10 hook points × up to 16 facets each, pluggable aggregators per hook point

## Constitution Check

*No constitution file found. Skipped.*

## Project Structure

### Documentation (this feature)

```
kitty-specs/001-hook-dispatcher-diamond/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 — prior art analysis (exists in research/)
├── meta.json            # Feature metadata
├── checklists/          # Quality checklists
└── tasks.md             # Phase 2 output (/spec-kitty.tasks)
```

### Source Code (repository root)

```
contracts/src/master-hook-pkg/
├── types/
│   ├── HookBitmapMod.sol         # uint16 UDVT — facet selection bitmap (INV-010)
│   ├── FacetIndexMod.sol          # uint8 UDVT — bounded registry index (INV-011)
│   ├── HookPointSelectorMod.sol   # bytes4 UDVT — validated hook selector (INV-012)
│   ├── FacetConfigMod.sol         # struct — facet address + critical flag (INV-008)
│   ├── DispatcherStorageMod.sol   # namespaced storage — registries (INV-001/002/005)
│   ├── IAggregator.sol            # interface — pluggable return combiner (INV-006/007)
│   └── HookSelectors.sol          # existing — hook permission detection
├── HookDispatcher.sol             # Inner Diamond proxy — dispatch strategy routing
├── DispatchStrategyFacet.sol      # Core dispatch loop — bitmap decode, delegatecall, aggregate
├── FacetRegistryFacet.sol         # Admin — register/remove facets, assign aggregators
├── MasterHook.sol                 # existing — modified to delegatecall HookDispatcher
├── AllHook.sol                    # existing — default no-op facet
├── HookFacetTemplate.sol          # existing — template for hook facets
└── LibHook.sol                    # existing — placeholder storage

contracts/test/master-hook-pkg/
├── kontrol/                        # Kontrol formal proofs (prove_*)
│   ├── HookBitmapProof.k.sol
│   ├── FacetIndexProof.k.sol
│   ├── HookPointSelectorProof.k.sol
│   ├── DispatcherProof.k.sol
│   └── StorageContextProof.k.sol
└── fuzz/                           # Fuzz tests (testFuzz_*)
    ├── DispatchFuzz.t.sol
    └── AggregatorFuzz.t.sol
```

**Structure Decision**: All new code lives in `contracts/src/master-hook-pkg/` alongside existing MasterHook infrastructure. Types in `types/` subdirectory. Tests mirror the source layout under `contracts/test/master-hook-pkg/`.

## Architecture

### Two-Level Diamond Delegatecall Chain

```
PoolManager
    │
    ▼ (external call)
MasterHook (outer Diamond)
    │
    ▼ (delegatecall via fallback)
HookDispatcher (inner Diamond)
    │
    ▼ (delegatecall per selected facet)
HookFacet₀, HookFacet₁, ... HookFacetₙ
    │
    ▼ (if >1 result)
IAggregator.aggregate(results[])
    │
    ▼ (return combined result)
PoolManager
```

All execution happens in MasterHook's storage context. The HookDispatcher is a Diamond whose facets are dispatch strategies, not hook implementations. Hook facets are registered in the DispatcherStorage, not as Diamond facets.

### Dispatch Flow

1. PoolManager calls `afterSwap(...)` on MasterHook
2. MasterHook fallback delegatecalls to HookDispatcher (registered as Diamond facet for all 10 hook selectors)
3. HookDispatcher's DispatchStrategyFacet:
   a. Decodes bitmap from hookData (or uses allFacetsBitmap if empty)
   b. Iterates facetRegistry[selector], skipping facets whose bitmap bit is 0
   c. delegatecalls each selected facet, collecting return values
   d. If critical facet reverts → entire dispatch reverts (INV-008)
   e. If non-critical facet reverts → skip, continue
4. If >1 facet returned values → call aggregatorRegistry[selector].aggregate(results)
5. If >1 result and no aggregator → revert (INV-007)
6. If exactly 1 result → return directly (INV-006)
7. Return combined result to PoolManager

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Dispatch model | Conditional routing (bitmap) | Universal — sequential and independent are subsets |
| Facet storage | Separate DispatcherStorage, not Diamond facet slots | Diamond cuts don't affect hook facet registrations (INV-005) |
| Aggregation | Pluggable IAggregator per hook point | Different hooks need different strategies (sum vs last-write-wins) |
| Max facets | 16 (uint16 bitmap) | Matches MODL's proven limit, fits in single slot |
| Failure policy | Per-facet critical flag | Some facets are optional (analytics), some are critical (fee logic) |
| Storage isolation | keccak-based namespaced slots | Prevents collision in two-level delegatecall chain (INV-009) |

## Invariant-to-Implementation Mapping

| Invariant | Implementation Component | Verification |
|---|---|---|
| INV-001 (max facets ≤16) | FacetRegistryFacet.registerFacet() | Kontrol + fuzz |
| INV-002 (no duplicates) | DispatcherStorage.registeredFacets mapping | Kontrol |
| INV-003 (bitmap dispatch) | DispatchStrategyFacet dispatch loop | Kontrol + fuzz |
| INV-004 (empty hookData) | DispatchStrategyFacet — allFacetsBitmap default | Kontrol |
| INV-005 (diamond cut preserves) | Separate DispatcherStorage namespace | Kontrol |
| INV-006 (aggregator iff >1) | DispatchStrategyFacet aggregation logic | Kontrol + fuzz |
| INV-007 (missing aggregator) | DispatchStrategyFacet revert check | Kontrol |
| INV-008 (critical/non-critical) | DispatchStrategyFacet try/catch per facet | Kontrol + fuzz |
| INV-009 (storage context) | Integration test — sload across chain | Kontrol |
| INV-010 (bitmap type) | HookBitmapMod.newHookBitmap() | Type enforcement |
| INV-011 (facet index type) | FacetIndexMod.newFacetIndex() | Type enforcement |
| INV-012 (hook point selector) | HookPointSelectorMod.newHookPointSelector() | Type enforcement |

## Complexity Tracking

No constitution violations. SCOP constraints are a design requirement, not a violation.
