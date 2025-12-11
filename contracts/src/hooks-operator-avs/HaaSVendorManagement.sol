// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnableUpgradeable} from "@openzeppelin-upgrades/contracts/access/OwnableUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin-upgrades/contracts/token/ERC721/ERC721Upgradeable.sol";

import {IHaaSVendorManagement, SignatureWithSaltAndExpiryVendor} from "./interfaces/IHaaSVendorManagement.sol";
import {IHooksOperatorAVSTypes} from "./interfaces/IHooksOperatorAVSTypes.sol";

/// @title HaaSVendorManagement
/// @notice Manages HookDeveloper registration and HookLicense issuance
/// @dev HookDevelopers are operators that provide HookContracts compliant with HookSpec
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
contract HaaSVendorManagement is
    IHaaSVendorManagement,
    OwnableUpgradeable,
    ERC721Upgradeable
{

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Service manager for AVS registration
    address public serviceManager;

    /// @notice Latest license ID
    uint256 public latestLicenseId;

    /// @notice License ID => HookLicense
    mapping(uint256 => HookLicense) private _licenses;

    /// @notice License ID => HookSpec URI
    mapping(uint256 => string) private _licenseSpecs;

    /// @notice License ID => operator address
    mapping(uint256 => address) private _licenseOperators;

    /// @notice License ID => quorum numbers
    mapping(uint256 => bytes) private _licenseQuorums;

    /// @notice License ID => pubkey params
    mapping(uint256 => bytes) private _licensePubkeyParams;

    /// @notice License ID => socket
    mapping(uint256 => bytes) private _licenseSockets;

    /// @notice License ID => validity
    mapping(uint256 => bool) private _licenseValidity;

    /// @notice Operator => license IDs
    mapping(address => uint256[]) private _operatorLicenses;

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
        address _serviceManager,
        address initialOwner
    ) external initializer {
        __Ownable_init();
        __ERC721_init("HookLicense", "HLICENSE");
        if (initialOwner != msg.sender) {
            _transferOwnership(initialOwner);
        }
        serviceManager = _serviceManager;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OPERATOR REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHaaSVendorManagement
    function commitToHookSpec(
        string calldata hookSpecURI,
        SignatureWithSaltAndExpiryVendor calldata,
        address operatorAccount
    ) external returns (uint256 licenseId) {
        if (bytes(hookSpecURI).length == 0) revert HaaSVendorManagement__InvalidHookSpec();
        if (operatorAccount == address(0)) revert HaaSVendorManagement__OperatorNotRegistered();

        licenseId = latestLicenseId++;

        // Mint license NFT to operator
        _mint(operatorAccount, licenseId);

        // Store license data
        _licenseSpecs[licenseId] = hookSpecURI;
        _licenseOperators[licenseId] = operatorAccount;
        _licenseValidity[licenseId] = true;

        // Initialize empty strategies array
        _licenses[licenseId] = HookLicense({
            licenseId: licenseId,
            haasStrategies: new StrategyParams[](0),
            socketManager: address(0)
        });

        _operatorLicenses[operatorAccount].push(licenseId);

        emit HookDeveloperRegistered(operatorAccount, licenseId);
        emit HookLicenseIssued(licenseId, operatorAccount, hookSpecURI);
    }

    /// @inheritdoc IHaaSVendorManagement
    function getHaaSEngagementParams(uint256 licenseId)
        external
        view
        returns (bytes memory quorumNumbers, bytes memory pubkeyParams)
    {
        if (!_licenseValidity[licenseId]) revert HaaSVendorManagement__LicenseNotFound();
        return (_licenseQuorums[licenseId], _licensePubkeyParams[licenseId]);
    }

    /// @inheritdoc IHaaSVendorManagement
    function getOperatorSocket(uint256 licenseId) external view returns (bytes memory) {
        if (!_licenseValidity[licenseId]) revert HaaSVendorManagement__LicenseNotFound();
        return _licenseSockets[licenseId];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LICENSE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHaaSVendorManagement
    function getHookLicense(uint256 licenseId) external view returns (HookLicense memory) {
        if (!_licenseValidity[licenseId]) revert HaaSVendorManagement__LicenseNotFound();
        return _licenses[licenseId];
    }

    /// @inheritdoc IHaaSVendorManagement
    function getOperatorLicenses(address operator) external view returns (uint256[] memory) {
        return _operatorLicenses[operator];
    }

    /// @inheritdoc IHaaSVendorManagement
    function isLicenseValid(uint256 licenseId) external view returns (bool) {
        return _licenseValidity[licenseId];
    }

    /// @inheritdoc IHaaSVendorManagement
    function revokeLicense(uint256 licenseId, string calldata reason) external onlyOwner {
        if (!_licenseValidity[licenseId]) revert HaaSVendorManagement__LicenseNotFound();

        _licenseValidity[licenseId] = false;

        emit HookLicenseRevoked(licenseId, reason);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function setLicenseQuorums(uint256 licenseId, bytes calldata quorumNumbers) external onlyOwner {
        _licenseQuorums[licenseId] = quorumNumbers;
    }

    function setLicensePubkeyParams(uint256 licenseId, bytes calldata pubkeyParams) external onlyOwner {
        _licensePubkeyParams[licenseId] = pubkeyParams;
    }

    function setLicenseSocket(uint256 licenseId, bytes calldata socket) external onlyOwner {
        _licenseSockets[licenseId] = socket;
    }

    function setServiceManager(address _serviceManager) external onlyOwner {
        serviceManager = _serviceManager;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ERC721 OVERRIDES
    // ═══════════════════════════════════════════════════════════════════════

    function tokenURI(uint256 licenseId) public view override returns (string memory) {
        return _licenseSpecs[licenseId];
    }

    // Storage gap for upgrades
    uint256[40] private __gap;
}
