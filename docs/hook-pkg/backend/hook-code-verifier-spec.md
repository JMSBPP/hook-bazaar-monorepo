# HookCodeVerifier Service Specification

> **Document Type:** Backend Service Specification
> **Last Updated:** 2025-12-09
> **Status:** Ready for Implementation

---

## 1. Service Overview

The **HookCodeVerifier** is a modular backend service that handles the post-license workflow for hook code verification and encrypted deployment. After a HookLicense NFT is minted, developers submit a **GitHub repository URL** containing their hook implementation to be:

1. **Fetched and analyzed by the Repository Analyzer** - Clones repo, identifies hook contracts, and prepares for verification
2. **Verified by AVS (Actively Validated Service)** - Checks code compliance against the PDF/HookSpec specification
3. **Encrypted and Deployed via CFHE (Confidential FHE)** - Deploys bytecode in encrypted form

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           HOOK CODE VERIFICATION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  PREREQUISITES (Already Completed)                                                       │
│  ─────────────────────────────────                                                       │
│  ✓ HookSpec validated against StateSpaceModel                                           │
│  ✓ HookLicense NFT minted (tokenId, ipfsCid)                                           │
│  ✓ PDF specification stored on IPFS                                                     │
│                                                                                          │
│  NEW FLOW (Steps 5-6)                                                                   │
│  ────────────────────                                                                    │
│                                                                                          │
│  FRONTEND                                                                                │
│  ────────                                                                                │
│                                                                                          │
│  HookLicense NFT Minted ──► "Submit Code" Button ──► Enter GitHub Repo URL             │
│                                                              │                           │
│                              OR                              │                           │
│                                                              │                           │
│  CLI: hook-bazaar submit-code --license <tokenId> --repo https://github.com/user/hook   │
│                                                              │                           │
│                                                              │ POST /api/hook/verify     │
│                                                              ▼                           │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              BACKEND                                               │  │
│  │                                                                                    │  │
│  │   CodeSubmissionRequest                                                           │  │
│  │   {                                                                               │  │
│  │     licenseTokenId: number,                                                       │  │
│  │     repoUrl: string,            // GitHub repository URL                          │  │
│  │     branch?: string,            // Optional branch (default: main)                │  │
│  │     contractPath?: string,      // Optional path to main contract                 │  │
│  │     compilerVersion: string,    // e.g., "0.8.26"                                 │  │
│  │     optimizerRuns?: number,     // e.g., 200                                      │  │
│  │     signature: string,          // EIP-712 signature                              │  │
│  │   }                                                                               │  │
│  │         │                                                                         │  │
│  │         ▼                                                                         │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                    HOOKCODEEVERIFIER SERVICE                            │    │  │
│  │   │                                                                          │    │  │
│  │   │   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐  │
│  │   │   │ RepoAnalyzer   │───►│ CompilerModule │───►│ AVSVerifier    │───►│ CFHEDeployer   │  │
│  │   │   │                │    │                │    │                │    │                │  │
│  │   │   │ clone(url)     │    │ compile(code)  │    │ verify(byte,   │    │ encrypt(byte)  │  │
│  │   │   │ analyze()      │    │ ──► bytecode   │    │        spec)   │    │ deploy()       │  │
│  │   │   └────────────────┘    └────────────────┘    └────────────────┘    └────────────────┘  │
│  │   │                                │                      │                  │    │  │
│  │   │                                ▼                      ▼                  │    │  │
│  │   │                     ┌──────────────────┐   ┌──────────────────┐          │    │  │
│  │   │                     │ AVS Operators    │   │ CFHE Network     │          │    │  │
│  │   │                     │                  │   │                  │          │    │  │
│  │   │                     │ - Compliance %   │   │ - Encrypted      │          │    │  │
│  │   │                     │ - Attestation    │   │   bytecode       │          │    │  │
│  │   │                     │ - Stake slash    │   │ - Tx hash        │          │    │  │
│  │   │                     │   if wrong       │   │ - Contract addr  │          │    │  │
│  │   │                     └──────────────────┘   └──────────────────┘          │    │  │
│  │   └─────────────────────────────────────────────────────────────────────────┘    │  │
│  │         │                                                                         │  │
│  │         ▼                                                                         │  │
│  │   CodeVerificationResult                                                          │  │
│  │   {                                                                               │  │
│  │     success: true,                                                                │  │
│  │     avsResult: {                                                                  │  │
│  │       compliant: true,                                                            │  │
│  │       complianceScore: 98.5,                                                      │  │
│  │       attestationId: "0x...",                                                     │  │
│  │       findings: [...],                                                            │  │
│  │     },                                                                            │  │
│  │     cfheResult: {                                                                 │  │
│  │       encryptedBytecodeHash: "0x...",                                             │  │
│  │       deploymentTxHash: "0x...",                                                  │  │
│  │       encryptedContractAddress: "0x...",                                          │  │
│  │     }                                                                             │  │
│  │   }                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                              │                           │
│                                                              ▼                           │
│  FRONTEND receives verification results + deployment confirmation                       │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Modular Architecture

