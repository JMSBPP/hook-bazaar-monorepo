# Hook Developer Dashboard: Frontend Flow & API Specification

> **Document Type:** Implementation Specification
> **Last Updated:** 2025-12-09
> **Status:** Ready for Implementation

---

## 1. User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           HOOK DEVELOPER DASHBOARD FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌────────────────────┐                                                                 │
│  │  HookDeveloper     │                                                                 │
│  │  Dashboard         │                                                                 │
│  │  /hook-developer   │                                                                 │
│  └─────────┬──────────┘                                                                 │
│            │                                                                            │
│            │ clicks "Create New Hook"                                                   │
│            ▼                                                                            │
│  ┌────────────────────────────────────────────────────────────────────────────────┐    │
│  │  CreateHook Page                                                                │    │
│  │  /hook-developer/create                                                         │    │
│  │                                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  Step 1: View State Space Model (READ ONLY)                             │   │    │
│  │  │                                                                          │   │    │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐  │   │    │
│  │  │  │  StateSpaceModelViewer                                           │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  - LP Index Variables (positions, ticks)                         │  │   │    │
│  │  │  │  - Trader Index Variables (slot0, liquidity)                     │  │   │    │
│  │  │  │  - Shared Variables (fee growth)                                 │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  [Search] [Copy Symbol] [View IStateView Source]                 │  │   │    │
│  │  │  └──────────────────────────────────────────────────────────────────┘  │   │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  Step 2: Write/Upload HookSpec                                          │   │    │
│  │  │                                                                          │   │    │
│  │  │  [Upload File] or [Use Editor]                                          │   │    │
│  │  │                                                                          │   │    │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐  │   │    │
│  │  │  │  HookSpecEditor                                                  │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  metadata:                                                        │  │   │    │
│  │  │  │    name: "MyHook"                                                 │  │   │    │
│  │  │  │    version: "1.0.0"                                               │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  hook_state:                                                      │  │   │    │
│  │  │  │    - name: accumulated_fees                                       │  │   │    │
│  │  │  │      symbol: F_acc                                                │  │   │    │
│  │  │  │      type: uint256                                                │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  system_functions:                                                │  │   │    │
│  │  │  │    - callback: afterSwap                                          │  │   │    │
│  │  │  │      reads: [sqrt_price, active_liquidity]                        │  │   │    │
│  │  │  │      ...                                                          │  │   │    │
│  │  │  └──────────────────────────────────────────────────────────────────┘  │   │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  Step 3: Validate Compatibility                                         │   │    │
│  │  │                                                                          │   │    │
│  │  │  [Validate HookSpec]                                                    │   │    │
│  │  │                                                                          │   │    │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐  │   │    │
│  │  │  │  ValidationResults                                               │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  ✓ V1: Valid pool state references                               │  │   │    │
│  │  │  │  ✓ V2: Unique hook state names                                   │  │   │    │
│  │  │  │  ✓ V3: Valid callbacks                                           │  │   │    │
│  │  │  │  ✗ V4: Invalid symbol 'X_invalid' in equation                    │  │   │    │
│  │  │  │  ✓ V5: Valid Solidity types                                      │  │   │    │
│  │  │  │  ✓ V6: Writes match hook state                                   │  │   │    │
│  │  │  └──────────────────────────────────────────────────────────────────┘  │   │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  Step 4: Submit & Mint License (if validation passes)                   │   │    │
│  │  │                                                                          │   │    │
│  │  │  [Submit HookSpec]                                                      │   │    │
│  │  │                                                                          │   │    │
│  │  │  Backend Flow:                                                          │   │    │
│  │  │  1. Upload to IPFS → Get CID                                            │   │    │
│  │  │  2. Call HookLicenseIssuer.mint(user, CID, metadata)                   │   │    │
│  │  │  3. Return HookLicense NFT                                              │   │    │
│  │  │                                                                          │   │    │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐  │   │    │
│  │  │  │  SubmissionResult                                                │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  ✓ HookSpec uploaded to IPFS                                     │  │   │    │
│  │  │  │    CID: QmXyz...                                                  │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  ✓ HookLicense NFT minted                                        │  │   │    │
│  │  │  │    Token ID: #42                                                  │  │   │    │
│  │  │  │    Owner: 0x1234...abcd                                          │  │   │    │
│  │  │  │                                                                   │  │   │    │
│  │  │  │  [View on OpenSea] [View on IPFS] [Back to Dashboard]            │  │   │    │
│  │  │  └──────────────────────────────────────────────────────────────────┘  │   │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/hook-developer` | `HookDeveloperDashboard` | Main dashboard with stats and hook list |
| `/hook-developer/create` | `CreateHookPage` | Create new hook flow |
| `/hook-developer/hooks/:tokenId` | `HookDetailPage` | View specific hook details |
| `/hook-developer/hooks/:tokenId/edit` | `EditHookPage` | Edit hook metadata |

---

## 3. Frontend Components

### 3.1 Component Hierarchy

```
CreateHookPage
├── StateSpaceModelViewer (Step 1)
│   ├── StateVariableTable
│   │   ├── LPIndexSection
│   │   ├── TraderIndexSection
│   │   └── SharedSection
│   └── SearchInput
├── HookSpecEditor (Step 2)
│   ├── MetadataForm
│   ├── HookStateForm
│   ├── SystemFunctionsForm
│   └── InvariantsForm
├── ValidationResults (Step 3)
│   ├── ValidationRuleResult (x6)
│   └── ErrorDetails
└── SubmissionFlow (Step 4)
    ├── IPFSUploadStatus
    ├── MintTransaction
    └── SubmissionResult
