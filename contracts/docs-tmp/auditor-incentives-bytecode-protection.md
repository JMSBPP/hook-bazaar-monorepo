# Auditor Incentive Mechanism and Bytecode Obfuscation with Fhenix

## Overview

This document addresses two critical security concerns in the Hook Bazaar marketplace:

1. **Auditor Information Leakage**: Designing economic mechanisms to ensure auditors behave honestly and don't leak hook code information
2. **Bytecode Obfuscation**: Using Fhenix to encrypt/obfuscate bytecode on-chain to prevent decompilation

Both mechanisms work together to protect hook intellectual property while maintaining auditability and functionality verification.

---

## Part 1: Auditor Incentive Mechanism Design

### 1.1 The Auditor Dilemma

**Problem Statement:**
- Auditors need access to hook source code to perform security reviews
- Auditors have economic incentives to leak code information (bribes, competitive advantage)
- Code leakage undermines marketplace sustainability
- System must ensure auditors prefer honest behavior over leakage

**Stakeholders:**
- **Hook Developer**: Wants code audited but not leaked
- **Auditor**: Wants audit fees but may leak for additional profit
- **Marketplace**: Needs audits for trust but must prevent leakage
- **Buyers**: Need audit assurance but don't want leaked code

### 1.2 Game-Theoretic Model

**Players:**
1. **Developer** (D): Submits code for audit
2. **Auditor** (A): Reviews code, can leak or be honest
3. **Marketplace** (M): Enforces mechanisms

**Strategies:**
- **Developer**: Submit code, pay audit fee, stake deposit
- **Auditor**: Audit honestly, stake deposit, OR leak code, risk slashing
- **Marketplace**: Monitor, verify, enforce penalties

**Payoffs:**
```
Developer:
- Honest audit: -AuditFee - Deposit + TrustValue
- Code leaked: -AuditFee - Deposit - CodeValue

Auditor:
- Audit honestly: AuditFee + Deposit - AuditCost
- Leak code: AuditFee + Bribe - SlashingPenalty - ReputationLoss
```

### 1.3 Dual-Deposit Escrow for Auditors

**Mechanism Design (Inspired by Asgaonkar & Krishnamachari, 2018):**

**Phase 1: Audit Initiation**
```
1. Developer submits hook code (encrypted) to marketplace
2. Developer stakes deposit D_dev
3. Auditor stakes deposit D_auditor
4. Marketplace grants temporary access to auditor
```

**Phase 2: Audit Execution**
```
1. Auditor reviews code in isolated environment
2. Auditor generates audit report
3. Auditor submits report hash (commitment)
4. Marketplace verifies report format
```

**Phase 3: Report Publication**
```
1. Auditor reveals full audit report
2. Marketplace verifies report matches commitment
3. Developer reviews audit report
4. Developer accepts or disputes
```

**Phase 4: Settlement**
```
If Developer accepts:
  - Auditor receives: AuditFee + D_auditor (refund)
  - Developer receives: D_dev (refund)
  - Marketplace: Verifies no leakage detected

If Developer disputes:
  - Marketplace investigates
  - If leakage detected: Slash D_auditor, refund D_dev
  - If false dispute: Slash D_dev, refund D_auditor
```

### 1.4 Leakage Detection Mechanism

**Multi-Layer Detection:**

**1. Cryptographic Watermarking:**
```solidity
struct AuditedCode {
    bytes32 codeHash;
    bytes32 watermark;  // Unique watermark per auditor
    bytes32 auditReportHash;
    uint256 timestamp;
}
```

- Each auditor receives code with unique watermark
- Watermark embedded in code structure
- Leaked code can be traced to specific auditor
- Cryptographic proof of leakage source

**2. Reputation System:**
```solidity
struct AuditorReputation {
    address auditor;
    uint256 totalAudits;
    uint256 successfulAudits;
    uint256 leakageIncidents;
    uint256 reputationScore;
    uint256 stakedAmount;
}
```

- Track auditor history
- Penalize leakage incidents
- Reward honest behavior
- Reputation affects future audit opportunities

**3. Economic Penalties:**
```solidity
// Slashing mechanism
function slashAuditor(address auditor, uint256 amount) external {
    require(leakageDetected(auditor), "No leakage detected");
    auditorReputation[auditor].stakedAmount -= amount;
    auditorReputation[auditor].leakageIncidents++;
    // Transfer slashed amount to developer as compensation
    payable(developer).transfer(amount);
}
```