### 2.1 Module Breakdown

```
HookCodeVerifier/
├── index.ts                    # Main service orchestrator
├── modules/
│   ├── RepoAnalyzerModule.ts   # GitHub repo cloning & analysis
│   ├── CompilerModule.ts       # Solidity compilation
│   ├── AVSVerifierModule.ts    # AVS verification abstraction
│   ├── CFHEDeployerModule.ts   # Encrypted deployment abstraction
│   └── LicenseModule.ts        # HookLicense validation
├── interfaces/
│   ├── IRepoAnalyzer.ts        # Repository analyzer interface
│   ├── ICompiler.ts            # Compiler interface
│   ├── IAVSVerifier.ts         # AVS verifier interface
│   ├── ICFHEDeployer.ts        # CFHE deployer interface
│   └── ILicenseValidator.ts    # License validator interface
├── providers/
│   ├── GitHubProvider.ts       # GitHub API implementation
│   ├── SolcProvider.ts         # solc-js implementation
│   ├── EigenLayerAVS.ts        # EigenLayer AVS implementation
│   ├── OthenticAVS.ts          # Othentic AVS implementation
│   └── IncoFHE.ts              # Inco Network FHE implementation
└── config/
    └── index.ts                # Configuration management
```

### 2.2 Dependency Injection

