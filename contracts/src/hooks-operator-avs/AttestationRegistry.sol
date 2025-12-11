// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnableUpgradeable} from "@openzeppelin-upgrades/contracts/access/OwnableUpgradeable.sol";

import {IAttestationRegistry} from "./interfaces/IAttestationRegistry.sol";
import {IHooksOperatorAVSTypes} from "./interfaces/IHooksOperatorAVSTypes.sol";

/// @title AttestationRegistry
/// @notice On-chain registry of hook attestations
/// @dev Stores attestation records for verified hooks
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
contract AttestationRegistry is IAttestationRegistry, OwnableUpgradeable {

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Attestation validity period (30 days)
    uint256 public constant ATTESTATION_VALIDITY_PERIOD = 30 days;

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Task manager address
    address public taskManager;

    /// @notice hook address => Attestation
    mapping(address => Attestation) private _attestations;

    /// @notice hook address => attestation history
    mapping(address => bytes32[]) private _attestationHistory;

    /// @notice attestation ID => Attestation
    mapping(bytes32 => Attestation) private _attestationsById;

    // ═══════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyTaskManager() {
        if (msg.sender != taskManager) revert AttestationRegistry__OnlyTaskManager();
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

    function initialize(address _taskManager, address initialOwner) external initializer {
        __Ownable_init();
        if (initialOwner != msg.sender) {
            _transferOwnership(initialOwner);
        }
        taskManager = _taskManager;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function setTaskManager(address _taskManager) external onlyOwner {
        taskManager = _taskManager;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ATTESTATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IAttestationRegistry
    function recordAttestation(
        address hook,
        string calldata specificationURI,
        uint32 taskIndex,
        bytes32 responsesHash
    ) external onlyTaskManager {
        if (hook == address(0)) revert AttestationRegistry__InvalidAttestation();

        bytes32 attestationId = keccak256(abi.encode(
            hook,
            specificationURI,
            taskIndex,
            block.timestamp
        ));

        Attestation memory attestation = Attestation({
            attestationId: attestationId,
            hook: hook,
            specificationURI: specificationURI,
            isValid: true,
            attestedAt: block.timestamp,
            expiresAt: block.timestamp + ATTESTATION_VALIDITY_PERIOD,
            taskIndex: taskIndex,
            responsesHash: responsesHash
        });

        _attestations[hook] = attestation;
        _attestationsById[attestationId] = attestation;
        _attestationHistory[hook].push(attestationId);

        emit AttestationRecorded(hook, attestationId, specificationURI, attestation.expiresAt);
    }

    /// @inheritdoc IAttestationRegistry
    function revokeAttestation(address hook, string calldata reason) external onlyTaskManager {
        Attestation storage attestation = _attestations[hook];
        if (attestation.attestationId == bytes32(0)) revert AttestationRegistry__AttestationNotFound();
        if (!attestation.isValid) revert AttestationRegistry__AttestationAlreadyRevoked();

        attestation.isValid = false;
        _attestationsById[attestation.attestationId].isValid = false;

        emit AttestationRevoked(hook, attestation.attestationId, reason);
    }

    /// @inheritdoc IAttestationRegistry
    function renewAttestation(
        address hook,
        uint32 taskIndex,
        bytes32 responsesHash
    ) external onlyTaskManager {
        Attestation storage attestation = _attestations[hook];
        if (attestation.attestationId == bytes32(0)) revert AttestationRegistry__AttestationNotFound();

        // Create new attestation ID for renewal
        bytes32 newAttestationId = keccak256(abi.encode(
            hook,
            attestation.specificationURI,
            taskIndex,
            block.timestamp
        ));

        uint256 newExpiresAt = block.timestamp + ATTESTATION_VALIDITY_PERIOD;

        // Update attestation
        attestation.attestationId = newAttestationId;
        attestation.isValid = true;
        attestation.attestedAt = block.timestamp;
        attestation.expiresAt = newExpiresAt;
        attestation.taskIndex = taskIndex;
        attestation.responsesHash = responsesHash;

        _attestationsById[newAttestationId] = attestation;
        _attestationHistory[hook].push(newAttestationId);

        emit AttestationRenewed(hook, newAttestationId, newExpiresAt);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IAttestationRegistry
    function isHookAttested(address hook) external view returns (bool) {
        Attestation storage attestation = _attestations[hook];
        return attestation.isValid && attestation.expiresAt > block.timestamp;
    }

    /// @inheritdoc IAttestationRegistry
    function getAttestation(address hook) external view returns (Attestation memory) {
        return _attestations[hook];
    }

    /// @inheritdoc IAttestationRegistry
    function getAttestationHistory(address hook) external view returns (bytes32[] memory) {
        return _attestationHistory[hook];
    }

    /// @inheritdoc IAttestationRegistry
    function getAttestationById(bytes32 attestationId) external view returns (Attestation memory) {
        return _attestationsById[attestationId];
    }

    // Storage gap for upgrades
    uint256[45] private __gap;
}
