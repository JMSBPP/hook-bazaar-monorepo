# Hook Bazaar: Goal Tree

> **Document Type:** Strategic Decomposition
> **Last Updated:** 2025-12-09
> **Related:** [Mission Statement](./mission-statement.md) | [Function Refinement Tree](./function-refinement-tree.md)

---

## 1. Goal Tree Overview

The goal tree decomposes the mission into hierarchical objectives, showing how lower-level goals contribute to higher-level outcomes.

```
                                    ┌─────────────────────────────────┐
                                    │           MISSION               │
                                    │  Trustless marketplace for      │
                                    │  verified, IP-protected hooks   │
                                    └───────────────┬─────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
                    ▼                               ▼                               ▼
        ┌───────────────────────┐     ┌───────────────────────┐     ┌───────────────────────┐
        │      GOAL 1           │     │      GOAL 2           │     │      GOAL 3           │
        │  Enable Mathematical  │     │  Provide Trustless    │     │  Create Sustainable   │
        │  Hook Specification   │     │  Verification         │     │  Marketplace          │
        └───────────┬───────────┘     └───────────┬───────────┘     └───────────┬───────────┘
                    │                             │                             │
        ┌───────────┴───────────┐     ┌───────────┴───────────┐     ┌───────────┴───────────┐
        │                       │     │                       │     │                       │
        ▼                       ▼     ▼                       ▼     ▼                       ▼
    [G1.1-G1.4]           [G2.1-G2.4]           [G3.1-G3.4]
    Subgoals              Subgoals              Subgoals
```

---

## 2. Primary Goals

### G1: Enable Mathematical Hook Specification

**Objective:** Create a formal framework for specifying hook behavior as mathematical systems

**Success Criteria:**
- Specification language can express all Uniswap V4 hook callbacks
- Specifications are machine-parseable for verification
- Specifications are human-readable for review

---

### G2: Provide Trustless Verification

**Objective:** Verify that hook implementations match specifications without code disclosure

**Success Criteria:**
- Verification does not require access to source code
- Economic security proportional to risk
- Challenge mechanism for incorrect attestations

---

### G3: Create Sustainable Marketplace

**Objective:** Build an economically viable platform for hook trading

**Success Criteria:**
- Developers can monetize hooks
- Integrators can easily discover and deploy hooks
- Platform is self-sustaining

---

## 3. Goal Decomposition

