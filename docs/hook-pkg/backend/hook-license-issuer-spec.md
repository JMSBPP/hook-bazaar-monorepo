# HookLicenseIssuer Service Specification

> **Document Type:** Backend Service Specification
> **Last Updated:** 2025-12-09
> **Status:** Ready for Implementation

---

## 1. Service Overview

The **HookLicenseIssuer** is a modular backend service that:
1. Receives validated HookSpecs from the frontend
2. Uploads specs to IPFS
3. Mints HookLicense NFTs
4. Returns the license to the user

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              HOOKLICENSEISSUER FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  FRONTEND                                                                                │
│  ────────                                                                                │
│                                                                                          │
│  createHook ──► HookDashboard ──► StateSpaceModel ──► [Validate] ──► submitHookSpec    │
│                                    (READ ONLY)         Compatibility                     │
│                                                                                          │
│                                                              │                           │
│                                                              │ POST /api/hookspec/submit │
│                                                              ▼                           │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              BACKEND                                               │  │
│  │                                                                                    │  │
│  │   SubmitHookSpecRequest                                                           │  │
│  │   {                                                                               │  │
│  │     spec: HookSpec,                                                               │  │
│  │     signature: string,    // EIP-712 signature                                    │  │
│  │     royaltyBps?: number   // Optional royalty (default: 500 = 5%)                 │  │
│  │   }                                                                               │  │
│  │         │                                                                         │  │
│  │         ▼                                                                         │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                    HOOKLICENSEISSUER SERVICE                             │    │  │
│  │   │                                                                          │    │  │
│  │   │   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐        │    │  │
│  │   │   │ SignatureModule│───►│ IPFSModule     │───►│ MintModule     │        │    │  │
│  │   │   │                │    │                │    │                │        │    │  │
│  │   │   │ verify(sig,    │    │ upload(spec)   │    │ mint(dev,cid,  │        │    │  │
│  │   │   │        signer) │    │ ──► CID        │    │      metadata) │        │    │  │
│  │   │   └────────────────┘    └────────────────┘    └────────────────┘        │    │  │
│  │   │                                                       │                  │    │  │
│  │   │                                                       ▼                  │    │  │
│  │   │                                              ┌────────────────┐          │    │  │
│  │   │                                              │ HookLicense    │          │    │  │
│  │   │                                              │ NFT Contract   │          │    │  │
│  │   │                                              │                │          │    │  │
│  │   │                                              │ tokenId: 42    │          │    │  │
│  │   │                                              │ owner: user    │          │    │  │
│  │   │                                              │ uri: ipfs://...│          │    │  │
│  │   │                                              └────────────────┘          │    │  │
│  │   └─────────────────────────────────────────────────────────────────────────┘    │  │
│  │         │                                                                         │  │
│  │         ▼                                                                         │  │
│  │   SubmissionResult                                                                │  │
│  │   {                                                                               │  │
│  │     success: true,                                                                │  │
│  │     ipfsCid: "Qm...",                                                             │  │
│  │     tokenId: 42,                                                                  │  │
│  │     transactionHash: "0x...",                                                     │  │
│  │     ownerAddress: "0x1234...",                                                    │  │
│  │     ipfsGatewayUrl: "https://ipfs.io/ipfs/Qm..."                                  │  │
│  │   }                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                              │                           │
│                                                              ▼                           │
│  FRONTEND receives (user, HookLicense)                                                  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Modular Architecture

### 2.1 Module Breakdown

```
HookLicenseIssuer/
├── index.ts                    # Main service orchestrator
├── modules/
│   ├── SignatureModule.ts      # EIP-712 signature verification
│   ├── ValidationModule.ts     # HookSpec re-validation
│   ├── IPFSModule.ts           # IPFS upload abstraction
│   └── MintModule.ts           # NFT minting abstraction
├── interfaces/
│   ├── ISignatureVerifier.ts   # Signature interface
│   ├── IIPFSProvider.ts        # IPFS provider interface
│   └── IMinter.ts              # NFT minter interface
├── providers/
│   ├── PinataProvider.ts       # Pinata IPFS implementation
│   ├── Web3StorageProvider.ts  # Web3.storage implementation
│   └── InfuraProvider.ts       # Infura IPFS implementation
└── config/
    └── index.ts                # Configuration management
```

