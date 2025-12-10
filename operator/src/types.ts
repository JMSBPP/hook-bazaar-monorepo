/**
 * HookAttestationAVS Type Definitions
 *
 * Based on: docs/hook-pkg/architecture/avs-verification-system.md
 *
 * These types mirror the on-chain structures defined in IHookAttestationTaskManager
 * and related contracts. Some contracts are not yet deployed - marked with TODO.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ATTESTATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * An attestation task to verify hook specification compliance
 * Mirrors: IHookAttestationTaskManager.AttestationTask
 */
export interface AttestationTask {
  /** The hook contract address to verify */
  hook: string;
  /** IPFS CID of the formal specification */
  specificationURI: string;
  /** Pool IDs to sample state from */
  poolIds: string[];
  /** Callbacks to test (as selector bytes4) */
  callbacks: string[];
  /** Number of state samples required */
  sampleCount: number;
  /** Block when task was created */
  taskCreatedBlock: number;
  /** Quorum configuration (bytes) */
  quorumNumbers: string;
  /** Threshold percentage for consensus */
  quorumThresholdPercentage: number;
}

/**
 * Response from operators after verification
 * Mirrors: IHookAttestationTaskManager.AttestationResponse
 */
export interface AttestationResponse {
  /** Reference to the task being responded to */
  referenceTaskIndex: number;
  /** Whether the hook passes all spec tests */
  specCompliant: boolean;
  /** Hash of all state samples collected */
  stateSamplesHash: string;
  /** Hash of test results */
  testResultsHash: string;
  /** Number of invariants verified */
  invariantsVerified: number;
  /** Number of invariants failed */
  invariantsFailed: number;
}

/**
 * Metadata about the response
 * Mirrors: IHookAttestationTaskManager.AttestationResponseMetadata
 */
