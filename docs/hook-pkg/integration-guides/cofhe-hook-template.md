# CoFHE Hook Template: Obfuscated Hook Development Guide

> **Status:** Architecture Design
> **Last Updated:** 2025-12-10
> **Prerequisites:** [State-Space Model](../mathematical-models/state-space-model.md), [AVS Verification System](../architecture/avs-verification-system.md)
> **References:** [Fhenix CoFHE Docs](https://cofhe-docs.fhenix.zone/), [IHooks Interface](https://github.com/Uniswap/v4-core/blob/main/src/interfaces/IHooks.sol)

---

## 1. Overview

This document specifies the **CoFHE Hook Template** - a standardized framework for developing Uniswap V4 hooks with bytecode obfuscation using Fhenix Fully Homomorphic Encryption (FHE). The template ensures:

1. **Code Obfuscation**: Deployed bytecode is encrypted, preventing decompilation and IP theft
2. **IHooks Compliance**: Full compatibility with Uniswap V4 PoolManager
3. **IHookStateView Compliance**: AVS operators can verify behavior without seeing source code
4. **Revenue Management**: Hook developers have APIs to manage revenue flows
5. **Third-Party Verification**: Authorized parties can verify functionality cryptographically

---

## 2. Architecture Overview

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COFHE HOOK ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────┐      ┌─────────────────────┐                      │
│   │   Hook Developer    │      │   Protocol Admin    │                      │
│   │   (Code Author)     │      │   (Integrator)      │                      │
│   └─────────┬───────────┘      └─────────┬───────────┘                      │
│             │                            │                                   │
│             │ Deploys                    │ Integrates                        │
│             ▼                            ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │                 OBFUSCATED HOOK CONTRACT                 │               │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │               │
│   │  │  IHooks     │  │IHookState   │  │ Revenue     │      │               │
│   │  │  Interface  │  │View Compat  │  │ Manager     │      │               │
│   │  └─────────────┘  └─────────────┘  └─────────────┘      │               │
│   │            ▲               ▲               ▲             │               │
│   │            │               │               │             │               │
│   │  ┌─────────┴───────────────┴───────────────┴──────────┐ │               │
│   │  │              ENCRYPTED CORE LOGIC                   │ │               │
│   │  │     (FHE.sol encrypted state & computation)         │ │               │
│   │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │               │
│   │  │  │ euint256 │  │ ebool    │  │ eaddress │          │ │               │
│   │  │  │ states   │  │ flags    │  │ access   │          │ │               │
│   │  │  └──────────┘  └──────────┘  └──────────┘          │ │               │
│   │  └────────────────────────────────────────────────────┘ │               │
│   └─────────────────────────────────────────────────────────┘               │
│                              │                                               │
│                              │ State Access                                  │
│                              ▼                                               │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │                   IHookStateView                         │               │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │               │
│   │  │ getLPState   │  │ getTraderSt  │  │ getHookState │   │               │
│   │  │ (public)     │  │ (public)     │  │ (authorized) │   │               │
│   │  └──────────────┘  └──────────────┘  └──────────────┘   │               │
│   └─────────────────────────────────────────────────────────┘               │
│                              │                                               │
│                              │ Verification                                  │
│                              ▼                                               │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │              HOOKATTESTATIONAVS (Off-Chain)              │               │
│   │  - Samples state via IHookStateView                      │               │
│   │  - Verifies behavior matches specification               │               │
│   │  - Does NOT see decrypted source code                    │               │
│   └─────────────────────────────────────────────────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
                    ┌─────────────────────┐
                    │  Hook Specification │
                    │  (IPFS - Public)    │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ AVS Operators │    │ Protocol Admin  │    │ Hook Developer  │
│ (Verifiers)   │    │ (Integrators)   │    │ (Owner)         │
└───────┬───────┘    └────────┬────────┘    └────────┬────────┘
        │                     │                      │
        │ Verify              │ Use                  │ Manage
        │ Behavior            │ Hook                 │ Revenue
        ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    OBFUSCATED HOOK                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PUBLIC INTERFACE LAYER                  │   │
│  │   IHooks callbacks (beforeSwap, afterSwap, etc.)     │   │
│  │   IHookStateView getters (state sampling)            │   │
│  │   IRevenueManager (revenue withdrawal)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ENCRYPTED LOGIC LAYER                   │   │
│  │   FHE.sol operations on encrypted state              │   │
│  │   Access control via allowThis/allowSender           │   │
│  │   Decryption only with explicit permission           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Template Contract Structure

### 3.1 Base Template Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {FHE, euint256, euint128, euint32, ebool} from "@fhenix/fhenix-contracts/contracts/FHE.sol";

/// @title ICoFHEHook
/// @notice Base interface for CoFHE-obfuscated hooks
/// @dev All hooks using the CoFHE template MUST implement this interface
interface ICoFHEHook is IHooks {

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Emitted when revenue is withdrawn by the hook developer
    event RevenueWithdrawn(
        address indexed recipient,
        address indexed token,
        uint256 amount
    );

    /// @notice Emitted when an authorized verifier is added/removed
    event VerifierUpdated(
        address indexed verifier,
        bool authorized
    );

    /// @notice Emitted when encrypted state is updated
    event EncryptedStateUpdated(
        PoolId indexed poolId,
        bytes32 stateHash
    );

    // ═══════════════════════════════════════════════════════════════════════
    // DEVELOPER REVENUE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Withdraw accumulated revenue to developer address
    /// @param token The token to withdraw (address(0) for ETH)
    /// @param amount Amount to withdraw
    /// @param recipient Recipient address
    function withdrawRevenue(
        address token,
        uint256 amount,
        address recipient
    ) external;

    /// @notice Get pending revenue balance
    /// @param token The token to query
    /// @return balance Pending revenue balance
    function pendingRevenue(address token) external view returns (uint256 balance);

    /// @notice Get the hook developer (owner) address
    /// @return developer The developer address
    function hookDeveloper() external view returns (address developer);

    // ═══════════════════════════════════════════════════════════════════════
    // STATE VIEW (IHookStateView COMPATIBLE)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get hook-specific state for AVS verification
    /// @dev Returns DECRYPTED state for authorized verifiers only
    /// @param poolId The pool identifier
    /// @return hookState ABI-encoded hook state variables
    function getHookState(PoolId poolId) external view returns (bytes memory hookState);

    /// @notice Get encrypted hook state (for public queries)
    /// @dev Returns encrypted handles, not plaintext values
    /// @param poolId The pool identifier
    /// @return encryptedState Encrypted state handles
    function getEncryptedHookState(PoolId poolId) external view returns (bytes memory encryptedState);

    // ═══════════════════════════════════════════════════════════════════════
    // VERIFIER ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Check if an address is an authorized verifier
    /// @param verifier Address to check
    /// @return authorized True if authorized
    function isAuthorizedVerifier(address verifier) external view returns (bool authorized);

    /// @notice Add or remove an authorized verifier
    /// @dev Only callable by hook developer
    /// @param verifier Address to update
    /// @param authorized New authorization status
    function setVerifierAuthorization(address verifier, bool authorized) external;

    // ═══════════════════════════════════════════════════════════════════════
    // SPECIFICATION METADATA
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get the IPFS URI of the hook specification
    /// @return uri IPFS CID of specification document
    function specificationURI() external view returns (string memory uri);

    /// @notice Get the hash of the specification for integrity verification
    /// @return hash Keccak256 hash of specification
    function specificationHash() external view returns (bytes32 hash);
}
```

### 3.2 Encrypted State Storage Pattern

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint256, euint128, euint32, ebool, inEuint256} from "@fhenix/fhenix-contracts/contracts/FHE.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";

/// @title CoFHEHookStorage
/// @notice Base storage contract for encrypted hook state
/// @dev Inherit this to add encrypted state management
abstract contract CoFHEHookStorage {

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED STATE TYPES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Encrypted fee configuration
    /// @dev Fee values kept encrypted to hide strategy
    struct EncryptedFeeConfig {
        euint32 baseFee;           // Base fee in bps (encrypted)
        euint32 maxFee;            // Maximum fee cap (encrypted)
        euint32 volatilityFactor;  // Volatility sensitivity (encrypted)
    }

    /// @notice Encrypted position tracking
    /// @dev Position data encrypted to hide LP strategies
    struct EncryptedPositionData {
        euint128 liquidity;        // Position liquidity (encrypted)
        euint256 feeAccrued0;      // Token0 fees earned (encrypted)
        euint256 feeAccrued1;      // Token1 fees earned (encrypted)
        ebool isActive;            // Position active flag (encrypted)
    }

    /// @notice Encrypted pool metrics
    /// @dev Aggregate metrics kept private
    struct EncryptedPoolMetrics {
        euint256 totalVolume;      // Cumulative volume (encrypted)
        euint256 totalFees;        // Cumulative fees (encrypted)
        euint128 avgLiquidity;     // Average liquidity (encrypted)
        euint32 txCount;           // Transaction count (encrypted)
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE MAPPINGS
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Pool ID => Encrypted fee configuration
    mapping(PoolId => EncryptedFeeConfig) internal _encryptedFees;

    /// @dev Pool ID => Position ID => Encrypted position data
    mapping(PoolId => mapping(bytes32 => EncryptedPositionData)) internal _encryptedPositions;

    /// @dev Pool ID => Encrypted pool metrics
    mapping(PoolId => EncryptedPoolMetrics) internal _encryptedMetrics;

    /// @dev Authorized verifiers who can decrypt state
    mapping(address => bool) internal _authorizedVerifiers;

    /// @dev Hook developer address (revenue recipient)
    address internal _hookDeveloper;

    /// @dev Revenue balances per token
    mapping(address => uint256) internal _revenueBalances;

    // ═══════════════════════════════════════════════════════════════════════
    // ACCESS CONTROL MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyDeveloper() {
        require(msg.sender == _hookDeveloper, "CoFHEHook: not developer");
        _;
    }

    modifier onlyAuthorizedVerifier() {
        require(
            _authorizedVerifiers[msg.sender] || msg.sender == _hookDeveloper,
            "CoFHEHook: not authorized verifier"
        );
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED STATE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Initialize encrypted fee configuration
    /// @dev Encrypts plaintext values using FHE
    function _initializeEncryptedFees(
        PoolId poolId,
        uint32 baseFee,
        uint32 maxFee,
        uint32 volatilityFactor
    ) internal {
        _encryptedFees[poolId] = EncryptedFeeConfig({
            baseFee: FHE.asEuint32(baseFee),
            maxFee: FHE.asEuint32(maxFee),
            volatilityFactor: FHE.asEuint32(volatilityFactor)
        });

        // Grant this contract permission to operate on encrypted values
        FHE.allowThis(_encryptedFees[poolId].baseFee);
        FHE.allowThis(_encryptedFees[poolId].maxFee);
        FHE.allowThis(_encryptedFees[poolId].volatilityFactor);
    }

    /// @notice Update encrypted fee with encrypted computation
    /// @dev Performs arithmetic on encrypted values without revealing them
    function _updateEncryptedFee(
        PoolId poolId,
        euint32 newBaseFee
    ) internal {
        EncryptedFeeConfig storage config = _encryptedFees[poolId];

        // Encrypted comparison: ensure new fee <= maxFee
        ebool isValid = FHE.lte(newBaseFee, config.maxFee);

        // Encrypted select: use new fee if valid, else keep old
        config.baseFee = FHE.select(isValid, newBaseFee, config.baseFee);

        // Re-grant permission after update
        FHE.allowThis(config.baseFee);
    }

    /// @notice Decrypt state for authorized verifiers
    /// @dev Only callable by authorized verifiers
    function _decryptFeeConfig(
        PoolId poolId
    ) internal view onlyAuthorizedVerifier returns (
        uint32 baseFee,
        uint32 maxFee,
        uint32 volatilityFactor
    ) {
        EncryptedFeeConfig storage config = _encryptedFees[poolId];

        // Decrypt encrypted values (requires permission)
        baseFee = FHE.decrypt(config.baseFee);
        maxFee = FHE.decrypt(config.maxFee);
        volatilityFactor = FHE.decrypt(config.volatilityFactor);
    }
}
```

### 3.3 Complete Template Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {FHE, euint256, euint128, euint32, ebool} from "@fhenix/fhenix-contracts/contracts/FHE.sol";
import {ICoFHEHook} from "./interfaces/ICoFHEHook.sol";
import {CoFHEHookStorage} from "./CoFHEHookStorage.sol";

/// @title CoFHEHookTemplate
/// @notice Template for CoFHE-obfuscated Uniswap V4 hooks
/// @dev Extends this contract to create obfuscated hooks
abstract contract CoFHEHookTemplate is BaseHook, ICoFHEHook, CoFHEHookStorage {
    using PoolIdLibrary for PoolKey;

    // ═══════════════════════════════════════════════════════════════════════
    // IMMUTABLES
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev IPFS URI of the hook specification
    string private _specificationURI;

    /// @dev Hash of specification for integrity verification
    bytes32 private _specificationHash;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor(
        IPoolManager poolManager_,
        address developer_,
        string memory specificationURI_,
        bytes32 specificationHash_
    ) BaseHook(poolManager_) {
        require(developer_ != address(0), "CoFHEHook: zero developer");
        require(bytes(specificationURI_).length > 0, "CoFHEHook: empty spec URI");

        _hookDeveloper = developer_;
        _specificationURI = specificationURI_;
        _specificationHash = specificationHash_;

        // Developer is automatically an authorized verifier
        _authorizedVerifiers[developer_] = true;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // IHOOKS IMPLEMENTATION (Required by Uniswap V4)
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc BaseHook
    function getHookPermissions() public pure virtual override returns (Hooks.Permissions memory) {
        // Override in child contract to specify which hooks are enabled
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DEVELOPER REVENUE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc ICoFHEHook
    function withdrawRevenue(
        address token,
        uint256 amount,
        address recipient
    ) external override onlyDeveloper {
        require(recipient != address(0), "CoFHEHook: zero recipient");
        require(_revenueBalances[token] >= amount, "CoFHEHook: insufficient balance");

        _revenueBalances[token] -= amount;

        if (token == address(0)) {
            // ETH withdrawal
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "CoFHEHook: ETH transfer failed");
        } else {
            // ERC20 withdrawal
            (bool success, bytes memory data) = token.call(
                abi.encodeWithSignature("transfer(address,uint256)", recipient, amount)
            );
            require(success && (data.length == 0 || abi.decode(data, (bool))), "CoFHEHook: token transfer failed");
        }

        emit RevenueWithdrawn(recipient, token, amount);
    }

    /// @inheritdoc ICoFHEHook
    function pendingRevenue(address token) external view override returns (uint256 balance) {
        return _revenueBalances[token];
    }

    /// @inheritdoc ICoFHEHook
    function hookDeveloper() external view override returns (address developer) {
        return _hookDeveloper;
    }

    /// @dev Internal function to accrue revenue
    function _accrueRevenue(address token, uint256 amount) internal {
        _revenueBalances[token] += amount;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATE VIEW (IHookStateView COMPATIBLE)
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc ICoFHEHook
    function getHookState(PoolId poolId) external view override onlyAuthorizedVerifier returns (bytes memory hookState) {
        // Decrypt and return hook state for authorized verifiers
        // This enables AVS verification without exposing source code

        (uint32 baseFee, uint32 maxFee, uint32 volatilityFactor) = _decryptFeeConfig(poolId);

        // Encode decrypted state for verifier
        hookState = abi.encode(
            baseFee,
            maxFee,
            volatilityFactor,
            _getAdditionalState(poolId) // Hook-specific state
        );
    }

    /// @inheritdoc ICoFHEHook
    function getEncryptedHookState(PoolId poolId) external view override returns (bytes memory encryptedState) {
        // Return encrypted handles (not plaintext) for public queries
        EncryptedFeeConfig storage config = _encryptedFees[poolId];

        // Encode handles (not values) - anyone can see encrypted references
        encryptedState = abi.encode(
            euint32.unwrap(config.baseFee),
            euint32.unwrap(config.maxFee),
            euint32.unwrap(config.volatilityFactor)
        );
    }

    /// @dev Override to provide additional hook-specific state
    function _getAdditionalState(PoolId poolId) internal view virtual returns (bytes memory) {
        return "";
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VERIFIER ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc ICoFHEHook
    function isAuthorizedVerifier(address verifier) external view override returns (bool authorized) {
        return _authorizedVerifiers[verifier];
    }

    /// @inheritdoc ICoFHEHook
    function setVerifierAuthorization(address verifier, bool authorized) external override onlyDeveloper {
        require(verifier != address(0), "CoFHEHook: zero verifier");
        _authorizedVerifiers[verifier] = authorized;
        emit VerifierUpdated(verifier, authorized);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SPECIFICATION METADATA
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc ICoFHEHook
    function specificationURI() external view override returns (string memory uri) {
        return _specificationURI;
    }

    /// @inheritdoc ICoFHEHook
    function specificationHash() external view override returns (bytes32 hash) {
        return _specificationHash;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED COMPUTATION HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Compute dynamic fee using encrypted arithmetic
    /// @dev Fee computation happens on encrypted values
    /// @param poolId The pool identifier
    /// @param volatility Current volatility metric
    /// @return encryptedFee The computed fee (encrypted)
    function _computeDynamicFee(
        PoolId poolId,
        uint32 volatility
    ) internal view returns (euint32 encryptedFee) {
        EncryptedFeeConfig storage config = _encryptedFees[poolId];

        // Encrypt the volatility input
        euint32 encryptedVolatility = FHE.asEuint32(volatility);

        // Encrypted computation: fee = baseFee + (volatility * volatilityFactor / 10000)
        euint32 adjustment = FHE.mul(encryptedVolatility, config.volatilityFactor);
        adjustment = FHE.div(adjustment, FHE.asEuint32(10000));

        encryptedFee = FHE.add(config.baseFee, adjustment);

        // Cap at maxFee using encrypted comparison
        ebool exceedsMax = FHE.gt(encryptedFee, config.maxFee);
        encryptedFee = FHE.select(exceedsMax, config.maxFee, encryptedFee);
    }

    /// @notice Safely decrypt a value for return to PoolManager
    /// @dev Only decrypts when necessary for external interfaces
    function _decryptForReturn(euint32 encrypted) internal view returns (uint32) {
        // Grant permission to decrypt
        FHE.allowThis(encrypted);
        return FHE.decrypt(encrypted);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RECEIVE ETH
    // ═══════════════════════════════════════════════════════════════════════

    receive() external payable {
        // Accept ETH for revenue collection
        _accrueRevenue(address(0), msg.value);
    }
}
```

---

## 4. Example Implementation: Dynamic Fee Hook

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CoFHEHookTemplate} from "./CoFHEHookTemplate.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {FHE, euint32} from "@fhenix/fhenix-contracts/contracts/FHE.sol";

/// @title CoFHEDynamicFeeHook
/// @notice Example CoFHE-obfuscated dynamic fee hook
/// @dev Fee computation logic is encrypted, only results are revealed
contract CoFHEDynamicFeeHook is CoFHEHookTemplate {
    using PoolIdLibrary for PoolKey;

    // ═══════════════════════════════════════════════════════════════════════
    // ADDITIONAL ENCRYPTED STATE
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Pool ID => Last price for volatility calculation
    mapping(PoolId => uint160) private _lastSqrtPrice;

    /// @dev Pool ID => Cumulative volatility (encrypted)
    mapping(PoolId => euint256) private _encryptedCumulativeVolatility;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor(
        IPoolManager poolManager_,
        address developer_,
        string memory specificationURI_,
        bytes32 specificationHash_
    ) CoFHEHookTemplate(poolManager_, developer_, specificationURI_, specificationHash_) {}

    // ═══════════════════════════════════════════════════════════════════════
    // HOOK PERMISSIONS
    // ═══════════════════════════════════════════════════════════════════════

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: true,  // Initialize encrypted fee config
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,        // Compute dynamic fee
            afterSwap: true,         // Update metrics and revenue
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HOOK CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    function beforeInitialize(
        address sender,
        PoolKey calldata key,
        uint160 sqrtPriceX96
    ) external override poolManagerOnly returns (bytes4) {
        PoolId poolId = key.toId();

        // Initialize encrypted fee configuration
        // Default: 0.3% base, 1% max, 100 volatility factor
        _initializeEncryptedFees(poolId, 3000, 10000, 100);

        // Initialize last price for volatility tracking
        _lastSqrtPrice[poolId] = sqrtPriceX96;

        return this.beforeInitialize.selector;
    }

    function beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) external override poolManagerOnly returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId poolId = key.toId();

        // Calculate volatility from price change
        uint160 currentPrice = _getCurrentSqrtPrice(poolId);
        uint160 lastPrice = _lastSqrtPrice[poolId];

        uint32 volatility = _calculateVolatility(lastPrice, currentPrice);

        // Compute fee using encrypted arithmetic
        // The fee computation logic is hidden from observers
        euint32 encryptedFee = _computeDynamicFee(poolId, volatility);

        // Decrypt only the final result for PoolManager
        uint24 lpFeeOverride = uint24(_decryptForReturn(encryptedFee));

        // Update last price
        _lastSqrtPrice[poolId] = currentPrice;

        // Return fee override with override flag set (bit 23)
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

        // Calculate and accrue revenue (portion of fees)
        // Revenue calculation happens on plaintext for simplicity
        // Could be encrypted if needed

        uint256 swapAmount = params.amountSpecified > 0
            ? uint256(params.amountSpecified)
            : uint256(-params.amountSpecified);

        // Hook takes 10% of the fee as revenue
        uint256 hookRevenue = (swapAmount * 3000 / 1000000) / 10; // ~0.03%

        // Accrue to the appropriate token
        address revenueToken = params.zeroForOne
            ? Currency.unwrap(key.currency0)
            : Currency.unwrap(key.currency1);

        _accrueRevenue(revenueToken, hookRevenue);

        return (this.afterSwap.selector, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    function _getCurrentSqrtPrice(PoolId poolId) internal view returns (uint160) {
        (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(poolId);
        return sqrtPriceX96;
    }

    function _calculateVolatility(
        uint160 lastPrice,
        uint160 currentPrice
    ) internal pure returns (uint32) {
        if (lastPrice == 0) return 0;

        // Calculate percentage change in basis points
        uint256 priceDiff = currentPrice > lastPrice
            ? currentPrice - lastPrice
            : lastPrice - currentPrice;

        uint256 volatilityBps = (priceDiff * 10000) / lastPrice;

        // Cap at max uint32
        return volatilityBps > type(uint32).max
            ? type(uint32).max
            : uint32(volatilityBps);
    }

    /// @inheritdoc CoFHEHookTemplate
    function _getAdditionalState(PoolId poolId) internal view override returns (bytes memory) {
        return abi.encode(
            _lastSqrtPrice[poolId],
            euint256.unwrap(_encryptedCumulativeVolatility[poolId])
        );
    }
}
```

---

## 5. Revenue Management API

### 5.1 Revenue Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HOOK REVENUE FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                 │
│   │   Swap Tx   │─────▶│ PoolManager │─────▶│ Hook.after  │                 │
│   │   (User)    │      │             │      │ Swap()      │                 │
│   └─────────────┘      └─────────────┘      └──────┬──────┘                 │
│                                                     │                        │
│                                    Fee calculation  │                        │
│                                    (encrypted)      │                        │
│                                                     ▼                        │
│                                             ┌──────────────┐                 │
│                                             │ Hook Revenue │                 │
│                                             │ Accumulator  │                 │
│                                             │ (per token)  │                 │
│                                             └──────┬───────┘                 │
│                                                    │                         │
│                        ┌───────────────────────────┼───────────────────────┐ │
│                        │                           │                       │ │
│                        ▼                           ▼                       ▼ │
│               ┌────────────────┐         ┌────────────────┐     ┌───────────┐│
│               │ pendingRevenue │         │withdrawRevenue │     │ Vault     ││
│               │ (view)         │         │ (action)       │────▶│(optional) ││
│               └────────────────┘         └────────────────┘     └───────────┘│
│                        │                           │                         │
│                        │         Developer         │                         │
│                        └───────────Dashboard───────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Revenue Manager Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IHookRevenueManager
/// @notice Extended revenue management interface for hook developers
interface IHookRevenueManager {

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event RevenueAccrued(
        address indexed token,
        uint256 amount,
        PoolId indexed poolId
    );

    event VaultConfigured(
        address indexed vault,
        address indexed token,
        uint256 autoWithdrawThreshold
    );

    event RevenueShareUpdated(
        address indexed recipient,
        uint256 shareBps
    );

    // ═══════════════════════════════════════════════════════════════════════
    // REVENUE QUERIES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get total revenue across all tokens
    /// @return tokens Array of token addresses
    /// @return amounts Array of pending amounts
    function getAllPendingRevenue() external view returns (
        address[] memory tokens,
        uint256[] memory amounts
    );

    /// @notice Get revenue breakdown by pool
    /// @param token Token to query
    /// @return poolIds Pools generating revenue
    /// @return amounts Revenue per pool
    function getRevenueByPool(address token) external view returns (
        PoolId[] memory poolIds,
        uint256[] memory amounts
    );

    /// @notice Get historical revenue data
    /// @param token Token to query
    /// @param fromBlock Starting block
    /// @param toBlock Ending block
    /// @return totalRevenue Total revenue in period
    /// @return withdrawals Total withdrawals in period
    function getRevenueHistory(
        address token,
        uint256 fromBlock,
        uint256 toBlock
    ) external view returns (
        uint256 totalRevenue,
        uint256 withdrawals
    );

    // ═══════════════════════════════════════════════════════════════════════
    // REVENUE ACTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Batch withdraw multiple tokens
    /// @param tokens Array of token addresses
    /// @param amounts Array of amounts to withdraw
    /// @param recipient Recipient address
    function batchWithdrawRevenue(
        address[] calldata tokens,
        uint256[] calldata amounts,
        address recipient
    ) external;

    /// @notice Withdraw all pending revenue for a token
    /// @param token Token to withdraw
    /// @param recipient Recipient address
    /// @return amount Amount withdrawn
    function withdrawAllRevenue(
        address token,
        address recipient
    ) external returns (uint256 amount);

    // ═══════════════════════════════════════════════════════════════════════
    // VAULT INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Configure automatic revenue forwarding to vault
    /// @param vault Vault address to forward revenue to
    /// @param token Token to configure
    /// @param autoWithdrawThreshold Minimum balance to trigger auto-withdraw
    function configureVault(
        address vault,
        address token,
        uint256 autoWithdrawThreshold
    ) external;

    /// @notice Get vault configuration
    /// @param token Token to query
    /// @return vault Configured vault address
    /// @return threshold Auto-withdraw threshold
    function getVaultConfig(address token) external view returns (
        address vault,
        uint256 threshold
    );

    // ═══════════════════════════════════════════════════════════════════════
    // REVENUE SHARING
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Configure revenue sharing with other addresses
    /// @param recipient Address to share revenue with
    /// @param shareBps Share percentage in basis points (max 10000)
    function setRevenueShare(
        address recipient,
        uint256 shareBps
    ) external;

    /// @notice Get revenue share configuration
    /// @return recipients Array of share recipients
    /// @return sharesBps Array of share percentages
    function getRevenueShares() external view returns (
        address[] memory recipients,
        uint256[] memory sharesBps
    );

    /// @notice Distribute revenue according to shares
    /// @param token Token to distribute
    /// @return distributed Total amount distributed
    function distributeRevenue(address token) external returns (uint256 distributed);
}
```

---

## 6. AVS Verification Integration

### 6.1 Verification Without Code Disclosure

The CoFHE template enables behavioral verification through:

1. **Public Specification**: Mathematical behavior defined in IPFS-stored specification
2. **Encrypted Implementation**: Source code protected via FHE
3. **Authorized Decryption**: AVS operators granted decrypt permission via `setVerifierAuthorization`
4. **State Sampling**: Operators call `getHookState()` to sample decrypted state
5. **Behavioral Verification**: Compare actual behavior to specification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VERIFICATION FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. OPERATOR REGISTRATION                                                   │
│   ────────────────────────                                                  │
│   Developer calls: setVerifierAuthorization(operatorAddress, true)           │
│                                                                              │
│   2. STATE SAMPLING                                                          │
│   ─────────────────                                                         │
│   Operator calls: getHookState(poolId)                                       │
│   → Returns DECRYPTED state (authorized access)                              │
│                                                                              │
│   3. CALLBACK EXECUTION                                                      │
│   ────────────────────                                                      │
│   Operator simulates: beforeSwap(params)                                     │
│   → Captures pre-state and post-state                                        │
│                                                                              │
│   4. SPECIFICATION COMPARISON                                                │
│   ──────────────────────────                                                │
│   Operator verifies:                                                         │
│   - State transitions match specification equations                          │
│   - Invariants hold                                                          │
│   - Return values within tolerance                                           │
│                                                                              │
│   5. ATTESTATION SUBMISSION                                                  │
│   ────────────────────────                                                  │
│   Operator signs: AttestationResponse { specCompliant: true/false }          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 IHookStateView Compatibility

The template implements the state sampling interface required by the AVS:

```solidity
/// @title IHookStateView Compatibility Layer
/// @notice Maps CoFHE template to AVS verification requirements
interface IHookStateViewCompatible {

    /// @notice Get trader-relevant state (slot0 + liquidity)
    /// @param poolId Pool identifier
    /// @return state TraderState struct
    function getTraderState(PoolId poolId) external view returns (TraderState memory state);

    /// @notice Get LP position state
    /// @param poolId Pool identifier
    /// @param positionId Position identifier
    /// @return state LPPositionState struct
    function getLPPositionState(
        PoolId poolId,
        bytes32 positionId
    ) external view returns (LPPositionState memory state);

    /// @notice Get hook-specific state (CoFHE encrypted)
    /// @dev Decrypts for authorized callers
    /// @param poolId Pool identifier
    /// @return hookState Encoded hook state
    function getHookState(PoolId poolId) external view returns (bytes memory hookState);
}
```

---

## 7. Deployment Guide

### 7.1 Prerequisites

1. **Fhenix CoFHE Setup**
   ```bash
   # Clone CoFHE starter
   git clone https://github.com/FhenixProtocol/cofhe-hardhat-starter
   cd cofhe-hardhat-starter
   pnpm install

   # Install CoFHE contracts
   pnpm add @fhenix/fhenix-contracts
   ```

2. **Environment Configuration**
   ```bash
   # .env file
   PRIVATE_KEY=your_private_key
   RPC_URL=https://rpc.fhenix.zone
   ETHERSCAN_API_KEY=your_key
   IPFS_GATEWAY=https://gateway.pinata.cloud
   ```

### 7.2 Deployment Steps

```typescript
// deploy/deploy-cofhe-hook.ts
import { ethers } from "hardhat";
import { uploadToIPFS } from "./utils/ipfs";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    // 1. Upload specification to IPFS
    const specification = {
        name: "CoFHE Dynamic Fee Hook",
        version: "1.0.0",
        callbacks: ["beforeInitialize", "beforeSwap", "afterSwap"],
        stateVariables: {
            baseFee: { type: "euint32", description: "Base fee in bps" },
            maxFee: { type: "euint32", description: "Maximum fee cap" },
            volatilityFactor: { type: "euint32", description: "Volatility sensitivity" }
        },
        invariants: [
            "baseFee <= maxFee",
            "computedFee <= maxFee"
        ],
        testVectors: [
            { input: { volatility: 0 }, expected: { fee: "baseFee" } },
            { input: { volatility: 10000 }, expected: { fee: "maxFee" } }
        ]
    };

    const specificationURI = await uploadToIPFS(specification);
    const specificationHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(specification))
    );

    console.log("Specification uploaded:", specificationURI);

    // 2. Get PoolManager address
    const poolManagerAddress = "0x..."; // Network-specific

    // 3. Deploy the hook
    const CoFHEHook = await ethers.getContractFactory("CoFHEDynamicFeeHook");
    const hook = await CoFHEHook.deploy(
        poolManagerAddress,
        deployer.address,
        specificationURI,
        specificationHash
    );

    await hook.waitForDeployment();
    console.log("Hook deployed to:", await hook.getAddress());

    // 4. Verify on explorer (optional)
    await hre.run("verify:verify", {
        address: await hook.getAddress(),
        constructorArguments: [
            poolManagerAddress,
            deployer.address,
            specificationURI,
            specificationHash
        ]
    });

    // 5. Register AVS verifiers
    const avsOperatorAddress = "0x...";
    await hook.setVerifierAuthorization(avsOperatorAddress, true);
    console.log("AVS operator authorized");
}

main().catch(console.error);
```

### 7.3 Testing

```typescript
// test/CoFHEDynamicFeeHook.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { cofhejs_initializeWithHardhatSigner, cofhejs } from "@fhenix/cofhejs";
import { Encryptable } from "@fhenix/cofhejs";

describe("CoFHEDynamicFeeHook", function() {
    let hook: Contract;
    let poolManager: Contract;
    let developer: Signer;
    let verifier: Signer;
    let user: Signer;

    beforeEach(async function() {
        [developer, verifier, user] = await ethers.getSigners();

        // Initialize CoFHE for testing
        await cofhejs_initializeWithHardhatSigner(developer);

        // Deploy mock PoolManager
        const MockPoolManager = await ethers.getContractFactory("MockPoolManager");
        poolManager = await MockPoolManager.deploy();

        // Deploy hook
        const CoFHEHook = await ethers.getContractFactory("CoFHEDynamicFeeHook");
        hook = await CoFHEHook.deploy(
            await poolManager.getAddress(),
            developer.address,
            "ipfs://QmTest",
            ethers.keccak256(ethers.toUtf8Bytes("test"))
        );
    });

    describe("Encrypted State", function() {
        it("should initialize encrypted fee configuration", async function() {
            // Call beforeInitialize
            await hook.beforeInitialize(
                user.address,
                mockPoolKey,
                BigInt(1e18) // sqrtPriceX96
            );

            // Try to read encrypted state without authorization
            await expect(
                hook.connect(user).getHookState(poolId)
            ).to.be.revertedWith("CoFHEHook: not authorized verifier");
        });

        it("should allow authorized verifier to decrypt state", async function() {
            // Initialize
            await hook.beforeInitialize(user.address, mockPoolKey, BigInt(1e18));

            // Authorize verifier
            await hook.connect(developer).setVerifierAuthorization(verifier.address, true);

            // Verifier can read decrypted state
            const state = await hook.connect(verifier).getHookState(poolId);
            const [baseFee, maxFee, volatilityFactor] = ethers.AbiCoder.defaultAbiCoder().decode(
                ["uint32", "uint32", "uint32", "bytes"],
                state
            );

            expect(baseFee).to.equal(3000); // Default 0.3%
            expect(maxFee).to.equal(10000); // Default 1%
        });
    });

    describe("Revenue Management", function() {
        it("should accrue and withdraw revenue", async function() {
            // Simulate swap that generates revenue
            await simulateSwap(hook, mockPoolKey);

            // Check pending revenue
            const pending = await hook.pendingRevenue(tokenAddress);
            expect(pending).to.be.gt(0);

            // Withdraw
            const balanceBefore = await token.balanceOf(developer.address);
            await hook.connect(developer).withdrawRevenue(
                tokenAddress,
                pending,
                developer.address
            );
            const balanceAfter = await token.balanceOf(developer.address);

            expect(balanceAfter - balanceBefore).to.equal(pending);
        });

        it("should only allow developer to withdraw", async function() {
            await expect(
                hook.connect(user).withdrawRevenue(tokenAddress, 100, user.address)
            ).to.be.revertedWith("CoFHEHook: not developer");
        });
    });
});
```

---

## 8. Security Considerations

### 8.1 Access Control Matrix

| Function | Developer | Verifier | Public |
|----------|:---------:|:--------:|:------:|
| `getHookState()` (decrypted) | Yes | Yes | No |
| `getEncryptedHookState()` | Yes | Yes | Yes |
| `withdrawRevenue()` | Yes | No | No |
| `setVerifierAuthorization()` | Yes | No | No |
| `specificationURI()` | Yes | Yes | Yes |
| Hook callbacks | PoolManager Only | No | No |

### 8.2 Trust Assumptions

1. **Fhenix Network**: FHE operations are secure and correctly implemented
2. **Developer Honesty**: Developer correctly implements specification
3. **Verifier Independence**: AVS operators are economically incentivized to verify correctly
4. **Specification Accuracy**: Public specification accurately describes intended behavior

### 8.3 Attack Vectors & Mitigations

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Unauthorized Decryption** | Attacker tries to decrypt state | Access control + FHE.allow() |
| **Revenue Theft** | Attacker tries to withdraw revenue | onlyDeveloper modifier |
| **Specification Gaming** | Developer writes misleading spec | Community review, slashing |
| **Verifier Collusion** | Verifiers collude to false attest | Minimum operator count, stake distribution |

---

## 9. References

1. **[Fhenix CoFHE]** Fhenix Protocol. *CoFHE Documentation*. https://cofhe-docs.fhenix.zone/
2. **[Fhenix Contracts]** Fhenix Protocol. *fhenix-contracts*. https://github.com/FhenixProtocol/fhenix-contracts
3. **[IHooks]** Uniswap. *v4-core IHooks Interface*. https://github.com/Uniswap/v4-core
4. **[State-Space Model]** Hook Bazaar. *Hook State-Space Model*. `docs/hook-pkg/mathematical-models/state-space-model.md`
5. **[AVS Verification]** Hook Bazaar. *AVS Verification System*. `docs/hook-pkg/architecture/avs-verification-system.md`

---

## 10. Appendix: Quick Reference

### 10.1 CoFHE Types

| Type | Bits | Use Case |
|------|------|----------|
| `ebool` | 1 | Flags, conditions |
| `euint8` | 8 | Small counters |
| `euint16` | 16 | Tick values |
| `euint32` | 32 | Fees, timestamps |
| `euint64` | 64 | Amounts |
| `euint128` | 128 | Liquidity |
| `euint256` | 256 | Large amounts |
| `eaddress` | 160 | Encrypted addresses |

### 10.2 FHE Operations

```solidity
// Arithmetic
FHE.add(a, b)      // a + b
FHE.sub(a, b)      // a - b
FHE.mul(a, b)      // a * b
FHE.div(a, b)      // a / b

// Comparison (returns ebool)
FHE.eq(a, b)       // a == b
FHE.ne(a, b)       // a != b
FHE.lt(a, b)       // a < b
FHE.lte(a, b)      // a <= b
FHE.gt(a, b)       // a > b
FHE.gte(a, b)      // a >= b

// Control Flow
FHE.select(cond, a, b)  // cond ? a : b

// Access Control
FHE.allowThis(val)      // Allow current contract
FHE.allowSender(val)    // Allow msg.sender
FHE.allow(val, addr)    // Allow specific address

// Conversion
FHE.asEuint32(plaintext)  // Encrypt
FHE.decrypt(encrypted)     // Decrypt (requires permission)
```

### 10.3 Template Checklist

- [ ] Implement `IHooks` interface
- [ ] Implement `ICoFHEHook` interface
- [ ] Store specification on IPFS
- [ ] Initialize encrypted state in `beforeInitialize`
- [ ] Implement revenue accrual in callbacks
- [ ] Grant FHE permissions with `allowThis()`
- [ ] Implement `getHookState()` for verifiers
- [ ] Test with CoFHE mock contracts
- [ ] Deploy to Fhenix testnet
- [ ] Register AVS verifiers
