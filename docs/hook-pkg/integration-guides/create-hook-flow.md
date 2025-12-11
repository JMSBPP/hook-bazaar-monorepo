# Create Hook Flow: End-to-End Development Guide

> **Status:** Architecture Design
> **Last Updated:** 2025-12-10
> **Prerequisites:** [CoFHE Hook Template](./cofhe-hook-template.md), [AVS Verification System](../architecture/avs-verification-system.md)
> **References:** [IHooks Interface](https://github.com/Uniswap/v4-core), [State-Space Model](../mathematical-models/state-space-model.md)

---

## 1. Overview

This document provides a complete end-to-end guide for hook developers to create, deploy, and verify hooks on the Hook Bazaar marketplace. The flow ensures:

1. **IHooks Compliance**: Full compatibility with Uniswap V4 PoolManager
2. **IHookStateView Compliance**: AVS operators can verify behavior
3. **Code Obfuscation**: Bytecode protected via Fhenix CoFHE
4. **Revenue Management**: Developer APIs for revenue collection
5. **Marketplace Listing**: Verified hooks can be discovered and used

---

## 2. Complete Development Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HOOK DEVELOPMENT LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  PHASE 1: SPECIFICATION                                         │       │
│   │  ─────────────────────────                                      │       │
│   │  1.1 Define State Variables (H)                                 │       │
│   │  1.2 Define State Transitions f_i(H, P) → (H', Δ)              │       │
│   │  1.3 Define Invariants                                          │       │
│   │  1.4 Create Test Vectors                                        │       │
│   │  1.5 Upload Specification to IPFS                               │       │
│   └────────────────────────────────────┬────────────────────────────┘       │
│                                        │                                     │
│                                        ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  PHASE 2: IMPLEMENTATION                                        │       │
│   │  ──────────────────────────                                     │       │
│   │  2.1 Extend CoFHEHookTemplate                                   │       │
│   │  2.2 Implement IHooks callbacks                                 │       │
│   │  2.3 Add encrypted state using FHE.sol                          │       │
│   │  2.4 Implement IHookStateView getters                           │       │
│   │  2.5 Implement revenue accrual logic                            │       │
│   └────────────────────────────────────┬────────────────────────────┘       │
│                                        │                                     │
│                                        ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  PHASE 3: TESTING                                               │       │
│   │  ─────────────────                                              │       │
│   │  3.1 Unit tests with CoFHE mock contracts                       │       │
│   │  3.2 Integration tests with mock PoolManager                    │       │
│   │  3.3 Verify state transitions match specification               │       │
│   │  3.4 Test revenue accrual and withdrawal                        │       │
│   │  3.5 Test verifier access control                               │       │
│   └────────────────────────────────────┬────────────────────────────┘       │
│                                        │                                     │
│                                        ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  PHASE 4: DEPLOYMENT                                            │       │
│   │  ───────────────────                                            │       │
│   │  4.1 Deploy to Fhenix testnet                                   │       │
│   │  4.2 Verify contract on explorer                                │       │
│   │  4.3 Register AVS verifier operators                            │       │
│   │  4.4 Deploy to mainnet                                          │       │
│   └────────────────────────────────────┬────────────────────────────┘       │
│                                        │                                     │
│                                        ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  PHASE 5: ATTESTATION                                           │       │
│   │  ────────────────────                                           │       │
│   │  5.1 Request attestation via HookAttestationTaskManager         │       │
│   │  5.2 AVS operators verify behavior against specification        │       │
│   │  5.3 Receive attestation certificate                            │       │
│   │  5.4 Attestation recorded in AttestationRegistry                │       │
│   └────────────────────────────────────┬────────────────────────────┘       │
│                                        │                                     │
│                                        ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  PHASE 6: MARKETPLACE LISTING                                   │       │
│   │  ────────────────────────────                                   │       │
│   │  6.1 List hook in HookMarket                                    │       │
│   │  6.2 Set pricing and terms                                      │       │
│   │  6.3 Protocols discover and integrate                           │       │
│   │  6.4 Collect revenue via withdrawRevenue()                      │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1: Specification

### 3.1 Specification Document Structure

Create a formal specification document following this template:

```markdown
# Hook Specification: [HookName] v[Version]

## 1. Hook Identity
- **Name:** [HookName]
- **Version:** [SemVer]
- **Author:** [Developer Address]
- **Hook Address:** [To be filled after deployment]
- **Specification Hash:** [Keccak256 of this document]

## 2. Callbacks Implemented

| Callback | Enabled | Description |
|----------|:-------:|-------------|
| beforeInitialize | [Yes/No] | [Description] |
| afterInitialize | [Yes/No] | [Description] |
| beforeAddLiquidity | [Yes/No] | [Description] |
| afterAddLiquidity | [Yes/No] | [Description] |
| beforeRemoveLiquidity | [Yes/No] | [Description] |
| afterRemoveLiquidity | [Yes/No] | [Description] |
| beforeSwap | [Yes/No] | [Description] |
| afterSwap | [Yes/No] | [Description] |
| beforeDonate | [Yes/No] | [Description] |
| afterDonate | [Yes/No] | [Description] |

## 3. State Variables

### 3.1 Hook State (H)
| Variable | Type | Encrypted | Description |
|----------|------|:---------:|-------------|
| [varName] | [type] | [Yes/No] | [Description] |

### 3.2 Pool State Dependencies (P)
- **Reads:** [List state variables read]
- **Writes:** [List state variables written]

## 4. State Transition Functions

### 4.1 [CallbackName](H, P) → (H', Δ)

**Preconditions:**
- [Condition 1]
- [Condition 2]

**Transition Equations:**

$$
[Variable]' = f([inputs])
$$

**Postconditions:**
- [Condition 1]
- [Condition 2]

### 4.2 [NextCallback]...

## 5. Invariants

### INV-1: [Invariant Name]
$$
[Mathematical Expression]
$$
**Description:** [What this invariant ensures]

### INV-2: [Next Invariant]...

## 6. Test Vectors

| ID | Pre-State | Input | Expected Post-State | Expected Return |
|----|-----------|-------|---------------------|-----------------|
| TV-1 | { H, P } | { params } | { H', P' } | { return } |
| TV-2 | ... | ... | ... | ... |

## 7. Gas Bounds

| Callback | Max Gas | Typical Gas |
|----------|---------|-------------|
| [callback] | [max] | [typical] |

## 8. Security Considerations

- [Consideration 1]
- [Consideration 2]

## 9. Revenue Model

| Source | Calculation | Recipient |
|--------|-------------|-----------|
| [source] | [formula] | [address] |
```

### 3.2 Upload to IPFS

```typescript
// scripts/upload-specification.ts
import { create } from 'ipfs-http-client';
import * as fs from 'fs';

async function uploadSpecification() {
    // Read specification
    const specPath = './specification.md';
    const specContent = fs.readFileSync(specPath, 'utf8');

    // Connect to IPFS
    const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

    // Upload
    const result = await ipfs.add(specContent);
    const ipfsURI = `ipfs://${result.path}`;

    console.log('Specification uploaded:', ipfsURI);

    // Compute hash for on-chain verification
    const specHash = ethers.keccak256(ethers.toUtf8Bytes(specContent));
    console.log('Specification hash:', specHash);

    return { ipfsURI, specHash };
}

uploadSpecification();
```

---

## 4. Phase 2: Implementation

### 4.1 IHooks Interface Compliance

Every hook MUST implement the IHooks interface callbacks it enables:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

/// @title IHooks Compliance Checklist
/// @notice All hooks MUST implement enabled callbacks correctly
interface IHooksCompliance {

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Called before pool initialization
    /// @dev MUST return this.beforeInitialize.selector
    /// @param sender The address initializing the pool
    /// @param key The pool configuration
    /// @param sqrtPriceX96 Initial sqrt price
    function beforeInitialize(
        address sender,
        PoolKey calldata key,
        uint160 sqrtPriceX96
    ) external returns (bytes4);

    /// @notice Called after pool initialization
    /// @dev MUST return this.afterInitialize.selector
    function afterInitialize(
        address sender,
        PoolKey calldata key,
        uint160 sqrtPriceX96,
        int24 tick
    ) external returns (bytes4);

    // ═══════════════════════════════════════════════════════════════════════
    // LIQUIDITY CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Called before adding liquidity
    /// @dev MUST return this.beforeAddLiquidity.selector
    function beforeAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4);

    /// @notice Called after adding liquidity
    /// @dev Returns selector + optional BalanceDelta for hook's token delta
    function afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) external returns (bytes4, BalanceDelta);

    /// @notice Called before removing liquidity
    function beforeRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4);

    /// @notice Called after removing liquidity
    function afterRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) external returns (bytes4, BalanceDelta);

    // ═══════════════════════════════════════════════════════════════════════
    // SWAP CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Called before swap execution
    /// @dev Can modify fee via return value
    /// @return selector Function selector
    /// @return beforeSwapDelta Hook's delta (if enabled)
    /// @return lpFeeOverride Fee override (if bit 23 set)
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4, BeforeSwapDelta, uint24);

    /// @notice Called after swap execution
    /// @return selector Function selector
    /// @return hookDelta Hook's unspecified currency delta (if enabled)
    function afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external returns (bytes4, int128);

    // ═══════════════════════════════════════════════════════════════════════
    // DONATE CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    function beforeDonate(
        address sender,
        PoolKey calldata key,
        uint256 amount0,
        uint256 amount1,
        bytes calldata hookData
    ) external returns (bytes4);

    function afterDonate(
        address sender,
        PoolKey calldata key,
        uint256 amount0,
        uint256 amount1,
        bytes calldata hookData
    ) external returns (bytes4);
}
```

### 4.2 Hook Address Requirements

Uniswap V4 hooks MUST be deployed to specific addresses where the least significant bits encode enabled callbacks:

```solidity
/// @title Hook Address Flags
/// @notice Bit positions for hook permissions
library HookAddressFlags {
    // Permission flags (from least significant bit)
    uint160 constant BEFORE_INITIALIZE_FLAG = 1 << 13;
    uint160 constant AFTER_INITIALIZE_FLAG = 1 << 12;
    uint160 constant BEFORE_ADD_LIQUIDITY_FLAG = 1 << 11;
    uint160 constant AFTER_ADD_LIQUIDITY_FLAG = 1 << 10;
    uint160 constant BEFORE_REMOVE_LIQUIDITY_FLAG = 1 << 9;
    uint160 constant AFTER_REMOVE_LIQUIDITY_FLAG = 1 << 8;
    uint160 constant BEFORE_SWAP_FLAG = 1 << 7;
    uint160 constant AFTER_SWAP_FLAG = 1 << 6;
    uint160 constant BEFORE_DONATE_FLAG = 1 << 5;
    uint160 constant AFTER_DONATE_FLAG = 1 << 4;
    uint160 constant BEFORE_SWAP_RETURNS_DELTA_FLAG = 1 << 3;
    uint160 constant AFTER_SWAP_RETURNS_DELTA_FLAG = 1 << 2;
    uint160 constant AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG = 1 << 1;
    uint160 constant AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG = 1 << 0;

    /// @notice Calculate required address suffix for given permissions
    function calculateAddressSuffix(
        bool beforeInitialize,
        bool afterInitialize,
        bool beforeAddLiquidity,
        bool afterAddLiquidity,
        bool beforeRemoveLiquidity,
        bool afterRemoveLiquidity,
        bool beforeSwap,
        bool afterSwap,
        bool beforeDonate,
        bool afterDonate
    ) internal pure returns (uint160 suffix) {
        if (beforeInitialize) suffix |= BEFORE_INITIALIZE_FLAG;
        if (afterInitialize) suffix |= AFTER_INITIALIZE_FLAG;
        if (beforeAddLiquidity) suffix |= BEFORE_ADD_LIQUIDITY_FLAG;
        if (afterAddLiquidity) suffix |= AFTER_ADD_LIQUIDITY_FLAG;
        if (beforeRemoveLiquidity) suffix |= BEFORE_REMOVE_LIQUIDITY_FLAG;
        if (afterRemoveLiquidity) suffix |= AFTER_REMOVE_LIQUIDITY_FLAG;
        if (beforeSwap) suffix |= BEFORE_SWAP_FLAG;
        if (afterSwap) suffix |= AFTER_SWAP_FLAG;
        if (beforeDonate) suffix |= BEFORE_DONATE_FLAG;
        if (afterDonate) suffix |= AFTER_DONATE_FLAG;
    }
}
```

### 4.3 Mining Hook Address

Use CREATE2 to deploy hooks to addresses with correct permission flags:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title HookDeployer
/// @notice Deploy hooks to addresses with correct permission flags
contract HookDeployer {

    event HookDeployed(address hook, bytes32 salt, uint160 flags);

    /// @notice Find a salt that produces an address with required flags
    /// @param bytecodeHash Keccak256 of hook creation bytecode
    /// @param requiredFlags The permission flags needed in the address
    /// @return salt The salt to use with CREATE2
    /// @return hookAddress The resulting hook address
    function findSalt(
        bytes32 bytecodeHash,
        uint160 requiredFlags
    ) external view returns (bytes32 salt, address hookAddress) {
        uint256 nonce = 0;
        uint160 mask = (1 << 14) - 1; // 14 LSBs

        while (true) {
            salt = keccak256(abi.encodePacked(msg.sender, nonce));
            hookAddress = address(uint160(uint256(keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                bytecodeHash
            )))));

            // Check if address has required flags
            if ((uint160(hookAddress) & mask) == requiredFlags) {
                return (salt, hookAddress);
            }

            nonce++;
            require(nonce < 1000000, "Salt not found");
        }
    }

    /// @notice Deploy hook using CREATE2
    /// @param salt Salt for CREATE2
    /// @param bytecode Hook creation bytecode
    /// @return hook Deployed hook address
    function deploy(
        bytes32 salt,
        bytes calldata bytecode
    ) external returns (address hook) {
        assembly {
            hook := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(hook != address(0), "Deployment failed");

        emit HookDeployed(hook, salt, uint160(hook) & ((1 << 14) - 1));
    }
}
```

### 4.4 Complete Implementation Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CoFHEHookTemplate} from "./CoFHEHookTemplate.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {FHE, euint32, euint256, ebool} from "@fhenix/fhenix-contracts/contracts/FHE.sol";

/// @title MyCoFHEHook
/// @notice Example implementation following create-hook flow
/// @dev Implements dynamic fee based on volatility with encrypted parameters
contract MyCoFHEHook is CoFHEHookTemplate {
    using PoolIdLibrary for PoolKey;

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED STATE (Step 2.3)
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Pool ID => Last sqrt price
    mapping(PoolId => uint160) private _lastPrice;

    /// @dev Pool ID => Cumulative volume (encrypted)
    mapping(PoolId => euint256) private _encryptedVolume;

    /// @dev Pool ID => Fee tier parameters (encrypted)
    struct EncryptedFeeTiers {
        euint32 lowVolatilityFee;   // Fee when volatility < threshold1
        euint32 midVolatilityFee;   // Fee when threshold1 <= volatility < threshold2
        euint32 highVolatilityFee;  // Fee when volatility >= threshold2
        euint32 threshold1;         // Low/mid boundary
        euint32 threshold2;         // Mid/high boundary
    }
    mapping(PoolId => EncryptedFeeTiers) private _feeTiers;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor(
        IPoolManager poolManager_,
        address developer_,
        string memory specificationURI_,
        bytes32 specificationHash_
    ) CoFHEHookTemplate(
        poolManager_,
        developer_,
        specificationURI_,
        specificationHash_
    ) {}

    // ═══════════════════════════════════════════════════════════════════════
    // HOOK PERMISSIONS (Step 2.2)
    // ═══════════════════════════════════════════════════════════════════════

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: true,   // Initialize fee tiers
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,         // Compute dynamic fee
            afterSwap: true,          // Update volume metrics & revenue
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // IHOOKS CALLBACKS (Step 2.2)
    // ═══════════════════════════════════════════════════════════════════════

    function beforeInitialize(
        address sender,
        PoolKey calldata key,
        uint160 sqrtPriceX96
    ) external override poolManagerOnly returns (bytes4) {
        PoolId poolId = key.toId();

        // Initialize encrypted fee tiers
        _feeTiers[poolId] = EncryptedFeeTiers({
            lowVolatilityFee: FHE.asEuint32(500),    // 0.05%
            midVolatilityFee: FHE.asEuint32(3000),   // 0.30%
            highVolatilityFee: FHE.asEuint32(10000), // 1.00%
            threshold1: FHE.asEuint32(100),          // 1% volatility
            threshold2: FHE.asEuint32(500)           // 5% volatility
        });

        // Grant contract permission to operate on encrypted values
        FHE.allowThis(_feeTiers[poolId].lowVolatilityFee);
        FHE.allowThis(_feeTiers[poolId].midVolatilityFee);
        FHE.allowThis(_feeTiers[poolId].highVolatilityFee);
        FHE.allowThis(_feeTiers[poolId].threshold1);
        FHE.allowThis(_feeTiers[poolId].threshold2);

        // Initialize last price
        _lastPrice[poolId] = sqrtPriceX96;

        // Initialize encrypted volume
        _encryptedVolume[poolId] = FHE.asEuint256(0);
        FHE.allowThis(_encryptedVolume[poolId]);

        return this.beforeInitialize.selector;
    }

    function beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) external override poolManagerOnly returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId poolId = key.toId();

        // Calculate volatility
        uint160 currentPrice = _getCurrentPrice(poolId);
        uint160 lastPrice = _lastPrice[poolId];
        uint32 volatility = _calculateVolatility(lastPrice, currentPrice);

        // Select fee tier based on volatility using encrypted comparison
        euint32 encryptedVolatility = FHE.asEuint32(volatility);
        EncryptedFeeTiers storage tiers = _feeTiers[poolId];

        // Encrypted tier selection
        ebool isLow = FHE.lt(encryptedVolatility, tiers.threshold1);
        ebool isMid = FHE.and(
            FHE.gte(encryptedVolatility, tiers.threshold1),
            FHE.lt(encryptedVolatility, tiers.threshold2)
        );

        // Select fee: low if isLow, mid if isMid, else high
        euint32 selectedFee = FHE.select(
            isLow,
            tiers.lowVolatilityFee,
            FHE.select(isMid, tiers.midVolatilityFee, tiers.highVolatilityFee)
        );

        // Decrypt for PoolManager return
        uint24 lpFeeOverride = uint24(FHE.decrypt(selectedFee));

        // Update last price
        _lastPrice[poolId] = currentPrice;

        return (
            this.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            lpFeeOverride | 0x400000 // Set override flag
        );
    }

    function afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external override poolManagerOnly returns (bytes4, int128) {
        PoolId poolId = key.toId();

        // Calculate swap amount
        uint256 swapAmount = params.amountSpecified > 0
            ? uint256(params.amountSpecified)
            : uint256(-params.amountSpecified);

        // Update encrypted volume
        euint256 volumeDelta = FHE.asEuint256(swapAmount);
        _encryptedVolume[poolId] = FHE.add(_encryptedVolume[poolId], volumeDelta);
        FHE.allowThis(_encryptedVolume[poolId]);

        // Calculate and accrue revenue (Step 2.5)
        // Hook takes 5% of the fee charged
        uint256 hookRevenue = (swapAmount * 3000 / 1000000) * 5 / 100;

        address revenueToken = params.zeroForOne
            ? Currency.unwrap(key.currency0)
            : Currency.unwrap(key.currency1);

        _accrueRevenue(revenueToken, hookRevenue);

        return (this.afterSwap.selector, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // IHOOKSTATEVIEW GETTERS (Step 2.4)
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc CoFHEHookTemplate
    function _getAdditionalState(PoolId poolId) internal view override returns (bytes memory) {
        // Return decrypted state for authorized verifiers
        EncryptedFeeTiers storage tiers = _feeTiers[poolId];

        return abi.encode(
            _lastPrice[poolId],
            FHE.decrypt(tiers.lowVolatilityFee),
            FHE.decrypt(tiers.midVolatilityFee),
            FHE.decrypt(tiers.highVolatilityFee),
            FHE.decrypt(tiers.threshold1),
            FHE.decrypt(tiers.threshold2),
            FHE.decrypt(_encryptedVolume[poolId])
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    function _getCurrentPrice(PoolId poolId) internal view returns (uint160) {
        (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(poolId);
        return sqrtPriceX96;
    }

    function _calculateVolatility(
        uint160 lastPrice,
        uint160 currentPrice
    ) internal pure returns (uint32) {
        if (lastPrice == 0) return 0;

        uint256 priceDiff = currentPrice > lastPrice
            ? currentPrice - lastPrice
            : lastPrice - currentPrice;

        // Return volatility in basis points (0.01% = 1)
        uint256 volatilityBps = (priceDiff * 10000) / lastPrice;
        return volatilityBps > type(uint32).max ? type(uint32).max : uint32(volatilityBps);
    }
}
```

