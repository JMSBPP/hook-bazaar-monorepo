# hooks-operator-avs: Roadmap

## Contracts

| Status | Feature | Test Reference |
|--------|---------|----------------|
| TODO | createAttestationTask event emission | [HookAttestationTaskManager.t.sol:27](../../contracts/test/hooks-operator-avs/HookAttestationTaskManager.t.sol) |
| TODO | createTask revert for zero hook address | [HookAttestationTaskManager.t.sol:42](../../contracts/test/hooks-operator-avs/HookAttestationTaskManager.t.sol) |
| TODO | createTask revert for empty specURI | [HookAttestationTaskManager.t.sol:53](../../contracts/test/hooks-operator-avs/HookAttestationTaskManager.t.sol) |
| TODO | createTask revert for empty poolIds | [HookAttestationTaskManager.t.sol:64](../../contracts/test/hooks-operator-avs/HookAttestationTaskManager.t.sol) |
| TODO | createTask store correct task data | [HookAttestationTaskManager.t.sol:75](../../contracts/test/hooks-operator-avs/HookAttestationTaskManager.t.sol) |
| TODO | respondToAttestationTask with valid signature | Requires BLS infrastructure |
| TODO | respondToAttestationTask window enforcement | Response after window should revert |
| TODO | challengeFalsePositive verification | Counter-sample validation logic |
| TODO | challengeFalseNegative verification | Compliance samples validation logic |
| TODO | AttestationRegistry recordAttestation | [AttestationRegistry.t.sol](../../contracts/test/hooks-operator-avs/AttestationRegistry.t.sol) |
| TODO | AttestationRegistry revokeAttestation | Challenge-triggered revocation |
| TODO | AttestationRegistry renewAttestation | Re-verification flow |
| TODO | HaaSVendorManagement commitToHookSpec | [HaaSVendorManagement.t.sol](../../contracts/test/hooks-operator-avs/HaaSVendorManagement.t.sol) |
| TODO | HaaSVendorManagement license NFT minting | ERC721 integration |
| TODO | ClearingHouse acceptBondedEngagement | [ClearingHouseEscrow.t.sol](../../contracts/test/hooks-operator-avs/ClearingHouseEscrow.t.sol) |
| TODO | ClearingHouse terminateBondedEngagement | Deregistration flow |
| TODO | EscrowCoordinator postBond | Bond deposit with strategy |
| TODO | EscrowCoordinator releaseBond | Post-lock release |
| TODO | EscrowCoordinator slashBond | Penalty execution |
| TODO | HookStateSampler getHookState | [HookStateSampler.t.sol](../../contracts/test/hooks-operator-avs/HookStateSampler.t.sol) |

## Operator Runtime

| Status | Feature | Test Reference |
|--------|---------|----------------|
| Implemented | Event listener setup | [HookAttestationAVS.ts:205](../../operator/src/HookAttestationAVS.ts) |
| Implemented | Task processing pipeline | [processor.ts:71](../../operator/src/processor.ts) |
| Implemented | Specification parsing | [specParser.ts](../../operator/src/specParser.ts) |
| Implemented | Compliance checking | [complianceChecker.ts](../../operator/src/complianceChecker.ts) |
| Implemented | State sampling | [stateSampler.ts](../../operator/src/stateSampler.ts) |
| TODO | BLS signature aggregation | Response signing infrastructure |
| TODO | On-chain response submission | Awaiting BLS setup |
| TODO | Multi-operator coordination | Quorum formation |

## EigenLayer Integration

| Status | Feature | Notes |
|--------|---------|-------|
| Scaffolded | AVSDirectory registration | Interface defined, awaiting deployment |
| Scaffolded | StakeRegistry integration | Operator stake tracking |
| TODO | BLSSignatureChecker | Full signature verification |
| TODO | AllocationManager slashing | Economic penalty execution |
| TODO | RewardsCoordinator | Operator reward distribution |
