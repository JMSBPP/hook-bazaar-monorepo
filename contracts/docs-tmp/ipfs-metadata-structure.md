# IPFS Metadata Structure for Hook License Descriptions

## Overview

This document defines the structure and content requirements for IPFS-hosted metadata associated with hook licenses. The IPFS content provides verifiable proof of functionality, documentation, audits, and trust indicators that create value beyond the raw bytecode.

---

## 1. IPFS Content Structure

### 1.1 Root Directory Structure

```
hook-license-{hookId}/
├── metadata.json          # Core license metadata
├── documentation/         # Documentation files
│   ├── README.md
│   ├── API.md
│   ├── integration-guide.md
│   └── examples/
├── audits/               # Security audit reports
│   ├── audit-report-1.json
│   ├── audit-report-2.json
│   └── verification-proofs/
├── tests/                # Test suites
│   ├── unit-tests/
│   ├── integration-tests/
│   └── test-results.json
├── reputation/           # Reputation data
│   ├── developer-profile.json
│   └── historical-reviews.json
└── fhenix/               # Fhenix configuration (if applicable)
    ├── encrypted-params.json
    └── access-config.json
```

### 1.2 Core Metadata Schema (`metadata.json`)

```json
{
  "version": "1.0.0",
  "hookId": "bytes32_identifier",
  "developer": {
    "address": "0x...",
    "name": "Developer Name",
    "reputation": {
      "score": 0.95,
      "totalReviews": 150,
      "verifiedAudits": 3,
      "marketplaceTenure": "2024-01-15"
    }
  },
  "hook": {
    "name": "Hook Name",
    "version": "1.2.3",
    "description": "Brief description of hook functionality",
    "category": "liquidity|swap|fee|governance|custom",
    "selectors": {
      "beforeInitialize": true,
      "afterInitialize": false,
      "beforeSwap": true,
      "afterSwap": true,
      "beforeAddLiquidity": false,
      "afterAddLiquidity": false,
      "beforeRemoveLiquidity": false,
      "afterRemoveLiquidity": false,
      "beforeDonate": false,
      "afterDonate": false
    },
    "complexity": "low|medium|high",
    "gasEstimate": {
      "beforeSwap": 50000,
      "afterSwap": 30000
    }
  },
  "pricing": {
    "model": "fixed|revenue-share|hybrid",
    "fixedPrice": "1000000000000000000",
    "revenueShare": {
      "percentage": 5,
      "minimum": "0",
      "maximum": "10"
    },
    "currency": "ETH|USDC|native"
  },
  "license": {
    "type": "commercial|open-source|custom",
    "terms": "ipfs://.../license-terms.md",
    "warranty": true,
    "indemnification": true,
    "redistribution": false,
    "modification": false
  },
  "ipfs": {
    "rootHash": "Qm...",
    "pinned": true,
    "replication": 5,
    "lastUpdated": "2024-12-03T10:00:00Z"
  },
  "fhenix": {
    "required": false,
    "encryptedParams": "ipfs://.../fhenix/encrypted-params.json",
    "accessControl": "license-based"
  }
}
```

---

## 2. Documentation Requirements

### 2.1 README.md

**Required Sections:**
- Overview and purpose
- Key features
- Installation instructions
- Quick start guide
- Configuration options
- Usage examples
- Troubleshooting

**Value Proposition:**
- Licensed users get comprehensive documentation
- Decompiled code lacks this context
- Reduces integration time significantly

### 2.2 API.md

**Required Content:**
- Function signatures
- Parameter descriptions
- Return values
- Error conditions
- Gas costs
- Best practices

**Value Proposition:**
- Clear API documentation saves development time
- Prevents integration errors
- Enables proper usage patterns

### 2.3 Integration Guide

**Required Content:**
- Step-by-step integration instructions
- Code examples for common scenarios
- Compatibility requirements
- Migration guides
- Performance considerations

**Value Proposition:**
- Licensed users get proven integration paths
- Decompiled code requires reverse engineering

### 2.4 Examples Directory

**Required Content:**
- Working code examples
- Test scenarios
- Edge case handling
- Common patterns

**Value Proposition:**
- Licensed users get tested, working examples
- Decompiled code requires experimentation

---

## 3. Audit Reports

### 3.1 Audit Report Schema

```json
{
  "auditId": "audit-001",
  "auditor": {
    "name": "Audit Firm Name",
    "address": "0x...",
    "reputation": 0.98,
    "certification": "certified"
  },
  "date": "2024-11-15",
  "scope": {
    "version": "1.2.3",
    "commitHash": "0x...",
    "files": ["HookFacet.sol", "LibHook.sol"]
  },
  "findings": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 3,
    "informational": 8
  },
  "status": "passed|failed|conditional",
  "reportHash": "0x...",
  "verificationProof": "ipfs://.../verification-proofs/proof-001.json"
}
```

### 3.2 Verification Proofs

**Purpose:** Cryptographic proofs that audits are authentic

**Structure:**
- Auditor signature on audit report
- Timestamp proof
- Reputation attestation
- Chain of custody

**Value Proposition:**
- Licensed users get verified security audits
- Decompiled code has no security guarantees
- Reduces risk significantly

---

## 4. Test Suites

### 4.1 Test Structure

```
tests/
├── unit-tests/
│   ├── HookFacet.test.sol
│   └── LibHook.test.sol
├── integration-tests/
│   ├── PoolIntegration.test.sol
│   └── MultiHook.test.sol
└── test-results.json
```

### 4.2 Test Results Schema

