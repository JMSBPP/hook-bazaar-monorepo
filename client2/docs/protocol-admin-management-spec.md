# Protocol Admin Management Page - Frontend Specification

## Overview

This specification details the Protocol Admin Management Page, a comprehensive interface for protocol administrators to manage their protocols through the `IProtocolAdminManager` and `IProtocolAdminClient` smart contract interfaces.

## Purpose

Protocol administrators need a dedicated interface to:
1. View and manage protocol details
2. Create new pools for their protocol
3. Set protocol-wide and pool-specific revenue configurations
4. Delegate pool creator roles
5. Manage protocol metadata (URIs)

## Contract Interfaces

### IProtocolAdminManager Functions (All exposed)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `isCreator(address)` | `_account: address` | `bool` | Check if address is protocol creator |
| `setPool(PoolId)` | `_poolId: PoolId` | `void` | Set pool (called through admin panel) |
| `getPools()` | - | `PoolId[]` | Get all pools for protocol |
| `delegatePoolCreatorRole(address)` | `_account: address` | `void` | Delegate pool creation rights |
| `isPoolCreator(address)` | `_account: address` | `bool` | Check if address can create pools |
| `protocolId()` | - | `uint256` | Get protocol token ID |
| `protocolName()` | - | `string` | Get protocol name |
| `setURI(URI_TYPE, string)` | `_uriType: enum, _uri: string` | `void` | Set protocol URI metadata |
| `getURI(URI_TYPE)` | `_uriType: enum` | `string` | Get protocol URI by type |

### URI_TYPE Enum
- `ZORA` (0) - Zora NFT metadata URI
- `WEBSITE` (1) - Protocol website
- `X` (2) - X/Twitter handle
- `FARCASTER` (3) - Farcaster handle

### IProtocolAdminClient Functions (Selective exposure)

| Function | Parameters | Returns | Description | Exposed |
|----------|------------|---------|-------------|---------|
| `create_pool` | `protocolId: uint256, _encoded_pool_key: bytes, initialSqrtPrice: uint160` | `(PoolId, int24)` | Create new pool | Yes |
| `setProtocolRevenue` | `protocolId: uint256` | `uint256` | Set protocol revenue | Yes |
| `setPoolRevenue` | `protocolId: uint256, poolId: PoolId` | `uint256` | Set pool revenue | Yes |
| `getProtocols` | - | `uint256[]` | Get user's protocols | No |
| `getProtocolRevenue` | `protocolId: uint256` | `uint256` | Get protocol revenue | No (view only) |
| `getPoolRevenue` | `protocolId: uint256, poolId: PoolId` | `uint256` | Get pool revenue | No (view only) |

## Page Architecture

### Route
`/ProtocolDashboard/protocol/:protocolId/admin`

### URL Parameters
- `protocolId`: The protocol token ID from the contract

### Navigation
- Access via "View Details" button on Protocol Designer Dashboard
- Back navigation to Protocol Designer Dashboard

## Component Structure

```
ProtocolAdminPage/
├── ProtocolAdminPage.tsx      # Main page orchestrator
├── ProtocolHeader.tsx         # Protocol info header
├── ManagerSection.tsx         # IProtocolAdminManager functions
│   ├── PoolsTable.tsx         # Display pools with getPools()
│   ├── DelegateRoleForm.tsx   # delegatePoolCreatorRole()
│   └── URIManager.tsx         # setURI() and getURI()
├── ClientSection.tsx          # IProtocolAdminClient functions
│   ├── CreatePoolForm.tsx     # create_pool()
│   ├── SetProtocolRevenueForm.tsx  # setProtocolRevenue()
│   └── SetPoolRevenueForm.tsx      # setPoolRevenue()
└── index.ts                   # Exports
```

## UI Sections

### 1. Protocol Header
- Protocol Name (from `protocolName()`)
- Protocol ID (from `protocolId()`)
- Creator verification badge (from `isCreator()`)
- Chain information

### 2. Protocol Admin Manager Section

#### 2.1 Pools Overview
- Table displaying all pools from `getPools()`
- Columns: Pool ID, Status, Actions

#### 2.2 Role Management
- Form to delegate pool creator role via `delegatePoolCreatorRole()`
- Check role status via `isPoolCreator()`
- Input: Ethereum address

#### 2.3 URI Management
- Forms to set/update protocol URIs via `setURI()`
- Display current URIs via `getURI()`
- URI types: Website, X/Twitter, Farcaster, Zora

### 3. Protocol Admin Client Section

#### 3.1 Create Pool Form
**Function:** `create_pool(uint256 protocolId, bytes _encoded_pool_key, uint160 initialSqrtPrice)`