### 1.5 Incentive Compatibility Conditions

**For Auditor Honesty:**

**Condition 1: Slashing Penalty > Leakage Benefit**
```
SlashingPenalty > Bribe + LeakageValue
D_auditor > Bribe + LeakageValue
```

**Condition 2: Reputation Value > Leakage Benefit**
```
FutureAuditValue > Bribe
ReputationScore * AvgAuditFee * ExpectedAudits > Bribe
```

**Condition 3: Detection Probability**
```
ExpectedPenalty = DetectionProbability * SlashingPenalty
ExpectedPenalty > Bribe
```

**Combined Condition:**
```
D_auditor + (ReputationValue * DetectionProbability) > Bribe + LeakageValue
```

### 1.6 Implementation: AuditorEscrow Contract

```solidity
contract AuditorEscrow {
    struct AuditRequest {
        bytes32 hookId;
        address developer;
        address auditor;
        bytes32 encryptedCodeHash;
        bytes32 reportCommitment;
        uint256 developerDeposit;
        uint256 auditorDeposit;
        uint256 auditFee;
        AuditStatus status;
    }
    
    enum AuditStatus {
        Pending,
        InProgress,
        ReportCommitted,
        ReportRevealed,
        Accepted,
        Disputed,
        LeakageDetected
    }
    
    mapping(bytes32 => AuditRequest) public audits;
    mapping(address => AuditorReputation) public auditorReputation;
    
    /**
     * @notice Initiate audit with dual deposits
     */
    function initiateAudit(
        bytes32 hookId,
        address auditor,
        bytes32 encryptedCodeHash
    ) external payable {
        require(msg.value >= auditFee + developerDeposit, "Insufficient payment");
        
        AuditRequest storage audit = audits[hookId];
        audit.developer = msg.sender;
        audit.auditor = auditor;
        audit.encryptedCodeHash = encryptedCodeHash;
        audit.developerDeposit = developerDeposit;
        audit.auditFee = auditFee;
        audit.status = AuditStatus.Pending;
        
        // Require auditor to stake
        require(
            auditorReputation[auditor].stakedAmount >= auditorDeposit,
            "Auditor must stake deposit"
        );
        audit.auditorDeposit = auditorDeposit;
        audit.status = AuditStatus.InProgress;
    }
    
    /**
     * @notice Commit audit report (prevents auditor from changing)
     */
    function commitReport(
        bytes32 hookId,
        bytes32 reportHash
    ) external {
        AuditRequest storage audit = audits[hookId];
        require(msg.sender == audit.auditor, "Only auditor");
        require(audit.status == AuditStatus.InProgress, "Invalid status");
        
        audit.reportCommitment = reportHash;
        audit.status = AuditStatus.ReportCommitted;
    }
    
    /**
     * @notice Reveal full audit report
     */
    function revealReport(
        bytes32 hookId,
        bytes calldata fullReport
    ) external {
        AuditRequest storage audit = audits[hookId];
        require(msg.sender == audit.auditor, "Only auditor");
        require(audit.status == AuditStatus.ReportCommitted, "Invalid status");
        
        bytes32 computedHash = keccak256(fullReport);
        require(computedHash == audit.reportCommitment, "Hash mismatch");
        
        audit.status = AuditStatus.ReportRevealed;
    }
    
    /**
     * @notice Developer accepts audit
     */
    function acceptAudit(bytes32 hookId) external {
        AuditRequest storage audit = audits[hookId];
        require(msg.sender == audit.developer, "Only developer");
        require(audit.status == AuditStatus.ReportRevealed, "Invalid status");
        
        // Refund deposits
        payable(audit.auditor).transfer(audit.auditFee + audit.auditorDeposit);
        payable(audit.developer).transfer(audit.developerDeposit);
        
        // Update reputation
        auditorReputation[audit.auditor].successfulAudits++;
        auditorReputation[audit.auditor].reputationScore += 10;
        
        audit.status = AuditStatus.Accepted;
    }
    
    /**
     * @notice Detect and penalize code leakage
     */
    function detectLeakage(
        bytes32 hookId,
        address suspectedAuditor,
        bytes calldata proof
    ) external {
        AuditRequest storage audit = audits[hookId];
        require(verifyLeakageProof(proof, audit.encryptedCodeHash), "Invalid proof");
        
        // Slash auditor deposit
        uint256 slashedAmount = audit.auditorDeposit;
        auditorReputation[suspectedAuditor].stakedAmount -= slashedAmount;
        auditorReputation[suspectedAuditor].leakageIncidents++;
        auditorReputation[suspectedAuditor].reputationScore = 0; // Reset reputation
        
        // Compensate developer
        payable(audit.developer).transfer(slashedAmount);
        
        audit.status = AuditStatus.LeakageDetected;
    }
}
```