### 2.2 Dependency Injection

```typescript
// Interfaces for dependency injection (fully modular)

interface ISignatureVerifier {
  verify(message: SignedMessage, signature: string, expectedSigner: string): boolean;
  recoverSigner(message: SignedMessage, signature: string): string;
}

interface IIPFSProvider {
  upload(content: string | Buffer): Promise<string>;  // Returns CID
  pin(cid: string): Promise<boolean>;
  unpin(cid: string): Promise<boolean>;
  getGatewayUrl(cid: string): string;
}

interface IMinter {
  mint(
    developer: string,
    ipfsCid: string,
    name: string,
    version: string,
    royaltyBps: number
  ): Promise<MintResult>;

  getTokenByCid(cid: string): Promise<number | null>;
  isRegistered(cid: string): Promise<boolean>;
}

interface MintResult {
  tokenId: number;
  transactionHash: string;
  blockNumber: number;
}
```

---

## 3. Input/Output Contracts

### 3.1 Service Input (What HookLicenseIssuer Receives)

```typescript
// POST /api/hookspec/submit
interface SubmitHookSpecRequest {
  // The validated HookSpec document
  spec: HookSpec;

  // EIP-712 signature proving user consent
  signature: string;

  // Optional royalty percentage (basis points)
  // Default: 500 (5%)
  // Range: 0-10000 (0-100%)
  royaltyBps?: number;
}

// HookSpec structure (from frontend validation)
interface HookSpec {
  metadata: {
    name: string;           // e.g., "DynamicFeeHook"
    version: string;        // e.g., "1.0.0"
    author: string;         // Ethereum address
    description?: string;
    license?: string;
    system_state_version?: string;  // IPFS CID of system-state.md
  };
  hook_state: StateVariable[];
  system_functions: SystemFunction[];
  invariants?: Invariant[];
}

// EIP-712 Typed Data being signed
interface SignedMessage {
  name: string;              // spec.metadata.name
  version: string;           // spec.metadata.version
  specHash: string;          // keccak256(JSON.stringify(spec))
  developer: string;         // User's address
  nonce: number;             // Replay protection
  deadline: number;          // Unix timestamp
}
```

### 3.2 Service Output (What HookLicenseIssuer Returns)

```typescript
// Success Response
interface SubmissionResult {
  success: true;

  // IPFS CID of the uploaded spec
  ipfsCid: string;           // e.g., "QmXyz..."

  // Minted NFT token ID
  tokenId: number;           // e.g., 42

  // Transaction hash of mint
  transactionHash: string;   // e.g., "0xabc..."

  // Owner of the NFT (developer)
  ownerAddress: string;      // e.g., "0x1234..."

  // Convenience URLs
  ipfsGatewayUrl: string;    // e.g., "https://ipfs.io/ipfs/QmXyz..."
  openSeaUrl?: string;       // e.g., "https://opensea.io/assets/..."
  etherscanUrl?: string;     // e.g., "https://etherscan.io/tx/..."
}

// Error Response
interface SubmissionError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

type ErrorCode =
  | 'INVALID_SIGNATURE'
  | 'SIGNATURE_EXPIRED'
  | 'INVALID_SPEC'
  | 'IPFS_UPLOAD_FAILED'
  | 'CID_ALREADY_REGISTERED'
  | 'MINT_FAILED'
  | 'INSUFFICIENT_GAS'
  | 'CONTRACT_ERROR'
  | 'NETWORK_ERROR';
```

---

## 4. Module Specifications

### 4.1 SignatureModule

**Purpose**: Verify EIP-712 signatures to ensure user consent.

