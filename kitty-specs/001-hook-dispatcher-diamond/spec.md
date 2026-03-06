# Feature Specification: Hook Dispatcher Diamond

**Feature Branch**: `001-hook-dispatcher-diamond`
**Created**: 2026-03-06
**Status**: Draft
**Input**: Two-level Diamond architecture for multi-hook dispatch in Uniswap v4

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Protocol Admin Registers Multiple Hook Facets (Priority: P1)

A protocol admin deploys MasterHook for their pool and needs to register multiple independent hook logic modules (e.g., a FeeConcentrationIndex module and a TWAP Oracle module) that both require `afterSwap` and `beforeRemoveLiquidity` callbacks. Today, the Diamond's 1:1 selector-to-facet mapping prevents this. With the HookDispatcher Diamond, the admin registers each hook facet into the dispatcher's per-hook-point registry, and both facets execute when those hook points fire.

**Why this priority**: This is the core problem being solved. Without multi-facet registration per hook point, the entire system is blocked.

**Independent Test**: Deploy MasterHook + HookDispatcher, register two facets that both subscribe to `afterSwap`, execute a swap, verify both facets executed.

**Acceptance Scenarios**:

1. **Given** a MasterHook with HookDispatcher initialized, **When** admin registers FacetA for `afterSwap` and FacetB for `afterSwap`, **Then** both facets appear in the dispatcher's registry for `afterSwap`.
2. **Given** two facets registered for `afterSwap`, **When** a swap executes on the pool, **Then** the dispatcher invokes both facets via delegatecall in registration order.
3. **Given** a facet registered for `afterSwap` and `beforeRemoveLiquidity`, **When** the admin registers a second facet for only `afterSwap`, **Then** `beforeRemoveLiquidity` still routes to the first facet only, and `afterSwap` routes to both.

---

### User Story 2 - Caller Selects Active Facets via Bitmap in hookData (Priority: P1)

When a user or router initiates a swap (or liquidity operation), they encode a bitmap in the `hookData` bytes parameter. The bitmap selects which registered facets should execute for this particular call. This enables conditional routing: not all facets fire every time.

**Why this priority**: Bitmap-driven routing is the dispatch mechanism. Without it, the system degenerates to "run all facets always."

**Independent Test**: Register 3 facets for `beforeSwap`. Pass hookData with bitmap `0b101` (facets 0 and 2 active, facet 1 skipped). Verify only facets 0 and 2 executed.

**Acceptance Scenarios**:

1. **Given** 3 facets registered for `beforeSwap`, **When** hookData contains bitmap `0b111`, **Then** all 3 facets execute.
2. **Given** 3 facets registered for `beforeSwap`, **When** hookData contains bitmap `0b010`, **Then** only facet at index 1 executes.
3. **Given** 3 facets registered for `beforeSwap`, **When** hookData contains bitmap `0b000`, **Then** no facets execute and default return values are used.
4. **Given** 3 facets registered, **When** hookData contains a bitmap with a bit set beyond the registry length, **Then** the out-of-bounds bit is ignored (not a revert).

---

### User Story 3 - Pluggable Aggregator Combines Multi-Facet Return Values (Priority: P1)

When multiple facets execute for the same hook point, their return values must be combined. Each hook point can have a different aggregation strategy (e.g., sum BalanceDeltas for `afterSwap`, take the max fee override for `beforeSwap`). The aggregator is a separate pluggable contract implementing an `IAggregator` interface, swappable per hook point.

**Why this priority**: Without aggregation, multi-facet execution produces ambiguous return values that cannot be sent back to the PoolManager.

**Independent Test**: Deploy a SumDeltaAggregator, register it for `afterSwap`. Register two facets that each return a BalanceDelta. Execute a swap and verify the combined delta equals the sum.

**Acceptance Scenarios**:

