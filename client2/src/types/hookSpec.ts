// Hook Specification Types
// Based on the HookSpec schema from hook-specification-platform-decomposition.md

export interface HookSpecAttachment {
  type: 'pdf' | 'image' | 'document';
  name: string;
  url: string;
}

export interface HookSpecMetadata {
  name: string;
  version: string;
  author: string;
  description?: string;
  license?: 'MIT' | 'GPL-3.0' | 'BUSL-1.1' | 'PROPRIETARY';
  system_state_version?: string;
  attachments?: HookSpecAttachment[];
}

export interface StateVariable {
  name: string;
  symbol: string;
  type: SolidityType;
  description?: string;
  initial_value?: string;
}

export type SolidityType =
  | 'uint8' | 'uint16' | 'uint24' | 'uint32' | 'uint64' | 'uint128' | 'uint256'
  | 'int8' | 'int16' | 'int24' | 'int32' | 'int64' | 'int128' | 'int256'
  | 'address' | 'bool' | 'bytes32';

export type HookCallback =
  | 'beforeInitialize' | 'afterInitialize'
  | 'beforeAddLiquidity' | 'afterAddLiquidity'
  | 'beforeRemoveLiquidity' | 'afterRemoveLiquidity'
  | 'beforeSwap' | 'afterSwap'
  | 'beforeDonate' | 'afterDonate';

export interface StateTransition {
  preconditions?: string[];
  equation: string;
  postconditions?: string[];
  delta_returns?: {
    amount0?: string;
    amount1?: string;
  };
}

export interface SystemFunction {
  callback: HookCallback;
  reads: string[];
  writes: string[];
  transition: StateTransition;
}

export interface Invariant {
  name: string;
  expression: string;
  description?: string;
}

export interface HookSpec {
  metadata: HookSpecMetadata;
  hook_state: StateVariable[];
  system_functions: SystemFunction[];
  invariants?: Invariant[];
}

// State Space Model Types
export interface SystemStateVariable {
  name: string;
  symbol: string;
  type: SolidityType;
  getter: string;
  description: string;
}

export interface StateSpaceModel {
  version: string;
  ipfsCid: string;
  uniswapVersion: string;
  updatedAt: string;
  indices: {
    lp: SystemStateVariable[];
    trader: SystemStateVariable[];
    shared: SystemStateVariable[];
  };
}

// Validation Types
export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidateHookSpecResponse {
  valid: boolean;
  results: ValidationResult[];
  errors: string[];
  warnings: string[];
}

// Submission Types
export interface SubmitHookSpecRequest {
  spec: HookSpec;
  signature: string;
  royaltyBps?: number;
}

export interface SubmissionResult {
  success: boolean;
  ipfsCid: string;
  tokenId: number;
  transactionHash: string;
  ownerAddress: string;
  openSeaUrl?: string;
  ipfsGatewayUrl: string;
}

// Hook License Types
export interface HookLicenseSummary {
  tokenId: number;
  name: string;
  version: string;
  ipfsCid: string;
  deprecated: boolean;
  registeredAt: string;
}

export interface HookLicenseDetail extends HookLicenseSummary {
  owner: string;
  description?: string;
  developer: string;
  spec: HookSpec;
  attestations?: AttestationInfo[];
  deployments?: DeploymentInfo[];
}

export interface AttestationInfo {
  attestationId: string;
  attester: string;
  timestamp: string;
  valid: boolean;
}

export interface DeploymentInfo {
  poolId: string;
  deployer: string;
  timestamp: string;
  chainId: number;
}

// ============================================
// Code Verification Types (Steps 5-6)
// Based on hook-code-verifier-spec.md
// ============================================

// Code submission request
export interface CodeSubmissionRequest {
  licenseTokenId: number;
  repoUrl: string;
  branch?: string;
  contractPath?: string;
  compilerVersion: string;
  optimizerRuns?: number;
  signature: string;
  verifyOnly?: boolean;
}

// Repository analysis result
export interface RepoAnalysisResult {
  repoUrl: string;
  branch: string;
  commitHash: string;
  mainContract: string;
  contractsFound: number;
  dependencies: string[];
}

// Compilation result
export interface CompilationResult {
  success: boolean;
  bytecodeHash?: string;
  deployedBytecodeHash?: string;
  errors?: CompilationError[];
  warnings?: CompilationWarning[];
}

export interface CompilationError {
  type: string;
  message: string;
  formattedMessage?: string;
  sourceLocation?: {
    file: string;
    start: number;
    end: number;
  };
}