```

### 3.2 Component Specifications

#### StateSpaceModelViewer

```typescript
// components/hook/StateSpaceModelViewer.tsx

interface StateVariable {
  name: string;
  symbol: string;
  type: string;
  getter: string;
  description: string;
}

interface StateSpaceModel {
  version: string;
  ipfsCid: string;
  lpIndex: StateVariable[];
  traderIndex: StateVariable[];
  shared: StateVariable[];
}

interface StateSpaceModelViewerProps {
  model: StateSpaceModel;
  onSelectVariable?: (variable: StateVariable) => void;
}

// Features:
// - Collapsible sections for each index
// - Search/filter by name, symbol, or type
// - Copy-to-clipboard for symbols
// - Tooltip with full description
// - Link to IStateView source code
```

#### HookSpecEditor

```typescript
// components/hook/HookSpecEditor.tsx

interface HookSpecEditorProps {
  initialSpec?: HookSpec;
  stateSpaceModel: StateSpaceModel;
  onChange: (spec: HookSpec) => void;
  onValidate: () => void;
}

// Features:
// - Monaco editor or CodeMirror for YAML editing
// - Syntax highlighting
// - Auto-complete for state variable names
// - Real-time schema validation
// - Upload from file option
// - Template selection
```

#### ValidationResults

```typescript
// components/hook/ValidationResults.tsx

interface ValidationResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationResultsProps {
  results: ValidationResult[];
  isLoading: boolean;
  onFixError?: (ruleId: string, errorIndex: number) => void;
}

// Features:
// - Visual pass/fail indicator for each rule
// - Expandable error details
// - Link to relevant spec section
// - Fix suggestions where possible
```

#### SubmissionFlow

```typescript
// components/hook/SubmissionFlow.tsx

interface SubmissionFlowProps {
  hookSpec: HookSpec;
  validationPassed: boolean;
  onSubmit: () => Promise<SubmissionResult>;
}

interface SubmissionResult {
  ipfsCid: string;
  tokenId: number;
  transactionHash: string;
  ownerAddress: string;
}

// Features:
// - Step-by-step progress indicator
// - IPFS upload progress
// - Transaction confirmation
// - Success/error states
// - Links to OpenSea, IPFS, Etherscan
```

---

## 4. API Endpoints

### 4.1 Frontend → Backend API

| Method | Endpoint | Request | Response | Description |
|--------|----------|---------|----------|-------------|
| `GET` | `/api/state-space-model` | - | `StateSpaceModel` | Get current system state model |
| `POST` | `/api/hookspec/validate` | `HookSpec` | `ValidationResult[]` | Validate a HookSpec |
| `POST` | `/api/hookspec/submit` | `{ spec: HookSpec, signature: string }` | `SubmissionResult` | Submit spec, upload to IPFS, mint NFT |
| `GET` | `/api/hooks` | `?owner=0x...` | `HookLicense[]` | List user's hook licenses |
| `GET` | `/api/hooks/:tokenId` | - | `HookLicenseDetail` | Get hook license details |

### 4.2 API Type Definitions

```typescript
// types/api.ts

// GET /api/state-space-model
interface StateSpaceModelResponse {
  version: string;
  ipfsCid: string;
  uniswapVersion: string;
  updatedAt: string;
  indices: {
    lp: StateVariable[];
    trader: StateVariable[];
    shared: StateVariable[];
  };
}

// POST /api/hookspec/validate
interface ValidateHookSpecRequest {
  spec: HookSpec;
}

interface ValidateHookSpecResponse {
  valid: boolean;
  results: ValidationResult[];
  errors: string[];
  warnings: string[];
}

// POST /api/hookspec/submit
interface SubmitHookSpecRequest {
  spec: HookSpec;
  signature: string;  // EIP-712 signature from wallet
  royaltyBps?: number; // Royalty percentage (default: 500 = 5%)
}

