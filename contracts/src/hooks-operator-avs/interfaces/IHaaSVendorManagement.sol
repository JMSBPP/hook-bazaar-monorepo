// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooksOperatorAVSTypes} from "./IHooksOperatorAVSTypes.sol";

/// @notice Signature type for operator registration
/// @dev In production, import from eigenlayer-contracts/src/contracts/interfaces/ISignatureUtilsMixin.sol
struct SignatureWithSaltAndExpiryVendor {
    bytes signature;
    bytes32 salt;
    uint256 expiry;
}

/// @title IHaaSVendorManagement
/// @notice Manages HookDeveloper registration and HookLicense issuance
/// @dev HookDevelopers are operators that provide HookContracts compliant with HookSpec
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
interface IHaaSVendorManagement is IHooksOperatorAVSTypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error HaaSVendorManagement__InvalidHookSpec();
    error HaaSVendorManagement__OperatorNotRegistered();
    error HaaSVendorManagement__LicenseNotFound();
    error HaaSVendorManagement__LicenseAlreadyExists();
    error HaaSVendorManagement__InsufficientBond();
    error HaaSVendorManagement__Unauthorized();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event HookDeveloperRegistered(
        address indexed operator,
        uint256 indexed licenseId
    );

    event HookLicenseIssued(
        uint256 indexed licenseId,
        address indexed operator,
        string hookSpecURI
    );

    event HookLicenseRevoked(
        uint256 indexed licenseId,
        string reason
    );

    event BondPosted(
        uint256 indexed licenseId,
        address indexed operator,
        uint256 amount
    );

    // ═══════════════════════════════════════════════════════════════════════
    // OPERATOR REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Commit to a HookSpec by registering as operator
    /// @dev HookDeveloper commits bonded participation for HookContract within HookSpec
    /// @param hookSpecURI IPFS URI of the HookSpec
    /// @param operatorSignature Signature for registration
    /// @param operatorAccount Operator's account address
    /// @return licenseId The issued license ID
    function commitToHookSpec(
        string calldata hookSpecURI,
        SignatureWithSaltAndExpiryVendor calldata operatorSignature,
        address operatorAccount
    ) external returns (uint256 licenseId);

    /// @notice Get HaaS engagement parameters for a license
    /// @param licenseId The license ID
    /// @return quorumNumbers Quorum configuration bytes
    /// @return pubkeyParams BLS pubkey registration params (encoded)
    function getHaaSEngagementParams(uint256 licenseId)
        external
        view
        returns (bytes memory quorumNumbers, bytes memory pubkeyParams);

    /// @notice Get operator socket for a license
    /// @param licenseId The license ID
    /// @return socket The operator socket (typically IP address)
    function getOperatorSocket(uint256 licenseId) external view returns (bytes memory socket);

    // ═══════════════════════════════════════════════════════════════════════
    // LICENSE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get hook license by ID
    /// @param licenseId The license ID
    /// @return license The HookLicense struct
    function getHookLicense(uint256 licenseId) external view returns (HookLicense memory license);

    /// @notice Get licenses for an operator
    /// @param operator The operator address
    /// @return licenseIds Array of license IDs
    function getOperatorLicenses(address operator) external view returns (uint256[] memory licenseIds);

    /// @notice Check if license is valid
    /// @param licenseId The license ID
    /// @return isValid Whether license is valid
    function isLicenseValid(uint256 licenseId) external view returns (bool isValid);

    /// @notice Revoke a license
    /// @param licenseId The license ID
    /// @param reason Revocation reason
    function revokeLicense(uint256 licenseId, string calldata reason) external;
}
