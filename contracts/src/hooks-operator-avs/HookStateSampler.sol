// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHookStateSampler} from "./interfaces/IHookStateSampler.sol";
import {IHooksOperatorAVSTypes} from "./interfaces/IHooksOperatorAVSTypes.sol";

/// @notice Interface for hook state view (placeholder)
interface IHookStateViewSimple {
    function getTraderState(bytes32 poolId) external view returns (bytes memory);
    function getSharedFeeState(bytes32 poolId) external view returns (uint256, uint256);
    function getHookState(bytes32 poolId) external view returns (bytes memory);
    function getLPState(bytes32 poolId) external view returns (bytes memory);
}

/// @title HookStateSampler
/// @notice Collects state samples for hook verification
/// @dev Used by AVS operators for behavioral verification without code disclosure
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
contract HookStateSampler is IHookStateSampler {

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Default state view contract
    address public defaultStateView;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor(address _defaultStateView) {
        defaultStateView = _defaultStateView;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SAMPLING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookStateSampler
    function sampleCurrentState(
        bytes32 poolId,
        address hook,
        address stateView
    ) external view returns (StateSample memory sample) {
        if (poolId == bytes32(0)) revert HookStateSampler__InvalidPool();
        if (hook == address(0)) revert HookStateSampler__InvalidHook();

        address viewContract = stateView != address(0) ? stateView : defaultStateView;

        sample.blockNumber = block.number;
        sample.timestamp = block.timestamp;
        sample.poolId = poolId;

        // Sample via IHookStateViewSimple
        IHookStateViewSimple view_ = IHookStateViewSimple(viewContract);

        // Get LP state
        sample.lpState = view_.getLPState(poolId);

        // Get trader state
        sample.traderState = view_.getTraderState(poolId);

        // Get shared state
        (uint256 feeGrowth0, uint256 feeGrowth1) = view_.getSharedFeeState(poolId);
        sample.sharedState = abi.encode(feeGrowth0, feeGrowth1);

        // Get hook-specific state
        sample.hookState = view_.getHookState(poolId);
    }

    /// @inheritdoc IHookStateSampler
    function sampleTransition(
        bytes32 poolId,
        address hook,
        bytes4 callback,
        bytes calldata input
    ) external returns (TransitionSample memory transition) {
        if (poolId == bytes32(0)) revert HookStateSampler__InvalidPool();
        if (hook == address(0)) revert HookStateSampler__InvalidHook();

        // Record pre-state
        transition.preState = this.sampleCurrentState(poolId, hook, defaultStateView);
        transition.callback = callback;
        transition.input = input;

        // Execute callback and measure gas
        uint256 gasBefore = gasleft();

        // Note: In practice, this would be done via PoolManager
        // with proper context setup for unlock callback
        (bool success, bytes memory returnData) = hook.call(
            abi.encodeWithSelector(callback, input)
        );

        transition.gasUsed = gasBefore - gasleft();

        if (!success) {
            // Still record the failed transition
            transition.returnData = returnData;
        } else {
            transition.returnData = returnData;
        }

        // Record post-state
        transition.postState = this.sampleCurrentState(poolId, hook, defaultStateView);

        emit TransitionSampled(poolId, hook, callback, success);
    }

    /// @inheritdoc IHookStateSampler
    function batchSampleStates(
        bytes32[] calldata poolIds,
        address hook,
        address stateView
    ) external view returns (StateSample[] memory samples) {
        samples = new StateSample[](poolIds.length);

        for (uint256 i = 0; i < poolIds.length; i++) {
            samples[i] = this.sampleCurrentState(poolIds[i], hook, stateView);
        }
    }

    /// @inheritdoc IHookStateSampler
    function computeSamplesHash(StateSample[] calldata samples) external pure returns (bytes32) {
        return keccak256(abi.encode(samples));
    }

    /// @inheritdoc IHookStateSampler
    function computeTransitionsHash(TransitionSample[] calldata transitions) external pure returns (bytes32) {
        return keccak256(abi.encode(transitions));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function setDefaultStateView(address _stateView) external {
        defaultStateView = _stateView;
    }
}