---

## 5. Phase 3: Testing

### 5.1 Test Suite Structure

```
test/
├── unit/
│   ├── MyCoFHEHook.test.ts       # Core functionality
│   ├── EncryptedState.test.ts    # FHE operations
│   └── RevenueManager.test.ts    # Revenue functions
├── integration/
│   ├── PoolManager.test.ts       # PoolManager integration
│   └── AVSVerification.test.ts   # Verifier access
└── specification/
    └── Compliance.test.ts        # Spec compliance tests
```

### 5.2 Specification Compliance Tests

```typescript
// test/specification/Compliance.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadSpecification, TestVector } from "../utils/specification";

describe("Specification Compliance", function() {
    let hook: Contract;
    let specification: any;
    let testVectors: TestVector[];

    beforeEach(async function() {
        // Load specification from IPFS or local file
        specification = await loadSpecification("./specification.md");
        testVectors = specification.testVectors;

        // Deploy hook
        // ... deployment code
    });

    describe("Test Vectors", function() {
        testVectors.forEach((tv, index) => {
            it(`should pass test vector TV-${index + 1}`, async function() {
                // Setup pre-state
                await setupState(hook, tv.preState);

                // Execute callback
                const result = await executeCallback(
                    hook,
                    tv.callback,
                    tv.input
                );

                // Verify post-state matches expected
                const postState = await getState(hook, tv.poolId);

                for (const [key, expected] of Object.entries(tv.expectedPostState)) {
                    expect(postState[key]).to.be.closeTo(
                        expected,
                        tv.tolerance || 0,
                        `State variable ${key} mismatch`
                    );
                }

                // Verify return value
                if (tv.expectedReturn) {
                    expect(result).to.deep.equal(tv.expectedReturn);
                }
            });
        });
    });

    describe("Invariants", function() {
        specification.invariants.forEach((inv: any) => {
            it(`should maintain ${inv.name}`, async function() {
                // Generate random inputs
                const inputs = generateRandomInputs(100);

                for (const input of inputs) {
                    const preState = await getState(hook, input.poolId);

                    // Execute callback
                    await executeCallback(hook, input.callback, input.params);

                    const postState = await getState(hook, input.poolId);

                    // Check invariant
                    const holds = evaluateInvariant(inv.expression, preState, postState);
                    expect(holds).to.be.true;
                }
            });
        });
    });
});
```

