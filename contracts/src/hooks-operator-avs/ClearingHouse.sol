// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnableUpgradeable} from "@openzeppelin-upgrades/contracts/access/OwnableUpgradeable.sol";

import {IClearingHouse, SignatureWithSaltAndExpiryCH} from "./interfaces/IClearingHouse.sol";
import {IHooksOperatorAVSTypes} from "./interfaces/IHooksOperatorAVSTypes.sol";
import {IHaaSVendorManagement} from "./interfaces/IHaaSVendorManagement.sol";

/// @notice Registry coordinator interface (simplified placeholder)
/// @dev In production, import from eigenlayer-middleware
interface IRegistryCoordinatorSimple {
    function registerOperator(
        bytes calldata quorumNumbers,
        string calldata socket,
        bytes calldata params,
        SignatureWithSaltAndExpiryCH memory operatorSignature
    ) external;

    function deregisterOperator(bytes calldata quorumNumbers) external;
}

/// @title ClearingHouse
/// @notice Coordinates bonded engagement between HookDevelopers and Protocols
/// @dev Entry point for RegistryCoordinator interactions
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
contract ClearingHouse is IClearingHouse, OwnableUpgradeable {

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice HaaS clearing coordinator (RegistryCoordinator)
    address public haaSClearingCoordinator;

    /// @notice HaaS hub (vendor management)
    address public haaSHub;

    /// @notice License ID => engagement active
    mapping(uint256 => bool) private _engagementActive;

    /// @notice License ID => engaged operator
    mapping(uint256 => address) private _engagementOperators;

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
        address _haaSClearingCoordinator,
        address _haaSHub,
        address initialOwner
    ) external initializer {
        __Ownable_init();
        if (initialOwner != msg.sender) {
            _transferOwnership(initialOwner);
        }
        haaSClearingCoordinator = _haaSClearingCoordinator;
        haaSHub = _haaSHub;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BONDED ENGAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IClearingHouse
    function acceptBondedEngagement(
        SignatureWithSaltAndExpiryCH calldata operatorSignature,
        uint256 licenseId
    ) external {
        IHaaSVendorManagement vendorManagement = IHaaSVendorManagement(haaSHub);

        // Validate license
        if (!vendorManagement.isLicenseValid(licenseId)) revert ClearingHouse__InvalidLicense();

        // Check not already engaged
        if (_engagementActive[licenseId]) revert ClearingHouse__EngagementAlreadyAccepted();

        // Get engagement params from HaaS hub
        (bytes memory quorumNumbers, bytes memory pubkeyParams) = vendorManagement.getHaaSEngagementParams(licenseId);
        bytes memory socket = vendorManagement.getOperatorSocket(licenseId);

        // Register operator with RegistryCoordinator
        IRegistryCoordinatorSimple(haaSClearingCoordinator).registerOperator(
            quorumNumbers,
            string(socket),
            pubkeyParams,
            operatorSignature
        );

        // Mark engagement as active
        _engagementActive[licenseId] = true;
        _engagementOperators[licenseId] = msg.sender;

        emit BondedEngagementAccepted(licenseId, msg.sender, quorumNumbers);
        emit QuorumRegistered(msg.sender, quorumNumbers);
    }

    /// @inheritdoc IClearingHouse
    function terminateBondedEngagement(
        uint256 licenseId,
        string calldata reason
    ) external {
        // Only the engaged operator or owner can terminate
        if (msg.sender != _engagementOperators[licenseId] && msg.sender != owner()) {
            revert ClearingHouse__Unauthorized();
        }

        if (!_engagementActive[licenseId]) revert ClearingHouse__InvalidLicense();

        IHaaSVendorManagement vendorManagement = IHaaSVendorManagement(haaSHub);

        // Get quorum numbers for deregistration
        (bytes memory quorumNumbers,) = vendorManagement.getHaaSEngagementParams(licenseId);

        // Deregister from RegistryCoordinator
        IRegistryCoordinatorSimple(haaSClearingCoordinator).deregisterOperator(quorumNumbers);

        // Mark engagement as inactive
        address operator = _engagementOperators[licenseId];
        _engagementActive[licenseId] = false;
        _engagementOperators[licenseId] = address(0);

        emit BondedEngagementTerminated(licenseId, operator, reason);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IClearingHouse
    function getHaaSClearingCoordinator() external view returns (address) {
        return haaSClearingCoordinator;
    }

    /// @inheritdoc IClearingHouse
    function getHaaSHub() external view returns (address) {
        return haaSHub;
    }

    /// @inheritdoc IClearingHouse
    function isEngagementActive(uint256 licenseId) external view returns (bool) {
        return _engagementActive[licenseId];
    }

    /// @inheritdoc IClearingHouse
    function getEngagementOperator(uint256 licenseId) external view returns (address) {
        return _engagementOperators[licenseId];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function setHaaSClearingCoordinator(address _coordinator) external onlyOwner {
        haaSClearingCoordinator = _coordinator;
    }

    function setHaaSHub(address _hub) external onlyOwner {
        haaSHub = _hub;
    }

    // Storage gap for upgrades
    uint256[45] private __gap;
}
