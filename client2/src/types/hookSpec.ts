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
