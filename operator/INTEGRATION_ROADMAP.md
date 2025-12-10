# HookAttestationAVS Integration Roadmap

This document outlines the missing components required for full HookAttestationAVS functionality and what capabilities each integration enables.

---

## Current Status

The operator is **functional for local testing and dry-run mode**. It can:
- Parse hook specifications from JSON/Markdown
- Sample state using mock contracts
- Verify compliance against specifications
- Generate attestation responses

**What's missing:** On-chain contracts and EigenLayer infrastructure needed for live verification.

---

## Missing Components & Integration Benefits

### 1. IHookAttestationTaskManager

**What it is:** On-chain contract that creates attestation tasks and aggregates operator responses.

**Status:** ❌ Not implemented

**Integration Enables:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TASK MANAGER INTEGRATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BEFORE: Operator runs in dry-run mode, logs responses                   │
│                                                                          │
│  AFTER:                                                                  │
│  ✓ Hook developers can REQUEST attestations on-chain                     │
│  ✓ Multiple operators receive tasks via events                           │
│  ✓ Operators submit signed responses on-chain                            │
│  ✓ Quorum-based consensus determines final attestation                   │
│  ✓ Invalid responses can be challenged and slashed                       │
│                                                                          │
│  KEY FUNCTIONS TO IMPLEMENT:                                             │
│  - createAttestationTask(hook, specURI, poolIds, callbacks, sampleCount) │
│  - respondToAttestationTask(task, response, signature)                   │
│  - challengeAttestation(taskIndex, counterSamples)                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Contract Interface Required:**
```solidity
interface IHookAttestationTaskManager {
    struct AttestationTask {
        address hook;
        string specificationURI;
        bytes32[] poolIds;
        bytes4[] callbacks;
        uint32 sampleCount;
        uint32 taskCreatedBlock;
        bytes quorumNumbers;
        uint32 quorumThresholdPercentage;
    }

    struct AttestationResponse {
        uint32 referenceTaskIndex;
        bool specCompliant;
        bytes32 stateSamplesHash;
        bytes32 testResultsHash;
        uint32 invariantsVerified;
        uint32 invariantsFailed;
    }

    event AttestationTaskCreated(uint32 indexed taskIndex, AttestationTask task);
    event AttestationTaskResponded(uint32 indexed taskIndex, AttestationResponse response);
}
```

---

### 2. AttestationRegistry

**What it is:** On-chain registry storing attestation records for verified hooks.

**Status:** ❌ Not implemented

**Integration Enables:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                  ATTESTATION REGISTRY INTEGRATION                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BEFORE: Attestation results exist only in operator logs                 │
│                                                                          │
│  AFTER:                                                                  │
│  ✓ Permanent on-chain record of hook verifications                       │
│  ✓ Protocol designers can query: isHookAttested(hookAddress)             │
│  ✓ Attestations have expiry dates for re-verification                    │
│  ✓ Hook Market can filter by attestation status                          │
│  ✓ Smart contracts can gate functionality on attestation                 │
│                                                                          │
│  USAGE PATTERN:                                                          │
│  ```solidity                                                             │
│  // In a protocol that uses hooks                                        │
│  function deployPool(address hook) external {                            │
│      require(attestationRegistry.isHookAttested(hook), "Not attested"); │
│      // proceed with deployment...                                       │
│  }                                                                       │
│  ```                                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3. HookStateSampler / IHookStateView

**What it is:** On-chain helper contract for reading pool and hook state.

**Status:** ❌ Needs implementation (currently using mock)

**Integration Enables:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STATE SAMPLER INTEGRATION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BEFORE: Mock state data, no real pool interaction                       │
│                                                                          │
│  AFTER:                                                                  │
│  ✓ Real-time pool state sampling from Uniswap V4 PoolManager             │
│  ✓ Accurate hook state extraction for any deployed hook                  │
│  ✓ Pre/post callback state capture for behavioral verification           │
│  ✓ Gas-efficient batch sampling for multiple pools                       │
│                                                                          │
│  REQUIRED INTERFACE:                                                     │
│  - getTraderState(poolId) → (sqrtPrice, tick, lpFee, protocolFee)       │
│  - getSharedFeeState(poolId) → (feeGrowth0, feeGrowth1)                  │
│  - getHookState(poolId) → bytes (hook-specific encoded state)           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 4. BLS Signature Infrastructure

**What it is:** EigenLayer BLS signature components for aggregated operator signatures.

**Status:** ❌ Not configured

**Integration Enables:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     BLS SIGNATURE INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BEFORE: Single operator response, no cryptographic proof                │
│                                                                          │
│  AFTER:                                                                  │
│  ✓ Multiple operators sign the same attestation                          │
│  ✓ Signatures aggregated into single efficient proof                     │
│  ✓ On-chain verification of quorum threshold                             │
│  ✓ Non-signers can be identified for slashing                            │
│                                                                          │
│  COMPONENTS REQUIRED:                                                    │
│  - BLSApkRegistry: Stores operator BLS public keys                       │
│  - BLSSignatureChecker: Verifies aggregated signatures                   │
│  - Operator BLS key generation and registration                          │
│                                                                          │
│  FLOW:                                                                   │
│  1. Operator generates BLS keypair                                       │
│  2. Registers public key with BLSApkRegistry                             │
│  3. Signs attestation response with private key                          │
│  4. Aggregator combines signatures from all operators                    │
│  5. On-chain verification checks quorum threshold met                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 5. Registry Coordinator

