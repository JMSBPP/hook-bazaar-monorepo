// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {ICoFHETypes} from "./ICoFHETypes.sol";

/// @title IHookStateLens
/// @notice Interface for viewing encrypted hook state with decryption for authorized parties
/// @dev Uses delegatecall pattern to read state of queried hooks
interface IHookStateLens is ICoFHETypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error HookStateLens__NotAuthorized();
    error HookStateLens__HookNotRegistered();
    error HookStateLens__DecryptionFailed();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event StateAccessed(
        address indexed hook,
        PoolId indexed poolId,
        address indexed requester,
        bool decrypted
    );

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED STATE (Public - anyone can see encrypted handles)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get encrypted pool key for a hook's pool
    /// @param hook The hook contract address
    /// @param poolId The pool identifier
    /// @return eKey Encrypted pool key
    function getEncryptedPoolKey(
        address hook,
        PoolId poolId
    ) external view returns (EPoolKey memory eKey);

    /// @notice Get encrypted swap params from last swap
    /// @param hook The hook contract address
    /// @param poolId The pool identifier
    /// @return eParams Encrypted swap parameters
    function getEncryptedSwapParams(
        address hook,
        PoolId poolId
    ) external view returns (ESwapParams memory eParams);

    /// @notice Get encrypted balance delta from last operation
    /// @param hook The hook contract address
    /// @param poolId The pool identifier
    /// @return eDelta Encrypted balance delta
    function getEncryptedBalanceDelta(
        address hook,
        PoolId poolId
    ) external view returns (EBalanceDelta memory eDelta);

    /// @notice Get raw encrypted hook state bytes
    /// @param hook The hook contract address
    /// @param poolId The pool identifier
    /// @return encryptedState ABI-encoded encrypted state
    function getEncryptedHookState(
        address hook,
        PoolId poolId
    ) external returns (bytes memory encryptedState);

    // ═══════════════════════════════════════════════════════════════════════
    // DECRYPTED STATE (Authorized only - developer and verifiers)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get decrypted hook state (authorized verifiers only)
    /// @dev Decrypts all encrypted state for AVS verification
    /// @param hook The hook contract address
    /// @param poolId The pool identifier
    /// @return hookState ABI-encoded decrypted hook state
    function getDecryptedHookState(
        address hook,
        PoolId poolId
    ) external returns (bytes memory hookState);

    /// @notice Check if caller is authorized to decrypt
    /// @param hook The hook contract address
    /// @param account The account to check
    /// @return authorized True if authorized
    function isAuthorizedToDecrypt(
        address hook,
        address account
    ) external view returns (bool authorized);

    // ═══════════════════════════════════════════════════════════════════════
    // STATE SAMPLING (For AVS)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Sample state for AVS verification
    /// @param hook The hook contract address
    /// @param poolId The pool identifier
    /// @return stateHash Hash of current state
    /// @return timestamp Block timestamp
    /// @return blockNumber Current block number
    function sampleStateForAVS(
        address hook,
        PoolId poolId
    ) external view returns (
        bytes32 stateHash,
        uint256 timestamp,
        uint256 blockNumber
    );
}