```typescript
// Interfaces for dependency injection (fully modular)

interface IRepoAnalyzer {
  /**
   * Clone and analyze a GitHub repository
   * @param repoUrl - GitHub repository URL
   * @param branch - Optional branch (defaults to main/master)
   * @param contractPath - Optional path to main contract
   * @returns Analysis result with discovered contracts and source code
   */
  analyze(request: RepoAnalyzeRequest): Promise<RepoAnalyzeResult>;

  /**
   * Get repository metadata (without cloning)
   */
  getRepoMetadata(repoUrl: string): Promise<RepoMetadata>;

  /**
   * Validate that URL is a valid GitHub repository
   */
  validateUrl(repoUrl: string): Promise<boolean>;
}

interface RepoAnalyzeRequest {
  repoUrl: string;
  branch?: string;          // Default: main or master
  contractPath?: string;    // Optional: path to main hook contract
}

interface RepoAnalyzeResult {
  success: boolean;
  repoUrl: string;
  branch: string;
  commitHash: string;
  contracts: DiscoveredContract[];
  mainContract?: DiscoveredContract;  // Auto-detected or specified
  dependencies: string[];             // External dependencies found
  foundryConfig?: any;               // foundry.toml if present
  hardhatConfig?: any;               // hardhat.config.js if present
  errors?: string[];
}

interface DiscoveredContract {
  name: string;
  path: string;
  sourceCode: string;
  isHook: boolean;          // Detected as implementing BaseHook
  inheritsFrom: string[];
  pragmaVersion?: string;
}

interface RepoMetadata {
  owner: string;
  repo: string;
  defaultBranch: string;
  stars: number;
  lastUpdated: string;
  license?: string;
  isPrivate: boolean;
}

interface ICompiler {
  compile(
    sourceCode: string,
    compilerVersion: string,
    optimizerRuns?: number
  ): Promise<CompilationResult>;

  getSupportedVersions(): Promise<string[]>;
}

interface CompilationResult {
  success: boolean;
  bytecode?: string;
  deployedBytecode?: string;
  abi?: any[];
  errors?: CompilationError[];
  warnings?: CompilationWarning[];
}

interface IAVSVerifier {
  /**
   * Verify bytecode compliance against specification
   * @param request - Verification request with bytecode and spec reference
   * @returns Verification result with compliance score and findings
   */
  verify(request: AVSVerifyRequest): Promise<AVSVerifyResult>;

  /**
   * Check verification status (for async verification)
   */
  getVerificationStatus(taskId: string): Promise<AVSVerifyResult>;

  /**
   * Get required stake for verification request
   */
  getRequiredStake(specComplexity: number): Promise<bigint>;
}

interface AVSVerifyRequest {
  bytecode: string;
  deployedBytecode: string;
  specIpfsCid: string;
  licenseTokenId: number;
  requesterAddress: string;
  stakeAmount: bigint;
}

interface AVSVerifyResult {
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  compliant: boolean;
  complianceScore: number;         // 0-100 percentage
  attestationId?: string;          // On-chain attestation ID
  attestationTxHash?: string;
  findings: AVSFinding[];
  operatorSignatures: string[];    // Signatures from AVS operators
  timestamp: number;
}

interface AVSFinding {
  severity: 'critical' | 'warning' | 'info';
  ruleId: string;
  ruleName: string;
  description: string;
  codeLocation?: {
    startLine: number;
    endLine: number;
    functionName?: string;
  };
  specReference?: string;          // Reference to spec section
}

interface ICFHEDeployer {
  /**
   * Encrypt bytecode using FHE
   */
  encrypt(bytecode: string): Promise<EncryptionResult>;

  /**
   * Deploy encrypted bytecode to CFHE network
   */
  deploy(encryptedBytecode: string, metadata: DeploymentMetadata): Promise<DeploymentResult>;

  /**
   * Get deployment status
   */
  getDeploymentStatus(deploymentId: string): Promise<DeploymentResult>;
}

interface EncryptionResult {
  encryptedBytecode: string;
  encryptedBytecodeHash: string;
  publicKeyUsed: string;
  encryptionProof?: string;
}

interface DeploymentMetadata {
  licenseTokenId: number;
  specIpfsCid: string;
  hookName: string;
  hookVersion: string;
  deployer: string;
}

interface DeploymentResult {
  deploymentId: string;
  status: 'pending' | 'deployed' | 'failed';
  encryptedContractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: bigint;
  error?: string;
}

interface ILicenseValidator {
  /**
   * Validate that license exists and is owned by requester
   */
  validateLicense(
    tokenId: number,
    requesterAddress: string
  ): Promise<LicenseValidation>;

  /**
   * Get license details including spec CID
   */
  getLicenseDetails(tokenId: number): Promise<LicenseDetails>;
}

interface LicenseValidation {
  valid: boolean;
  owner: string;
  specIpfsCid: string;
  deprecated: boolean;
  error?: string;
}

interface LicenseDetails {
  tokenId: number;
  owner: string;
  specIpfsCid: string;
  hookName: string;
  hookVersion: string;
  registeredAt: number;
  deprecated: boolean;
}
```

---

## 3. Input/Output Contracts

### 3.1 Service Input (What HookCodeVerifier Receives)

```typescript
// POST /api/hook/verify
interface CodeSubmissionRequest {
  // License token ID (proves ownership of spec)
  licenseTokenId: number;

  // GitHub repository URL containing hook implementation
  repoUrl: string;

  // Optional: Branch to use (defaults to main/master)
  branch?: string;

  // Optional: Path to main hook contract (auto-detected if not provided)
  contractPath?: string;

  // Compiler version (e.g., "0.8.26")
  compilerVersion: string;

  // Optimizer settings
  optimizerRuns?: number;  // Default: 200

  // EIP-712 signature proving consent
  signature: string;

  // Optional: Skip CFHE deployment (verification only)
  verifyOnly?: boolean;
}

// CLI equivalent
// hook-bazaar submit-code \
//   --license 42 \
//   --repo https://github.com/username/my-hook \
//   --branch main \
//   --contract src/DynamicFeeHook.sol \
//   --compiler 0.8.26 \
//   --optimizer-runs 200

// EIP-712 Typed Data being signed
interface CodeSubmissionMessage {
  licenseTokenId: number;
  repoUrl: string;            // GitHub repository URL
  commitHash: string;         // Specific commit being verified
  compilerVersion: string;
  submitter: string;
  nonce: number;
  deadline: number;
}
```

### 3.2 Service Output (What HookCodeVerifier Returns)