export interface AttestationResponseMetadata {
  taskRespondedBlock: number;
  hashOfNonSigners: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE TYPES (from State-Space Model)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Trader state variables from the pool
 * Based on: docs/hook-pkg/mathematical-models/state-space-model.md
 */
export interface TraderState {
  /** Current sqrtPriceX96 */
  sqrtPrice: bigint;
  /** Current tick */
  tick: number;
  /** LP fee (in hundredths of a bip) */
  lpFee: number;
  /** Protocol fee */
  protocolFee: number;
}

/**
 * LP Position state
 */
export interface LPPositionState {
  /** Position liquidity */
  liquidity: bigint;
  /** Lower tick bound */
  tickLower: number;
  /** Upper tick bound */
  tickUpper: number;
  /** Fees owed token0 */
  feeGrowthInside0LastX128: bigint;
  /** Fees owed token1 */
  feeGrowthInside1LastX128: bigint;
}

/**
 * Shared fee state
 */
export interface SharedFeeState {
  feeGrowthGlobal0X128: bigint;
  feeGrowthGlobal1X128: bigint;
}

/**
 * Complete state sample at a point in time
 * Mirrors: HookStateSampler.StateSample
 */
export interface StateSample {
  /** Block number when sampled */
  blockNumber: number;
  /** Timestamp when sampled */
  timestamp: number;
  /** Pool identifier */
  poolId: string;
  /** Trader state */
  traderState: TraderState;
  /** Hook-specific state (encoded) */
  hookState: Record<string, unknown>;
  /** Shared fee state */
  sharedState: SharedFeeState;
}

/**
 * A complete state transition record
 * Mirrors: HookStateSampler.TransitionSample
 */
export interface TransitionSample {
  /** State before callback */
  preState: StateSample;
  /** Callback executed (selector) */
  callback: string;
  /** Callback input parameters (encoded) */
  input: string;
  /** State after callback */
  postState: StateSample;
  /** Gas consumed */
  gasUsed: bigint;
  /** Return data from callback */
  returnData: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIFICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook callback selectors
 */
export enum HookCallback {
  BEFORE_INITIALIZE = "beforeInitialize",
  AFTER_INITIALIZE = "afterInitialize",
  BEFORE_ADD_LIQUIDITY = "beforeAddLiquidity",
  AFTER_ADD_LIQUIDITY = "afterAddLiquidity",
  BEFORE_REMOVE_LIQUIDITY = "beforeRemoveLiquidity",
  AFTER_REMOVE_LIQUIDITY = "afterRemoveLiquidity",
  BEFORE_SWAP = "beforeSwap",
  AFTER_SWAP = "afterSwap",
  BEFORE_DONATE = "beforeDonate",
  AFTER_DONATE = "afterDonate",
}

/**
 * Callback selector to bytes4 mapping
 */
export const CALLBACK_SELECTORS: Record<HookCallback, string> = {
  [HookCallback.BEFORE_INITIALIZE]: "0x34bc5f74",
  [HookCallback.AFTER_INITIALIZE]: "0x21d0ee70",
  [HookCallback.BEFORE_ADD_LIQUIDITY]: "0x259982e5",
  [HookCallback.AFTER_ADD_LIQUIDITY]: "0xe5c17b97",
  [HookCallback.BEFORE_REMOVE_LIQUIDITY]: "0x5765a5cc",
  [HookCallback.AFTER_REMOVE_LIQUIDITY]: "0xd6c21c59",
  [HookCallback.BEFORE_SWAP]: "0xec9f4aa6",
  [HookCallback.AFTER_SWAP]: "0x9ca3a9e7",
  [HookCallback.BEFORE_DONATE]: "0x0d046ae5",
  [HookCallback.AFTER_DONATE]: "0xae63ec0e",
};

/**
 * State variable definition in specification
 */
export interface StateVariableSpec {
  name: string;
  type: string;
  description: string;
  initialValue?: string;
}

/**
 * Invariant definition
 */
export interface InvariantSpec {
  id: string;
  name: string;
  description: string;
  /** LaTeX or symbolic expression */
  expression: string;
  /** Severity: critical invariants cause immediate failure */
  severity: "critical" | "warning" | "info";
}

/**
 * State transition function specification
 */
export interface TransitionFunctionSpec {
  callback: HookCallback;
  /** Description of the transition */
  description: string;
  /** Input parameters */
  inputs: StateVariableSpec[];
  /** Output/return values */
  outputs: StateVariableSpec[];
  /** State changes (equations) */
  equations: string[];
  /** Constraints that must hold */
  constraints: string[];
}

/**
 * Test vector for verification
 */
export interface TestVector {
  id: string;
  description: string;
  preState: Record<string, unknown>;
  input: Record<string, unknown>;
  expectedPostState: Record<string, unknown>;
  tolerance?: number;
}

/**
 * Complete parsed hook specification
 */
export interface HookSpecification {
  /** Specification version */
  version: string;
  /** Hook identity */
  hookAddress: string;
  /** Specification hash (for integrity) */
  specificationHash: string;
  /** Callbacks implemented */
  callbacks: HookCallback[];
  /** Hook state variables */
  hookStateVariables: StateVariableSpec[];
  /** Pool state dependencies */
  poolStateDependencies: {
    reads: string[];
    writes: string[];
  };
  /** State transition functions */
  transitionFunctions: TransitionFunctionSpec[];
  /** Invariants */
  invariants: InvariantSpec[];
  /** Test vectors */
  testVectors: TestVector[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE CHECK TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Result of checking a single transition
 */
export interface TransitionComplianceResult {
  transitionId: string;
  callback: HookCallback;
  compliant: boolean;
  deviationMagnitude: number;
  failedConstraints: string[];
  details: string;
}

/**
 * Result of checking an invariant
 */
export interface InvariantCheckResult {
  invariantId: string;
  holds: boolean;
  preStateValue?: unknown;
  postStateValue?: unknown;
  details: string;
}

/**
 * Complete compliance check result
 */
export interface ComplianceResult {
  specCompliant: boolean;
  transitionResults: TransitionComplianceResult[];
  invariantResults: InvariantCheckResult[];
  totalTransitionsChecked: number;
  totalInvariantsChecked: number;
  invariantsVerified: number;
  invariantsFailed: number;
  overallDeviation: number;
  failureReasons: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Operator configuration
 */
export interface OperatorConfig {
  /** RPC URL for blockchain connection */
  rpcUrl: string;
  /** Operator private key */
  privateKey: string;
  /** Task manager contract address */
  taskManagerAddress: string;
  /** Attestation registry address */
  attestationRegistryAddress: string;
  /** IPFS gateway URL */
  ipfsGateway: string;
  /** Compliance tolerance (basis points) */
  complianceTolerance: number;
  /** Dry run mode (no on-chain writes) */
  dryRun: boolean;
  /** Polling interval for new tasks (ms) */
  pollingIntervalMs: number;
}

/**
 * Task processing result
 */
export interface TaskProcessingResult {
  taskIndex: number;
  success: boolean;
  response?: AttestationResponse;
  error?: string;
  processingTimeMs: number;
  samplesCollected: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT ABIS (Minimal for operator interaction)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Minimal ABI for HookAttestationTaskManager
 * TODO: Replace with full ABI when contract is deployed
 */
export const TASK_MANAGER_ABI = [
  "event AttestationTaskCreated(uint32 indexed taskIndex, tuple(address hook, string specificationURI, bytes32[] poolIds, bytes4[] callbacks, uint32 sampleCount, uint32 taskCreatedBlock, bytes quorumNumbers, uint32 quorumThresholdPercentage) task)",
  "event AttestationTaskResponded(uint32 indexed taskIndex, tuple(uint32 referenceTaskIndex, bool specCompliant, bytes32 stateSamplesHash, bytes32 testResultsHash, uint32 invariantsVerified, uint32 invariantsFailed) response, tuple(uint32 taskRespondedBlock, bytes32 hashOfNonSigners) metadata)",
  "function createAttestationTask(address hook, string calldata specificationURI, bytes32[] calldata poolIds, bytes4[] calldata callbacks, uint32 sampleCount) external returns (uint32 taskIndex)",
  "function respondToAttestationTask(tuple(address hook, string specificationURI, bytes32[] poolIds, bytes4[] callbacks, uint32 sampleCount, uint32 taskCreatedBlock, bytes quorumNumbers, uint32 quorumThresholdPercentage) calldata task, tuple(uint32 referenceTaskIndex, bool specCompliant, bytes32 stateSamplesHash, bytes32 testResultsHash, uint32 invariantsVerified, uint32 invariantsFailed) calldata response, tuple(bytes32[] nonSignerPubkeyHashes, uint96[] nonSignerStakeIndices, tuple(uint256 X, uint256 Y) sigma, tuple(uint256[2] X, uint256[2] Y)[] nonSignerPubkeys, uint32[] quorumApkIndices, tuple(uint256 X, uint256 Y)[] quorumApks, uint32[] totalStakeIndices, uint32[][] nonSignerStakeIndices) memory nonSignerStakesAndSignature) external",
  "function getLatestTaskIndex() external view returns (uint32)",
  "function getTask(uint32 taskIndex) external view returns (tuple(address hook, string specificationURI, bytes32[] poolIds, bytes4[] callbacks, uint32 sampleCount, uint32 taskCreatedBlock, bytes quorumNumbers, uint32 quorumThresholdPercentage))",
];

/**
 * Minimal ABI for IHookStateView
 * TODO: Replace with actual ABI when contract is available
 */
export const HOOK_STATE_VIEW_ABI = [
  "function getTraderState(bytes32 poolId) external view returns (tuple(uint160 sqrtPrice, int24 tick, uint24 lpFee, uint24 protocolFee))",
  "function getSharedFeeState(bytes32 poolId) external view returns (uint256 feeGrowthGlobal0X128, uint256 feeGrowthGlobal1X128)",
  "function getHookState(bytes32 poolId) external view returns (bytes)",
];

/**
 * Minimal ABI for AttestationRegistry
 * TODO: Replace with actual ABI when contract is deployed
 */
export const ATTESTATION_REGISTRY_ABI = [
  "function isHookAttested(address hook) external view returns (bool)",
  "function getAttestation(address hook) external view returns (tuple(bytes32 attestationId, address hook, string specificationURI, bool isValid, uint256 attestedAt, uint256 expiresAt, uint32 taskIndex, bytes32 responsesHash))",
  "event AttestationRecorded(address indexed hook, bytes32 indexed attestationId, string specificationURI, uint256 expiresAt)",
];
