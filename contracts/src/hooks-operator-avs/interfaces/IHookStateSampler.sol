// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooksOperatorAVSTypes} from "./IHooksOperatorAVSTypes.sol";

/// @title IHookStateSampler
/// @notice Interface for collecting state samples for verification
/// @dev Used by AVS operators for behavioral verification without code disclosure
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
interface IHookStateSampler is IHooksOperatorAVSTypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error HookStateSampler__InvalidPool();
    error HookStateSampler__InvalidHook();
    error HookStateSampler__SamplingFailed();
    error HookStateSampler__TransitionFailed();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event StateSampled(
        bytes32 indexed poolId,
        address indexed hook,
        uint256 blockNumber
    );

    event TransitionSampled(
        bytes32 indexed poolId,
        address indexed hook,
        bytes4 callback,
        bool success
    );

    // ═══════════════════════════════════════════════════════════════════════
    // SAMPLING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Sample current pool and hook state
    /// @param poolId Pool to sample
    /// @param hook Hook contract
    /// @param stateView State view contract
    /// @return sample The state sample
    function sampleCurrentState(
        bytes32 poolId,
        address hook,
        address stateView
    ) external view returns (StateSample memory sample);

    /// @notice Sample a state transition by executing callback
    /// @param poolId Pool to test
    /// @param hook Hook contract
    /// @param callback Callback selector
    /// @param input Callback input
    /// @return transition The transition sample
    function sampleTransition(
        bytes32 poolId,
        address hook,
        bytes4 callback,
        bytes calldata input
    ) external returns (TransitionSample memory transition);

    /// @notice Batch sample multiple states
    /// @param poolIds Pools to sample
    /// @param hook Hook contract
    /// @param stateView State view contract
    /// @return samples Array of state samples
    function batchSampleStates(
        bytes32[] calldata poolIds,
        address hook,
        address stateView
    ) external view returns (StateSample[] memory samples);

    /// @notice Compute hash of samples for verification
    /// @param samples Array of state samples
    /// @return hash Keccak256 hash of encoded samples
    function computeSamplesHash(StateSample[] calldata samples) external pure returns (bytes32 hash);

    /// @notice Compute hash of transition samples
    /// @param transitions Array of transition samples
    /// @return hash Keccak256 hash of encoded transitions
    function computeTransitionsHash(TransitionSample[] calldata transitions) external pure returns (bytes32 hash);
}