**Form Fields:**
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| Token 0 Address | `address` | First token in pair | Valid checksum address |
| Token 1 Address | `address` | Second token in pair | Valid checksum address |
| Fee | `uint24` | Pool fee in bps | 100, 500, 3000, or 10000 |
| Tick Spacing | `int24` | Price tick spacing | Positive integer |
| Hook Address | `address` | Hook contract address | Valid address or zero |
| Initial Price | `uint160` | sqrtPriceX96 format | Positive number |

**PoolKey Structure (for encoding):**
```typescript
interface PoolKey {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}
```

#### 3.2 Set Protocol Revenue Form
**Function:** `setProtocolRevenue(uint256 protocolId)`

**Form Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Revenue Amount | `uint256` | Revenue in wei |

#### 3.3 Set Pool Revenue Form
**Function:** `setPoolRevenue(uint256 protocolId, PoolId poolId)`

**Form Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Pool ID | `PoolId` | Select from available pools |
| Revenue Amount | `uint256` | Revenue in wei |

## State Management

### React Hooks Required
- `useProtocolAdminManager` - Interact with IProtocolAdminManager
- `useProtocolAdminClient` - Interact with IProtocolAdminClient (existing, extend if needed)

### Wagmi Hooks
- `useReadContract` - Read contract state
- `useWriteContract` - Execute transactions
- `useWaitForTransactionReceipt` - Track transaction status

## TypeScript Types

```typescript
// URI Types enum matching contract
export enum URIType {
  ZORA = 0,
  WEBSITE = 1,
  X = 2,
  FARCASTER = 3,
}

// Pool Key structure for encoding
export interface PoolKey {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}

// Create Pool parameters
export interface CreatePoolParams {
  protocolId: bigint;
  poolKey: PoolKey;
  initialSqrtPrice: bigint;
}

// Revenue parameters
export interface SetRevenueParams {
  protocolId: bigint;
  poolId?: string; // For pool-specific revenue
  amount: bigint;
}

// Protocol Admin state
export interface ProtocolAdminState {
  protocolId: bigint | null;
  protocolName: string;
  isCreator: boolean;
  pools: string[];
  uris: Record<URIType, string>;
}
```

## Transaction Flow

### Create Pool Flow
1. User fills pool key form
2. Frontend encodes PoolKey to bytes using `abi.encode`
3. Call `create_pool(protocolId, encodedPoolKey, initialSqrtPrice)`
4. Wait for transaction confirmation
5. Display pool ID and initial tick from return values
6. Refresh pools list

### Set Revenue Flow
1. User enters revenue amount
2. Convert to wei if needed
3. Call `setProtocolRevenue()` or `setPoolRevenue()`
4. Wait for confirmation
5. Update displayed revenue

## Error Handling

| Error | Contract | User Message |
|-------|----------|--------------|
| `ProtocolAdminManagerCallerIsNotCreator` | Manager | "You are not the protocol creator" |
| `ProtocolAdminClientUnauthorizedCaller` | Client | "You are not authorized to create pools" |
| `ProtocolAdminManagerNotClone` | Manager | "Invalid protocol instance" |
| `ProtocolAdminManagerInvalidContextCall` | Manager | "Invalid call context" |

## Responsive Design

- Desktop: Full 3-column layout
- Tablet: 2-column layout with stacked sections
- Mobile: Single column with collapsible sections

## Accessibility

- Form labels with proper `for` attributes
- ARIA labels on action buttons
- Keyboard navigation support
- Screen reader friendly error messages
- Focus management after transactions

## Mock Data (Development)

```typescript
const mockProtocolAdmin = {
  protocolId: 1n,
  protocolName: 'My DeFi Protocol',
  isCreator: true,
  pools: [
    '0x0000000000000000000000000000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000000000000000000000000000002',
  ],
  uris: {
    [URIType.WEBSITE]: 'https://myprotocol.io',
    [URIType.X]: '@myprotocol',
    [URIType.FARCASTER]: 'myprotocol.eth',
    [URIType.ZORA]: 'ipfs://...',
  },
};
```

## Implementation Priority

1. **Phase 1 - Core Functions (Required)**
   - ProtocolAdminPage layout
   - Create Pool form
   - Set Protocol Revenue form
   - Set Pool Revenue form

2. **Phase 2 - Manager Functions**
   - Pools table display
   - Delegate role form
   - URI management

3. **Phase 3 - Polish**
   - Transaction status toasts
   - Loading states
   - Error boundaries

## Dependencies

- React Router v6 (navigation)
- wagmi v2 (contract interactions)
- viem (encoding/decoding)
- lucide-react (icons)
- Existing design system components
