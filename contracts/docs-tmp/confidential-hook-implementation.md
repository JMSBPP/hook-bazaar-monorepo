# Confidential Hook Implementation with Fhenix

## Overview

This document specifies the integration of Fhenix confidential computing technology into the Hook Bazaar marketplace. Fhenix enables hooks to execute critical logic in an encrypted/confidential environment, where sensitive parameters are only accessible to licensed users.

---

## 1. Fhenix Integration Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Hook Execution Flow                    │
└─────────────────────────────────────────────────────────┘

1. Hook Bytecode (Public, On-Chain)
   └──> Contains public logic, visible to all

2. Fhenix Encrypted Parameters (Confidential, Off-Chain)
   └──> Stored in Fhenix confidential environment
   └──> Accessible only with valid license

2a. Fhenix Encrypted Bytecode (On-Chain, Encrypted)
   └──> Hook bytecode encrypted before deployment
   └──> Deployed as ciphertext on blockchain
   └──> Decompilation yields encrypted data, not source code
   └──> Decryption keys granted only to licensed users

3. License Verification (On-Chain)
   └──> Validates license before parameter access
   └──> Grants decryption keys to licensed users

4. Confidential Execution (Fhenix)
   └──> Executes hook logic with encrypted parameters
   └──> Returns encrypted results
   └──> Only licensed users can decrypt
```

### 1.2 Key Components

1. **FhenixHookExecutor**: Wrapper contract that interfaces with Fhenix
2. **LicenseVerifier**: On-chain license validation
3. **Encrypted Parameter Storage**: Fhenix-based storage for sensitive data
4. **Access Control**: License-based decryption key management

---

## 2. Fhenix Confidential Computing

### 2.1 What is Fhenix?

Fhenix is a blockchain platform that provides:
- **Homomorphic Encryption**: Compute on encrypted data
- **Confidential Execution**: Execute code in isolated, encrypted environments
- **Access Control**: Fine-grained permission management
- **EVM Compatibility**: Works with existing Solidity code

### 2.2 Use Cases for Hooks

**Sensitive Parameters:**
- Trading algorithms with proprietary logic
- Fee calculation formulas
- Risk management parameters
- Custom pricing models
- Secret keys or credentials

**Value Proposition:**
- Licensed users: Get decryption keys, full functionality
- Decompiled code: Cannot access encrypted parameters, incomplete functionality

---

## 3. Implementation Specification

### 3.1 FhenixHookExecutor Contract

**Purpose:** Wrapper contract that interfaces with Fhenix for confidential execution

**Key Functions:**

```solidity
interface IFhenixHookExecutor {
    /**
     * @notice Execute hook logic in Fhenix confidential environment
     * @param hookAddress The hook contract address
     * @param functionSelector The function to execute
     * @param encryptedParams Encrypted parameters for execution
     * @param licenseProof Proof of valid license
     * @return encryptedResult Encrypted execution result
     */
    function executeConfidential(
        address hookAddress,
        bytes4 functionSelector,
        bytes calldata encryptedParams,
        bytes calldata licenseProof
    ) external returns (bytes memory encryptedResult);
    
    /**
     * @notice Verify license and grant decryption access
     * @param hookId The hook identifier
     * @param licensee The address requesting access
     * @return decryptionKey The decryption key (encrypted)
     */
    function grantDecryptionAccess(
        bytes32 hookId,
        address licensee
    ) external returns (bytes memory decryptionKey);
    
    /**
     * @notice Check if address has access to hook parameters
     * @param hookId The hook identifier
     * @param account The address to check
     * @return hasAccess Whether the account has valid license
     */
    function hasAccess(bytes32 hookId, address account) external view returns (bool);
}
```

### 3.2 LicenseVerifier Contract

**Purpose:** On-chain license validation for Fhenix access control

**Key Functions:**

```solidity
interface ILicenseVerifier {
    /**
     * @notice Verify license for Fhenix access
     * @param hookId The hook identifier
     * @param licensee The address requesting access
     * @param poolId The pool where hook is deployed
     * @return isValid Whether license is valid
     * @return licenseData License information
     */
    function verifyLicense(
        bytes32 hookId,
        address licensee,
        bytes32 poolId
    ) external view returns (bool isValid, LicenseData memory licenseData);
    