export interface CompilationWarning {
  type: string;
  message: string;
  formattedMessage?: string;
}

// AVS Verification Types
export type AVSFindingSeverity = 'critical' | 'warning' | 'info';

export interface AVSFinding {
  severity: AVSFindingSeverity;
  ruleId: string;
  ruleName: string;
  description: string;
  codeLocation?: {
    startLine: number;
    endLine: number;
    functionName?: string;
  };
  specReference?: string;
}

export interface AVSVerificationResult {
  compliant: boolean;
  complianceScore: number;  // 0-100 percentage
  attestationId: string;
  attestationTxHash: string;
  findings: AVSFinding[];
  verificationTimestamp: number;
}

// CFHE Deployment Types
export interface CFHEDeploymentResult {
  encryptedBytecodeHash: string;
  deploymentTxHash: string;
  encryptedContractAddress: string;
  blockNumber: number;
  explorerUrl: string;
}

// Full Code Verification Result
export interface CodeVerificationResult {
  success: boolean;
  repoAnalysis: RepoAnalysisResult;
  compilation: CompilationResult;
  avsResult: AVSVerificationResult;
  cfheResult?: CFHEDeploymentResult;
  summary: {
    hookName: string;
    hookVersion: string;
    licenseTokenId: number;
    specIpfsCid: string;
    repoUrl: string;
    commitHash: string;
    submittedAt: number;
    completedAt: number;
  };
}

// Code Verification Error
export type CodeVerificationErrorCode =
  | 'INVALID_SIGNATURE'
  | 'SIGNATURE_EXPIRED'
  | 'INVALID_LICENSE'
  | 'LICENSE_NOT_OWNED'
  | 'LICENSE_DEPRECATED'
  | 'INVALID_REPO_URL'
  | 'REPO_NOT_FOUND'
  | 'REPO_ACCESS_DENIED'
  | 'BRANCH_NOT_FOUND'
  | 'NO_HOOK_CONTRACTS_FOUND'
  | 'MULTIPLE_HOOKS_FOUND'
  | 'CONTRACT_PATH_NOT_FOUND'
  | 'COMPILATION_FAILED'
  | 'UNSUPPORTED_COMPILER'
  | 'AVS_VERIFICATION_FAILED'
  | 'AVS_TIMEOUT'
  | 'INSUFFICIENT_STAKE'
  | 'CFHE_ENCRYPTION_FAILED'
  | 'CFHE_DEPLOYMENT_FAILED'
  | 'NETWORK_ERROR';

