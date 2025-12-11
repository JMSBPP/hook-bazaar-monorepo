// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IERC165} from "forge-std/interfaces/IERC165.sol";
import {HaaSMod} from "./HaaSMod.sol";
import {IHookStateLens} from "./interfaces/IHookStateLens.sol";

/// @title IHaaS
/// @notice Combined interface for HaaS hooks
interface IHaaS is IHooks {
    function poolManager() external view returns (IPoolManager);
}

/// @title IImmutableState
/// @notice Interface for immutable state access
interface IImmutableState {
    function poolManager() external view returns (IPoolManager);
}

/// @title HaaSFacet
/// @notice Diamond facet implementing IHooks with HaaS storage pattern
/// @dev Hook developers extend this facet and override callbacks they need
contract HaaSFacet is IHaaS, IImmutableState, IERC165, HaaSMod {
    using PoolIdLibrary for PoolKey;

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error HaaSFacet__NotImplemented();

    // ═══════════════════════════════════════════════════════════════════════
    // ERC165 SUPPORT
    // ═══════════════════════════════════════════════════════════════════════

    function supportsInterface(bytes4 interfaceID) external pure override returns (bool) {
        return interfaceID == type(IHooks).interfaceId ||
               interfaceID == type(IERC165).interfaceId;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // IMMUTABLE STATE
    // ═══════════════════════════════════════════════════════════════════════

    function poolManager() external view override(IHaaS, IImmutableState) returns (IPoolManager) {
        return _poolManager();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // IHOOKS IMPLEMENTATION (Default - override in derived contracts)
    // ═══════════════════════════════════════════════════════════════════════

    function beforeInitialize(
        address,
        PoolKey calldata,
        uint160
    ) external virtual override onlyPoolManager returns (bytes4) {
        return IHooks.beforeInitialize.selector;
    }

    function afterInitialize(
        address,
        PoolKey calldata,
        uint160,
        int24
    ) external virtual override onlyPoolManager returns (bytes4) {
        return IHooks.afterInitialize.selector;
    }

    function beforeAddLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        bytes calldata
    ) external virtual override onlyPoolManager returns (bytes4) {
        return IHooks.beforeAddLiquidity.selector;
    }

    function afterAddLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external virtual override onlyPoolManager returns (bytes4, BalanceDelta) {
        return (IHooks.afterAddLiquidity.selector, BalanceDeltaLibrary.ZERO_DELTA);
    }

    function beforeRemoveLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        bytes calldata
    ) external virtual override onlyPoolManager returns (bytes4) {
        return IHooks.beforeRemoveLiquidity.selector;
    }

    function afterRemoveLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external virtual override onlyPoolManager returns (bytes4, BalanceDelta) {
        return (IHooks.afterRemoveLiquidity.selector, BalanceDeltaLibrary.ZERO_DELTA);
    }

    function beforeSwap(
        address,
        PoolKey calldata,
        SwapParams calldata,
        bytes calldata
    ) external virtual override onlyPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function afterSwap(
        address,
        PoolKey calldata,
        SwapParams calldata,
        BalanceDelta,
        bytes calldata
    ) external virtual override onlyPoolManager returns (bytes4, int128) {
        return (IHooks.afterSwap.selector, 0);
    }

    function beforeDonate(
        address,
        PoolKey calldata,
        uint256,
        uint256,
        bytes calldata
    ) external virtual override onlyPoolManager returns (bytes4) {
        return IHooks.beforeDonate.selector;
    }

    function afterDonate(
        address,
        PoolKey calldata,
        uint256,
        uint256,
        bytes calldata
    ) external virtual override onlyPoolManager returns (bytes4) {
        return IHooks.afterDonate.selector;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function setAuthorization(address account, bool authorized) external onlyDeveloper {
        _setAuthorization(account, authorized);
    }

    function getDeveloper() external view returns (address) {
        return _developer();
    }

    function isAuthorized(address account) external view returns (bool) {
        return _isAuthorized(account);
    }

    function getHookStateViewer() external view returns (IHookStateLens) {
        return _hookStateViewer();
    }
}