---

## 6. Phase 4: Deployment

### 6.1 Deployment Script

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";
import { HookDeployer__factory } from "../typechain-types";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 1. Get specification details
    const specificationURI = process.env.SPECIFICATION_URI!;
    const specificationHash = process.env.SPECIFICATION_HASH!;

    // 2. Get PoolManager address for network
    const poolManagerAddress = getPoolManagerAddress(network.name);

    // 3. Calculate required hook address flags
    // beforeInitialize (bit 13), beforeSwap (bit 7), afterSwap (bit 6)
    const requiredFlags = (1 << 13) | (1 << 7) | (1 << 6);

    // 4. Deploy HookDeployer
    const HookDeployer = await ethers.getContractFactory("HookDeployer");
    const hookDeployer = await HookDeployer.deploy();
    await hookDeployer.waitForDeployment();

    // 5. Get hook bytecode
    const MyCoFHEHook = await ethers.getContractFactory("MyCoFHEHook");
    const bytecode = MyCoFHEHook.bytecode + ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "string", "bytes32"],
        [poolManagerAddress, deployer.address, specificationURI, specificationHash]
    ).slice(2);

    const bytecodeHash = ethers.keccak256(bytecode);

    // 6. Find salt for correct address
    console.log("Finding salt for address with flags:", requiredFlags.toString(16));
    const { salt, hookAddress } = await hookDeployer.findSalt(bytecodeHash, requiredFlags);
    console.log("Found salt:", salt);
    console.log("Hook will deploy to:", hookAddress);

    // 7. Deploy hook
    const tx = await hookDeployer.deploy(salt, bytecode);
    await tx.wait();

    console.log("Hook deployed to:", hookAddress);

    // 8. Verify on explorer
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("Verifying contract...");
        await hre.run("verify:verify", {
            address: hookAddress,
            constructorArguments: [
                poolManagerAddress,
                deployer.address,
                specificationURI,
                specificationHash
            ]
        });
    }

    // 9. Register AVS verifiers
    const hook = MyCoFHEHook.attach(hookAddress);
    const avsOperators = getAVSOperators(network.name);

    for (const operator of avsOperators) {
        await hook.setVerifierAuthorization(operator, true);
        console.log("Authorized verifier:", operator);
    }

    // 10. Save deployment info
    saveDeployment({
        hook: hookAddress,
        deployer: deployer.address,
        specificationURI,
        specificationHash,
        network: network.name,
        timestamp: Date.now()
    });

    console.log("\nDeployment complete!");
    console.log("Next steps:");
    console.log("1. Request attestation via HookAttestationTaskManager");
    console.log("2. Wait for AVS verification");
    console.log("3. List in HookMarket");
}

