// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooksOperatorAVSTypes} from "./IHooksOperatorAVSTypes.sol";

/// @notice BLS Signature Checker placeholder interface
/// @dev In production, replace with: import {BLSSignatureChecker} from "eigenlayer-middleware/src/BLSSignatureChecker.sol";
interface IBLSSignatureCheckerTypes {
    struct NonSignerStakesAndSignature {
        uint32[] nonSignerQuorumBitmapIndices;
        bytes32[] nonSignerPubkeys;
        bytes32[] quorumApks;
        bytes signature;
        uint32[] quorumApkIndices;
        uint32[] totalStakeIndices;
        uint32[][] nonSignerStakeIndices;
    }
}

/// @title IHookAttestationTaskManager
/// @notice Task manager for hook specification verification
/// @dev Based on Incredible Squaring AVS pattern
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
interface IHookAttestationTaskManager is IHooksOperatorAVSTypes, IBLSSignatureCheckerTypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error HookAttestationTaskManager__TaskNotFound();
    error HookAttestationTaskManager__TaskAlreadyResponded();
    error HookAttestationTaskManager__TaskExpired();
    error HookAttestationTaskManager__InvalidTask();
    error HookAttestationTaskManager__QuorumNotMet();
    error HookAttestationTaskManager__InvalidSignature();
    error HookAttestationTaskManager__ChallengeWindowExpired();
    error HookAttestationTaskManager__InvalidChallenge();
    error HookAttestationTaskManager__Unauthorized();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event AttestationTaskCreated(
        uint32 indexed taskIndex,
        AttestationTask task
    );

    event AttestationTaskResponded(
        uint32 indexed taskIndex,
        AttestationResponse response,
        AttestationResponseMetadata metadata
    );

    event AttestationChallenged(
        uint32 indexed taskIndex,
        address indexed challenger,
        bool challengeSuccessful
    );

    event TaskCompleted(
        uint32 indexed taskIndex,
        bool specCompliant
    );

    // ═══════════════════════════════════════════════════════════════════════
    // TASK LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Create a new attestation task
    /// @param hook The hook contract to verify
    /// @param specificationURI IPFS URI of formal specification
    /// @param poolIds Pools to sample for verification
    /// @param callbacks Hook callbacks to test
    /// @param sampleCount Number of state samples to collect
    /// @return taskIndex The created task index
    function createAttestationTask(
        address hook,
        string calldata specificationURI,
        bytes32[] calldata poolIds,
        bytes4[] calldata callbacks,
        uint32 sampleCount
    ) external returns (uint32 taskIndex);

    /// @notice Respond to an attestation task
    /// @param task The original task
    /// @param response The verification response
    /// @param nonSignerStakesAndSignature BLS signature data
    function respondToAttestationTask(
        AttestationTask calldata task,
        AttestationResponse calldata response,
        NonSignerStakesAndSignature memory nonSignerStakesAndSignature
    ) external;

    /// @notice Challenge a false positive attestation
    /// @dev Hook was attested but doesn't match spec
    /// @param task The original task
    /// @param response The contested response
    /// @param counterSample State samples proving non-compliance
    function challengeFalsePositive(
        AttestationTask calldata task,
        AttestationResponse calldata response,
        TransitionSample calldata counterSample
    ) external;

    /// @notice Challenge a false negative attestation
    /// @dev Hook was rejected but actually matches spec
    /// @param task The original task
    /// @param response The contested response
    /// @param complianceSamples Samples proving compliance
    function challengeFalseNegative(
        AttestationTask calldata task,
        AttestationResponse calldata response,
        TransitionSample[] calldata complianceSamples
    ) external;

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get task by index
    /// @param taskIndex The task index
    /// @return task The attestation task
    function getTask(uint32 taskIndex) external view returns (AttestationTask memory task);

    /// @notice Get task response
    /// @param taskIndex The task index
    /// @return response The attestation response
    function getTaskResponse(uint32 taskIndex) external view returns (AttestationResponse memory response);

    /// @notice Get latest task index
    /// @return latestTaskIndex The latest task index
    function latestTaskNum() external view returns (uint32 latestTaskIndex);

    /// @notice Check if task has been responded to
    /// @param taskIndex The task index
    /// @return responded Whether task has response
    function taskResponded(uint32 taskIndex) external view returns (bool responded);

    /// @notice Get task response window blocks
    /// @return blocks The response window in blocks
    function TASK_RESPONSE_WINDOW_BLOCK() external view returns (uint32 blocks);

    /// @notice Get task challenge window blocks
    /// @return blocks The challenge window in blocks
    function TASK_CHALLENGE_WINDOW_BLOCK() external view returns (uint32 blocks);
}