```typescript
// modules/SignatureModule.ts

import { ethers } from 'ethers';

interface SignatureModuleConfig {
  domain: EIP712Domain;
  types: EIP712Types;
}

interface EIP712Domain {
  name: string;              // "HookBazaar"
  version: string;           // "1"
  chainId: number;           // 1 (mainnet) or testnet
  verifyingContract: string; // HookLicense contract address
}

class SignatureModule implements ISignatureVerifier {
  constructor(private config: SignatureModuleConfig) {}

  /**
   * Verify signature matches expected signer
   */
  verify(message: SignedMessage, signature: string, expectedSigner: string): boolean {
    const recoveredSigner = this.recoverSigner(message, signature);
    return recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();
  }

  /**
   * Recover signer address from signature
   */
  recoverSigner(message: SignedMessage, signature: string): string {
    return ethers.verifyTypedData(
      this.config.domain,
      this.config.types,
      message,
      signature
    );
  }

  /**
   * Check if signature deadline has passed
   */
  isExpired(message: SignedMessage): boolean {
    return Date.now() / 1000 > message.deadline;
  }
}
```

**Input**:
- `message`: The typed data that was signed
- `signature`: The hex-encoded signature
- `expectedSigner`: The address we expect signed it

**Output**:
- `boolean`: Whether signature is valid

### 4.2 ValidationModule

**Purpose**: Re-validate HookSpec before processing (defense in depth).

```typescript
// modules/ValidationModule.ts

interface ValidationModuleConfig {
  systemStateUrl: string;  // URL or IPFS CID of system-state.md
  strictMode: boolean;     // Fail on warnings
}

class ValidationModule {
  private systemState: StateSpaceModel | null = null;

  constructor(private config: ValidationModuleConfig) {}

  /**
   * Load system state model
   */
  async initialize(): Promise<void> {
    this.systemState = await this.fetchSystemState();
  }

  /**
   * Validate HookSpec against system state
   */
  validate(spec: HookSpec): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Run all validation rules
    results.push(this.validatePoolStateReferences(spec));
    results.push(this.validateUniqueHookStateNames(spec));
    results.push(this.validateCallbacks(spec));
    results.push(this.validateEquationSymbols(spec));
    results.push(this.validateSolidityTypes(spec));
    results.push(this.validateWritesMatchHookState(spec));

    return results;
  }

  /**
   * Quick check if spec is valid
   */
  isValid(spec: HookSpec): boolean {
    const results = this.validate(spec);
    return results.every(r => r.passed);
  }
}
```

**Input**:
- `spec`: HookSpec document

**Output**:
- `ValidationResult[]`: Array of rule results
- `boolean`: Overall validity

### 4.3 IPFSModule

**Purpose**: Abstract IPFS operations with provider flexibility.

```typescript
// modules/IPFSModule.ts

interface IPFSModuleConfig {
  provider: 'pinata' | 'web3storage' | 'infura';
  apiKey: string;
  apiSecret?: string;
  gateway: string;
}

class IPFSModule implements IIPFSProvider {
  private provider: IIPFSProvider;

  constructor(private config: IPFSModuleConfig) {
    // Factory pattern for provider selection
    this.provider = this.createProvider(config);
  }

  private createProvider(config: IPFSModuleConfig): IIPFSProvider {
    switch (config.provider) {
      case 'pinata':
        return new PinataProvider(config.apiKey, config.apiSecret);
      case 'web3storage':
        return new Web3StorageProvider(config.apiKey);
      case 'infura':
        return new InfuraProvider(config.apiKey, config.apiSecret);
      default:
        throw new Error(`Unknown IPFS provider: ${config.provider}`);
    }
  }

  /**
   * Upload HookSpec to IPFS
   */
  async upload(spec: HookSpec, developer: string): Promise<string> {
    // Wrap spec with metadata
    const wrapper: IPFSHookSpecWrapper = {
      schema_version: '1.0.0',
      content_type: 'hookspec',
      uploader: developer,
      uploaded_at: Date.now(),
      content: spec
    };

    const content = JSON.stringify(wrapper, null, 2);
    const cid = await this.provider.upload(content);

    // Ensure pinned
    await this.provider.pin(cid);

    return cid;
  }

  /**
   * Get gateway URL for CID
   */
  getGatewayUrl(cid: string): string {
    return `${this.config.gateway}/ipfs/${cid}`;
  }
}
```