```typescript
// Success Response
interface CodeVerificationResult {
  success: true;

  // Repository analysis result
  repoAnalysis: {
    repoUrl: string;
    branch: string;
    commitHash: string;
    mainContract: string;         // Path to main hook contract
    contractsFound: number;
    dependencies: string[];
  };

  // Compilation result
  compilation: {
    success: true;
    bytecodeHash: string;
    deployedBytecodeHash: string;
  };

  // AVS verification result
  avsResult: {
    compliant: boolean;
    complianceScore: number;      // 0-100 percentage
    attestationId: string;        // On-chain attestation reference
    attestationTxHash: string;
    findings: AVSFinding[];
    verificationTimestamp: number;
  };

  // CFHE deployment result (if not verifyOnly)
  cfheResult?: {
    encryptedBytecodeHash: string;
    deploymentTxHash: string;
    encryptedContractAddress: string;
    blockNumber: number;
    explorerUrl: string;
  };

  // Summary
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

// Error Response
interface CodeVerificationError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  // Partial results if available
  partialResults?: {
    compilation?: CompilationResult;
    avsResult?: Partial<AVSVerifyResult>;
  };
}

type ErrorCode =
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
```

---

## 4. Module Specifications

### 4.1 CompilerModule

**Purpose**: Compile Solidity source code to bytecode.

```typescript
// modules/CompilerModule.ts

import solc from 'solc';

interface CompilerModuleConfig {
  supportedVersions: string[];
  defaultOptimizerRuns: number;
  timeout: number;
}

class CompilerModule implements ICompiler {
  constructor(private config: CompilerModuleConfig) {}

  /**
   * Compile Solidity source code
   */
  async compile(
    sourceCode: string,
    compilerVersion: string,
    optimizerRuns: number = this.config.defaultOptimizerRuns
  ): Promise<CompilationResult> {
    // Validate compiler version
    if (!this.config.supportedVersions.includes(compilerVersion)) {
      return {
        success: false,
        errors: [{
          type: 'UnsupportedCompiler',
          message: `Compiler version ${compilerVersion} not supported`
        }]
      };
    }

    // Load specific compiler version
    const compiler = await this.loadCompiler(compilerVersion);

    // Prepare input
    const input = {
      language: 'Solidity',
      sources: {
        'Hook.sol': { content: sourceCode }
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: optimizerRuns
        },
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
          }
        }
      }
    };

    // Compile
    const output = JSON.parse(compiler.compile(JSON.stringify(input)));

    // Check for errors
    const errors = output.errors?.filter((e: any) => e.severity === 'error') || [];
    const warnings = output.errors?.filter((e: any) => e.severity === 'warning') || [];

    if (errors.length > 0) {
      return {
        success: false,
        errors: errors.map((e: any) => ({
          type: e.type,
          message: e.message,
          formattedMessage: e.formattedMessage
        })),
        warnings
      };
    }

    // Extract bytecode from first contract
    const contracts = output.contracts['Hook.sol'];
    const contractName = Object.keys(contracts)[0];
    const contract = contracts[contractName];

    return {
      success: true,
      bytecode: contract.evm.bytecode.object,
      deployedBytecode: contract.evm.deployedBytecode.object,
      abi: contract.abi,
      warnings
    };
  }

  private async loadCompiler(version: string): Promise<any> {
    // Load specific solc version
    return new Promise((resolve, reject) => {
      solc.loadRemoteVersion(`v${version}`, (err: any, solcSnapshot: any) => {
        if (err) reject(err);
        else resolve(solcSnapshot);
      });
    });
  }

  async getSupportedVersions(): Promise<string[]> {
    return this.config.supportedVersions;
  }
}
```

### 4.2 AVSVerifierModule

**Purpose**: Submit bytecode to AVS operators for specification compliance verification.

