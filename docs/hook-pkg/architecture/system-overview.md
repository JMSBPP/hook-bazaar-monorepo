# Hook Bazaar: Complete System Architecture

> **Status:** Architecture Specification
> **Last Updated:** 2025-12-09
> **Related Documents:**
> - [State-Space Model](../mathematical-models/state-space-model.md)
> - [AVS Verification System](./avs-verification-system.md)

---

## 1. Vision

Hook Bazaar is a **marketplace for verified Uniswap V4 hooks** that enables:

1. **Hook Developers** to monetize their implementations while protecting intellectual property
2. **Pool Operators** to discover and deploy verified hooks with cryptoeconomic guarantees
3. **The Ecosystem** to grow through composable, trusted hook infrastructure

---

## 2. System Components

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            HOOK BAZAAR ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                          LAYER 1: SPECIFICATIONS                         │    │
│  │                                                                          │    │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │    │
│  │   │    Hook      │    │   State      │    │  Invariant   │              │    │
│  │   │    Spec      │    │  Transition  │    │  Definitions │              │    │
│  │   │  (Markdown)  │    │  Equations   │    │   (LaTeX)    │              │    │
│  │   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │    │
│  │          │                   │                   │                       │    │
│  │          └───────────────────┼───────────────────┘                       │    │
│  │                              ▼                                           │    │
│  │                    ┌──────────────────┐                                  │    │
│  │                    │   IPFS Storage   │                                  │    │
│  │                    │  (Spec Document) │                                  │    │
│  │                    └────────┬─────────┘                                  │    │
│  └─────────────────────────────┼────────────────────────────────────────────┘    │
│                                │                                                  │
│  ┌─────────────────────────────┼────────────────────────────────────────────┐    │
│  │                          LAYER 2: IMPLEMENTATION                         │    │
│  │                                │                                         │    │
│  │   ┌───────────────────────────┼───────────────────────────────────┐     │    │
│  │   │                           ▼                                    │     │    │
│  │   │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │     │    │
│  │   │  │   Solidity   │───▶│   Fhenix    │───▶│  Encrypted   │    │     │    │
│  │   │  │    Code      │    │   CoFHE     │    │   Bytecode   │    │     │    │
│  │   │  └──────────────┘    └──────────────┘    └──────┬───────┘    │     │    │
│  │   │         Hook Developer's Local Environment      │            │     │    │
│  │   └─────────────────────────────────────────────────┼────────────┘     │    │
│  │                                                     │                   │    │
│  │                                                     ▼                   │    │
│  │                              ┌──────────────────────────────┐          │    │
│  │                              │   Deployed Hook Contract     │          │    │
│  │                              │   (Code hidden, behavior     │          │    │
│  │                              │    publicly observable)      │          │    │
│  │                              └──────────────┬───────────────┘          │    │
│  └─────────────────────────────────────────────┼────────────────────────────┘    │
│                                                │                                  │
│  ┌─────────────────────────────────────────────┼────────────────────────────┐    │
│  │                          LAYER 3: VERIFICATION                           │    │
│  │                                             │                            │    │
│  │   ┌─────────────────────────────────────────┼─────────────────────────┐ │    │
│  │   │                    EigenLayer AVS       │                         │ │    │
│  │   │                                         ▼                         │ │    │
│  │   │   ┌──────────────┐    ┌──────────────────────────┐               │ │    │
│  │   │   │   Service    │    │     Task Manager          │               │ │    │
│  │   │   │   Manager    │◄──▶│  - createAttestationTask  │               │ │    │
│  │   │   └──────────────┘    │  - respondToTask          │               │ │    │
│  │   │                       │  - challengeAttestation   │               │ │    │
│  │   │                       └────────────┬─────────────┘               │ │    │
│  │   │                                    │                              │ │    │
│  │   │   ┌────────────────────────────────┼────────────────────────┐    │ │    │
│  │   │   │              Operator Network  │                        │    │ │    │
│  │   │   │                                ▼                        │    │ │    │
│  │   │   │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │    │ │    │
│  │   │   │  │OP 1      │  │OP 2      │  │OP N      │   ...       │    │ │    │
│  │   │   │  │Sample    │  │Sample    │  │Sample    │             │    │ │    │
│  │   │   │  │Verify    │  │Verify    │  │Verify    │             │    │ │    │
│  │   │   │  │Sign      │  │Sign      │  │Sign      │             │    │ │    │
│  │   │   │  └──────────┘  └──────────┘  └──────────┘             │    │ │    │
│  │   │   └─────────────────────────────────────────────────────────┘    │ │    │
│  │   └───────────────────────────────────────────────────────────────────┘ │    │
│  │                                             │                            │    │
│  │                                             ▼                            │    │
│  │                              ┌──────────────────────────┐               │    │
│  │                              │   Attestation Registry   │               │    │
│  │                              │   (On-chain record)      │               │    │
│  │                              └──────────────┬───────────┘               │    │
│  └─────────────────────────────────────────────┼────────────────────────────┘    │
│                                                │                                  │
│  ┌─────────────────────────────────────────────┼────────────────────────────┐    │
│  │                          LAYER 4: MARKETPLACE                            │    │
│  │                                             │                            │    │
│  │                                             ▼                            │    │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │    │
│  │   │  Hook NFT    │◄──▶│  Hook Market │◄──▶│   Protocol   │              │    │
│  │   │  Registry    │    │  (Listings)  │    │   Mediator   │              │    │
│  │   └──────────────┘    └──────────────┘    └──────────────┘              │    │
│  │          │                   │                   │                       │    │
│  │          │                   │                   │                       │    │
│  │          ▼                   ▼                   ▼                       │    │
│  │   ┌──────────────────────────────────────────────────────────┐          │    │
│  │   │                   MasterHook (Diamond)                    │          │    │
│  │   │   - Routes callbacks to verified hooks                    │          │    │
│  │   │   - Enforces attestation requirements                     │          │    │
│  │   │   - Manages hook composition                              │          │    │
│  │   └──────────────────────────────────────────────────────────┘          │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │                          LAYER 5: UNISWAP V4                             │    │
│  │                                                                          │    │
│  │   ┌──────────────────────────────────────────────────────────┐          │    │
│  │   │                      PoolManager                          │          │    │
│  │   │   - Executes swaps, mints, burns                          │          │    │
│  │   │   - Invokes hook callbacks                                │          │    │
│  │   │   - Manages pool state                                    │          │    │
│  │   └──────────────────────────────────────────────────────────┘          │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Specification Layer

