# Issue: Hook Bytecode Confidentiality Layer Implementation

## Title

**Implement Confidentiality Layer for Hook Bytecode Protection Using Fhenix and Access Control**

## Motivation

### Problem Statement

Hook developers face a critical challenge in the Hook Bazaar marketplace: when hook bytecode is deployed on-chain, it becomes publicly visible and can be easily decompiled by attackers, leading to intellectual property theft. This creates a fundamental market sustainability problem:


- If decompilation cost (`C_decompile`) is lower than license purchase price (`P`), protocols will decompile instead of purchasing
- Without bytecode protection, developers cannot monetize their intellectual property
- The marketplace becomes economically unsustainable

### Current State

- Hook bytecode is [deployed on-chain](https://github.com/hook-bazaar/monorepo/blob/e0e1bfe9bda95d712f06f6c3698f36bb64d20e5a/contracts/hook-pkg/src/facets/HookFactoryFacet.sol#L54) and publicly visible
- [Decompilation tools](https://youtu.be/bdF_jmOjA9M?t=32) can extract and reverse-engineer hook logic

### Desired Outcome

Create a **Confidentiality Layer** that:
1. **Protects hook bytecode intellectual property** through obfuscation/encryption
2. **Enables full functionality for licensed users** via controlled access
3. **Maintains on-chain deployment** for verification and trust

This is system requirement: *"Protect hook bytecode intellectual property through Fhenix-based obfuscation and encryption, ensuring that decompilation attempts yield encrypted ciphertext rather than usable source code."*


### Sugegested Project structure

```txt
contracts/
  confidentiality_layer-pkg/
scripts/
  confidentiality_layer-pkg/
src/
  confidentiality_layer-pkg/
test/
  confidentiality_layer-pkg/
```

Since Fhenix uses Hardhat, use the `hardhat-foundry` package and ensure you include `node_modules` in your `foundry.toml`.

```toml
lib = ["lib", "node-modules"]
```

## Key Specifications

### 1. Hook Confidentiality Service

**Service**: `HookBytecodeEncryption`

**Requirements**:
- Encrypt hook state variables and sensitive data using Fhenix FHE (`euint8`, `euint32`, etc.)
- Encrypt access control keys and license parameters using Fhenix FHE
- Use Fhenix permit system for access control to encrypted data
- Ensure decompilation of on-chain contracts yields only encrypted state variables, not hook logic

### 2. License Verification and Key Distribution

**Service**: `LicenseVerificationAndKeyDistribution`

**Requirements**:
- Verify protocol administrator holds valid license for hook + pool combination
- Distribute decryption keys (encrypted) to licensed users upon verification (these can be auditors or validators who might need access to the full raw source code to validate security and functionality)
- Prevent unauthorized access attempts

### Key Services to Implement

1. `HookBytecodeEncryption` - Core encryption service
2. `LicenseVerificationAndKeyDistribution` - Access control


## Notes

- This issue focuses on the **Confidentiality Layer** package (encryption, obfuscation, access control)
- Market mechanisms  are separate concerns

