// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooksOperatorAVSTypes} from "./IHooksOperatorAVSTypes.sol";

/// @title IAttestationRegistry
/// @notice On-chain registry of hook attestations
/// @dev Stores attestation records for verified hooks
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
interface IAttestationRegistry is IHooksOperatorAVSTypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error AttestationRegistry__OnlyTaskManager();
    error AttestationRegistry__AttestationNotFound();
    error AttestationRegistry__AttestationExpired();
    error AttestationRegistry__AttestationAlreadyRevoked();
    error AttestationRegistry__InvalidAttestation();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event AttestationRecorded(
        address indexed hook,
        bytes32 indexed attestationId,
        string specificationURI,
        uint256 expiresAt
    );

    event AttestationRevoked(
        address indexed hook,
        bytes32 indexed attestationId,
        string reason
    );

    event AttestationRenewed(
        address indexed hook,
        bytes32 indexed attestationId,
        uint256 newExpiresAt
    );

    // ═══════════════════════════════════════════════════════════════════════
    // ATTESTATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Record a successful attestation
    /// @dev Called by TaskManager after successful response
    /// @param hook The hook contract address
    /// @param specificationURI IPFS URI of the specification
    /// @param taskIndex The task index from TaskManager
    /// @param responsesHash Hash of all operator responses
    function recordAttestation(
        address hook,
        string calldata specificationURI,
        uint32 taskIndex,
        bytes32 responsesHash
    ) external;

    /// @notice Revoke an attestation
    /// @dev Called when attestation is challenged successfully
    /// @param hook The hook contract address
    /// @param reason Reason for revocation
    function revokeAttestation(address hook, string calldata reason) external;

    /// @notice Renew an existing attestation
    /// @param hook The hook contract address
    /// @param taskIndex New task index for renewal
    /// @param responsesHash New responses hash
    function renewAttestation(
        address hook,
        uint32 taskIndex,
        bytes32 responsesHash
    ) external;

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Check if a hook has valid attestation
    /// @param hook The hook contract address
    /// @return isAttested Whether hook has valid, non-expired attestation
    function isHookAttested(address hook) external view returns (bool isAttested);

    /// @notice Get full attestation details
    /// @param hook The hook contract address
    /// @return attestation The attestation record
    function getAttestation(address hook) external view returns (Attestation memory attestation);

    /// @notice Get attestation history for a hook
    /// @param hook The hook contract address
    /// @return attestationIds Array of historical attestation IDs
    function getAttestationHistory(address hook) external view returns (bytes32[] memory attestationIds);

    /// @notice Get attestation by ID
    /// @param attestationId The attestation ID
    /// @return attestation The attestation record
    function getAttestationById(bytes32 attestationId) external view returns (Attestation memory attestation);

    /// @notice Get attestation validity period
    /// @return period The validity period in seconds
    function ATTESTATION_VALIDITY_PERIOD() external view returns (uint256 period);
}
