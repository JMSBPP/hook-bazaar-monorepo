# Hook Dispatcher Diamond — Design Specification

This branch contains **only** the design artifacts for the Hook Dispatcher Diamond feature (001). It is a clean reference for external agents, reviewers, and collaborators.

## What's Here

```
├── README.md                                    ← You are here
├── contracts/src/master-hook-pkg/
│   ├── HOOK_FACET_GUIDE.md                      ← START HERE — developer guide for building HookFacets
│   └── types/
│       ├── HookBitmapMod.sol                    ← uint16 UDVT — facet selection bitmap
│       ├── FacetIndexMod.sol                    ← uint8 UDVT — bounded registry index
│       ├── HookPointSelectorMod.sol             ← bytes4 UDVT — validated hook selector
│       ├── FacetConfigMod.sol                   ← struct — facet address + critical flag
│       ├── IAggregator.sol                      ← interface — pluggable return combiner
│       └── DispatcherStorageMod.sol             ← namespaced storage — registries
├── kitty-specs/001-hook-dispatcher-diamond/
│   ├── spec.md                                  ← Feature specification (5 user stories, 13 FRs)
│   ├── plan.md                                  ← Implementation plan (architecture, dispatch flow)
│   ├── tasks.md                                 ← 8 work packages, 45 subtasks
│   ├── meta.json                                ← Feature metadata
│   ├── checklists/requirements.md               ← Quality checklist
│   └── tasks/
│       ├── WP01-type-scaffold-compilation.md
│       ├── WP02-hook-dispatcher-diamond-proxy.md
│       ├── WP03-facet-registry-admin.md
│       ├── WP04-dispatch-strategy-core.md       ← MVP
│       ├── WP05-master-hook-integration.md
│       ├── WP06-reference-aggregators.md
│       ├── WP07-kontrol-formal-proofs.md
│       └── WP08-fuzz-tests-static-analysis.md
├── specs/hook-dispatcher-diamond/
│   └── invariants.md                            ← 12 invariants in Hoare triple format
├── demo/presentation.pdf                        ← Project presentation
└── docs/slides-utils/                           ← Slide assets
```

## Reading Order

1. **`HOOK_FACET_GUIDE.md`** — If you're building a facet, start here
2. **`spec.md`** — Full feature specification with user stories and requirements
3. **`invariants.md`** — 12 system invariants your code must respect
4. **`plan.md`** — Architecture, dispatch flow, type system design
5. **`tasks/`** — Work package prompts with detailed implementation guidance

## Architecture (TL;DR)

```
PoolManager → MasterHook (outer Diamond) → HookDispatcher (inner Diamond) → HookFacets
                                                    ↓
                                           bitmap selects which facets fire
                                                    ↓
                                           IAggregator combines return values
```

- **Conditional routing**: hookData carries a uint16 bitmap selecting active facets
- **Pluggable aggregation**: Per hook point IAggregator (sum deltas, last-write-wins, etc.)
- **delegatecall chain**: All execution in MasterHook's storage context
- **Max 16 facets** per hook point, no duplicates

## Upstream Issues

Work packages tracked at: https://github.com/hook-bazaar/monorepo/issues (#34–#41)

## Implementation Branch

Full codebase lives on branch `uhi7` at https://github.com/JMSBPP/hook-bazaar-monorepo