```json
{
  "testSuite": "v1.2.3",
  "date": "2024-12-01",
  "coverage": {
    "statements": 95,
    "branches": 90,
    "functions": 100,
    "lines": 95
  },
  "results": {
    "total": 150,
    "passed": 148,
    "failed": 2,
    "skipped": 0
  },
  "gasReports": {
    "beforeSwap": {
      "average": 45000,
      "min": 42000,
      "max": 48000
    }
  }
}
```

**Value Proposition:**
- Licensed users get verified test coverage
- Decompiled code requires writing tests from scratch
- Ensures reliability and correctness

---

## 5. Reputation Data

### 5.1 Developer Profile

```json
{
  "developerAddress": "0x...",
  "profile": {
    "name": "Developer Name",
    "bio": "Description",
    "website": "https://...",
    "github": "https://github.com/...",
    "verified": true
  },
  "statistics": {
    "totalHooks": 12,
    "totalSales": 450,
    "averageRating": 4.8,
    "totalRevenue": "5000000000000000000000"
  },
  "badges": [
    "verified-developer",
    "audited-hooks",
    "top-seller"
  ]
}
```

### 5.2 Historical Reviews

```json
{
  "reviews": [
    {
      "reviewId": "review-001",
      "buyer": "0x...",
      "rating": 5,
      "comment": "Excellent hook, well documented",
      "date": "2024-11-20",
      "verified": true
    }
  ],
  "aggregate": {
    "averageRating": 4.8,
    "totalReviews": 150,
    "distribution": {
      "5": 120,
      "4": 25,
      "3": 3,
      "2": 1,
      "1": 1
    }
  }
}
```

**Value Proposition:**
- Licensed users can verify developer reputation
- Decompiled code has no reputation context
- Builds trust through transparency

---

## 6. Fhenix Configuration (If Applicable)

### 6.1 Encrypted Parameters

```json
{
  "hookId": "bytes32",
  "encryptedParams": {
    "param1": "encrypted_value_1",
    "param2": "encrypted_value_2"
  },
  "encryptionMethod": "fhenix-homomorphic",
  "accessControl": {
    "type": "license-based",
    "verificationContract": "0x..."
  }
}
```

### 6.2 Access Configuration

```json
{
  "licenseRequired": true,
  "verificationMethod": "on-chain-license-check",
  "decryptionKey": "ipfs://.../fhenix/keys/",
  "accessLog": "ipfs://.../fhenix/access-log.json"
}
```

**Value Proposition:**
- Licensed users get access to encrypted parameters
- Decompiled code cannot access confidential data
- Critical functionality remains protected

---

## 7. IPFS Pinning and Replication

### 7.1 Pinning Strategy

- **Primary Pins:** Marketplace-operated IPFS nodes
- **Secondary Pins:** Developer-operated nodes
- **Replication:** Minimum 5 copies across different nodes
- **Redundancy:** Geographic distribution

### 7.2 Content Addressing

- Use IPFS Content Identifiers (CIDs) for all content
- Maintain manifest file with all CIDs
- Version control through CID updates
- Immutable audit trails

### 7.3 Update Mechanism

- New versions create new CIDs
- Maintain backward compatibility references
- Version history in metadata
- Migration guides for updates

---

## 8. Value Proposition Summary

### 8.1 Licensed Users Receive

1. **Comprehensive Documentation**
   - API references
   - Integration guides
   - Working examples
   - Best practices

2. **Security Assurance**
   - Verified audit reports
   - Test coverage proof
   - Security best practices
   - Vulnerability disclosures

3. **Developer Trust**
   - Reputation scores
   - Historical reviews
   - Verified developer status
   - Market statistics

4. **Ongoing Support**
   - Update notifications
   - Bug fixes
   - Feature additions
   - Community access

5. **Legal Protection**
   - License terms
   - Warranty coverage
   - Indemnification
   - Compliance guarantees

### 8.2 Decompiled Code Lacks

1. No documentation
2. No security audits
3. No test suites
4. No reputation context
5. No support or updates
6. No legal protection
7. No encrypted parameters (if Fhenix used)

### 8.3 Economic Value

The IPFS metadata creates significant economic value:

```
V_ipfs = V_docs + V_audit + V_tests + V_reputation + V_support + V_legal
```

This value makes purchasing licenses economically superior to decompilation, even when bytecode is publicly visible.

---

## 9. Implementation Guidelines

### 9.1 Content Creation

- Developers create IPFS content when listing hooks
- Marketplace validates content structure
- Automated checks for required files
- Quality scoring based on completeness

### 9.2 Content Updates

- Version control through new CIDs
- Backward compatibility maintained
- Update notifications to license holders
- Migration support provided

### 9.3 Content Verification

- Cryptographic proofs for audits
- Reputation attestations
- Developer verification
- Content integrity checks

---

## 10. Integration with HookLicenseDescription

The IPFS content is referenced in the on-chain `HookLicenseDescription` struct:

```solidity
struct HookLicenseDescription {
    bytes32 ipfsKey;        // Root CID of IPFS content
    bytes metadata;         // On-chain metadata summary
    bytes additionalData;   // Fhenix config, pricing, etc.
}
```

The `ipfsKey` points to the root of the IPFS directory structure, enabling clients to fetch all associated content.

---

## Conclusion

The IPFS metadata structure creates a comprehensive value proposition that extends far beyond raw bytecode. By providing documentation, audits, tests, reputation data, and support, licensed hooks become significantly more valuable than decompiled alternatives, ensuring market sustainability even when code is publicly visible.