```typescript
// modules/AVSVerifierModule.ts

interface AVSVerifierConfig {
  avsContractAddress: string;
  rpcUrl: string;
  minOperatorQuorum: number;
  verificationTimeout: number;  // ms
  stakingTokenAddress: string;
}

class AVSVerifierModule implements IAVSVerifier {
  private contract: ethers.Contract;
  private provider: ethers.Provider;

  constructor(private config: AVSVerifierConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.contract = new ethers.Contract(
      config.avsContractAddress,
      HookVerifierAVSABI,
      this.provider
    );
  }

  /**
   * Submit verification request to AVS
   */
  async verify(request: AVSVerifyRequest): Promise<AVSVerifyResult> {
    // Check required stake
    const requiredStake = await this.getRequiredStake(
      this.estimateSpecComplexity(request.specIpfsCid)
    );

    if (request.stakeAmount < requiredStake) {
      throw new AVSError('INSUFFICIENT_STAKE',
        `Required stake: ${requiredStake}, provided: ${request.stakeAmount}`);
    }

    // Create verification task
    const taskId = await this.createVerificationTask(request);

    // Wait for operator responses (with timeout)
    const result = await this.waitForVerification(taskId);

    return result;
  }

  private async createVerificationTask(request: AVSVerifyRequest): Promise<string> {
    // This would interact with AVS contract to create a task
    // Operators would then fetch bytecode and spec, verify, and submit responses

    const tx = await this.contract.createVerificationTask(
      request.bytecode,
      request.specIpfsCid,
      request.licenseTokenId,
      request.requesterAddress,
      { value: request.stakeAmount }
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === 'TaskCreated'
    );

    return event?.args?.taskId;
  }

  private async waitForVerification(taskId: string): Promise<AVSVerifyResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < this.config.verificationTimeout) {
      const status = await this.getVerificationStatus(taskId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new AVSError('AVS_TIMEOUT', 'Verification timed out');
  }

  async getVerificationStatus(taskId: string): Promise<AVSVerifyResult> {
    const task = await this.contract.getTask(taskId);
    const responses = await this.contract.getTaskResponses(taskId);

    // Aggregate operator responses
    const findings = this.aggregateFindings(responses);
    const complianceScore = this.calculateComplianceScore(responses);
    const compliant = complianceScore >= 95;  // 95% threshold

    return {
      taskId,
      status: task.status,
      compliant,
      complianceScore,
      attestationId: task.attestationId,
      attestationTxHash: task.attestationTxHash,
      findings,
      operatorSignatures: responses.map((r: any) => r.signature),
      timestamp: task.completedAt
    };
  }

  async getRequiredStake(specComplexity: number): Promise<bigint> {
    // Stake increases with spec complexity
    // This creates economic incentive for accurate verification
    const baseStake = await this.contract.baseStakeAmount();
    return baseStake * BigInt(specComplexity);
  }

  private estimateSpecComplexity(specCid: string): number {
    // In production, this would analyze the spec
    // For now, return a default complexity
    return 1;
  }

  private aggregateFindings(responses: any[]): AVSFinding[] {
    // Aggregate findings from all operators
    // Use consensus to filter out false positives
    const findingsMap = new Map<string, { finding: AVSFinding; count: number }>();

    for (const response of responses) {
      for (const finding of response.findings) {
        const key = `${finding.ruleId}:${finding.codeLocation?.startLine}`;
        const existing = findingsMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          findingsMap.set(key, { finding, count: 1 });
        }
      }
    }

    // Only include findings with consensus (>50% of operators)
    const threshold = Math.ceil(responses.length / 2);
    return Array.from(findingsMap.values())
      .filter(({ count }) => count >= threshold)
      .map(({ finding }) => finding);
  }

  private calculateComplianceScore(responses: any[]): number {
    const scores = responses.map((r: any) => r.complianceScore);
    return scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
  }
}
```

### 4.3 CFHEDeployerModule

**Purpose**: Encrypt bytecode and deploy to CFHE network.