main().catch(console.error);
```

---

## 7. Phase 5: Attestation

### 7.1 Request Attestation

```typescript
// scripts/request-attestation.ts
import { ethers } from "hardhat";

async function requestAttestation() {
    const [developer] = await ethers.getSigners();

    // Get deployed contracts
    const hookAddress = process.env.HOOK_ADDRESS!;
    const taskManagerAddress = getTaskManagerAddress(network.name);

    const taskManager = await ethers.getContractAt(
        "IHookAttestationTaskManager",
        taskManagerAddress
    );

    // Get pools using this hook
    const poolIds = await getPoolsUsingHook(hookAddress);

    // Specify callbacks to verify
    const callbacks = [
        "0x34fcd5be", // beforeInitialize
        "0x8b803435", // beforeSwap
        "0x9f5d7a8d"  // afterSwap
    ];

    // Create attestation task
    const tx = await taskManager.createAttestationTask(
        hookAddress,
        process.env.SPECIFICATION_URI!,
        poolIds,
        callbacks,
        100 // Number of state samples
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find(
        (log: any) => log.fragment?.name === "AttestationTaskCreated"
    );

    const taskIndex = event.args.taskIndex;
    console.log("Attestation task created:", taskIndex);
    console.log("Waiting for operator verification...");

    // Monitor for response
    await waitForAttestationResponse(taskManager, taskIndex);
}

async function waitForAttestationResponse(
    taskManager: Contract,
    taskIndex: number
) {
    return new Promise((resolve, reject) => {
        taskManager.on("AttestationTaskResponded", (index, response, metadata) => {
            if (index === taskIndex) {
                if (response.specCompliant) {
                    console.log("Attestation successful!");
                    console.log("Invariants verified:", response.invariantsVerified);
                    resolve(response);
                } else {
                    console.log("Attestation failed!");
                    console.log("Invariants failed:", response.invariantsFailed);
                    reject(new Error("Hook does not comply with specification"));
                }
            }
        });

        // Timeout after 1 hour
        setTimeout(() => reject(new Error("Attestation timeout")), 3600000);
    });
}

requestAttestation().catch(console.error);
```

---

## 8. Phase 6: Marketplace Listing

### 8.1 List Hook

```typescript
// scripts/list-hook.ts
import { ethers } from "hardhat";

async function listHook() {
    const [developer] = await ethers.getSigners();

    const hookAddress = process.env.HOOK_ADDRESS!;
    const hookMarketAddress = getHookMarketAddress(network.name);

    const hookMarket = await ethers.getContractAt("HookMarket", hookMarketAddress);

    // Verify attestation exists
    const attestationRegistry = await ethers.getContractAt(
        "AttestationRegistry",
        getAttestationRegistryAddress(network.name)
    );

    const isAttested = await attestationRegistry.isHookAttested(hookAddress);
    if (!isAttested) {
        throw new Error("Hook must have valid attestation before listing");
    }

    // Prepare listing metadata
    const metadata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "string", "string[]"],
        [
            "Dynamic Fee Hook",                    // Name
            "Volatility-based dynamic fee hook",   // Description
            ["DeFi", "Fee", "Dynamic", "CoFHE"]   // Tags
        ]
    );

    // List hook
    const listingPrice = ethers.parseEther("0.1"); // Price per integration
    const tx = await hookMarket.listHook(hookAddress, listingPrice, metadata);
    await tx.wait();

    console.log("Hook listed successfully!");
    console.log("Listing price:", ethers.formatEther(listingPrice), "ETH");
}

