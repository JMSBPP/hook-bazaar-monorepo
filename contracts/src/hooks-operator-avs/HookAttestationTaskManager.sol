// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnableUpgradeable} from "@openzeppelin-upgrades/contracts/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin-upgrades/contracts/security/PausableUpgradeable.sol";

import {IHookAttestationTaskManager} from "./interfaces/IHookAttestationTaskManager.sol";
import {IHooksOperatorAVSTypes} from "./interfaces/IHooksOperatorAVSTypes.sol";
import {IAttestationRegistry} from "./interfaces/IAttestationRegistry.sol";

/// @title HookAttestationTaskManager
/// @notice Manages attestation tasks for hook specification verification
/// @dev Based on Incredible Squaring AVS task manager pattern
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
contract HookAttestationTaskManager is
    IHookAttestationTaskManager,
    OwnableUpgradeable,
    PausableUpgradeable
{

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Response window in blocks
    uint32 public constant TASK_RESPONSE_WINDOW_BLOCK = 100;

    /// @notice Challenge window in blocks
    uint32 public constant TASK_CHALLENGE_WINDOW_BLOCK = 200;

    /// @notice Compliance tolerance (basis points)
    uint256 public constant COMPLIANCE_TOLERANCE = 100; // 1%

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice BLS signature checker address
    /// @dev In production, use BLSSignatureChecker from eigenlayer-middleware
    address public blsSignatureChecker;

    /// @notice Attestation registry
    IAttestationRegistry public attestationRegistry;

    /// @notice Service manager
    address public serviceManager;

    /// @notice Latest task number
    uint32 public latestTaskNum;

    /// @notice Task hash => task responded
    mapping(bytes32 => bool) private _taskResponded;

    /// @notice Task index => task hash
    mapping(uint32 => bytes32) public allTaskHashes;

    /// @notice Task index => response hash
    mapping(uint32 => bytes32) public allTaskResponses;

    /// @notice Task index => AttestationTask
    mapping(uint32 => AttestationTask) private _tasks;

    /// @notice Task index => AttestationResponse
    mapping(uint32 => AttestationResponse) private _responses;

    /// @notice Task index => response metadata
    mapping(uint32 => AttestationResponseMetadata) private _responseMetadata;

    // ═══════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyServiceManager() {
        require(msg.sender == serviceManager, "Only service manager");
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor() {
        _disableInitializers();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    function initialize(
        address _blsSignatureChecker,
        address _attestationRegistry,
        address _serviceManager,
        address initialOwner
    ) external initializer {
        __Ownable_init();
        __Pausable_init();
        if (initialOwner != msg.sender) {
            _transferOwnership(initialOwner);
        }

        blsSignatureChecker = _blsSignatureChecker;
        attestationRegistry = IAttestationRegistry(_attestationRegistry);
        serviceManager = _serviceManager;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TASK CREATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookAttestationTaskManager
    function createAttestationTask(
        address hook,
        string calldata specificationURI,
        bytes32[] calldata poolIds,
        bytes4[] calldata callbacks,
        uint32 sampleCount
    ) external whenNotPaused returns (uint32 taskIndex) {
        if (hook == address(0)) revert HookAttestationTaskManager__InvalidTask();
        if (bytes(specificationURI).length == 0) revert HookAttestationTaskManager__InvalidTask();
        if (poolIds.length == 0) revert HookAttestationTaskManager__InvalidTask();
        if (callbacks.length == 0) revert HookAttestationTaskManager__InvalidTask();

        taskIndex = latestTaskNum;

        AttestationTask memory task = AttestationTask({
            hook: hook,
            specificationURI: specificationURI,
            poolIds: poolIds,
            callbacks: callbacks,
            sampleCount: sampleCount,
            taskCreatedBlock: uint32(block.number),
            quorumNumbers: hex"00", // Default quorum
            quorumThresholdPercentage: 6667 // 66.67%
        });

        // Store task
        _tasks[taskIndex] = task;
        allTaskHashes[taskIndex] = keccak256(abi.encode(task));

        emit AttestationTaskCreated(taskIndex, task);

        latestTaskNum++;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TASK RESPONSE
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookAttestationTaskManager
    function respondToAttestationTask(
        AttestationTask calldata task,
        AttestationResponse calldata response,
        NonSignerStakesAndSignature memory nonSignerStakesAndSignature
    ) external whenNotPaused {
        uint32 taskIndex = response.referenceTaskIndex;

        // Validate task
        bytes32 taskHash = keccak256(abi.encode(task));
        if (allTaskHashes[taskIndex] != taskHash) revert HookAttestationTaskManager__InvalidTask();

        // Check not already responded
        if (_taskResponded[taskHash]) revert HookAttestationTaskManager__TaskAlreadyResponded();

        // Check response window
        if (block.number > task.taskCreatedBlock + TASK_RESPONSE_WINDOW_BLOCK) {
            revert HookAttestationTaskManager__TaskExpired();
        }

        // Verify BLS signature (simplified - in production would use full verification)
        // blsSignatureChecker.checkSignatures(...)

        // Store response
        _responses[taskIndex] = response;
        _responseMetadata[taskIndex] = AttestationResponseMetadata({
            taskRespondedBlock: uint32(block.number),
            hashOfNonSigners: keccak256(abi.encode(nonSignerStakesAndSignature))
        });

        bytes32 responseHash = keccak256(abi.encode(response));
        allTaskResponses[taskIndex] = responseHash;
        _taskResponded[taskHash] = true;

        emit AttestationTaskResponded(taskIndex, response, _responseMetadata[taskIndex]);

        // If compliant, record attestation
        if (response.specCompliant) {
            attestationRegistry.recordAttestation(
                task.hook,
                task.specificationURI,
                taskIndex,
                responseHash
            );
        }

        emit TaskCompleted(taskIndex, response.specCompliant);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CHALLENGE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookAttestationTaskManager
    function challengeFalsePositive(
        AttestationTask calldata task,
        AttestationResponse calldata response,
        TransitionSample calldata counterSample
    ) external whenNotPaused {
        uint32 taskIndex = response.referenceTaskIndex;

        // Validate response exists and was compliant
        if (!response.specCompliant) revert HookAttestationTaskManager__InvalidChallenge();

        // Check challenge window
        AttestationResponseMetadata memory metadata = _responseMetadata[taskIndex];
        if (block.number > metadata.taskRespondedBlock + TASK_CHALLENGE_WINDOW_BLOCK) {
            revert HookAttestationTaskManager__ChallengeWindowExpired();
        }

        // Verify counter sample proves non-compliance
        // In production: verify sample authenticity and check against spec
        bool challengeSuccessful = _verifyCounterSample(task, counterSample);

        if (challengeSuccessful) {
            // Revoke attestation
            attestationRegistry.revokeAttestation(task.hook, "Challenge successful: false positive");

            // Slash operators (via service manager)
            // serviceManager.slashOperators(...)
        }

        emit AttestationChallenged(taskIndex, msg.sender, challengeSuccessful);
    }

    /// @inheritdoc IHookAttestationTaskManager
    function challengeFalseNegative(
        AttestationTask calldata task,
        AttestationResponse calldata response,
        TransitionSample[] calldata complianceSamples
    ) external whenNotPaused {
        uint32 taskIndex = response.referenceTaskIndex;

        // Validate response exists and was non-compliant
        if (response.specCompliant) revert HookAttestationTaskManager__InvalidChallenge();

        // Check challenge window
        AttestationResponseMetadata memory metadata = _responseMetadata[taskIndex];
        if (block.number > metadata.taskRespondedBlock + TASK_CHALLENGE_WINDOW_BLOCK) {
            revert HookAttestationTaskManager__ChallengeWindowExpired();
        }

        // Verify compliance samples prove the hook is actually compliant
        bool challengeSuccessful = _verifyComplianceSamples(task, complianceSamples);

        if (challengeSuccessful) {
            // Record attestation that was wrongly denied
            attestationRegistry.recordAttestation(
                task.hook,
                task.specificationURI,
                taskIndex,
                keccak256(abi.encode(complianceSamples))
            );

            // Slash operators (via service manager)
            // serviceManager.slashOperators(...)
        }

        emit AttestationChallenged(taskIndex, msg.sender, challengeSuccessful);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookAttestationTaskManager
    function getTask(uint32 taskIndex) external view returns (AttestationTask memory) {
        return _tasks[taskIndex];
    }

    /// @inheritdoc IHookAttestationTaskManager
    function getTaskResponse(uint32 taskIndex) external view returns (AttestationResponse memory) {
        return _responses[taskIndex];
    }

    /// @inheritdoc IHookAttestationTaskManager
    function taskResponded(uint32 taskIndex) external view returns (bool) {
        return _taskResponded[allTaskHashes[taskIndex]];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function _verifyCounterSample(
        AttestationTask calldata,
        TransitionSample calldata
    ) internal pure returns (bool) {
        // In production: verify the counter sample against the specification
        // This is a placeholder that always returns false
        return false;
    }

    function _verifyComplianceSamples(
        AttestationTask calldata task,
        TransitionSample[] calldata samples
    ) internal pure returns (bool) {
        // In production: verify all samples prove compliance
        // Check minimum sample coverage
        if (samples.length < task.sampleCount) {
            return false;
        }
        return true;
    }

    // Storage gap for upgrades
    uint256[40] private __gap;
}