```typescript
// modules/CFHEDeployerModule.ts

interface CFHEDeployerConfig {
  networkUrl: string;
  encryptionKeyId: string;
  deployerPrivateKey: string;
  gasLimit: number;
}

class CFHEDeployerModule implements ICFHEDeployer {
  private fheClient: FHEClient;
  private signer: ethers.Wallet;

  constructor(private config: CFHEDeployerConfig) {
    const provider = new ethers.JsonRpcProvider(config.networkUrl);
    this.signer = new ethers.Wallet(config.deployerPrivateKey, provider);
    this.fheClient = new FHEClient(config.networkUrl, config.encryptionKeyId);
  }

  /**
   * Encrypt bytecode using FHE
   */
  async encrypt(bytecode: string): Promise<EncryptionResult> {
    // Get public key for encryption
    const publicKey = await this.fheClient.getPublicKey();

    // Encrypt bytecode
    const encryptedBytecode = await this.fheClient.encrypt(
      Buffer.from(bytecode, 'hex'),
      publicKey
    );

    // Calculate hash of encrypted bytecode
    const encryptedBytecodeHash = ethers.keccak256(encryptedBytecode);

    return {
      encryptedBytecode: encryptedBytecode.toString('hex'),
      encryptedBytecodeHash,
      publicKeyUsed: publicKey,
      encryptionProof: await this.fheClient.getEncryptionProof(encryptedBytecode)
    };
  }

  /**
   * Deploy encrypted bytecode
   */
  async deploy(
    encryptedBytecode: string,
    metadata: DeploymentMetadata
  ): Promise<DeploymentResult> {
    try {
      // Create deployment transaction
      const tx = await this.signer.sendTransaction({
        data: `0x${encryptedBytecode}`,
        gasLimit: this.config.gasLimit
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      // Extract contract address
      const contractAddress = receipt?.contractAddress;

      if (!contractAddress) {
        throw new Error('Contract address not found in receipt');
      }

      // Register deployment in registry (links to license)
      await this.registerDeployment(
        contractAddress,
        metadata.licenseTokenId,
        metadata.specIpfsCid
      );

      return {
        deploymentId: tx.hash,
        status: 'deployed',
        encryptedContractAddress: contractAddress,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };

    } catch (error) {
      return {
        deploymentId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async registerDeployment(
    contractAddress: string,
    licenseTokenId: number,
    specIpfsCid: string
  ): Promise<void> {
    // Register in deployment registry contract
    const registry = new ethers.Contract(
      DEPLOYMENT_REGISTRY_ADDRESS,
      DeploymentRegistryABI,
      this.signer
    );

    await registry.registerDeployment(
      contractAddress,
      licenseTokenId,
      specIpfsCid
    );
  }

  async getDeploymentStatus(deploymentId: string): Promise<DeploymentResult> {
    const receipt = await this.signer.provider?.getTransactionReceipt(deploymentId);

    if (!receipt) {
      return {
        deploymentId,
        status: 'pending'
      };
    }

    return {
      deploymentId,
      status: receipt.status === 1 ? 'deployed' : 'failed',
      encryptedContractAddress: receipt.contractAddress || undefined,
      transactionHash: deploymentId,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed
    };
  }
}
```

### 4.4 LicenseModule

**Purpose**: Validate HookLicense ownership and retrieve spec details.

```typescript
// modules/LicenseModule.ts

interface LicenseModuleConfig {
  contractAddress: string;
  rpcUrl: string;
}

class LicenseModule implements ILicenseValidator {
  private contract: ethers.Contract;

  constructor(private config: LicenseModuleConfig) {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.contract = new ethers.Contract(
      config.contractAddress,
      HookLicenseABI,
      provider
    );
  }

  /**
   * Validate license ownership
   */
  async validateLicense(
    tokenId: number,
    requesterAddress: string
  ): Promise<LicenseValidation> {
    try {
      // Check token exists
      const owner = await this.contract.ownerOf(tokenId);

      // Check ownership
      if (owner.toLowerCase() !== requesterAddress.toLowerCase()) {
        return {
          valid: false,
          owner,
          specIpfsCid: '',
          deprecated: false,
          error: 'License not owned by requester'
        };
      }

      // Get spec details
      const details = await this.getLicenseDetails(tokenId);

      // Check not deprecated
      if (details.deprecated) {
        return {
          valid: false,
          owner,
          specIpfsCid: details.specIpfsCid,
          deprecated: true,
          error: 'License is deprecated'
        };
      }

      return {
        valid: true,
        owner,
        specIpfsCid: details.specIpfsCid,
        deprecated: false
      };

    } catch (error) {
      return {
        valid: false,
        owner: '',
        specIpfsCid: '',
        deprecated: false,
        error: 'License does not exist'
      };
    }
  }

  async getLicenseDetails(tokenId: number): Promise<LicenseDetails> {
    const [name, version, ipfsCid, deprecated, registeredAt] = await Promise.all([
      this.contract.hookName(tokenId),
      this.contract.hookVersion(tokenId),
      this.contract.specCid(tokenId),
      this.contract.isDeprecated(tokenId),
      this.contract.registeredAt(tokenId)
    ]);

    const owner = await this.contract.ownerOf(tokenId);

    return {
      tokenId,
      owner,
      specIpfsCid: ipfsCid,
      hookName: name,
      hookVersion: version,
      registeredAt: Number(registeredAt),
      deprecated
    };
  }
}
```

---

## 5. Main Service Orchestrator