---

## Part 2: Bytecode Obfuscation/Encryption with Fhenix

### 2.1 The Decompilation Problem

**Challenge:**
- Hook bytecode deployed on-chain is publicly visible
- Determined attackers can decompile bytecode to source code
- Decompilation cost may be less than license purchase price
- Need to make decompilation economically unviable

**Solution:**
- Use Fhenix to encrypt/obfuscate bytecode on-chain
- Deployed bytecode is encrypted ciphertext
- Only licensed users can decrypt and execute
- Decompiled code is useless without decryption keys

### 2.2 Fhenix Bytecode Encryption Architecture

**Concept:**
Instead of deploying plain bytecode, deploy **encrypted bytecode** that:
1. Appears as ciphertext on-chain
2. Requires decryption key to execute
3. Keys granted only to licensed users
4. Decompilation yields encrypted data, not source code

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│        Fhenix Bytecode Encryption Flow          │
└─────────────────────────────────────────────────┘

1. Hook Source Code (Private)
   └──> Developer's original implementation

2. Compilation to Bytecode
   └──> Standard Solidity compilation

3. Fhenix Encryption
   ├──> Encrypt bytecode using Fhenix homomorphic encryption
   ├──> Generate encrypted bytecode (ciphertext)
   └──> Create decryption keys (one per license)

4. On-Chain Deployment
   ├──> Deploy encrypted bytecode (visible as ciphertext)
   ├──> Store encryption metadata
   └──> No plain bytecode on-chain

5. License-Based Decryption
   ├──> Licensed users receive decryption keys
   ├──> Decrypt bytecode at execution time
   └──> Execute decrypted bytecode in Fhenix TEE

6. Decompilation Attempt
   ├──> Attacker sees encrypted ciphertext
   ├──> Cannot decrypt without key
   └──> Decompilation yields garbage/encrypted data