listHook().catch(console.error);
```

### 8.2 Monitor Revenue

```typescript
// scripts/monitor-revenue.ts
import { ethers } from "hardhat";

async function monitorRevenue() {
    const [developer] = await ethers.getSigners();
    const hookAddress = process.env.HOOK_ADDRESS!;

    const hook = await ethers.getContractAt("ICoFHEHook", hookAddress);

    // Get supported tokens
    const tokens = [
        ethers.ZeroAddress,                        // ETH
        "0x...",                                   // USDC
        "0x..."                                    // WETH
    ];

    console.log("\nPending Revenue:");
    console.log("================");

    let totalValueUSD = 0;

    for (const token of tokens) {
        const balance = await hook.pendingRevenue(token);
        const tokenSymbol = token === ethers.ZeroAddress ? "ETH" : await getTokenSymbol(token);
        const tokenPrice = await getTokenPrice(token);
        const valueUSD = Number(ethers.formatEther(balance)) * tokenPrice;

        console.log(`${tokenSymbol}: ${ethers.formatEther(balance)} (~$${valueUSD.toFixed(2)})`);
        totalValueUSD += valueUSD;
    }

    console.log("================");
    console.log(`Total: ~$${totalValueUSD.toFixed(2)}`);

    // Option to withdraw
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("\nWithdraw all revenue? (y/n): ", async (answer: string) => {
        if (answer.toLowerCase() === "y") {
            for (const token of tokens) {
                const balance = await hook.pendingRevenue(token);
                if (balance > 0) {
                    await hook.withdrawRevenue(token, balance, developer.address);
                    console.log(`Withdrawn ${ethers.formatEther(balance)} ${token === ethers.ZeroAddress ? "ETH" : await getTokenSymbol(token)}`);
                }
            }
        }
        rl.close();
    });
}