```typescript
// index.ts - HookCodeVerifier main service

interface HookCodeVerifierConfig {
  compiler: CompilerModuleConfig;
  avs: AVSVerifierConfig;
  cfhe: CFHEDeployerConfig;
  license: LicenseModuleConfig;
  signature: SignatureModuleConfig;
}

class HookCodeVerifier {
  private compilerModule: CompilerModule;
  private avsModule: AVSVerifierModule;
  private cfheModule: CFHEDeployerModule;
  private licenseModule: LicenseModule;
  private signatureModule: SignatureModule;

  constructor(config: HookCodeVerifierConfig) {
    this.compilerModule = new CompilerModule(config.compiler);
    this.avsModule = new AVSVerifierModule(config.avs);
    this.cfheModule = new CFHEDeployerModule(config.cfhe);
    this.licenseModule = new LicenseModule(config.license);
    this.signatureModule = new SignatureModule(config.signature);
  }

  /**
   * Main entry point: Verify and deploy hook code
   */
  async verifyAndDeploy(request: CodeSubmissionRequest): Promise<CodeVerificationResult> {
    const { licenseTokenId, sourceCode, compilerVersion, optimizerRuns, signature, verifyOnly } = request;

    // Step 1: Validate signature
    const codeHash = ethers.keccak256(ethers.toUtf8Bytes(sourceCode));
    const recoveredSigner = this.signatureModule.recoverSigner(
      { licenseTokenId, codeHash, compilerVersion, submitter: '', nonce: 0, deadline: 0 },
      signature
    );

    // Step 2: Validate license ownership
    const licenseValidation = await this.licenseModule.validateLicense(
      licenseTokenId,
      recoveredSigner
    );

    if (!licenseValidation.valid) {
      throw new VerifierError(
        licenseValidation.deprecated ? 'LICENSE_DEPRECATED' : 'LICENSE_NOT_OWNED',
        licenseValidation.error || 'License validation failed'
      );
    }

    // Step 3: Compile source code
    const compilation = await this.compilerModule.compile(
      sourceCode,
      compilerVersion,
      optimizerRuns
    );

    if (!compilation.success) {
      throw new VerifierError('COMPILATION_FAILED', 'Compilation failed', {
        errors: compilation.errors
      });
    }

    // Step 4: Submit to AVS for verification
    const avsResult = await this.avsModule.verify({
      bytecode: compilation.bytecode!,
      deployedBytecode: compilation.deployedBytecode!,
      specIpfsCid: licenseValidation.specIpfsCid,
      licenseTokenId,
      requesterAddress: recoveredSigner,
      stakeAmount: await this.avsModule.getRequiredStake(1)
    });

    // Step 5: Deploy to CFHE (if not verify-only and AVS passed)
    let cfheResult: DeploymentResult | undefined;

    if (!verifyOnly && avsResult.compliant) {
      const encryption = await this.cfheModule.encrypt(compilation.deployedBytecode!);

      const licenseDetails = await this.licenseModule.getLicenseDetails(licenseTokenId);

      cfheResult = await this.cfheModule.deploy(encryption.encryptedBytecode, {
        licenseTokenId,
        specIpfsCid: licenseValidation.specIpfsCid,
        hookName: licenseDetails.hookName,
        hookVersion: licenseDetails.hookVersion,
        deployer: recoveredSigner
      });

      if (cfheResult.status === 'failed') {
        throw new VerifierError('CFHE_DEPLOYMENT_FAILED', cfheResult.error || 'Deployment failed');
      }
    }

    // Return result
    const licenseDetails = await this.licenseModule.getLicenseDetails(licenseTokenId);

    return {
      success: true,
      compilation: {
        success: true,
        bytecodeHash: ethers.keccak256(`0x${compilation.bytecode}`),
        deployedBytecodeHash: ethers.keccak256(`0x${compilation.deployedBytecode}`)
      },
      avsResult: {
        compliant: avsResult.compliant,
        complianceScore: avsResult.complianceScore,
        attestationId: avsResult.attestationId!,
        attestationTxHash: avsResult.attestationTxHash!,
        findings: avsResult.findings,
        verificationTimestamp: avsResult.timestamp
      },
      cfheResult: cfheResult ? {
        encryptedBytecodeHash: ethers.keccak256(`0x${cfheResult.encryptedContractAddress}`),
        deploymentTxHash: cfheResult.transactionHash!,
        encryptedContractAddress: cfheResult.encryptedContractAddress!,
        blockNumber: cfheResult.blockNumber!,
        explorerUrl: `https://explorer.inco.org/tx/${cfheResult.transactionHash}`
      } : undefined,
      summary: {
        hookName: licenseDetails.hookName,
        hookVersion: licenseDetails.hookVersion,
        licenseTokenId,
        specIpfsCid: licenseValidation.specIpfsCid,
        submittedAt: Date.now(),
        completedAt: Date.now()
      }
    };
  }
}
```

---

## 6. API Endpoint Implementation

```typescript
// routes/hook.ts