**Input**:
- `spec`: HookSpec document
- `developer`: Uploader address

**Output**:
- `string`: IPFS CID

### 4.4 MintModule

**Purpose**: Abstract NFT minting operations.

```typescript
// modules/MintModule.ts

interface MintModuleConfig {
  contractAddress: string;
  rpcUrl: string;
  signerPrivateKey: string;  // Backend signer with MINTER_ROLE
  chainId: number;
  gasLimit?: number;
}

class MintModule implements IMinter {
  private contract: ethers.Contract;
  private signer: ethers.Wallet;

  constructor(private config: MintModuleConfig) {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.signer = new ethers.Wallet(config.signerPrivateKey, provider);
    this.contract = new ethers.Contract(
      config.contractAddress,
      HookLicenseABI,
      this.signer
    );
  }

  /**
   * Mint HookLicense NFT
   */
  async mint(
    developer: string,
    ipfsCid: string,
    name: string,
    version: string,
    royaltyBps: number
  ): Promise<MintResult> {
    // Check if already registered
    if (await this.isRegistered(ipfsCid)) {
      throw new MintError('CID_ALREADY_REGISTERED', `CID ${ipfsCid} already registered`);
    }

    // Estimate gas
    const estimatedGas = await this.contract.mint.estimateGas(
      developer,
      ipfsCid,
      name,
      version,
      royaltyBps
    );

    // Execute mint
    const tx = await this.contract.mint(
      developer,
      ipfsCid,
      name,
      version,
      royaltyBps,
      {
        gasLimit: Math.ceil(Number(estimatedGas) * 1.2)  // 20% buffer
      }
    );

    // Wait for confirmation
    const receipt = await tx.wait();

    // Extract tokenId from event
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === 'HookSpecRegistered'
    );
    const tokenId = event?.args?.tokenId?.toNumber() ?? 0;

    return {
      tokenId,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Check if CID is already registered
   */
  async isRegistered(cid: string): Promise<boolean> {
    return await this.contract.isRegistered(cid);
  }

  /**
   * Get token ID by CID
   */
  async getTokenByCid(cid: string): Promise<number | null> {
    try {
      const tokenId = await this.contract.getTokenByCid(cid);
      return tokenId.toNumber();
    } catch {
      return null;
    }
  }
}
```

**Input**:
- `developer`: Address to receive NFT
- `ipfsCid`: IPFS CID of spec
- `name`: Hook name
- `version`: Hook version
- `royaltyBps`: Royalty percentage

**Output**:
- `MintResult`: Token ID, tx hash, block number

---

## 5. Main Service Orchestrator