**Purpose:** Define hook behavior mathematically before implementation

**Components:**

| Component | Format | Storage | Purpose |
|-----------|--------|---------|---------|
| Hook Specification | Markdown + LaTeX | IPFS | Human-readable behavior description |
| State Variables | JSON Schema | IPFS | Formal state definitions ($H$) |
| Transition Functions | LaTeX equations | IPFS | $f_i(H, P) \rightarrow (H', \Delta)$ |
| Invariants | First-order logic | IPFS | Properties that must always hold |
| Test Vectors | JSON | IPFS | Input→Output pairs for validation |

**Interface:**

```solidity
interface IHookSpecification {
    /// @return specURI IPFS CID of complete specification
    function specificationURI() external pure returns (string memory specURI);

    /// @return vars Bitmask of state variables accessed
    function declareStateReads() external pure returns (
        uint256 lpStateVars,
        uint256 traderStateVars,
        uint256 sharedStateVars
    );

    /// @return invariantIds Identifiers for declared invariants
    function declareInvariants() external pure returns (bytes32[] memory invariantIds);
}
```

### 3.2 Implementation Layer

**Purpose:** Transform specifications into executable code with IP protection

**Components:**

| Component | Technology | Purpose |
|-----------|------------|---------|
| Hook Contract | Solidity | Implements specification as executable code |
| Fhenix CoFHE | FHE Encryption | Encrypts bytecode to prevent decompilation |
| IHookStateView | Interface | Exposes hook state for verification |

**Code Protection Flow:**

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Solidity    │────▶│    Compile    │────▶│   Bytecode    │
│    Source     │     │    (solc)     │     │   (clear)     │
└───────────────┘     └───────────────┘     └───────┬───────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │  Fhenix CoFHE │
                                            │   Encrypt     │
                                            └───────┬───────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │   Encrypted   │
                                            │   Bytecode    │
                                            └───────┬───────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │    Deploy     │
                                            │   (on-chain)  │
                                            └───────────────┘
```

### 3.3 Verification Layer

**Purpose:** Prove implementation matches specification without code disclosure

**Reference:** [AVS Verification System](./avs-verification-system.md)

**Key Contracts:**

| Contract | Function |
|----------|----------|
| `HookAttestationServiceManager` | EigenLayer AVS registration and operator management |
| `HookAttestationTaskManager` | Task creation, response, and challenge handling |
| `AttestationRegistry` | On-chain record of valid attestations |
| `HookStateSampler` | State sampling utilities for operators |

**Verification Guarantee:**

$$
\text{Attestation} \implies P(\text{spec compliance}) \geq 1 - \epsilon
$$

Where $\epsilon$ depends on:
- Sample count
- Operator count
- Stake amount
- Challenge period duration

### 3.4 Marketplace Layer

**Purpose:** Enable discovery, trading, and deployment of verified hooks

**Components:**

| Contract | Purpose |
|----------|---------|
| `HookNFTRegistry` | ERC-721 tokens representing hook ownership |
| `HookMarket` | Listings, pricing, and purchase mechanics |
| `ProtocolHookMediator` | Interfaces between protocols and hooks |
| `MasterHook` | Diamond-pattern hub routing callbacks |

**NFT Metadata Schema:**

```json
{
  "name": "DynamicFeeHook v1.0.0",
  "description": "Volatility-responsive fee adjustment hook",
  "image": "ipfs://Qm.../preview.png",
  "external_url": "https://hookbazaar.xyz/hooks/0x...",
  "attributes": [
    { "trait_type": "Callbacks", "value": ["beforeSwap", "afterSwap"] },
    { "trait_type": "Attestation Status", "value": "Verified" },
    { "trait_type": "Attestation Expiry", "value": 1735689600 },
    { "trait_type": "Specification URI", "value": "ipfs://Qm.../spec.md" },
    { "trait_type": "Developer", "value": "0x..." }
  ]
}
```

### 3.5 Integration Layer (Uniswap V4)

**Purpose:** Connect verified hooks to Uniswap V4 PoolManager

**Key Integration Points:**

| Component | Integration |
|-----------|-------------|
| `PoolManager` | Hook address registered at pool creation |
| `IHooks` | Standard callback interface implementation |
| `StateView` | Exposes pool state for verification sampling |

---

## 4. Data Flow Diagrams

### 4.1 Hook Registration Flow

```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │
       │ 1. Create Specification
       ▼
┌─────────────┐
│    IPFS     │◄─────────────────────────────────────────┐
└──────┬──────┘                                          │
       │                                                 │
       │ 2. specificationURI                             │
       ▼                                                 │
┌─────────────┐                                          │
│  Implement  │                                          │
│    Hook     │                                          │
└──────┬──────┘                                          │
       │                                                 │
       │ 3. Encrypt via Fhenix                           │
       ▼                                                 │
┌─────────────┐                                          │
│   Deploy    │                                          │
│  Contract   │                                          │
└──────┬──────┘                                          │
       │                                                 │
       │ 4. hookAddress                                  │
       ▼                                                 │
┌─────────────────────┐                                  │
│ createAttestationTask│                                  │
│ (hookAddress, specURI)│                                  │
└──────┬──────────────┘                                  │
       │                                                 │
       │ 5. Task emitted                                 │
       ▼                                                 │
┌─────────────────────┐     6. Fetch spec                │
│  AVS Operators      │─────────────────────────────────▶│
│  - Sample state     │
│  - Execute callbacks│
│  - Verify behavior  │
│  - Sign response    │
└──────┬──────────────┘
       │
       │ 7. Aggregated response
       ▼
┌─────────────────────┐
│  respondToTask      │
│  (BLS signatures)   │
└──────┬──────────────┘
       │
       │ 8. If compliant
       ▼
┌─────────────────────┐
│ AttestationRegistry │
│ .recordAttestation()│
└──────┬──────────────┘
       │
       │ 9. Attestation recorded
       ▼
┌─────────────────────┐
│    HookMarket       │
│  .listHook()        │
└─────────────────────┘
```

### 4.2 Hook Deployment Flow

```
┌─────────────┐
│ Integrator  │
└──────┬──────┘
       │
       │ 1. Browse HookMarket
       ▼
┌─────────────┐
│ HookMarket  │
│ .getListings()│
└──────┬──────┘
       │
       │ 2. Select hook
       ▼
┌─────────────────────┐
│ AttestationRegistry │
│ .getAttestation()   │
└──────┬──────────────┘
       │
       │ 3. Verify attestation
       │    - isValid == true
       │    - expiresAt > now
       ▼
┌─────────────┐     4. Fetch spec
│    IPFS     │◄─────────────────────────────────────────────
└──────┬──────┘
       │
       │ 5. Review specification
       │    - State variables
       │    - Transition functions
       │    - Invariants
       ▼
┌─────────────────────┐
│ HookMarket          │
│ .purchaseHook()     │
│ (if paid model)     │
└──────┬──────────────┘
       │
       │ 6. Deploy to pool
       ▼
┌─────────────────────┐
│ ProtocolHookMediator│
│ .registerHook()     │
└──────┬──────────────┘
       │
       │ 7. Route via MasterHook
       ▼
┌─────────────────────┐
│ MasterHook          │
│ (Diamond facet)     │
└──────┬──────────────┘
       │
       │ 8. Connect to PoolManager
       ▼
┌─────────────────────┐
│ PoolManager         │
│ .initialize(hook)   │
└─────────────────────┘
```

### 4.3 Runtime Callback Flow

```
┌─────────────┐
│   Trader    │
└──────┬──────┘
       │
       │ 1. swap(poolId, params)
       ▼
┌─────────────────────┐
│    PoolManager      │
└──────┬──────────────┘
       │
       │ 2. hook.beforeSwap(...)
       ▼
┌─────────────────────┐
│    MasterHook       │
│    (Diamond Hub)    │
└──────┬──────────────┘
       │
       │ 3. Route to registered hook
       ▼
┌─────────────────────┐
│ DynamicFeeHook      │  ◄── Encrypted bytecode
│ (Fhenix protected)  │      (cannot decompile)
│                     │
│ Executes:           │
│ - Read H (hook state)│
│ - Read P (pool state)│
│ - Compute f(H,P)    │
│ - Return Δ          │
└──────┬──────────────┘
       │
       │ 4. Return (deltaFee, hookData)
       ▼
┌─────────────────────┐
│    MasterHook       │
└──────┬──────────────┘
       │
       │ 5. Return to PoolManager
       ▼
┌─────────────────────┐
│    PoolManager      │
│    - Apply fee Δ    │
│    - Execute swap   │
└──────┬──────────────┘
       │
       │ 6. hook.afterSwap(...)
       │    (similar flow)
       ▼
┌─────────────────────┐
│   Swap Complete     │
└─────────────────────┘
```

---

## 5. Security Model

### 5.1 Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARY 1                                │
│                     (Cryptographic: Fhenix CoFHE)                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │   Hook Source Code - Encrypted, cannot be extracted                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARY 2                                │
│                  (Cryptoeconomic: EigenLayer AVS)                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │   Specification Compliance - Verified by staked operators          │  │
│  │   Economic security: Σ(operator_stake) × slashing_rate            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARY 3                                │
│                    (Social: Specification Review)                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │   Specification Quality - Community review, audits, reputation     │  │
│  │   Risk: Malicious spec that matches malicious behavior             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Threat Model

| Threat | Impact | Mitigation | Residual Risk |
|--------|--------|------------|---------------|
| Code Extraction | IP theft | Fhenix FHE encryption | Cryptographic break |
| False Attestation | Deploy malicious hook | Slashing, multi-operator | Operator collusion |
| Spec Gaming | Approved malicious behavior | Community review | Undetected malicious spec |
| State Manipulation | Bypass verification | Random sampling | Statistical edge cases |
| Time-of-Check Attack | Behavior change after attestation | Attestation expiry | Short-term exploitation |

### 5.3 Economic Security

**Attestation Security Budget:**

$$
\text{Security} = \sum_{i \in \text{Operators}} \text{Stake}_i \times \text{SlashRate}
$$

**Recommended Parameters:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Minimum Operator Count | 10 | Decentralization |
| Quorum Threshold | 67% | BFT assumption |
| Slash Rate | 10% | Sufficient deterrent |
| Attestation Validity | 30 days | Balance freshness vs. overhead |
| Sample Count | 100 | Statistical confidence |

---

## 6. Deployment Architecture

### 6.1 Contract Deployment Order

```
Phase 1: Core Infrastructure
├── 1.1 Deploy EigenLayer middleware (if not existing)
├── 1.2 Deploy HookAttestationServiceManager
├── 1.3 Deploy HookAttestationTaskManager
└── 1.4 Deploy AttestationRegistry

Phase 2: Marketplace
├── 2.1 Deploy HookNFTRegistry
├── 2.2 Deploy HookMarket
├── 2.3 Deploy ProtocolHookMediator
└── 2.4 Deploy MasterHook (Diamond)

Phase 3: Integration
├── 3.1 Register AVS with EigenLayer
├── 3.2 Onboard initial operators
├── 3.3 Connect MasterHook to PoolManager
└── 3.4 Deploy StateView adapter

Phase 4: Testing
├── 4.1 Deploy test hooks
├── 4.2 Run attestation workflow
├── 4.3 Verify marketplace flow
└── 4.4 Test slashing conditions
```

### 6.2 Operator Requirements

**Hardware:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 100GB SSD
- Network: 100Mbps+

**Software:**
- Ethereum node (archive preferred)
- AVS operator client
- BLS key management
- IPFS gateway access

**Stake:**
- Minimum: 32 ETH equivalent
- Recommended: 100+ ETH for higher task allocation

---

## 7. Future Extensions

### 7.1 Planned Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Hook Composition | Chain multiple hooks on same pool | High |
| Subscription Model | Recurring payments for hook usage | Medium |
| Governance | DAO control of marketplace parameters | Medium |
| Cross-chain | Deploy hooks on L2s and other chains | Low |
| Formal Verification | TLA+ specs alongside Solidity | Low |

### 7.2 Research Questions

1. **Optimal Sample Distribution**: How to select state samples that maximize coverage with minimum count?
2. **Specification Language**: Can we create a DSL that compiles to both Solidity and verification rules?
3. **Incentive Alignment**: How to reward operators for thorough verification vs. speed?
4. **Upgradeability**: How to handle hook upgrades while maintaining attestation?

---

## 8. References

1. **[Uniswap V4 Core]** https://github.com/Uniswap/v4-core
2. **[EigenLayer]** https://github.com/Layr-Labs/eigenlayer-contracts
3. **[Fhenix CoFHE]** https://cofhe-docs.fhenix.zone/
4. **[Bonded Hooks]** https://github.com/Jammabeans/Bonded-hooks
5. **[arXiv:2512.06203]** Formal State-Machine Models for Uniswap v3
6. **[Diamond Pattern]** EIP-2535 Diamonds

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Hook** | Smart contract extending Uniswap V4 pool behavior via callbacks |
| **Specification** | Formal document defining hook behavior mathematically |
| **Attestation** | On-chain proof that hook implementation matches specification |
| **AVS** | Actively Validated Service - EigenLayer service for decentralized verification |
| **CoFHE** | Co-processing Fully Homomorphic Encryption |
| **MasterHook** | Diamond-pattern contract routing callbacks to registered hooks |
| **State Index** | Partitioning of pool state by user type (LP vs Trader) |