interface SubmitHookSpecResponse {
  success: boolean;
  ipfsCid: string;
  tokenId: number;
  transactionHash: string;
  ownerAddress: string;
  openSeaUrl?: string;
  ipfsGatewayUrl: string;
}

// GET /api/hooks
interface ListHooksRequest {
  owner?: string;
  page?: number;
  limit?: number;
}

interface ListHooksResponse {
  hooks: HookLicenseSummary[];
  total: number;
  page: number;
  limit: number;
}

interface HookLicenseSummary {
  tokenId: number;
  name: string;
  version: string;
  ipfsCid: string;
  deprecated: boolean;
  registeredAt: string;
}

// GET /api/hooks/:tokenId
interface HookLicenseDetailResponse {
  tokenId: number;
  owner: string;
  metadata: {
    name: string;
    version: string;
    description?: string;
    developer: string;
    registeredAt: string;
    deprecated: boolean;
  };
  ipfsCid: string;
  ipfsGatewayUrl: string;
  spec: HookSpec;  // Full spec content
  attestations?: AttestationInfo[];
  deployments?: DeploymentInfo[];
}
```

---

## 5. Backend Services

### 5.1 Service Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        API Gateway                                   │    │
│  │                    (Express / Fastify)                               │    │
│  └───────────────────────────┬─────────────────────────────────────────┘    │
│                              │                                               │
│         ┌────────────────────┼────────────────────┐                         │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  ┌─────────────┐    ┌─────────────────┐   ┌─────────────────┐              │
│  │ StateSpace  │    │  Validation     │   │ HookLicense     │              │
│  │ Service     │    │  Service        │   │ Issuer          │              │
│  └──────┬──────┘    └────────┬────────┘   └────────┬────────┘              │
│         │                    │                     │                        │
│         │                    │                     │                        │
│         ▼                    ▼                     ▼                        │
│  ┌─────────────┐    ┌─────────────────┐   ┌─────────────────┐              │
│  │   IPFS      │    │   IPFS          │   │   Blockchain    │              │
│  │   Gateway   │    │   (fetch spec)  │   │   (mint NFT)    │              │
│  └─────────────┘    └─────────────────┘   └─────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 HookLicenseIssuer Service

```typescript
// services/HookLicenseIssuer.ts

interface HookLicenseIssuerConfig {
  contractAddress: string;
  ipfsProvider: 'pinata' | 'infura' | 'web3storage';
  ipfsApiKey: string;
  ipfsGatewayUrl: string;
  rpcUrl: string;
  signerPrivateKey: string;  // Backend signer with MINTER_ROLE
}

interface MintRequest {
  developer: string;          // User's address (receives NFT)
  spec: HookSpec;             // Validated HookSpec
  signature: string;          // User's EIP-712 signature
  royaltyBps?: number;
}

interface MintResult {
  success: boolean;
  tokenId: number;
  ipfsCid: string;
  transactionHash: string;
  error?: string;
}

class HookLicenseIssuer {
  constructor(config: HookLicenseIssuerConfig);

  /**
   * Issue a new HookLicense NFT
   *
   * Flow:
   * 1. Verify user signature
   * 2. Validate HookSpec (double-check)
   * 3. Package and upload to IPFS
   * 4. Call HookLicense.mint() on-chain
   * 5. Return result with tokenId and CID
   */
  async issueHookLicense(request: MintRequest): Promise<MintResult>;

  /**
   * Upload HookSpec to IPFS
   */
  async uploadToIPFS(spec: HookSpec, developer: string): Promise<string>;

  /**
   * Mint NFT on-chain
   */
  async mintNFT(
    developer: string,
    ipfsCid: string,
    name: string,
    version: string,
    royaltyBps: number
  ): Promise<{ tokenId: number; transactionHash: string }>;

