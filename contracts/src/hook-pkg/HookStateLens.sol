// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {FHE} from "fhenix-contracts/FHE.sol";
import {IHookStateLens} from "./interfaces/IHookStateLens.sol";
import {ICoFHETypes} from "./interfaces/ICoFHETypes.sol";
import {CoFHEHook} from "./CoFHEHook.sol";

/// @title HookStateLens
/// @notice Authorized state variables lens access to authorized clients
/// @dev Uses delegatecall pattern to read state of queried hooks
contract HookStateLens is IHookStateLens {

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Mapping of hook => poolId => encrypted state cache
    mapping(address => mapping(PoolId => bytes)) internal _encryptedStateCache;

    /// @dev Mapping of hook => poolId => last encrypted pool key
    mapping(address => mapping(PoolId => EPoolKey)) internal _encryptedPoolKeys;

    /// @dev Mapping of hook => poolId => last encrypted swap params
    mapping(address => mapping(PoolId => ESwapParams)) internal _encryptedSwapParams;

    /// @dev Mapping of hook => poolId => last encrypted balance delta
    mapping(address => mapping(PoolId => EBalanceDelta)) internal _encryptedBalanceDeltas;

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED STATE GETTERS (Public)
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookStateLens
    function getEncryptedPoolKey(
        address hook,
        PoolId poolId
    ) external view override returns (EPoolKey memory eKey) {
        return _encryptedPoolKeys[hook][poolId];
    }

    /// @inheritdoc IHookStateLens
    function getEncryptedSwapParams(
        address hook,
        PoolId poolId
    ) external view override returns (ESwapParams memory eParams) {
        return _encryptedSwapParams[hook][poolId];
    }

    /// @inheritdoc IHookStateLens
    function getEncryptedBalanceDelta(
        address hook,
        PoolId poolId
    ) external view override returns (EBalanceDelta memory eDelta) {
        return _encryptedBalanceDeltas[hook][poolId];
    }

    /// @inheritdoc IHookStateLens
    function getEncryptedHookState(
        address hook,
        PoolId poolId
    ) external override returns (bytes memory encryptedState) {
        emit StateAccessed(hook, poolId, msg.sender, false);
        return _encryptedStateCache[hook][poolId];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DECRYPTED STATE GETTERS (Authorized only)
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookStateLens
    function getDecryptedHookState(
        address hook,
        PoolId poolId
    ) external override returns (bytes memory hookState) {
        // Check authorization
        if (!_isAuthorized(hook, msg.sender)) {
            revert HookStateLens__NotAuthorized();
        }

        emit StateAccessed(hook, poolId, msg.sender, true);

        // Decrypt cached state
        EPoolKey memory eKey = _encryptedPoolKeys[hook][poolId];
        ESwapParams memory eParams = _encryptedSwapParams[hook][poolId];
        EBalanceDelta memory eDelta = _encryptedBalanceDeltas[hook][poolId];

        // Decrypt and encode
        hookState = abi.encode(
            _decryptPoolKey(eKey),
            _decryptSwapParams(eParams),
            _decryptBalanceDelta(eDelta)
        );
    }

    /// @inheritdoc IHookStateLens
    function isAuthorizedToDecrypt(
        address hook,
        address account
    ) external view override returns (bool authorized) {
        return _isAuthorized(hook, account);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATE SAMPLING (For AVS)
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookStateLens
    function sampleStateForAVS(
        address hook,
        PoolId poolId
    ) external view override returns (
        bytes32 stateHash,
        uint256 timestamp,
        uint256 blockNumber
    ) {
        if (!_isAuthorized(hook, msg.sender)) {
            revert HookStateLens__NotAuthorized();
        }

        bytes memory encryptedState = _encryptedStateCache[hook][poolId];
        stateHash = keccak256(encryptedState);
        timestamp = block.timestamp;
        blockNumber = block.number;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATE UPDATE (Called by CoFHEHook)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Cache encrypted pool key
    /// @dev Called by CoFHEHook after encryption
    function cacheEncryptedPoolKey(
        PoolId poolId,
        EPoolKey calldata eKey
    ) external {
        _encryptedPoolKeys[msg.sender][poolId] = eKey;
    }

    /// @notice Cache encrypted swap params
    function cacheEncryptedSwapParams(
        PoolId poolId,
        ESwapParams calldata eParams
    ) external {
        _encryptedSwapParams[msg.sender][poolId] = eParams;
    }

    /// @notice Cache encrypted balance delta
    function cacheEncryptedBalanceDelta(
        PoolId poolId,
        EBalanceDelta calldata eDelta
    ) external {
        _encryptedBalanceDeltas[msg.sender][poolId] = eDelta;
    }

    /// @notice Cache full encrypted state
    function cacheEncryptedState(
        PoolId poolId,
        bytes calldata encryptedState
    ) external {
        _encryptedStateCache[msg.sender][poolId] = encryptedState;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    function _isAuthorized(address hook, address account) internal view returns (bool) {
        CoFHEHook cofheHook = CoFHEHook(hook);
        return account == cofheHook.developer() || cofheHook.authorizedVerifiers(account);
    }

    /// @dev Decrypted pool key struct for return
    struct DecryptedPoolKey {
        address currency0;
        address currency1;
        uint24 fee;
        int24 tickSpacing;
        address hooks;
    }

    /// @dev Decrypted swap params struct for return
    struct DecryptedSwapParams {
        bool zeroForOne;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
    }

    /// @dev Decrypted balance delta struct for return
    struct DecryptedBalanceDelta {
        int128 amount0;
        int128 amount1;
    }

    function _decryptPoolKey(EPoolKey memory eKey) internal view returns (DecryptedPoolKey memory) {
        return DecryptedPoolKey({
            currency0: address(uint160(FHE.decrypt(eKey.currency0))),
            currency1: address(uint160(FHE.decrypt(eKey.currency1))),
            fee: uint24(FHE.decrypt(eKey.fee)),
            tickSpacing: int24(int32(FHE.decrypt(eKey.tickSpacing))),
            hooks: address(uint160(FHE.decrypt(eKey.hooks)))
        });
    }

    function _decryptSwapParams(ESwapParams memory eParams) internal view returns (DecryptedSwapParams memory) {
        return DecryptedSwapParams({
            zeroForOne: FHE.decrypt(eParams.zeroForOne),
            amountSpecified: int256(FHE.decrypt(eParams.amountSpecified)),
            sqrtPriceLimitX96: uint160(FHE.decrypt(eParams.sqrtPriceLimitX96))
        });
    }

    function _decryptBalanceDelta(EBalanceDelta memory eDelta) internal view returns (DecryptedBalanceDelta memory) {
        return DecryptedBalanceDelta({
            amount0: int128(uint128(FHE.decrypt(eDelta.amount0))),
            amount1: int128(uint128(FHE.decrypt(eDelta.amount1)))
        });
    }
}