    /**
     * @notice Register license purchase
     * @param hookId The hook identifier
     * @param licensee The address purchasing license
     * @param poolId The pool where hook will be deployed
     * @param licenseTerms License terms hash
     */
    function registerLicense(
        bytes32 hookId,
        address licensee,
        bytes32 poolId,
        bytes32 licenseTerms
    ) external;
}
```

### 3.3 Encrypted Parameter Storage

**Structure:**
```
Fhenix Storage:
├── hook-{hookId}/
│   ├── encrypted-params.json
│   │   ├── param1: encrypted_value_1
│   │   ├── param2: encrypted_value_2
│   │   └── ...
│   ├── access-config.json
│   │   ├── licenseRequired: true
│   │   ├── verificationContract: 0x...
│   │   └── accessLog: ipfs://...
│   └── decryption-keys/
│       ├── licensee-0x...: encrypted_key
│       └── ...
```

**Access Control:**
- Parameters encrypted with Fhenix homomorphic encryption
- Decryption keys granted only to licensed users
- Access logged for audit purposes
- Revocation supported for license violations

---

## 4. Integration Flow

### 4.1 Hook Listing with Fhenix

1. **Developer Lists Hook:**
   - Deploys hook bytecode (public)
   - Encrypts sensitive parameters using Fhenix
   - Stores encrypted parameters in Fhenix
   - Registers hook with `requiresFhenix = true`

2. **Marketplace Registration:**
   - Validates Fhenix configuration
   - Stores Fhenix access control contract address
   - Links encrypted parameter hash to hook

### 4.2 License Purchase Flow

1. **Buyer Purchases License:**
   - Pays license fee
   - License registered on-chain
   - LicenseVerifier updates access list

2. **Decryption Key Grant:**
   - LicenseVerifier verifies purchase
   - FhenixHookExecutor grants decryption access
   - Encrypted decryption key provided to buyer
   - Buyer can now decrypt parameters

### 4.3 Hook Execution Flow

1. **Hook Called:**
   - Standard hook function called
   - FhenixHookExecutor intercepts call

2. **License Verification:**
   - LicenseVerifier checks license validity
   - Verifies pool deployment authorization
   - Confirms access rights

3. **Confidential Execution:**
   - Encrypted parameters retrieved from Fhenix
   - Hook logic executed in Fhenix environment
   - Result encrypted and returned

4. **Result Decryption:**
   - Licensed user decrypts result using key
   - Unlicensed users cannot decrypt

---

## 5. Security Considerations

### 5.1 Access Control

**Multi-Layer Protection:**
1. **On-Chain License Check**: Verifies license exists
2. **Fhenix Access Control**: Validates decryption permissions
3. **Pool-Specific Authorization**: Ensures hook deployed to authorized pool
4. **Time-Based Expiration**: Licenses can have expiration

### 5.2 Parameter Protection

**Encryption:**
- Parameters encrypted with Fhenix homomorphic encryption
- Keys managed by Fhenix access control
- No plaintext exposure on-chain

**Key Management:**
- Decryption keys encrypted and stored securely
- Keys granted only to licensed users
- Revocation supported for violations

### 5.3 Attack Mitigation

**Decompilation Attacks:**
- Decompiled bytecode lacks encrypted parameters
- Cannot execute without decryption keys
- Incomplete functionality without license

**License Violations:**
- On-chain detection of unauthorized use
- Automatic revocation of access
- Slashing of deposits for violations

---

## 6. Economic Mechanism Integration

### 6.1 Value Proposition

**Licensed Users:**
- Full access to encrypted parameters
- Complete hook functionality
- Decryption keys provided
- Ongoing support and updates

**Decompiled Code:**
- No access to encrypted parameters
- Incomplete functionality
- Cannot decrypt results
- No support or updates

### 6.2 Pricing Model

**Fhenix-Enabled Hooks:**
- May command premium pricing
- Confidential parameters add value
- Access control creates exclusivity
- Network effects from licensed ecosystem

### 6.3 Revenue Share

**For Revenue-Share Hooks:**
- Licensed users: Full revenue share eligibility
- Unlicensed use: No revenue distribution
- Access control ensures only licensed users benefit

---

## 7. Implementation Details

### 7.1 Fhenix Integration Points

**Required Fhenix Features:**
- Homomorphic encryption for parameters
- Confidential execution environment
- Access control and key management
- EVM-compatible interface

**Integration Contracts:**
- `FhenixHookExecutor.sol`: Main executor contract
- `LicenseVerifier.sol`: License validation
- `FhenixAccessControl.sol`: Access management

### 7.2 Hook Modification

**Standard Hook:**
```solidity
function beforeSwap(...) external {
    // Public logic
    uint256 result = publicCalculation();
    // ...
}
```

**Fhenix-Enabled Hook:**
```solidity
function beforeSwap(...) external {
    // Public logic
    uint256 publicResult = publicCalculation();
    
    // Confidential logic (requires license)
    bytes memory encryptedResult = fhenixExecutor.executeConfidential(
        address(this),
        this.confidentialCalculation.selector,
        encryptedParams,
        licenseProof
    );
    
    // Decrypt result (only licensed users can)
    uint256 confidentialResult = decrypt(encryptedResult);
    // ...
}
```

### 7.3 License Proof Format

```solidity
struct LicenseProof {
    bytes32 hookId;
    bytes32 poolId;
    address licensee;
    uint256 licenseId;
    bytes signature;  // Signature from LicenseVerifier
    uint64 expiration;  // License expiration timestamp
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

- License verification logic
- Access control checks
- Parameter encryption/decryption
- Key management

### 8.2 Integration Tests

- End-to-end license purchase flow
- Fhenix execution flow
- Access revocation
- Multi-user scenarios

### 8.3 Security Tests

- Unauthorized access attempts
- License forgery attempts
- Parameter extraction attempts
- Key compromise scenarios

---

## 9. Deployment Considerations

### 9.1 Fhenix Network Setup

- Deploy Fhenix access control contracts
- Configure encryption parameters
- Set up key management infrastructure
- Establish monitoring and logging

### 9.2 Migration Path

- Existing hooks: Optional Fhenix integration
- New hooks: Can opt-in to Fhenix
- Backward compatibility maintained
- Gradual adoption supported

### 9.3 Cost Considerations

- Fhenix execution costs
- Storage costs for encrypted parameters
- Key management overhead
- Monitoring and maintenance

---

## 10. Future Enhancements

### 10.1 Advanced Features

- Multi-party computation for complex hooks
- Time-locked parameter access
- Gradual parameter revelation
- Zero-knowledge proofs for license verification

### 10.2 Performance Optimization

- Caching of decrypted parameters
- Batch license verification
- Optimized encryption schemes
- Reduced gas costs

---

## Conclusion

Fhenix integration provides a powerful mechanism for protecting sensitive hook parameters while maintaining public bytecode visibility. By requiring licenses for parameter access, the system creates economic value that makes purchasing licenses superior to decompilation, even when bytecode is publicly available.

The combination of:
- Public bytecode (for transparency and verification)
- Encrypted parameters (for protection)
- License-based access (for economic sustainability)

Creates a sustainable marketplace model that protects developer intellectual property while enabling protocol innovation.