1. **Given** a SumDeltaAggregator assigned to `afterSwap` and two facets returning deltas `(10, -5)` and `(3, -2)`, **When** a swap executes, **Then** the aggregated return to PoolManager is `(13, -7)`.
2. **Given** a LastWriteWinsAggregator assigned to `beforeSwap` fee override and two facets returning fees `500` and `3000`, **When** a swap executes, **Then** the returned fee is `3000` (last facet's value).
3. **Given** no aggregator assigned to a hook point, **When** multiple facets execute, **Then** the system reverts with a descriptive error (aggregator required when >1 facet returns values).

---

### User Story 4 - HookDispatcher Is a Diamond with Upgradeable Strategy Facets (Priority: P2)

The HookDispatcher itself is a Diamond proxy. Its internal facets are dispatch strategy modules (not hook implementations). This allows the dispatch logic, bitmap parsing, and aggregation orchestration to be independently upgraded without redeploying MasterHook or migrating hook facet registrations.

**Why this priority**: Upgradeability of dispatch logic is important but not blocking for initial functionality.

**Independent Test**: Deploy HookDispatcher as Diamond, perform a diamond cut to replace the dispatch strategy facet, verify hook calls still route correctly with the new strategy.

**Acceptance Scenarios**:

1. **Given** a HookDispatcher Diamond with DispatchStrategyV1, **When** admin performs a diamond cut replacing DispatchStrategyV1 with V2, **Then** subsequent hook calls use V2 logic.
2. **Given** an upgraded dispatch strategy, **When** the registry and aggregator configurations are unchanged, **Then** all existing facet registrations and aggregator assignments remain intact.

---

### User Story 5 - Protocol Admin Manages Aggregator Assignments (Priority: P2)

The protocol admin can assign, replace, or remove aggregator contracts for each hook point independently. Different hook points can use different aggregation strategies simultaneously.

**Why this priority**: Aggregator management is an admin operation needed for configurability but not for core dispatch.

**Independent Test**: Assign SumDeltaAggregator to `afterSwap`, assign MaxFeeAggregator to `beforeSwap`, verify each hook point uses its assigned aggregator.

**Acceptance Scenarios**:

1. **Given** no aggregator for `afterSwap`, **When** admin assigns SumDeltaAggregator, **Then** `afterSwap` uses sum aggregation.
2. **Given** SumDeltaAggregator assigned to `afterSwap`, **When** admin replaces it with WeightedAggregator, **Then** subsequent `afterSwap` calls use weighted aggregation.
3. **Given** an aggregator assigned to `afterSwap`, **When** admin removes it and only one facet is registered, **Then** that facet's return value is used directly (no aggregation needed).

---

### Edge Cases

- What happens when a facet delegatecall reverts? The dispatcher must handle per-facet failure policies (revert-all vs skip-and-continue).
- What happens when hookData is empty (no bitmap)? Default behavior: execute all registered facets for that hook point (bitmap = all-ones).
- What happens when the same facet address is registered twice for the same hook point? Reject duplicate registration with a descriptive error.
- What happens during a nested delegatecall (MasterHook -> Dispatcher -> Facet) if storage slot collisions occur? All contracts must use namespaced storage (ERC-7201 or keccak-based slot positioning).
- What happens when the aggregator contract itself reverts? The entire hook call reverts — aggregator failures are always critical.
- What happens if a facet's return value overflows during aggregation (e.g., summing two int128 values)? The aggregator must use int256 accumulators and safe-cast on the final result.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow registration of multiple hook facet addresses per hook point (bytes4 selector) in an ordered array.
- **FR-002**: System MUST support bitmap-based facet selection encoded in the `hookData` parameter of Uniswap v4 hook callbacks.
- **FR-003**: System MUST execute selected facets via `delegatecall` so all facets operate within MasterHook's storage context.
- **FR-004**: System MUST support pluggable aggregator contracts per hook point, implementing a standard `IAggregator` interface.
- **FR-005**: System MUST allow the protocol admin to assign, replace, and remove aggregator contracts for each hook point independently.
- **FR-006**: System MUST implement the HookDispatcher as a Diamond proxy (EIP-2535) where dispatch strategies are internal facets.
- **FR-007**: System MUST connect MasterHook to HookDispatcher via delegatecall, preserving the existing Diamond fallback pattern.
- **FR-008**: System MUST enforce namespaced storage (keccak-based slot positioning consistent with Compose library patterns) across all contracts to prevent storage collisions in the two-level delegatecall chain.
- **FR-009**: System MUST support a maximum of at least 16 hook facets per hook point (bitmap must accommodate this).
- **FR-010**: System MUST allow the protocol admin to set per-facet failure policies: `critical` (revert on failure) or `non-critical` (skip and continue).
- **FR-011**: System MUST default to executing all registered facets when hookData contains no bitmap (empty hookData).
- **FR-012**: System MUST reject duplicate facet registrations for the same hook point.
- **FR-013**: System MUST preserve access control: only protocol admins can register facets, assign aggregators, and perform diamond cuts on the dispatcher.

### Key Entities

- **HookDispatcher**: Inner Diamond proxy that receives delegatecalls from MasterHook. Holds the facet registry, aggregator registry, and routes to dispatch strategy facets.
- **DispatchStrategy (facet of HookDispatcher Diamond)**: Contains the core dispatch loop — decodes bitmap from hookData, iterates selected facets, invokes them via delegatecall, passes results to the aggregator.
- **Facet Registry**: Mapping from hook point selector (bytes4) to an ordered array of registered hook facet addresses with their configuration (critical/non-critical flag, optional gas limit).
- **Aggregator Registry**: Mapping from hook point selector (bytes4) to the aggregator contract address assigned for combining return values.
- **IAggregator**: Interface that all aggregator contracts implement. Receives an array of raw return values from facets and produces a single combined return value.
- **HookFacet**: An external hook implementation contract registered in the dispatcher. Executes via delegatecall in MasterHook's storage context. Must use namespaced storage.
- **FacetConfig**: Per-facet configuration including: address, critical flag, optional gas limit, subscription bitmap (which hook points this facet subscribes to).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Multiple hook facets (minimum 2) can be registered for the same hook point and all execute successfully during a pool operation.
- **SC-002**: Bitmap-based routing correctly activates only the selected subset of facets — verified for all 10 Uniswap v4 hook points.
- **SC-003**: Pluggable aggregators correctly combine return values for at least two different aggregation strategies (sum and last-write-wins).
- **SC-004**: Two-level delegatecall chain (MasterHook -> Dispatcher -> Facet) executes without storage collisions across all hook points.
- **SC-005**: HookDispatcher Diamond supports facet cuts (add/replace/remove dispatch strategies) without disrupting existing facet registrations or aggregator assignments.
- **SC-006**: Gas overhead of the dispatcher layer (compared to direct single-facet execution) is no more than 30% for a single-facet dispatch and scales linearly with the number of active facets.
- **SC-007**: All existing MasterHook functionality (initialization, pool creation via ProtocolHookMediator, access control) continues to work unchanged after integrating the HookDispatcher.

## Prior Art & Design Constraints

### MODL Aggregator (migarci2/modl)
- Uses bitmap subscription per module, pre-computed index arrays per hook, priority-ordered execution
- Aggregates: BalanceDeltas additively, fees via last-writer-wins, void hooks fire-and-forget
- Uses external `call` (not `delegatecall`) — modules have isolated storage
- Max 16 modules, global module config (not per-pool)
- No Diamond pattern

### Current MasterHook (hook-bazar)
- Diamond proxy using Compose/DiamondMod
- AllHook registered as default facet for all 10 IHooks selectors (no-op passthrough)
- `addHook()` replaces the facet for hook selectors — 1:1 mapping, no multi-facet support
- Uses keccak-based namespaced storage slots

### Design Constraints (from brainstorming)
- Conditional routing is the universal dispatch model (sequential chain and independent+merge are subsets)
- Bitmap + on-chain facet registry for selecting which facets fire per hook call
- Custom pluggable aggregator contracts per hook point
- Separate HookDispatcher contract connected via delegatecall
- HookDispatcher is itself a Diamond (Approach 3 from brainstorming)
- SCOP: no inheritance in contracts, no `library` keyword, no `modifier` keyword — use Compose/DiamondMod patterns

## Assumptions

- The Compose Diamond library (DiamondMod, DiamondCutMod) supports nested Diamond usage (Diamond within Diamond via delegatecall).
- hookData encoding format will use a fixed-position bitmap prefix (first N bytes) followed by per-facet calldata, maintaining compatibility with existing hookData consumers.
- The maximum of 16 facets per hook point is sufficient for foreseeable use cases, matching MODL's proven limit.
- Aggregator contracts are stateless pure functions that receive encoded return values and produce a combined result — they do not need storage access.
