// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnableUpgradeable} from "@openzeppelin-upgrades/contracts/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IHookAttestationServiceManager} from "./interfaces/IHookAttestationServiceManager.sol";
import {IHooksOperatorAVSTypes} from "./interfaces/IHooksOperatorAVSTypes.sol";

/// @notice Signature type for operator registration
/// @dev In production, import from eigenlayer-contracts/src/contracts/interfaces/ISignatureUtilsMixin.sol
struct SignatureWithSaltAndExpiry {
    bytes signature;
    bytes32 salt;
    uint256 expiry;
}

/// @notice AVS Directory interface (placeholder)
/// @dev In production, import from eigenlayer-contracts
interface IAVSDirectorySimple {
    function registerOperatorToAVS(address operator, SignatureWithSaltAndExpiry memory operatorSignature) external;
    function deregisterOperatorFromAVS(address operator) external;
    function updateAVSMetadataURI(string memory metadataURI) external;
}

/// @title HookAttestationServiceManager
/// @notice Service Manager for the Hook Attestation AVS
/// @dev Manages operator registration, rewards, and slashing for hook verification
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
contract HookAttestationServiceManager is IHookAttestationServiceManager, OwnableUpgradeable {
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Address of the AVS directory
    address public immutable avsDirectory;

    /// @notice Address of the rewards coordinator
    address public immutable rewardsCoordinator;

    /// @notice Address of the stake registry
    address public immutable stakeRegistry;

    /// @notice Address of the task manager
    address public taskManager;

    /// @notice Address of the attestation registry
    address public attestationRegistry;

    /// @notice Address of the rewards initiator
    address public rewardsInitiator;

    /// @notice Mapping of registered operators
    mapping(address => bool) private _registeredOperators;

    /// @notice Mapping of operator stakes
    mapping(address => uint256) private _operatorStakes;

    // ═══════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyTaskManager() {
        if (msg.sender != taskManager) revert HookAttestationServiceManager__OnlyTaskManager();
        _;
    }

    modifier onlyAttestationRegistry() {
        if (msg.sender != attestationRegistry) revert HookAttestationServiceManager__OnlyAttestationRegistry();
        _;
    }

    modifier onlyRewardsInitiator() {
        require(msg.sender == rewardsInitiator, "Only rewards initiator");
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor(
        address _avsDirectory,
        address _rewardsCoordinator,
        address _stakeRegistry
    ) {
        avsDirectory = _avsDirectory;
        rewardsCoordinator = _rewardsCoordinator;
        stakeRegistry = _stakeRegistry;
        _disableInitializers();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookAttestationServiceManager
    function initialize(
        address initialOwner,
        address _rewardsInitiator,
        address _taskManager,
        address _attestationRegistry
    ) external initializer {
        __Ownable_init();
        if (initialOwner != msg.sender) {
            _transferOwnership(initialOwner);
        }
        rewardsInitiator = _rewardsInitiator;
        taskManager = _taskManager;
        attestationRegistry = _attestationRegistry;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookAttestationServiceManager
    function setTaskManager(address _taskManager) external onlyOwner {
        emit TaskManagerUpdated(taskManager, _taskManager);
        taskManager = _taskManager;
    }

    /// @inheritdoc IHookAttestationServiceManager
    function setAttestationRegistry(address _attestationRegistry) external onlyOwner {
        emit AttestationRegistryUpdated(attestationRegistry, _attestationRegistry);
        attestationRegistry = _attestationRegistry;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OPERATOR REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Register operator to AVS
    function registerOperatorToAVS(
        address operator,
        SignatureWithSaltAndExpiry memory operatorSignature
    ) external {
        IAVSDirectorySimple(avsDirectory).registerOperatorToAVS(operator, operatorSignature);
        _registeredOperators[operator] = true;
    }

    /// @notice Deregister operator from AVS
    function deregisterOperatorFromAVS(address operator) external {
        IAVSDirectorySimple(avsDirectory).deregisterOperatorFromAVS(operator);
        _registeredOperators[operator] = false;
    }

    /// @notice Update AVS metadata URI
    function updateAVSMetadataURI(string memory metadataURI) external onlyOwner {
        IAVSDirectorySimple(avsDirectory).updateAVSMetadataURI(metadataURI);
    }

    /// @notice Get restakeable strategies
    function getRestakeableStrategies() external view returns (address[] memory) {
        // Return empty array - to be implemented based on quorum configuration
        return new address[](0);
    }

    /// @notice Get operator restaked strategies
    function getOperatorRestakedStrategies(address) external view returns (address[] memory) {
        // Return empty array - to be implemented
        return new address[](0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SLASHING
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookAttestationServiceManager
    function slashOperator(
        address operator,
        SlashableOffense offense,
        bytes32 evidence
    ) external onlyTaskManager {
        if (!_registeredOperators[operator]) revert HookAttestationServiceManager__OperatorNotRegistered();

        // Calculate slash amount based on offense
        uint256 slashAmount = _calculateSlashAmount(operator, offense);

        // Execute slashing through AllocationManager
        // In production, this would call the AllocationManager's slashing functions
        _operatorStakes[operator] -= slashAmount;

        emit OperatorSlashed(operator, slashAmount, offense);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IHookAttestationServiceManager
    function getTaskManager() external view returns (address) {
        return taskManager;
    }

    /// @inheritdoc IHookAttestationServiceManager
    function getAttestationRegistry() external view returns (address) {
        return attestationRegistry;
    }

    /// @inheritdoc IHookAttestationServiceManager
    function isOperatorRegistered(address operator) external view returns (bool) {
        return _registeredOperators[operator];
    }

    /// @inheritdoc IHookAttestationServiceManager
    function getOperatorStake(address operator) external view returns (uint256) {
        return _operatorStakes[operator];
    }

    /// @notice Get AVS directory address
    function getAvsDirectory() external view returns (address) {
        return avsDirectory;
    }

    /// @notice Get rewards coordinator address
    function getRewardsCoordinator() external view returns (address) {
        return rewardsCoordinator;
    }

    /// @notice Get stake registry address
    function getStakeRegistry() external view returns (address) {
        return stakeRegistry;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function _calculateSlashAmount(address operator, SlashableOffense offense) internal view returns (uint256) {
        uint256 stake = _operatorStakes[operator];

        // Different slash percentages based on offense severity
        if (offense == SlashableOffense.OPERATOR_COLLUSION) {
            return stake; // 100% slash for collusion
        } else if (offense == SlashableOffense.FALSE_POSITIVE) {
            return (stake * 50) / 100; // 50% slash for false positive
        } else if (offense == SlashableOffense.FALSE_NEGATIVE) {
            return (stake * 30) / 100; // 30% slash for false negative
        } else {
            return (stake * 20) / 100; // 20% slash for sample manipulation
        }
    }

    // Storage gap for upgrades
    uint256[45] private __gap;
}
