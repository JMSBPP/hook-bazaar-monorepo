// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ebool, euint32, euint128, euint256, eaddress} from "fhenix-contracts/FHE.sol";
import {ICoFHETypes} from "./ICoFHETypes.sol";

/// @title ICoFHEHookMod
/// @notice Interface for encrypted hook logic - mirrors IHooks but with encrypted types
/// @dev Hook developers implement this interface with their encrypted business logic
interface ICoFHEHookMod is ICoFHETypes {

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Encrypted beforeInitialize callback
    /// @param sender Encrypted sender address
    /// @param key Encrypted pool key
    /// @param sqrtPriceX96 Encrypted sqrt price
    /// @return selector Function selector (plaintext for PoolManager compatibility)
    function beforeInitialize(
        eaddress sender,
        EPoolKey calldata key,
        euint256 sqrtPriceX96
    ) external returns (bytes4);

    /// @notice Encrypted afterInitialize callback
    /// @param sender Encrypted sender address
    /// @param key Encrypted pool key
    /// @param sqrtPriceX96 Encrypted sqrt price
    /// @param tick Encrypted tick value
    /// @return selector Function selector
    function afterInitialize(
        eaddress sender,
        EPoolKey calldata key,
        euint256 sqrtPriceX96,
        euint32 tick
    ) external returns (bytes4);

    // ═══════════════════════════════════════════════════════════════════════
    // LIQUIDITY CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Encrypted beforeAddLiquidity callback
    function beforeAddLiquidity(
        eaddress sender,
        EPoolKey calldata key,
        EModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4);

    /// @notice Encrypted afterAddLiquidity callback
    function afterAddLiquidity(
        eaddress sender,
        EPoolKey calldata key,
        EModifyLiquidityParams calldata params,
        EBalanceDelta calldata delta,
        EBalanceDelta calldata feesAccrued,
        bytes calldata hookData
    ) external returns (bytes4, EBalanceDelta memory);

    /// @notice Encrypted beforeRemoveLiquidity callback
    function beforeRemoveLiquidity(
        eaddress sender,
        EPoolKey calldata key,
        EModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4);

    /// @notice Encrypted afterRemoveLiquidity callback
    function afterRemoveLiquidity(
        eaddress sender,
        EPoolKey calldata key,
        EModifyLiquidityParams calldata params,
        EBalanceDelta calldata delta,
        EBalanceDelta calldata feesAccrued,
        bytes calldata hookData
    ) external returns (bytes4, EBalanceDelta memory);

    // ═══════════════════════════════════════════════════════════════════════
    // SWAP CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Encrypted beforeSwap callback
    function beforeSwap(
        eaddress sender,
        EPoolKey calldata key,
        ESwapParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4, EBeforeSwapDelta memory, euint32);

    /// @notice Encrypted afterSwap callback
    function afterSwap(
        eaddress sender,
        EPoolKey calldata key,
        ESwapParams calldata params,
        EBalanceDelta calldata delta,
        bytes calldata hookData
    ) external returns (bytes4, euint128);

    // ═══════════════════════════════════════════════════════════════════════
    // DONATE CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Encrypted beforeDonate callback
    function beforeDonate(
        eaddress sender,
        EPoolKey calldata key,
        euint256 amount0,
        euint256 amount1,
        bytes calldata hookData
    ) external returns (bytes4);

    /// @notice Encrypted afterDonate callback
    function afterDonate(
        eaddress sender,
        EPoolKey calldata key,
        euint256 amount0,
        euint256 amount1,
        bytes calldata hookData
    ) external returns (bytes4);
}