import { Router } from 'express';
import { HookCodeVerifier } from '../services/HookCodeVerifier';

const router = Router();
const verifier = new HookCodeVerifier(config);

/**
 * POST /api/hook/verify
 *
 * Submit hook code for AVS verification and CFHE deployment
 */
router.post('/verify', async (req, res) => {
  try {
    const request: CodeSubmissionRequest = req.body;

    // Validate request shape
    if (!request.licenseTokenId || !request.sourceCode || !request.signature) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: licenseTokenId, sourceCode, signature'
        }
      });
    }

    // Verify and deploy
    const result = await verifier.verifyAndDeploy(request);

    return res.status(200).json(result);

  } catch (error) {
    if (error instanceof VerifierError) {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
    }

    console.error('Unexpected error in /verify:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
});

/**
 * GET /api/hook/verify/:taskId
 *
 * Get verification status for async verification
 */
router.get('/verify/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const status = await verifier.getVerificationStatus(taskId);
    return res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get verification status'
      }
    });
  }
});

export default router;
```

---

## 7. Economic Model

### 7.1 Staking Requirements

```
Protocol Designer (requester) must stake:
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Required Stake = baseStake * specComplexity                       │
│                                                                     │
│  Where:                                                             │
│  - baseStake: Minimum stake (e.g., 0.1 ETH)                        │
│  - specComplexity: Based on number of functions/invariants          │
│                                                                     │
│  Purpose:                                                           │
│  - Prevents spam requests                                           │
│  - Compensates AVS operators for verification work                  │
│  - Creates economic incentive for accurate specifications           │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 AVS Operator Economics

```
AVS Operators:
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Correct Verification:                                              │
│  - Receive portion of requester's stake as reward                  │
│  - Reputation score increases                                       │
│                                                                     │
│  Incorrect Verification (detected via challenge):                   │
│  - Operator's stake is slashed                                      │
│  - Slashed stake goes to challenger                                │
│  - Reputation score decreases                                       │
│                                                                     │
│  This creates:                                                      │
│  - Incentive for thorough verification                             │
│  - Disincentive for lazy/malicious attestations                    │
│  - Self-correcting system via challenges                           │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 8. Summary

**HookCodeVerifier receives:**
```typescript
{
  licenseTokenId: number,     // Proves ownership of spec
  repoUrl: string,            // GitHub repository URL
  branch?: string,            // Optional branch (default: main)
  contractPath?: string,      // Optional path to hook contract
  compilerVersion: string,    // Compiler version
  optimizerRuns?: number,     // Optimizer settings
  signature: string,          // EIP-712 consent
  verifyOnly?: boolean        // Skip deployment
}
```

**HookCodeVerifier returns:**
```typescript
{
  success: true,
  repoAnalysis: {
    repoUrl: string,
    branch: string,
    commitHash: string,
    mainContract: string,
    contractsFound: number
  },
  compilation: {
    success: true,
    bytecodeHash: string,
    deployedBytecodeHash: string
  },
  avsResult: {
    compliant: boolean,
    complianceScore: number,     // 0-100%
    attestationId: string,
    attestationTxHash: string,
    findings: AVSFinding[]
  },
  cfheResult: {
    encryptedBytecodeHash: string,
    deploymentTxHash: string,
    encryptedContractAddress: string,
    explorerUrl: string
  }
}
```

**Modular design via interfaces:**
- `IRepoAnalyzer` - Clone and analyze GitHub repositories
- `ICompiler` - Compile Solidity to bytecode
- `IAVSVerifier` - Verify compliance with staked operators
- `ICFHEDeployer` - Encrypt and deploy to CFHE network
- `ILicenseValidator` - Validate license ownership

Each module can be independently tested, replaced, or upgraded without affecting the others.