```typescript
// index.ts - HookLicenseIssuer main service

interface HookLicenseIssuerConfig {
  signature: SignatureModuleConfig;
  validation: ValidationModuleConfig;
  ipfs: IPFSModuleConfig;
  mint: MintModuleConfig;
}

class HookLicenseIssuer {
  private signatureModule: SignatureModule;
  private validationModule: ValidationModule;
  private ipfsModule: IPFSModule;
  private mintModule: MintModule;

  constructor(config: HookLicenseIssuerConfig) {
    this.signatureModule = new SignatureModule(config.signature);
    this.validationModule = new ValidationModule(config.validation);
    this.ipfsModule = new IPFSModule(config.ipfs);
    this.mintModule = new MintModule(config.mint);
  }

  /**
   * Initialize service (load system state, etc.)
   */
  async initialize(): Promise<void> {
    await this.validationModule.initialize();
  }

  /**
   * Main entry point: Issue a HookLicense NFT
   *
   * @param request - The submission request from frontend
   * @returns SubmissionResult on success, throws on error
   */
  async issueHookLicense(request: SubmitHookSpecRequest): Promise<SubmissionResult> {
    const { spec, signature, royaltyBps = 500 } = request;
    const developer = spec.metadata.author;

    // Step 1: Verify signature
    const specHash = this.computeSpecHash(spec);
    const signedMessage: SignedMessage = {
      name: spec.metadata.name,
      version: spec.metadata.version,
      specHash,
      developer,
      nonce: await this.getNonce(developer),
      deadline: Math.floor(Date.now() / 1000) + 3600  // Assume 1 hour validity
    };

    if (this.signatureModule.isExpired(signedMessage)) {
      throw new IssuerError('SIGNATURE_EXPIRED', 'Signature deadline has passed');
    }

    if (!this.signatureModule.verify(signedMessage, signature, developer)) {
      throw new IssuerError('INVALID_SIGNATURE', 'Signature verification failed');
    }

    // Step 2: Re-validate spec (defense in depth)
    if (!this.validationModule.isValid(spec)) {
      const results = this.validationModule.validate(spec);
      const errors = results.filter(r => !r.passed).flatMap(r => r.errors);
      throw new IssuerError('INVALID_SPEC', 'HookSpec validation failed', { errors });
    }

    // Step 3: Upload to IPFS
    let ipfsCid: string;
    try {
      ipfsCid = await this.ipfsModule.upload(spec, developer);
    } catch (error) {
      throw new IssuerError('IPFS_UPLOAD_FAILED', 'Failed to upload to IPFS', { error });
    }

    // Step 4: Mint NFT
    let mintResult: MintResult;
    try {
      mintResult = await this.mintModule.mint(
        developer,
        ipfsCid,
        spec.metadata.name,
        spec.metadata.version,
        royaltyBps
      );
    } catch (error) {
      if (error instanceof MintError && error.code === 'CID_ALREADY_REGISTERED') {
        throw new IssuerError('CID_ALREADY_REGISTERED', 'This spec is already registered');
      }
      throw new IssuerError('MINT_FAILED', 'Failed to mint NFT', { error });
    }

    // Step 5: Return result
    return {
      success: true,
      ipfsCid,
      tokenId: mintResult.tokenId,
      transactionHash: mintResult.transactionHash,
      ownerAddress: developer,
      ipfsGatewayUrl: this.ipfsModule.getGatewayUrl(ipfsCid),
      openSeaUrl: this.buildOpenSeaUrl(mintResult.tokenId),
      etherscanUrl: this.buildEtherscanUrl(mintResult.transactionHash)
    };
  }

  private computeSpecHash(spec: HookSpec): string {
    return ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(spec))
    );
  }

  private async getNonce(address: string): Promise<number> {
    // Implement nonce tracking (could be from contract or database)
    return 0;
  }

  private buildOpenSeaUrl(tokenId: number): string {
    // Build OpenSea URL based on network
    return `https://opensea.io/assets/ethereum/${this.mintModule.config.contractAddress}/${tokenId}`;
  }

  private buildEtherscanUrl(txHash: string): string {
    return `https://etherscan.io/tx/${txHash}`;
  }
}
```

---

## 6. API Endpoint Implementation

```typescript
// routes/hookspec.ts

import { Router } from 'express';
import { HookLicenseIssuer } from '../services/HookLicenseIssuer';

const router = Router();
const issuer = new HookLicenseIssuer(config);

// Initialize on startup
issuer.initialize();

/**
 * POST /api/hookspec/submit
 *
 * Submit a validated HookSpec for IPFS upload and NFT minting
 */
router.post('/submit', async (req, res) => {
  try {
    const request: SubmitHookSpecRequest = req.body;

    // Validate request shape
    if (!request.spec || !request.signature) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: spec, signature'
        }
      });
    }

    // Issue the license
    const result = await issuer.issueHookLicense(request);

    return res.status(201).json(result);

  } catch (error) {
    if (error instanceof IssuerError) {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
    }

    // Unexpected error
    console.error('Unexpected error in /submit:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
});