```

### 2.3 Implementation Strategy

**Option 1: Full Bytecode Encryption**
- Encrypt entire hook bytecode
- Deploy encrypted version on-chain
- Decrypt in Fhenix TEE before execution
- **Pros**: Maximum protection
- **Cons**: Higher gas costs, execution overhead

**Option 2: Selective Encryption (Recommended)**
- Encrypt only critical/sensitive parts
- Public interface remains unencrypted
- Core logic encrypted
- **Pros**: Balance of protection and performance
- **Cons**: Some code still visible

**Option 3: Hybrid Approach**
- Public bytecode: Standard deployment (interface, non-sensitive logic)
- Encrypted bytecode: Critical algorithms, parameters
- Runtime: Combine both in Fhenix TEE
- **Pros**: Best balance
- **Cons**: More complex integration

### 2.4 Fhenix Encrypted Bytecode Contract

```solidity
contract FhenixEncryptedHook {
    struct EncryptedBytecode {
        bytes encryptedCode;        // Encrypted hook bytecode
        bytes32 encryptionKeyHash;  // Hash of encryption key
        bytes32 hookId;             // Hook identifier
        address developer;          // Developer address
        bool requiresLicense;       // Whether license required
    }
    
    mapping(bytes32 => EncryptedBytecode) public encryptedHooks;
    mapping(bytes32 => mapping(address => bytes)) public decryptionKeys; // hookId => licensee => key
    
    /**
     * @notice Deploy encrypted hook bytecode
     */
    function deployEncryptedHook(
        bytes32 hookId,
        bytes calldata encryptedBytecode,
        bytes32 encryptionKeyHash
    ) external {
        encryptedHooks[hookId] = EncryptedBytecode({
            encryptedCode: encryptedBytecode,
            encryptionKeyHash: encryptionKeyHash,
            hookId: hookId,
            developer: msg.sender,
            requiresLicense: true
        });
    }
    
    /**
     * @notice Grant decryption key to licensed user
     */
    function grantDecryptionKey(
        bytes32 hookId,
        address licensee,
        bytes calldata encryptedKey,
        bytes calldata licenseProof
    ) external {
        require(verifyLicense(hookId, licensee, licenseProof), "Invalid license");
        
        // Store encrypted decryption key
        decryptionKeys[hookId][licensee] = encryptedKey;
        
        emit DecryptionKeyGranted(hookId, licensee);
    }
    
    /**
     * @notice Execute hook with encrypted bytecode
     */
    function executeEncryptedHook(
        bytes32 hookId,
        bytes calldata functionCall,
        bytes calldata fhenixProof
    ) external returns (bytes memory result) {
        EncryptedBytecode storage hook = encryptedHooks[hookId];
        require(hook.requiresLicense, "License not required");
        
        // Verify license
        require(
            decryptionKeys[hookId][msg.sender].length > 0,
            "No decryption key"
        );
        
        // Execute in Fhenix TEE
        // 1. Decrypt bytecode using key
        // 2. Execute decrypted bytecode
        // 3. Return encrypted result
        
        bytes memory decryptionKey = decryptionKeys[hookId][msg.sender];
        result = fhenixExecutor.executeEncryptedBytecode(
            hook.encryptedCode,
            decryptionKey,
            functionCall,
            fhenixProof
        );
        
        return result;
    }
}
```

### 2.5 Fhenix TEE Execution Flow

**Step-by-Step:**

1. **Bytecode Encryption (Development)**
   ```python
   # Developer encrypts bytecode
   hook_bytecode = compile_hook(source_code)
   encrypted_bytecode = fhenix.encrypt(hook_bytecode, encryption_key)
   deploy_to_blockchain(encrypted_bytecode)
   ```

2. **License Purchase (Marketplace)**
   ```solidity
   // Buyer purchases license
   purchaseLicense(hookId, poolId);
   // Marketplace grants decryption key
   grantDecryptionKey(hookId, buyer, encrypted_key);
   ```

3. **Hook Execution (Runtime)**
   ```solidity
   // Hook called
   hook.beforeSwap(...);
   
   // Fhenix TEE:
   // 1. Receives encrypted bytecode from blockchain
   // 2. Receives decryption key (if licensed)
   // 3. Decrypts bytecode in secure environment
   // 4. Executes decrypted bytecode
   // 5. Returns encrypted result
   ```

4. **Decompilation Attempt (Attacker)**
   ```python
   # Attacker tries to decompile
   bytecode = get_bytecode_from_blockchain(hook_address)
   # Result: encrypted ciphertext, not source code
   decompiled = decompile(bytecode)  # Yields garbage/encrypted data
   # Cannot execute without decryption key
   ```

### 2.6 Economic Mechanism Integration

**Value Proposition:**

**Licensed Users:**
- Receive decryption keys
- Can execute full functionality
- Access to encrypted bytecode execution
- Support and updates

**Decompilers:**
- See only encrypted ciphertext
- Cannot decrypt without keys
- Decompilation yields useless data
- No execution capability

**Economic Condition:**
```
DecompilationCost + DecryptionCost + ExecutionCost > LicensePrice
```

Since decryption is cryptographically infeasible without keys, the condition becomes:
```
DecompilationCost + ∞ > LicensePrice
```

This makes decompilation economically unviable.

### 2.7 Hybrid: Public Interface + Encrypted Core

**Recommended Architecture:**

```solidity
contract HybridEncryptedHook {
    // Public interface (unencrypted)
    bytes public publicInterface;  // Standard hook interface
    
    // Encrypted core logic
    bytes public encryptedCoreLogic;  // Critical algorithms encrypted
    
    function beforeSwap(...) external {
        // Public validation logic (unencrypted)
        validateInputs(...);
        
        // Encrypted core logic (requires license)
        bytes memory result = executeEncryptedCore(
            encryptedCoreLogic,
            functionSelector,
            inputs
        );
        
        // Process result
        processResult(result);
    }
}
```

**Benefits:**
- Public interface enables standard hook integration
- Core logic protected by encryption
- Performance optimized (only core encrypted)
- Economic value maintained

---

## Part 3: Combined Protection Mechanism

### 3.1 Integrated Architecture

**Complete Flow:**

```
┌─────────────────────────────────────────────────┐
│     Combined Auditor + Bytecode Protection      │
└─────────────────────────────────────────────────┘