### 3.1 G1: Enable Mathematical Hook Specification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  G1: ENABLE MATHEMATICAL HOOK SPECIFICATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G1.1: Define State Space Model                                       │    │
│  │                                                                      │    │
│  │ Formalize the state variables that hooks can read and write          │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G1.1.1: Partition pool state by user type (LP/Trader)            │    │
│  │ ├── G1.1.2: Define hook-specific state variables (H)                 │    │
│  │ ├── G1.1.3: Map IStateView to formal state vectors                   │    │
│  │ └── G1.1.4: Document state variable semantics                        │    │
│  │                                                                      │    │
│  │ Deliverable: state-space-model.md                                    │    │
│  │ Status: COMPLETE                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G1.2: Define Transition Functions                                    │    │
│  │                                                                      │    │
│  │ Specify how each callback transforms state                           │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G1.2.1: Map callbacks to state transitions                       │    │
│  │ ├── G1.2.2: Define f_i(H, P) → (H', Δ) for each callback             │    │
│  │ ├── G1.2.3: Specify pre/post conditions                              │    │
│  │ └── G1.2.4: Define composition rules for chained hooks               │    │
│  │                                                                      │    │
│  │ Deliverable: transition-functions.md                                 │    │
│  │ Status: PARTIAL (in state-space-model.md)                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G1.3: Define Invariant Framework                                     │    │
│  │                                                                      │    │
│  │ Specify properties that must always hold                             │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G1.3.1: Catalog pool invariants (constant product, etc.)         │    │
│  │ ├── G1.3.2: Define hook-specific invariant types                     │    │
│  │ ├── G1.3.3: Create invariant verification rules                      │    │
│  │ └── G1.3.4: Document invariant composition                           │    │
│  │                                                                      │    │
│  │ Deliverable: invariant-framework.md                                  │    │
│  │ Status: PARTIAL (in state-space-model.md)                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G1.4: Create Specification Template                                  │    │
│  │                                                                      │    │
│  │ Provide reusable template for hook specifications                    │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G1.4.1: Design specification document structure                  │    │
│  │ ├── G1.4.2: Create LaTeX/Markdown template                           │    │
│  │ ├── G1.4.3: Define test vector format                                │    │
│  │ └── G1.4.4: Build specification validator tool                       │    │
│  │                                                                      │    │
│  │ Deliverable: specification-template.md                               │    │
│  │ Status: NOT STARTED                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 G2: Provide Trustless Verification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  G2: PROVIDE TRUSTLESS VERIFICATION                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G2.1: Design AVS Architecture                                        │    │
│  │                                                                      │    │
│  │ Create EigenLayer AVS for hook verification                          │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G2.1.1: Define task structure (AttestationTask)                  │    │
│  │ ├── G2.1.2: Define response structure (AttestationResponse)          │    │
│  │ ├── G2.1.3: Design operator workflow                                 │    │
│  │ └── G2.1.4: Integrate with EigenLayer middleware                     │    │
│  │                                                                      │    │
│  │ Deliverable: avs-verification-system.md                              │    │
│  │ Status: COMPLETE                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G2.2: Implement Behavioral Verification                              │    │
│  │                                                                      │    │
│  │ Verify hook behavior without code access                             │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G2.2.1: Design state sampling strategy                           │    │
│  │ ├── G2.2.2: Implement spec-to-expected-output translation            │    │
│  │ ├── G2.2.3: Define tolerance/epsilon for comparisons                 │    │
│  │ └── G2.2.4: Create verification result aggregation                   │    │
│  │                                                                      │    │
│  │ Deliverable: behavioral-verification.md + contracts                  │    │
│  │ Status: DOCUMENTED (in avs-verification-system.md)                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G2.3: Implement Challenge Mechanism                                  │    │
│  │                                                                      │    │
│  │ Allow disputes of incorrect attestations                             │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G2.3.1: Define false positive challenge (bad attestation)        │    │
│  │ ├── G2.3.2: Define false negative challenge (wrong rejection)        │    │
│  │ ├── G2.3.3: Implement slashing logic                                 │    │
│  │ └── G2.3.4: Define challenge window and resolution                   │    │
│  │                                                                      │    │
│  │ Deliverable: challenge-mechanism.md + contracts                      │    │
│  │ Status: DOCUMENTED (in avs-verification-system.md)                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G2.4: Integrate Code Protection                                      │    │
│  │                                                                      │    │
│  │ Protect hook code from decompilation                                 │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G2.4.1: Integrate Fhenix CoFHE for bytecode encryption           │    │
│  │ ├── G2.4.2: Define encryption/deployment workflow                    │    │
│  │ ├── G2.4.3: Verify encrypted hooks remain callable                   │    │
│  │ └── G2.4.4: Document gas overhead of encrypted execution             │    │
│  │                                                                      │    │
│  │ Deliverable: code-protection.md + integration guide                  │    │
│  │ Status: NOT STARTED                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 G3: Create Sustainable Marketplace

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  G3: CREATE SUSTAINABLE MARKETPLACE                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G3.1: Design NFT-Based Ownership                                     │    │
│  │                                                                      │    │
│  │ Represent hook ownership and rights as NFTs                          │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G3.1.1: Define NFT metadata schema                               │    │
│  │ ├── G3.1.2: Link NFT to specification URI                            │    │
│  │ ├── G3.1.3: Link NFT to deployed hook address                        │    │
│  │ └── G3.1.4: Implement royalty mechanism (EIP-2981)                   │    │
│  │                                                                      │    │
│  │ Deliverable: HookNFTRegistry.sol                                     │    │
│  │ Status: NOT STARTED                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G3.2: Build Hook Market                                              │    │
│  │                                                                      │    │
│  │ Create listing, discovery, and purchase mechanics                    │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G3.2.1: Implement hook listing function                          │    │
│  │ ├── G3.2.2: Enforce attestation requirement for listing              │    │
│  │ ├── G3.2.3: Implement purchase/licensing flow                        │    │
│  │ └── G3.2.4: Build search and filter capabilities                     │    │
│  │                                                                      │    │
│  │ Deliverable: HookMarket.sol                                          │    │
│  │ Status: NOT STARTED                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G3.3: Integrate with Uniswap V4                                      │    │
│  │                                                                      │    │
│  │ Connect marketplace hooks to PoolManager                             │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G3.3.1: Design MasterHook (Diamond pattern)                      │    │
│  │ ├── G3.3.2: Implement ProtocolHookMediator                           │    │
│  │ ├── G3.3.3: Create hook registration flow                            │    │
│  │ └── G3.3.4: Handle hook composition and routing                      │    │
│  │                                                                      │    │
│  │ Deliverable: MasterHook.sol, ProtocolHookMediator.sol                │    │
│  │ Status: IN PROGRESS (existing contracts)                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ G3.4: Define Economic Model                                          │    │
│  │                                                                      │    │
│  │ Create sustainable economics for all participants                    │    │
│  │                                                                      │    │
│  │ Subgoals:                                                            │    │
│  │ ├── G3.4.1: Define developer revenue model (sales, licensing, fees)  │    │
│  │ ├── G3.4.2: Define operator incentives (verification rewards)        │    │
│  │ ├── G3.4.3: Define platform fees                                     │    │
│  │ └── G3.4.4: Model economic sustainability                            │    │
│  │                                                                      │    │
│  │ Deliverable: economic-model.md                                       │    │
│  │ Status: NOT STARTED                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Goal Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOAL DEPENDENCY GRAPH                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              ┌─────────┐                                     │
│                              │ MISSION │                                     │
│                              └────┬────┘                                     │
│                                   │                                          │
│               ┌───────────────────┼───────────────────┐                      │
│               │                   │                   │                      │
│               ▼                   ▼                   ▼                      │
│           ┌───────┐           ┌───────┐           ┌───────┐                  │
│           │  G1   │           │  G2   │           │  G3   │                  │
│           │ Spec  │           │Verify │           │Market │                  │
│           └───┬───┘           └───┬───┘           └───┬───┘                  │
│               │                   │                   │                      │
│       ┌───────┴───────┐   ┌───────┴───────┐   ┌───────┴───────┐              │
│       │               │   │               │   │               │              │
│       ▼               ▼   ▼               ▼   ▼               ▼              │
│   ┌───────┐       ┌───────┐           ┌───────┐           ┌───────┐          │
│   │ G1.1  │◄──────│ G2.2  │           │ G2.1  │◄──────────│ G3.2  │          │
│   │ State │       │Behav. │           │ AVS   │           │Market │          │
│   │ Model │       │Verify │           │ Arch  │           │       │          │
│   └───────┘       └───────┘           └───────┘           └───────┘          │
│       │               ▲                   ▲                   │              │
│       │               │                   │                   │              │
│       ▼               │                   │                   ▼              │
│   ┌───────┐       ┌───────┐           ┌───────┐           ┌───────┐          │
│   │ G1.2  │──────▶│ G1.3  │           │ G2.4  │◄──────────│ G3.3  │          │
│   │Trans. │       │Invari.│           │ Code  │           │Uniswap│          │
│   │ Func  │       │       │           │Protect│           │Integr.│          │
│   └───────┘       └───────┘           └───────┘           └───────┘          │
│       │               │                                       │              │
│       │               │                                       │              │
│       ▼               ▼                                       ▼              │
│   ┌───────────────────────┐                               ┌───────┐          │
│   │        G1.4           │                               │ G3.1  │          │
│   │   Spec Template       │◄──────────────────────────────│ NFT   │          │
│   └───────────────────────┘                               └───────┘          │
│                                                                              │
│                                                                              │
│  LEGEND:                                                                     │
│  ───────▶  depends on (must complete before)                                 │
│  ◄──────   enables (completion enables)                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Critical Path

The critical path to minimum viable product (MVP):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CRITICAL PATH TO MVP                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 1: Foundation                                                         │
│  ═══════════════════                                                         │
│                                                                              │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐                                │
│  │  G1.1   │────▶│  G1.2   │────▶│  G1.3   │                                │
│  │ State   │     │ Trans.  │     │ Invari. │                                │
│  │ Model   │     │ Funcs   │     │ Frame.  │                                │
│  └─────────┘     └─────────┘     └─────────┘                                │
│                                       │                                      │
│                                       ▼                                      │
│  Phase 2: Verification                │                                      │
│  ═════════════════════                │                                      │
│                                       │                                      │
│  ┌─────────┐     ┌─────────┐     ┌────┴────┐                                │
│  │  G2.1   │────▶│  G2.2   │◄────│  G1.4   │                                │
│  │  AVS    │     │ Behav.  │     │  Spec   │                                │
│  │  Arch   │     │ Verify  │     │ Template│                                │
│  └─────────┘     └─────────┘     └─────────┘                                │
│       │               │                                                      │
│       ▼               ▼                                                      │
│  ┌─────────┐     ┌─────────┐                                                │
│  │  G2.3   │     │  G2.4   │                                                │
│  │Challenge│     │  Code   │                                                │
│  │  Mech.  │     │ Protect │                                                │
│  └─────────┘     └─────────┘                                                │
│       │               │                                                      │
│       └───────┬───────┘                                                      │
│               ▼                                                              │
│  Phase 3: Marketplace                                                        │
│  ════════════════════                                                        │
│                                                                              │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐                                │
│  │  G3.1   │────▶│  G3.2   │────▶│  G3.3   │                                │
│  │  NFT    │     │ Market  │     │ Uniswap │                                │
│  │ Ownership│    │         │     │ Integr. │                                │
│  └─────────┘     └─────────┘     └─────────┘                                │
│                                       │                                      │
│                                       ▼                                      │
│                                  ┌─────────┐                                │
│                                  │   MVP   │                                │
│                                  │ LAUNCH  │                                │
│                                  └─────────┘                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Goal Status Summary

| Goal | Description | Status | Priority |
|------|-------------|--------|----------|
| G1.1 | State Space Model | COMPLETE | - |
| G1.2 | Transition Functions | PARTIAL | HIGH |
| G1.3 | Invariant Framework | PARTIAL | HIGH |
| G1.4 | Specification Template | NOT STARTED | HIGH |
| G2.1 | AVS Architecture | COMPLETE | - |
| G2.2 | Behavioral Verification | DOCUMENTED | MEDIUM |
| G2.3 | Challenge Mechanism | DOCUMENTED | MEDIUM |
| G2.4 | Code Protection | NOT STARTED | HIGH |
| G3.1 | NFT Ownership | NOT STARTED | MEDIUM |
| G3.2 | Hook Market | NOT STARTED | MEDIUM |
| G3.3 | Uniswap Integration | IN PROGRESS | HIGH |
| G3.4 | Economic Model | NOT STARTED | LOW |

---

## 7. Next Actions

Based on critical path and dependencies:

1. **G1.2/G1.3**: Complete transition function and invariant documentation
2. **G1.4**: Create specification template that developers can use
3. **G2.4**: Begin Fhenix CoFHE integration research
4. **G3.3**: Continue MasterHook and ProtocolHookMediator development
