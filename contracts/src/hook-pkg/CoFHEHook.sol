// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta, toBalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, toBeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {FHE, ebool, euint32, euint128, euint256, eaddress} from "fhenix-contracts/FHE.sol";
import {ICoFHEHookMod} from "./interfaces/ICoFHEHookMod.sol";
import {ICoFHETypes} from "./interfaces/ICoFHETypes.sol";

/// @title CoFHEHook
/// @notice IHooks-compliant wrapper that encrypts params and forwards to CoFHEHookMod
/// @dev Receives plaintext calls from PoolManager, encrypts, calls mod, decrypts results
contract CoFHEHook is IHooks, ICoFHETypes {
    using PoolIdLibrary for PoolKey;

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error CoFHEHook__OnlyPoolManager();
    error CoFHEHook__OnlyDeveloper();
    error CoFHEHook__NotAuthorized();
    error CoFHEHook__ModNotSet();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event ModUpdated(address indexed oldMod, address indexed newMod);
    event VerifierAuthorized(address indexed verifier, bool authorized);

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════

    IPoolManager public immutable poolManager;
    address public immutable developer;

    /// @dev The encrypted hook logic module
    ICoFHEHookMod public hookMod;

    /// @dev Authorized verifiers who can access decrypted state
    mapping(address => bool) public authorizedVerifiers;

    // ═══════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyPoolManager() {
        if (msg.sender != address(poolManager)) revert CoFHEHook__OnlyPoolManager();
        _;
    }

    modifier onlyDeveloper() {
        if (msg.sender != developer) revert CoFHEHook__OnlyDeveloper();
        _;
    }

    modifier onlyAuthorized() {
        if (msg.sender != developer && !authorizedVerifiers[msg.sender]) {
            revert CoFHEHook__NotAuthorized();
        }
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor(IPoolManager poolManager_, address developer_) {
        poolManager = poolManager_;
        developer = developer_;
        authorizedVerifiers[developer_] = true;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Set the encrypted hook logic module
    /// @dev Only callable by developer
    function setHookMod(ICoFHEHookMod mod_) external onlyDeveloper {
        emit ModUpdated(address(hookMod), address(mod_));
        hookMod = mod_;
    }

    /// @notice Authorize/deauthorize a verifier
    function setVerifierAuthorization(address verifier, bool authorized) external onlyDeveloper {
        authorizedVerifiers[verifier] = authorized;
        emit VerifierAuthorized(verifier, authorized);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTION HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    function _encryptAddress(address addr) internal pure returns (eaddress) {
        return FHE.asEaddress(addr);
    }

    function _encryptUint160(uint160 val) internal pure returns (euint256) {
        return FHE.asEuint256(uint256(val));
    }

    function _encryptUint256(uint256 val) internal pure returns (euint256) {
        return FHE.asEuint256(val);
    }

    function _encryptInt256(int256 val) internal pure returns (euint256) {
        // Store as uint256 - sign handling done in mod
        return FHE.asEuint256(val >= 0 ? uint256(val) : uint256(-val));
    }

    function _encryptUint24(uint24 val) internal pure returns (euint32) {
        return FHE.asEuint32(uint32(val));
    }

    function _encryptInt24(int24 val) internal pure returns (euint32) {
        return FHE.asEuint32(val >= 0 ? uint32(uint24(val)) : uint32(uint24(-val)));
    }

    function _encryptBool(bool val) internal pure returns (ebool) {
        return FHE.asEbool(val);
    }

    function _encryptInt128(int128 val) internal pure returns (euint128) {
        return FHE.asEuint128(val >= 0 ? uint128(val) : uint128(-val));
    }

    function _encryptPoolKey(PoolKey calldata key) internal pure returns (EPoolKey memory) {
        return EPoolKey({
            currency0: _encryptAddress(Currency.unwrap(key.currency0)),
            currency1: _encryptAddress(Currency.unwrap(key.currency1)),
            fee: _encryptUint24(key.fee),
            tickSpacing: _encryptInt24(key.tickSpacing),
            hooks: _encryptAddress(address(key.hooks))
        });
    }

    function _encryptModifyLiquidityParams(ModifyLiquidityParams calldata params) internal pure returns (EModifyLiquidityParams memory) {
        return EModifyLiquidityParams({
            tickLower: _encryptInt24(params.tickLower),
            tickUpper: _encryptInt24(params.tickUpper),
            liquidityDelta: _encryptInt256(params.liquidityDelta),
            salt: _encryptUint256(uint256(params.salt))
        });
    }

    function _encryptSwapParams(SwapParams calldata params) internal pure returns (ESwapParams memory) {
        return ESwapParams({
            zeroForOne: _encryptBool(params.zeroForOne),
            amountSpecified: _encryptInt256(params.amountSpecified),
            sqrtPriceLimitX96: _encryptUint160(params.sqrtPriceLimitX96)
        });
    }

    function _encryptBalanceDelta(BalanceDelta delta) internal pure returns (EBalanceDelta memory) {
        return EBalanceDelta({
            amount0: _encryptInt128(delta.amount0()),
            amount1: _encryptInt128(delta.amount1())
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DECRYPTION HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    function _decryptBalanceDelta(EBalanceDelta memory eDelta) internal view returns (BalanceDelta) {
        int128 amount0 = int128(uint128(FHE.decrypt(eDelta.amount0)));
        int128 amount1 = int128(uint128(FHE.decrypt(eDelta.amount1)));
        return toBalanceDelta(amount0, amount1);
    }

    function _decryptBeforeSwapDelta(EBeforeSwapDelta memory eDelta) internal view returns (BeforeSwapDelta) {
        int128 specified = int128(uint128(FHE.decrypt(eDelta.deltaSpecified)));
        int128 unspecified = int128(uint128(FHE.decrypt(eDelta.deltaUnspecified)));
        return toBeforeSwapDelta(specified, unspecified);
    }

    function _decryptUint24(euint32 eVal) internal view returns (uint24) {
        return uint24(FHE.decrypt(eVal));
    }

    function _decryptInt128(euint128 eVal) internal view returns (int128) {
        return int128(uint128(FHE.decrypt(eVal)));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // IHOOKS IMPLEMENTATION - Encrypt, forward to mod, decrypt
    // ═══════════════════════════════════════════════════════════════════════

    function beforeInitialize(
        address sender,
        PoolKey calldata key,
        uint160 sqrtPriceX96
    ) external override onlyPoolManager returns (bytes4) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        return hookMod.beforeInitialize(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptUint160(sqrtPriceX96)
        );
    }

    function afterInitialize(
        address sender,
        PoolKey calldata key,
        uint160 sqrtPriceX96,
        int24 tick
    ) external override onlyPoolManager returns (bytes4) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        return hookMod.afterInitialize(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptUint160(sqrtPriceX96),
            _encryptInt24(tick)
        );
    }

    function beforeAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        return hookMod.beforeAddLiquidity(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptModifyLiquidityParams(params),
            hookData
        );
    }

    function afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4, BalanceDelta) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        (bytes4 selector, EBalanceDelta memory eHookDelta) = hookMod.afterAddLiquidity(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptModifyLiquidityParams(params),
            _encryptBalanceDelta(delta),
            _encryptBalanceDelta(feesAccrued),
            hookData
        );

        return (selector, _decryptBalanceDelta(eHookDelta));
    }

    function beforeRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        return hookMod.beforeRemoveLiquidity(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptModifyLiquidityParams(params),
            hookData
        );
    }

    function afterRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4, BalanceDelta) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        (bytes4 selector, EBalanceDelta memory eHookDelta) = hookMod.afterRemoveLiquidity(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptModifyLiquidityParams(params),
            _encryptBalanceDelta(delta),
            _encryptBalanceDelta(feesAccrued),
            hookData
        );

        return (selector, _decryptBalanceDelta(eHookDelta));
    }

    function beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        (bytes4 selector, EBeforeSwapDelta memory eDelta, euint32 eFeeOverride) = hookMod.beforeSwap(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptSwapParams(params),
            hookData
        );

        return (
            selector,
            _decryptBeforeSwapDelta(eDelta),
            _decryptUint24(eFeeOverride)
        );
    }

    function afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4, int128) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        (bytes4 selector, euint128 eHookDelta) = hookMod.afterSwap(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptSwapParams(params),
            _encryptBalanceDelta(delta),
            hookData
        );

        return (selector, _decryptInt128(eHookDelta));
    }

    function beforeDonate(
        address sender,
        PoolKey calldata key,
        uint256 amount0,
        uint256 amount1,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        return hookMod.beforeDonate(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptUint256(amount0),
            _encryptUint256(amount1),
            hookData
        );
    }

    function afterDonate(
        address sender,
        PoolKey calldata key,
        uint256 amount0,
        uint256 amount1,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4) {
        if (address(hookMod) == address(0)) revert CoFHEHook__ModNotSet();

        return hookMod.afterDonate(
            _encryptAddress(sender),
            _encryptPoolKey(key),
            _encryptUint256(amount0),
            _encryptUint256(amount1),
            hookData
        );
    }
}
