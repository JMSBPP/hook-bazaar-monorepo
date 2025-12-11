// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooksOperatorAVSTypes} from "./IHooksOperatorAVSTypes.sol";

/// @notice Signature type for operator registration
/// @dev In production, import from eigenlayer-contracts/src/contracts/interfaces/ISignatureUtilsMixin.sol
struct SignatureWithSaltAndExpiryCH {
    bytes signature;
    bytes32 salt;
    uint256 expiry;
}

/// @title IClearingHouse
/// @notice Coordinates bonded engagement between HookDevelopers and Protocols
/// @dev Entry point for RegistryCoordinator interactions
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
interface IClearingHouse is IHooksOperatorAVSTypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error ClearingHouse__InvalidLicense();
    error ClearingHouse__EngagementAlreadyAccepted();
    error ClearingHouse__InsufficientBond();
    error ClearingHouse__RegistrationFailed();
    error ClearingHouse__Unauthorized();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event BondedEngagementAccepted(
        uint256 indexed licenseId,
        address indexed operator,
        bytes quorumNumbers
    );

    event BondedEngagementTerminated(
        uint256 indexed licenseId,
        address indexed operator,
        string reason
    );

    event QuorumRegistered(
        address indexed operator,
        bytes quorumNumbers
    );

    // ═══════════════════════════════════════════════════════════════════════
    // BONDED ENGAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Accept bonded engagement for a HookLicense
    /// @dev Registers operator with RegistryCoordinator for specified quorums
    /// @param operatorSignature Operator's signature for registration
    /// @param licenseId The HookLicense ID
    function acceptBondedEngagement(
        SignatureWithSaltAndExpiryCH calldata operatorSignature,
        uint256 licenseId
    ) external;

    /// @notice Terminate bonded engagement
    /// @param licenseId The HookLicense ID
    /// @param reason Termination reason
    function terminateBondedEngagement(
        uint256 licenseId,
        string calldata reason
    ) external;

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get the HaaS clearing coordinator
    /// @return coordinator The RegistryCoordinator address
    function getHaaSClearingCoordinator() external view returns (address coordinator);

    /// @notice Get the HaaS hub
    /// @return hub The HaaSHub address
    function getHaaSHub() external view returns (address hub);

    /// @notice Check if engagement is active for a license
    /// @param licenseId The license ID
    /// @return isActive Whether engagement is active
    function isEngagementActive(uint256 licenseId) external view returns (bool isActive);

    /// @notice Get operator for a license
    /// @param licenseId The license ID
    /// @return operator The operator address
    function getEngagementOperator(uint256 licenseId) external view returns (address operator);
}