**What it is:** EigenLayer component managing operator registration and quorum membership.

**Status:** ❌ Not configured

**Integration Enables:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                   REGISTRY COORDINATOR INTEGRATION                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BEFORE: Single operator, no stake tracking                              │
│                                                                          │
│  AFTER:                                                                  │
│  ✓ Multiple operators can register for the AVS                           │
│  ✓ Operators join specific quorums based on stake type                   │
│  ✓ Stake-weighted voting for attestation consensus                       │
│  ✓ Operator deregistration and ejection mechanisms                       │
│                                                                          │
│  QUORUM CONFIGURATION (from avs-verification-system.md):                 │
│  - Quorum 0: ETH restakers (native ETH + LSTs)                           │
│  - Quorum 1: EIGEN token stakers                                         │
│  - Quorum 2: AVS-specific token stakers                                  │
│                                                                          │
│  OPERATOR REGISTRATION FLOW:                                             │
│  1. Deposit stake with EigenLayer StrategyManager                        │
│  2. Register with DelegationManager                                      │
│  3. Register with AVS via RegistryCoordinator                            │
│  4. Opt-in to specific quorums                                           │
│  5. Start running operator software                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 6. Slashing Infrastructure

**What it is:** Economic security mechanism that slashes operator stake for incorrect attestations.

**Status:** ❌ Not implemented

**Integration Enables:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SLASHING INTEGRATION                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BEFORE: No economic consequences for false attestations                 │
│                                                                          │
│  AFTER:                                                                  │
│  ✓ Operators have "skin in the game" - real financial risk               │
│  ✓ Anyone can challenge attestations with counter-evidence               │
│  ✓ Slashing proportional to stake weight                                 │
│  ✓ Creates trustworthy verification service                              │
│                                                                          │
│  SLASHABLE OFFENSES:                                                     │
│  - False Positive: Attesting non-compliant hook as compliant             │
│  - False Negative: Rejecting a compliant hook                            │
│  - Non-response: Failing to respond to assigned tasks                    │
│                                                                          │
│  CHALLENGE MECHANISM:                                                    │
│  1. Challenger submits counter-samples proving hook non-compliance       │
│  2. On-chain verification of counter-samples                             │
│  3. If challenge valid: Attestation invalidated, operator slashed        │
│  4. If challenge invalid: Challenger loses bond                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Priority Order

| Priority | Component | Dependency | Effort | Impact |
|----------|-----------|------------|--------|--------|
| 1 | IHookStateView | None | Medium | Enables real state sampling |
| 2 | IHookAttestationTaskManager | IHookStateView | High | Core task flow |
| 3 | AttestationRegistry | TaskManager | Medium | Permanent records |
| 4 | RegistryCoordinator | EigenLayer | High | Multi-operator |
| 5 | BLS Infrastructure | RegistryCoordinator | High | Aggregated signatures |
| 6 | Slashing | All above | High | Economic security |

---

## Testing Without Full Integration

The operator can be tested at various integration levels:

### Level 1: Pure Dry-Run (Current)
```bash
DRY_RUN=1 npm start
# Uses mock state sampler
# Logs responses without submission
```

### Level 2: With Local Anvil
```bash
# Start local node
anvil

# Run with real RPC but mock contracts
RPC_URL=http://127.0.0.1:8545 DRY_RUN=1 npm start
```

### Level 3: With Mock TaskManager
```bash
# Deploy mock TaskManager to local node
# Configure operator to point to it
TASK_MANAGER_ADDRESS=0x... DRY_RUN=0 npm start
```

### Level 4: Full Integration (Future)
```bash
# All contracts deployed
# EigenLayer integration complete
# Operator registered with stake
npm start
```

---

## Files That Need Updates for Integration

| File | Changes Needed |
|------|----------------|
| `src/stateSampler.ts` | Replace mock with real IHookStateView calls |
| `src/HookAttestationAVS.ts` | Add BLS signing, real tx submission |
| `src/config.ts` | Add BLS key path, quorum config |
| `src/types.ts` | Update ABIs when contracts finalized |
| `package.json` | Add eigenlayer-cli, bls dependencies |

---

## Related Documentation

- [AVS Verification System Architecture](../docs/hook-pkg/architecture/avs-verification-system.md)
- [EigenLayer Docs: AVS Development](https://docs.eigenlayer.xyz/eigenlayer/avs-guides/avs-developer-guide)
- [Bonded-hooks Reference](https://github.com/Jammabeans/Bonded-hooks/tree/master/operator)