  /**
   * Verify EIP-712 signature
   */
  verifySignature(spec: HookSpec, signature: string, expectedSigner: string): boolean;
}
```

### 5.3 EIP-712 Signature Schema

```typescript
// For user to sign before submission
const HOOKSPEC_TYPEHASH = {
  HookSpecSubmission: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'specHash', type: 'bytes32' },  // keccak256(JSON.stringify(spec))
    { name: 'developer', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

const domain = {
  name: 'HookBazaar',
  version: '1',
  chainId: 1,  // or appropriate chain
  verifyingContract: HOOK_LICENSE_CONTRACT_ADDRESS,
};
```

---

## 6. Implementation Files

### 6.1 File Structure

```
client2/src/
├── components/
│   └── hook/
│       ├── CreateHookPage.tsx           # Main create hook flow
│       ├── StateSpaceModelViewer.tsx    # Read-only state model viewer
│       ├── HookSpecEditor.tsx           # YAML/JSON editor for specs
│       ├── ValidationResults.tsx        # Validation results display
│       ├── SubmissionFlow.tsx           # Submit, IPFS, mint flow
│       ├── HookDetailPage.tsx           # View single hook details
│       └── HookCard.tsx                 # Hook list item component
├── hooks/
│   ├── useStateSpaceModel.ts            # Fetch state space model
│   ├── useValidateHookSpec.ts           # Validate hook spec
│   ├── useSubmitHookSpec.ts             # Submit and mint
│   └── useHookLicenses.ts               # List user's hooks
├── lib/
│   └── api/
│       ├── hookApi.ts                   # API client for hooks
│       └── types.ts                     # API type definitions
└── types/
    └── hookSpec.ts                      # HookSpec type definitions
```

---

## 7. State Management

### 7.1 Create Hook Flow State

```typescript
// hooks/useCreateHookFlow.ts

interface CreateHookState {
  step: 'view-model' | 'edit-spec' | 'validate' | 'submit' | 'complete';
  stateSpaceModel: StateSpaceModel | null;
  hookSpec: HookSpec | null;
  validationResults: ValidationResult[] | null;
  submissionResult: SubmissionResult | null;
  error: string | null;
  isLoading: boolean;
}

type CreateHookAction =
  | { type: 'LOAD_STATE_MODEL'; payload: StateSpaceModel }
  | { type: 'UPDATE_SPEC'; payload: HookSpec }
  | { type: 'VALIDATE_START' }
  | { type: 'VALIDATE_SUCCESS'; payload: ValidationResult[] }
  | { type: 'VALIDATE_ERROR'; payload: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: SubmissionResult }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' };

function useCreateHookFlow() {
  const [state, dispatch] = useReducer(createHookReducer, initialState);

  // Actions
  const loadStateModel = async () => { ... };
  const updateSpec = (spec: HookSpec) => { ... };
  const validateSpec = async () => { ... };
  const submitSpec = async (signature: string) => { ... };
  const reset = () => { ... };

  return { state, loadStateModel, updateSpec, validateSpec, submitSpec, reset };
}
```

---

## 8. Wallet Integration

### 8.1 Required Wallet Actions

| Action | Method | When |
|--------|--------|------|
| Connect Wallet | `connect()` | On page load or "Connect" button |
| Sign Message | `signTypedData()` | Before submitting HookSpec |
| View Transaction | - | After mint transaction |

### 8.2 Signature Flow

```typescript
// hooks/useSignHookSpec.ts

async function signHookSpec(
  spec: HookSpec,
  walletClient: WalletClient
): Promise<string> {
  const specHash = keccak256(
    toBytes(JSON.stringify(spec))
  );

  const nonce = await getNonce(walletClient.account.address);
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

  const signature = await walletClient.signTypedData({
    domain,
    types: HOOKSPEC_TYPEHASH,
    primaryType: 'HookSpecSubmission',
    message: {
      name: spec.metadata.name,
      version: spec.metadata.version,
      specHash,
      developer: walletClient.account.address,
      nonce,
      deadline,
    },
  });

  return signature;
}
```

---

## 9. Error Handling

### 9.1 Error Types

```typescript
// types/errors.ts

enum HookErrorCode {
  // Validation errors
  INVALID_SPEC_FORMAT = 'INVALID_SPEC_FORMAT',
  INVALID_STATE_REFERENCE = 'INVALID_STATE_REFERENCE',
  INVALID_CALLBACK = 'INVALID_CALLBACK',
  INVALID_TYPE = 'INVALID_TYPE',
  DUPLICATE_STATE_NAME = 'DUPLICATE_STATE_NAME',
  INVALID_EQUATION = 'INVALID_EQUATION',

  // Submission errors
  IPFS_UPLOAD_FAILED = 'IPFS_UPLOAD_FAILED',
  SIGNATURE_INVALID = 'SIGNATURE_INVALID',
  MINT_FAILED = 'MINT_FAILED',
  CID_ALREADY_REGISTERED = 'CID_ALREADY_REGISTERED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
}

interface HookError {
  code: HookErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

- StateSpaceModelViewer: renders all sections, search works
- HookSpecEditor: updates state on change, validates schema
- ValidationResults: displays pass/fail correctly
- SubmissionFlow: handles all states

### 10.2 Integration Tests

- Full create flow: view model → edit spec → validate → submit
- API mocking for backend calls
- Wallet signature mocking

### 10.3 E2E Tests

- Connect wallet → create hook → verify NFT minted
- Invalid spec rejection flow
- Network error handling

---

## 11. Next Steps

1. **Create component files** in `client2/src/components/hook/`
2. **Add routes** to `App.tsx`
3. **Implement hooks** for API calls
4. **Set up backend API** endpoints
5. **Deploy HookLicense contract** to testnet
6. **Integrate IPFS provider**