1. Development Phase
   ├──> Developer writes hook code
   ├──> Encrypts bytecode with Fhenix
   └──> Submits encrypted code for audit

2. Audit Phase (Protected)
   ├──> Auditor receives encrypted code + watermark
   ├──> Audits in isolated Fhenix environment
   ├──> Generates audit report (no code access after)
   ├──> Dual deposits ensure honest behavior
   └──> Watermarking enables leakage detection

3. Deployment Phase
   ├──> Encrypted bytecode deployed on-chain
   ├──> Public interface visible (for integration)
   ├──> Core logic encrypted (ciphertext)
   └──> Decryption keys managed by marketplace

4. License Purchase
   ├──> Buyer purchases license
   ├──> Receives decryption key (encrypted)
   ├──> Key stored in Fhenix access control
   └──> License verified on-chain

5. Execution Phase
   ├──> Hook called by pool
   ├──> License verified on-chain
   ├──> Decryption key retrieved from Fhenix
   ├──> Bytecode decrypted in Fhenix TEE
   ├──> Hook executed in secure environment
   └──> Result encrypted and returned

6. Decompilation Attempt
   ├──> Attacker extracts bytecode from blockchain
   ├──> Sees encrypted ciphertext (not source)
   ├──> Cannot decrypt without key
   ├──> Decompilation yields garbage
   └──> Economically unviable
```

### 3.2 Security Guarantees

**Auditor Protection:**
- ✅ Code encrypted during audit
- ✅ Watermarking enables leakage detection
- ✅ Economic penalties for leakage
- ✅ Reputation system enforces honesty

**Bytecode Protection:**
- ✅ Encrypted bytecode on-chain
- ✅ Decryption keys license-based
- ✅ Execution in Fhenix TEE
- ✅ Decompilation yields ciphertext

**Combined Protection:**
- ✅ Multi-layer security
- ✅ Defense in depth
- ✅ Economic disincentives
- ✅ Cryptographic guarantees

### 3.3 Economic Sustainability

**Conditions for Sustainability:**

1. **Auditor Honesty:**
   ```
   D_auditor + ReputationValue > Bribe + LeakageValue
   ```

2. **Bytecode Protection:**
   ```
   DecompilationCost + DecryptionCost > LicensePrice
   DecryptionCost = ∞ (without key)
   ```

3. **Combined:**
   ```
   (AuditCost + LicensePrice) < (DecompilationCost + DecryptionCost + LeakageRisk)
   ```

**Market Equilibrium:**
- Auditors prefer honest behavior (economic incentives)
- Decompilers cannot extract useful code (encryption)
- Licensed users get full functionality (decryption keys)
- Developers receive fair compensation (premium pricing)

---

## Part 4: Implementation Roadmap

### Phase 1: Auditor Mechanism (Months 1-2)
- Implement AuditorEscrow contract
- Build watermarking system
- Create reputation tracking
- Test with pilot audits

### Phase 2: Bytecode Encryption (Months 3-4)
- Integrate Fhenix encryption
- Build encrypted deployment system
- Implement key management
- Test encrypted execution

### Phase 3: Integration (Months 5-6)
- Combine auditor + encryption mechanisms
- Build unified marketplace
- Optimize performance
- Security audits

### Phase 4: Production (Months 7+)
- Deploy to mainnet
- Monitor and adjust parameters
- Scale infrastructure
- Iterate based on feedback

---

## Conclusion

The combination of:
1. **Auditor incentive mechanisms** (dual deposits, watermarking, reputation)
2. **Fhenix bytecode encryption** (encrypted deployment, license-based keys)

Creates a robust protection system that:
- Prevents auditor information leakage through economic incentives
- Makes bytecode decompilation economically unviable through encryption
- Maintains auditability and functionality verification
- Ensures market sustainability

Both mechanisms work synergistically to protect hook intellectual property while enabling a thriving marketplace ecosystem.

