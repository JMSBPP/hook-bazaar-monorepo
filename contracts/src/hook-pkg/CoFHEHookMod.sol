// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint32, euint128, euint256, eaddress} from "fhenix-contracts/FHE.sol";
import {ICoFHEHookMod} from "./interfaces/ICoFHEHookMod.sol";
import {ICoFHETypes} from "./interfaces/ICoFHETypes.sol";

/// @title CoFHEHookMod
/// @notice Base contract for encrypted hook logic implementation
/// @dev Hook developers extend this contract and override the callbacks they need
abstract contract CoFHEHookMod is ICoFHEHookMod {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error CoFHEHookMod__NotImplemented();
    error CoFHEHookMod__OnlyCoFHEHook();

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Address of the CoFHEHook wrapper that can call this mod
    address internal immutable _cofheHook;

    // ═══════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyCoFHEHook() {
        if (msg.sender != _cofheHook) revert CoFHEHookMod__OnlyCoFHEHook();
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor(address cofheHook_) {
        _cofheHook = cofheHook_;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DEFAULT IMPLEMENTATIONS (revert - override what you need)
    // ═══════════════════════════════════════════════════════════════════════

    function beforeInitialize(
        eaddress,
        EPoolKey calldata,
        euint256
    ) external virtual onlyCoFHEHook returns (bytes4) {
        revert CoFHEHookMod__NotImplemented();
    }

    function afterInitialize(
        eaddress,
        EPoolKey calldata,
        euint256,
        euint32
    ) external virtual onlyCoFHEHook returns (bytes4) {
        revert CoFHEHookMod__NotImplemented();
    }

    function beforeAddLiquidity(
        eaddress,
        EPoolKey calldata,
        EModifyLiquidityParams calldata,
        bytes calldata
    ) external virtual onlyCoFHEHook returns (bytes4) {
        revert CoFHEHookMod__NotImplemented();
    }

    function afterAddLiquidity(
        eaddress,
        EPoolKey calldata,
        EModifyLiquidityParams calldata,
        EBalanceDelta calldata,
        EBalanceDelta calldata,
        bytes calldata
    ) external virtual onlyCoFHEHook returns (bytes4, EBalanceDelta memory) {
        revert CoFHEHookMod__NotImplemented();
    }

    function beforeRemoveLiquidity(
        eaddress,
        EPoolKey calldata,
        EModifyLiquidityParams calldata,
        bytes calldata
    ) external virtual onlyCoFHEHook returns (bytes4) {
        revert CoFHEHookMod__NotImplemented();
    }

    function afterRemoveLiquidity(
        eaddress,
        EPoolKey calldata,
        EModifyLiquidityParams calldata,
        EBalanceDelta calldata,
        EBalanceDelta calldata,
        bytes calldata
    ) external virtual onlyCoFHEHook returns (bytes4, EBalanceDelta memory) {
        revert CoFHEHookMod__NotImplemented();
    }

    function beforeSwap(
        eaddress,
        EPoolKey calldata,
        ESwapParams calldata,
        bytes calldata
    ) external virtual onlyCoFHEHook returns (bytes4, EBeforeSwapDelta memory, euint32) {
        revert CoFHEHookMod__NotImplemented();
    }

    function afterSwap(
        eaddress,
        EPoolKey calldata,
        ESwapParams calldata,
        EBalanceDelta calldata,
        bytes calldata
    ) external virtual onlyCoFHEHook returns (bytes4, euint128) {
        revert CoFHEHookMod__NotImplemented();
    }

    function beforeDonate(
        eaddress,
        EPoolKey calldata,
        euint256,
        euint256,
        bytes calldata
    ) external virtual onlyCoFHEHook returns (bytes4) {
        revert CoFHEHookMod__NotImplemented();
    }

    function afterDonate(
        eaddress,
        EPoolKey calldata,
        euint256,
        euint256,
        bytes calldata
    ) external virtual onlyCoFHEHook returns (bytes4) {
        revert CoFHEHookMod__NotImplemented();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER: Create zero EBalanceDelta
    // ═══════════════════════════════════════════════════════════════════════

    function _zeroEBalanceDelta() internal pure returns (EBalanceDelta memory) {
        return EBalanceDelta({
            amount0: euint128.wrap(0),
            amount1: euint128.wrap(0)
        });
    }

    function _zeroEBeforeSwapDelta() internal pure returns (EBeforeSwapDelta memory) {
        return EBeforeSwapDelta({
            deltaSpecified: euint128.wrap(0),
            deltaUnspecified: euint128.wrap(0)
        });
    }
}