export default router;
```

---

## 7. Configuration

```typescript
// config/index.ts

interface Config {
  // Network
  chainId: number;
  rpcUrl: string;

  // Contracts
  hookLicenseContract: string;

  // IPFS
  ipfsProvider: 'pinata' | 'web3storage' | 'infura';
  ipfsApiKey: string;
  ipfsApiSecret?: string;
  ipfsGateway: string;

  // Signing
  signerPrivateKey: string;  // For backend minting

  // Validation
  systemStateCid: string;    // IPFS CID of system-state.md
  strictValidation: boolean;
}

// Example config loading
function loadConfig(): Config {
  return {
    chainId: parseInt(process.env.CHAIN_ID || '1'),
    rpcUrl: process.env.RPC_URL || 'https://mainnet.infura.io/v3/...',
    hookLicenseContract: process.env.HOOK_LICENSE_CONTRACT!,
    ipfsProvider: (process.env.IPFS_PROVIDER || 'pinata') as any,
    ipfsApiKey: process.env.IPFS_API_KEY!,
    ipfsApiSecret: process.env.IPFS_API_SECRET,
    ipfsGateway: process.env.IPFS_GATEWAY || 'https://ipfs.io',
    signerPrivateKey: process.env.SIGNER_PRIVATE_KEY!,
    systemStateCid: process.env.SYSTEM_STATE_CID!,
    strictValidation: process.env.STRICT_VALIDATION === 'true'
  };
}
```

---

## 8. Modularity Benefits

### 8.1 Swappable Components

| Component | Interface | Implementations |
|-----------|-----------|-----------------|
| Signature Verification | `ISignatureVerifier` | EIP-712, EIP-1271 (smart contract wallets) |
| IPFS Upload | `IIPFSProvider` | Pinata, Web3.storage, Infura, IPFS daemon |
| NFT Minting | `IMinter` | HookLicense (ERC-721), HookLicense1155 (ERC-1155) |

### 8.2 Testing Strategy

```typescript
// Mock implementations for testing

class MockIPFSProvider implements IIPFSProvider {
  private storage = new Map<string, string>();

  async upload(content: string): Promise<string> {
    const cid = `Qm${Math.random().toString(36).slice(2)}`;
    this.storage.set(cid, content);
    return cid;
  }

  // ... other methods
}

class MockMinter implements IMinter {
  private tokenCounter = 0;
  private registry = new Map<string, number>();

  async mint(developer, ipfsCid, name, version, royaltyBps): Promise<MintResult> {
    const tokenId = ++this.tokenCounter;
    this.registry.set(ipfsCid, tokenId);
    return {
      tokenId,
      transactionHash: `0x${Math.random().toString(16).slice(2)}`,
      blockNumber: 12345
    };
  }

  // ... other methods
}
```

### 8.3 Future Extensions

1. **Multi-chain Support**: Add chain-specific minters
2. **Batch Minting**: Support minting multiple specs at once
3. **Upgradeable Specs**: Support versioning and updates
4. **AVS Integration**: Add attestation before minting
5. **Payment Integration**: Add payment module for paid listings

---

## 9. Summary

**HookLicenseIssuer receives:**
```typescript
{
  spec: HookSpec,        // The validated hook specification
  signature: string,     // EIP-712 signature proving consent
  royaltyBps?: number    // Optional royalty (default 5%)
}
```

**HookLicenseIssuer returns:**
```typescript
{
  success: true,
  ipfsCid: string,       // IPFS content address
  tokenId: number,       // NFT token ID
  transactionHash: string,
  ownerAddress: string,
  ipfsGatewayUrl: string,
  openSeaUrl?: string
}
```

**Modular design via interfaces:**
- `ISignatureVerifier` - Verify user consent
- `IIPFSProvider` - Store spec immutably
- `IMinter` - Issue NFT ownership

Each module can be independently tested, replaced, or upgraded without affecting the others.
