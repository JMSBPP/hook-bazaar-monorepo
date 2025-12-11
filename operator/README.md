# HookAttestationAVS Operator

Off-chain operator for the HookAttestationAVS - an EigenLayer AVS that verifies hook implementations match their formal specifications **without revealing source code**.

---

## User Stories

### Hook Developer Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HOOK DEVELOPER WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: Write Specification                                             │
│  ─────────────────────────────                                          │
│  - Define state variables (H) for your hook                              │
│  - Define state transitions f_i(H, P) → (H', Δ) for each callback       │
│  - Define invariants that must always hold                               │
│  - Create test vectors with expected inputs/outputs                      │
│  - Upload specification to IPFS → receive specificationURI               │
│                                                                          │
│  STEP 2: Implement Hook                                                  │
│  ─────────────────────────                                              │
│  - Write Solidity implementation matching your specification             │
│  - Run local tests against your test vectors                             │
│  - Ensure implementation behavior matches spec equations                 │
│                                                                          │
│  STEP 3: Deploy via Fhenix CoFHE (Optional)                             │
│  ───────────────────────────────────────────                            │
│  - Encrypt hook bytecode using Fhenix                                    │
│  - Deploy encrypted contract                                             │
│  - Your code is now protected from decompilation                         │
│                                                                          │
│  STEP 4: Request Attestation                                             │
│  ───────────────────────────                                            │
│  ```solidity                                                             │
│  HookAttestationTaskManager.createAttestationTask(                       │
│      hook: deployedHookAddress,                                          │
│      specificationURI: "ipfs://Qm...",                                   │
│      poolIds: [testPoolId1, testPoolId2],                                │
│      callbacks: [beforeSwap.selector, afterSwap.selector],               │
│      sampleCount: 100                                                    │
│  )                                                                       │
│  ```                                                                     │
│                                                                          │
│  STEP 5: Operators Verify (This Component)                               │
│  ──────────────────────────────────────────                             │
│  - AVS operators receive your task                                       │
│  - They sample state from specified pools                                │
│  - They execute callbacks as BLACK BOX (no code access)                  │
│  - They verify behavior matches your specification                       │
│  - They sign and submit attestation response                             │
│                                                                          │
│  STEP 6: Receive Attestation                                             │
│  ───────────────────────────                                            │
│  - If specCompliant == true:                                             │
│    ✓ Attestation recorded in AttestationRegistry                         │
│    ✓ Hook can be listed in HookMarket                                    │
│    ✓ Protocol designers can discover and trust your hook                 │
│  - If specCompliant == false:                                            │
│    ✗ Review failure reasons in response                                  │
│    ✗ Fix implementation to match specification                           │
│    ✗ Request new attestation                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Protocol Designer (Integrator) Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PROTOCOL DESIGNER WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: Browse Hook Market                                              │
│  ──────────────────────────                                             │
│  - View available hooks with attestations                                │
│  - Filter by: callback types, attestation status, price, rating          │
│  - See attestation validity period and quorum information                │
│                                                                          │
│  STEP 2: Review Specification (Not Code!)                                │
│  ────────────────────────────────────────                               │
│  ```typescript                                                           │
│  const att = await attestationRegistry.getAttestation(hookAddress);      │
│  // Fetch specification from att.specificationURI                        │
│  ```                                                                     │
│  - Review state variables and their meaning                              │
│  - Understand transition functions and expected behavior                 │
│  - Check invariants that are GUARANTEED to hold                          │
│  - Validate test vectors match your use case                             │
│                                                                          │
│  STEP 3: Verify Attestation On-Chain                                     │
│  ──────────────────────────────────                                     │
│  ```solidity                                                             │
│  require(attestationRegistry.isHookAttested(hook), "Not attested");      │
│  require(att.expiresAt > block.timestamp, "Attestation expired");        │
│  require(att.taskIndex > 0, "Valid task index");                         │
│  ```                                                                     │
│                                                                          │
│  STEP 4: Deploy Hook to Your Pool                                        │
│  ──────────────────────────────                                         │
│  ```solidity                                                             │
│  hookMarket.deployVerifiedHook(poolId, hookAddress);                     │
│  ```                                                                     │
│                                                                          │
│  TRUST GUARANTEES YOU RECEIVE:                                           │
│  ─────────────────────────────                                          │
│  ✓ Hook behavior matches published specification                         │
│  ✓ Operators staked slashable collateral on this claim                   │
│  ✓ Economic security proportional to total operator stake                │
│  ✓ NO NEED to audit source code - behavior is verified                   │
│  ✓ Invariants will hold or operators get slashed                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### AVS Operator Journey (Running This Software)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AVS OPERATOR WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: Register as Operator                                            │
│  ────────────────────────────                                           │
│  - Register with EigenLayer DelegationManager                            │
│  - Opt-in to HookAttestationAVS quorums                                  │
│  - Generate and register BLS keypair                                     │
│  - Stake collateral (subject to slashing for incorrect attestations)     │
│                                                                          │
│  STEP 2: Configure and Run Operator                                      │
│  ──────────────────────────────────                                     │
│  ```bash                                                                 │
│  export RPC_URL=https://mainnet.infura.io/v3/...                         │
│  export PRIVATE_KEY=0x...                                                │
│  export TASK_MANAGER_ADDRESS=0x...                                       │
│  npm start                                                               │
│  ```                                                                     │
│                                                                          │
│  STEP 3: Listen for Tasks                                                │
│  ────────────────────────                                               │
│  - Operator automatically listens for AttestationTaskCreated events      │
│  - When task received:                                                   │
│    1. Fetch specification from IPFS                                      │
│    2. Sample state from specified pools                                  │
│    3. Execute callbacks (black-box verification)                         │
│    4. Check compliance against specification                             │
│    5. Sign and submit response                                           │
│                                                                          │
│  STEP 4: Earn Rewards / Risk Slashing                                    │
│  ─────────────────────────────────────                                  │
│  - Correct attestations: Earn protocol fees                              │
│  - False Positive (attesting non-compliant hook): SLASHED                │
│  - False Negative (rejecting compliant hook): SLASHED                    │
│                                                                          │
│  SLASHING CONDITIONS:                                                    │
│  ────────────────────                                                   │
│  - Anyone can challenge attestation with counter-samples                 │
│  - If challenge proves operator was wrong → stake slashed                │
│  - This creates economic incentive for honest verification               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Insight: Behavioral Verification

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    HOW VERIFICATION WORKS WITHOUT CODE                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  The SPECIFICATION defines:    f_i(H, P) → (H', Δ)                      │
│                                                                          │
│  The OPERATOR executes:        actual_output = hook.callback(input)      │
│                                                                          │
│  The VERIFICATION checks:      |actual_output - spec_output| <= ε        │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  CODE REMAINS ENCRYPTED (via Fhenix CoFHE)                               │
│  ONLY INPUT→OUTPUT BEHAVIOR IS CHECKED                                   │
│  OPERATORS NEVER SEE SOURCE CODE                                         │
│                                                                          │
│  Mathematical Formalization:                                             │
│  ──────────────────────────                                             │
│  For sampled states {(H_j, P_j)} and callback f_i:                       │
│                                                                          │
│     PASS ⟺ ∀j: ‖f_i^actual(H_j, P_j) - f_i^spec(H_j, P_j)‖ ≤ ε         │
│                                                                          │
│  Where:                                                                  │
│  - f_i^actual = hook's actual behavior (black box)                       │
│  - f_i^spec = expected behavior from specification                       │
│  - ε = acceptable deviation (gas, rounding, etc.)                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Overview

The HookAttestationAVS operator performs behavioral verification of Uniswap V4 hooks by:

1. **Fetching Specifications** - Retrieves formal hook specifications from IPFS
2. **Sampling State** - Collects pre/post state samples from pool interactions
3. **Verifying Compliance** - Compares actual behavior against specification
4. **Submitting Attestations** - Signs and submits verification results on-chain

This implements the verification workflow described in [avs-verification-system.md](../docs/hook-pkg/architecture/avs-verification-system.md).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     OPERATOR VERIFICATION WORKFLOW                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. RECEIVE TASK          2. SAMPLE STATE        3. VERIFY AGAINST SPEC │
│   ┌─────────────┐          ┌─────────────┐        ┌─────────────┐       │
│   │ Parse task  │    →     │ Collect pre │   →    │ Compare vs  │       │
│   │ Fetch spec  │          │ /post state │        │ expected    │       │
│   │ from IPFS   │          │ for pools   │        │ Check invs  │       │
│   └─────────────┘          └─────────────┘        └─────────────┘       │
│                                                          │               │
│   4. AGGREGATE RESULTS     5. SIGN & SUBMIT              ▼               │
│   ┌─────────────┐          ┌─────────────┐        ┌─────────────┐       │
│   │ Compute     │    →     │ BLS sign    │   ←    │ PASS/FAIL   │       │
│   │ hashes      │          │ Submit tx   │        │ Result      │       │
│   └─────────────┘          └─────────────┘        └─────────────┘       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
operator/
├── src/
│   ├── HookAttestationAVS.ts    # Main operator runtime
│   ├── processor.ts              # Task processing orchestration
│   ├── specParser.ts             # IPFS specification parsing
│   ├── stateSampler.ts           # State sampling logic
│   ├── complianceChecker.ts      # Spec compliance verification
│   ├── config.ts                 # Configuration loading
│   └── types.ts                  # TypeScript type definitions
├── __tests__/                    # Unit tests
├── __mocks__/                    # Test mocks (IPFS, contracts)
├── integration/                  # Local testing helpers
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js >= 18
- npm or yarn
- (For live mode) Deployed HookAttestationTaskManager contract
- (For live mode) EigenLayer operator registration

## Installation

```bash
cd operator
npm install
```

## Configuration

Create a `.env` file:

```env
# Required
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x...

# Contract Addresses (required for live mode)
TASK_MANAGER_ADDRESS=0x...
ATTESTATION_REGISTRY_ADDRESS=0x...
HOOK_STATE_VIEW_ADDRESS=0x...

# IPFS
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Operator Settings
COMPLIANCE_TOLERANCE_BPS=100   # 1% tolerance
DRY_RUN=1                      # Set to 0 for live mode
POLLING_INTERVAL_MS=10000      # 10 seconds

# Logging
LOG_LEVEL=info                 # debug, info, warn, error
```

## Usage

### Dry Run Mode (Testing)

```bash
# Run with dry-run enabled (no on-chain transactions)
DRY_RUN=1 npm start
```

### Live Mode

```bash
# Ensure contracts are deployed and configured
DRY_RUN=0 npm start
```

### Attestation Simulation

Runs a DynamicFeeMock attestation simulation with console report output.

```bash
# Terminal 1
anvil

# Terminal 2
npx tsx integration/runSimulation.ts
```

### Manual Task Processing (Testing)

```typescript
import { processTaskManually } from "./src/HookAttestationAVS.js";

const task = {
  hook: "0x...",
  specificationURI: "ipfs://Qm...",
  poolIds: ["0x..."],
  callbacks: ["0xec9f4aa6"], // beforeSwap
  sampleCount: 10,
  taskCreatedBlock: 1000,
  quorumNumbers: "0x00",
  quorumThresholdPercentage: 67,
};

const result = await processTaskManually(task, 1);
console.log(result);
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- __tests__/specParser.test.ts
```

## Dependencies on Other Components

### Contracts (Not Yet Deployed)

| Contract | Status | Notes |
|----------|--------|-------|
| `IHookAttestationTaskManager` | ❌ Pending | Task creation and response submission |
| `AttestationRegistry` | ❌ Pending | Stores attestation results |
| `HookStateSampler` | ❌ Pending | On-chain state sampling helper |
| `IHookStateView` | ❓ Needs verification | Hook/pool state reading |

### EigenLayer Integration (Not Yet Configured)

| Component | Status | Notes |
|-----------|--------|-------|
| BLS Signature Infrastructure | ❌ Pending | Required for multi-operator consensus |
| Registry Coordinator | ❌ Pending | Operator/quorum registration |
| Stake Registry | ❌ Pending | Operator stake tracking |

## Specification Format

Hook specifications can be in JSON or Markdown format. See [avs-verification-system.md Section 3.1](../docs/hook-pkg/architecture/avs-verification-system.md#31-hook-specification-document-ipfs) for the full format.

### JSON Example

```json
{
  "version": "1.0.0",
  "hookAddress": "0x...",
  "callbacks": ["beforeSwap", "afterSwap"],
  "hookStateVariables": [
    { "name": "feeMultiplier", "type": "uint24", "description": "..." }
  ],
  "invariants": [
    {
      "id": "INV-1",
      "name": "Fee Bounds",
      "expression": "baseFee <= lpFee <= MAX_FEE",
      "severity": "critical"
    }
  ],
  "testVectors": [...]
}
```

## Development

### Building

```bash
npm run build
```

### Watching for Changes

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

## Reference Implementation

Based on patterns from [Bonded-hooks/operator](https://github.com/Jammabeans/Bonded-hooks/tree/master/operator), adapted for hook specification verification.

## Related Documentation

- [AVS Verification System Architecture](../docs/hook-pkg/architecture/avs-verification-system.md)
- [State-Space Model](../docs/hook-pkg/mathematical-models/state-space-model.md)
- [Quorums](../docs/avs-integration/Quorums.md)
- [Registry Coordinator](../docs/avs-integration/RegistryCoordinator.md)

## License

MIT
