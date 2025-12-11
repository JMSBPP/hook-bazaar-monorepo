// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IHookStateLens} from "./interfaces/IHookStateLens.sol";

// ═══════════════════════════════════════════════════════════════════════
// EXTERNAL INTERFACES
// ═══════════════════════════════════════════════════════════════════════

interface IHookLicenseIssuer {}

interface IHaaSMarket {
    function unlock(IHookLicenseIssuer licenseIssuer, PoolId poolId) external;
}

/// @title HaaSMod
/// @notice Base modifier contract for HaaS (Hook-as-a-Service) pattern
/// @dev Provides common storage access and authorization for hook implementations
abstract contract HaaSMod {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error HaaSMod__OnlyPoolManager();
    error HaaSMod__OnlyDeveloper();
    error HaaSMod__Unauthorized();

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE LAYOUT (Diamond Pattern Compatible)
    // ═══════════════════════════════════════════════════════════════════════

    bytes32 constant HAAS_STORAGE_POSITION = keccak256("hook-bazaar.haas.storage");

    struct HaaSStorage {
        IPoolManager poolManager;
        IHaaSMarket hooksMarket;
        IHookStateLens hookStateViewer;
        IHookLicenseIssuer hookLicenseIssuer;
        address developer;
        mapping(address => bool) authorizedAccounts;
    }

    function _getHaaSStorage() internal pure returns (HaaSStorage storage $) {
        bytes32 position = HAAS_STORAGE_POSITION;
        assembly {
            $.slot := position
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyPoolManager() {
        HaaSStorage storage $ = _getHaaSStorage();
        if (msg.sender != address($.poolManager)) revert HaaSMod__OnlyPoolManager();
        _;
    }

    modifier onlyDeveloper() {
        HaaSStorage storage $ = _getHaaSStorage();
        if (msg.sender != $.developer) revert HaaSMod__OnlyDeveloper();
        _;
    }

    modifier onlyAuthorized() {
        HaaSStorage storage $ = _getHaaSStorage();
        if (msg.sender != $.developer && !$.authorizedAccounts[msg.sender]) {
            revert HaaSMod__Unauthorized();
        }
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE ACCESSORS
    // ═══════════════════════════════════════════════════════════════════════

    function _poolManager() internal view returns (IPoolManager) {
        return _getHaaSStorage().poolManager;
    }

    function _hooksMarket() internal view returns (IHaaSMarket) {
        return _getHaaSStorage().hooksMarket;
    }

    function _hookStateViewer() internal view returns (IHookStateLens) {
        return _getHaaSStorage().hookStateViewer;
    }

    function _hookLicenseIssuer() internal view returns (IHookLicenseIssuer) {
        return _getHaaSStorage().hookLicenseIssuer;
    }

    function _developer() internal view returns (address) {
        return _getHaaSStorage().developer;
    }

    function _isAuthorized(address account) internal view returns (bool) {
        HaaSStorage storage $ = _getHaaSStorage();
        return account == $.developer || $.authorizedAccounts[account];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    function _initializeHaaS(
        IPoolManager poolManager_,
        IHaaSMarket hooksMarket_,
        IHookStateLens hookStateViewer_,
        IHookLicenseIssuer hookLicenseIssuer_,
        address developer_
    ) internal {
        HaaSStorage storage $ = _getHaaSStorage();
        $.poolManager = poolManager_;
        $.hooksMarket = hooksMarket_;
        $.hookStateViewer = hookStateViewer_;
        $.hookLicenseIssuer = hookLicenseIssuer_;
        $.developer = developer_;
        $.authorizedAccounts[developer_] = true;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AUTHORIZATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    function _setAuthorization(address account, bool authorized) internal {
        _getHaaSStorage().authorizedAccounts[account] = authorized;
    }
}