export interface CodeVerificationError {
  success: false;
  error: {
    code: CodeVerificationErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  partialResults?: {
    compilation?: CompilationResult;
    avsResult?: Partial<AVSVerificationResult>;
  };
}

// Supported compiler versions
export const SUPPORTED_COMPILER_VERSIONS = [
  '0.8.26',
  '0.8.25',
  '0.8.24',
  '0.8.23',
  '0.8.22',
  '0.8.21',
  '0.8.20',
  '0.8.19',
] as const;

export type SupportedCompilerVersion = typeof SUPPORTED_COMPILER_VERSIONS[number];

// ============================================
// Hook Market Types
// Based on hook-market-spec.md
// ============================================

// Hook Categories
export type HookCategory =
  | 'FEE_MANAGEMENT'      // Dynamic fees, fee sharing
  | 'ORACLE'              // Price oracles, TWAP
  | 'LIMIT_ORDER'         // Limit orders, stop-loss
  | 'LIQUIDITY'           // LP incentives, auto-rebalance
  | 'MEV_PROTECTION'      // MEV mitigation
  | 'CUSTOM';             // Other

export const HOOK_CATEGORIES: { value: HookCategory; label: string; description: string }[] = [
  { value: 'FEE_MANAGEMENT', label: 'Fee Management', description: 'Dynamic fees, fee sharing hooks' },
  { value: 'ORACLE', label: 'Oracle', description: 'Price oracles, TWAP implementations' },
  { value: 'LIMIT_ORDER', label: 'Limit Order', description: 'Limit orders, stop-loss functionality' },
  { value: 'LIQUIDITY', label: 'Liquidity', description: 'LP incentives, auto-rebalancing' },
  { value: 'MEV_PROTECTION', label: 'MEV Protection', description: 'MEV mitigation strategies' },
  { value: 'CUSTOM', label: 'Custom', description: 'Other specialized hooks' },
];

// Hook Pricing
export type PricingModel = 'FIXED' | 'REVENUE_SHARE' | 'HYBRID';

export interface HookPricing {
  model: PricingModel;
  fixedPrice?: string;           // One-time fee (wei as string)
  revenueShareBps?: number;      // Basis points (0-10000)
  currency: string;              // Payment token address (0x0 = ETH)
}

// Hook Capability
export interface HookCapability {
  callback: HookCallback;
  description: string;
}

// Hook Listing (summary for browsing)
export interface HookListingSummary {
  tokenId: number;
  name: string;
  version: string;
  description?: string;
  category: HookCategory;
  developer: string;
  pricing: HookPricing;
  complianceScore?: number;
  verified: boolean;
  cfheDeployed: boolean;
  subscriptionCount: number;
  registeredAt: string;
  tags?: string[];
}

// Full Hook Listing (detailed view)
export interface HookListing {
  tokenId: number;
  developer: string;
  registeredAt: string;
  deprecated: boolean;
  pricing: HookPricing;
  metadata: {
    name: string;
    version: string;
    description: string;
    category: HookCategory;
    tags: string[];
    capabilities: HookCapability[];
  };
  verification: {
    codeVerified: boolean;
    avsAttestationId?: string;
    complianceScore?: number;
    cfheDeployed: boolean;
    cfheContractAddress?: string;
  };
  spec?: HookSpec;
}

// Pool Deployment Info
export interface PoolDeployment {
  poolId: string;
  chainId: number;
  deployedAt: string;
  active: boolean;
}

// Hook Subscription
export interface HookSubscription {
  subscriptionId: string;
  hookTokenId: number;
  poolId: string;
  subscriber: string;
  subscribedAt: string;
  active: boolean;
  totalPaid: string;
  revenueShareAccrued: string;
}

// Bytecode Verification
export interface BytecodeVerificationRequest {
  hookTokenId: number;
  poolId?: string;
}

export type EncryptionStatus = 'ENCRYPTED' | 'PLAINTEXT' | 'NOT_DEPLOYED';

export interface BytecodeVerificationResult {
  verified: boolean;
  obfuscatedBytecodeHash: string;
  deployedBytecodeHash: string;
  matchPercentage: number;      // 0-100
  cfheContractAddress?: string;
  encryptionStatus: EncryptionStatus;
}

// Functionality Test Types
export type TestType = 'SWAP' | 'LIQUIDITY' | 'INITIALIZE' | 'CUSTOM';

export interface SwapTestParams {
  zeroForOne: boolean;
  amountSpecified: string;
  sqrtPriceLimitX96: string;
}

export interface LiquidityTestParams {
  tickLower: number;
  tickUpper: number;
  liquidityDelta: string;
}

export interface FunctionalityTestRequest {
  hookTokenId: number;
  testType: TestType;
  testData: {
    swapParams?: SwapTestParams;
    liquidityParams?: LiquidityTestParams;
    customParams?: Record<string, unknown>;
  };
  expectedBehavior?: string;
}

export type TestDeviationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface TestDeviation {
  field: string;
  expected: string;
  actual: string;
  severity: TestDeviationSeverity;
}

export interface FunctionalityTestResult {
  success: boolean;
  testId: string;
  avsVerificationId: string;
  accuracyScore: number;        // 0-100 percentage
  behaviorMatch: boolean;
  report: {
    inputSummary: string;
    expectedOutput: string;
    actualOutput: string;
    deviations: TestDeviation[];
    gasUsed: string;
    executionTimeMs: number;
  };
  attestation: {
    attestationId: string;
    attesters: string[];
    consensus: number;          // Percentage of agreeing operators
    timestamp: number;
  };
}

// Hook Market Error Codes
export type HookMarketErrorCode =
  | 'HOOK_NOT_FOUND'
  | 'HOOK_DEPRECATED'
  | 'HOOK_NOT_VERIFIED'
  | 'INVALID_POOL_ID'
  | 'POOL_NOT_FOUND'
  | 'ALREADY_SUBSCRIBED'
  | 'INSUFFICIENT_PAYMENT'
  | 'INVALID_SIGNATURE'
  | 'SIGNATURE_EXPIRED'
  | 'BYTECODE_MISMATCH'
  | 'CFHE_NOT_DEPLOYED'
  | 'AVS_UNAVAILABLE'
  | 'TEST_TIMEOUT'
  | 'INVALID_TEST_PARAMS';

export interface HookMarketError {
  code: HookMarketErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
