import type { Address } from 'viem';

// URI Types enum matching the contract's URI_TYPE
export enum URIType {
  ZORA = 0,
  WEBSITE = 1,
  X = 2,
  FARCASTER = 3,
}

// URI Type labels for UI display
export const URI_TYPE_LABELS: Record<URIType, string> = {
  [URIType.ZORA]: 'Zora NFT',
  [URIType.WEBSITE]: 'Website',
  [URIType.X]: 'X (Twitter)',
  [URIType.FARCASTER]: 'Farcaster',
};

// Pool Key structure matching Uniswap v4 PoolKey
export interface PoolKey {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}

// Create Pool parameters for the UI form
export interface CreatePoolParams {
  protocolId: bigint;
  poolKey: PoolKey;
  initialSqrtPrice: bigint;
}

// Create Pool form values (before conversion)
export interface CreatePoolFormValues {
  token0: string;
  token1: string;
  fee: string;
  tickSpacing: string;
  hookAddress: string;
  initialPrice: string;
}

// Standard fee tiers for Uniswap v4
export const FEE_TIERS = [
  { value: '100', label: '0.01%', description: 'Best for stable pairs' },
  { value: '500', label: '0.05%', description: 'Best for stable pairs' },
  { value: '3000', label: '0.30%', description: 'Best for most pairs' },
  { value: '10000', label: '1.00%', description: 'Best for exotic pairs' },
];

// Set Revenue parameters
export interface SetRevenueParams {
  protocolId: bigint;
  poolId?: string; // For pool-specific revenue (bytes32)
  amount: bigint;
}

// Set Revenue form values
export interface SetRevenueFormValues {
  amount: string;
  poolId?: string;
}

// Protocol Admin state from contracts
export interface ProtocolAdminState {
  protocolId: bigint | null;
  protocolName: string;
  isCreator: boolean;
  isPoolCreator: boolean;
  pools: string[];
  uris: Partial<Record<URIType, string>>;
}

// Pool display info
export interface PoolInfo {
  id: string; // bytes32 poolId
  currency0?: Address;
  currency1?: Address;
  fee?: number;
  tickSpacing?: number;
  hooks?: Address;
}

// Transaction status for UI feedback
export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

// Create Pool result
export interface CreatePoolResult {
  poolId: string;
  initialTick: number;
}

// Protocol Admin Manager function selectors (for reference)
export const MANAGER_FUNCTIONS = {
  isCreator: 'isCreator(address)',
  setPool: 'setPool(bytes32)',
  getPools: 'getPools()',
  delegatePoolCreatorRole: 'delegatePoolCreatorRole(address)',
  isPoolCreator: 'isPoolCreator(address)',
  protocolId: 'protocolId()',
  protocolName: 'protocolName()',
  setURI: 'setURI(uint8,string)',
  getURI: 'getURI(uint8)',
} as const;

// Protocol Admin Client function selectors (for reference)
export const CLIENT_FUNCTIONS = {
  createPool: 'create_pool(uint256,bytes,uint160)',
  setProtocolRevenue: 'setProtocolRevenue(uint256)',
  setPoolRevenue: 'setPoolRevenue(uint256,bytes32)',
  getProtocols: 'getProtocols()',
  getProtocolRevenue: 'getProtocolRevenue(uint256)',
  getPoolRevenue: 'getPoolRevenue(uint256,bytes32)',
} as const;

// Error messages mapping
export const PROTOCOL_ADMIN_ERRORS: Record<string, string> = {
  ProtocolAdminManagerCallerIsNotCreator: 'You are not the protocol creator',
  ProtocolAdminClientUnauthorizedCaller: 'You are not authorized to create pools',
  ProtocolAdminManagerNotClone: 'Invalid protocol instance',
  ProtocolAdminManagerInvalidContextCall: 'Invalid call context',
  ProtocolAdminManagerUninitialized: 'Protocol manager not initialized',
  ProtocolAdminClientUninitialized: 'Protocol client not initialized',
};

// Helper to get user-friendly error message
export function getProtocolAdminErrorMessage(error: Error): string {
  const errorMessage = error.message || '';
  for (const [key, message] of Object.entries(PROTOCOL_ADMIN_ERRORS)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }
  return errorMessage;
}