monitorRevenue().catch(console.error);
```

---

## 9. Quick Reference Checklist

### Pre-Development
- [ ] Read State-Space Model documentation
- [ ] Understand IHooks interface requirements
- [ ] Plan state variables and transitions
- [ ] Identify which callbacks are needed

### Phase 1: Specification
- [ ] Define all state variables (H)
- [ ] Define state transitions for each callback
- [ ] Define invariants
- [ ] Create comprehensive test vectors
- [ ] Upload specification to IPFS
- [ ] Save specification hash

### Phase 2: Implementation
- [ ] Extend CoFHEHookTemplate
- [ ] Implement getHookPermissions()
- [ ] Implement all enabled callbacks
- [ ] Add encrypted state using FHE.sol
- [ ] Implement _getAdditionalState()
- [ ] Add revenue accrual in afterSwap/afterAddLiquidity
- [ ] Call FHE.allowThis() on all encrypted values

### Phase 3: Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] All test vectors pass
- [ ] Invariants hold for random inputs
- [ ] Revenue accrual works correctly
- [ ] Verifier access control works

### Phase 4: Deployment
- [ ] Find correct salt for hook address
- [ ] Deploy to testnet first
- [ ] Verify contract on explorer
- [ ] Register AVS verifiers
- [ ] Test on testnet pools
- [ ] Deploy to mainnet

### Phase 5: Attestation
- [ ] Submit attestation request
- [ ] Wait for operator verification
- [ ] Receive attestation certificate
- [ ] Verify attestation in registry

### Phase 6: Marketplace
- [ ] List hook in HookMarket
- [ ] Set pricing and terms
- [ ] Monitor for integrations
- [ ] Collect revenue regularly

---

## 10. References

1. **[IHooks]** Uniswap. *v4-core IHooks Interface*. https://github.com/Uniswap/v4-core
2. **[CoFHE Template]** Hook Bazaar. *CoFHE Hook Template*. `docs/hook-pkg/integration-guides/cofhe-hook-template.md`
3. **[AVS Verification]** Hook Bazaar. *AVS Verification System*. `docs/hook-pkg/architecture/avs-verification-system.md`
4. **[State-Space Model]** Hook Bazaar. *Hook State-Space Model*. `docs/hook-pkg/mathematical-models/state-space-model.md`
5. **[Fhenix CoFHE]** Fhenix Protocol. *CoFHE Documentation*. https://cofhe-docs.fhenix.zone/
