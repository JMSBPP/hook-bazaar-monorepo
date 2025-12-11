// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooksOperatorAVSTypes} from "./IHooksOperatorAVSTypes.sol";

/// @title IHookAttestationServiceManager
/// @notice Service Manager for the Hook Attestation AVS
/// @dev Extends EigenLayer's ServiceManager with hook attestation functionality
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
/// @dev In production, inherit from eigenlayer-middleware IServiceManagerUI
interface IHookAttestationServiceManager is IHooksOperatorAVSTypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error HookAttestationServiceManager__OnlyTaskManager();
    error HookAttestationServiceManager__OnlyAttestationRegistry();
    error HookAttestationServiceManager__OperatorNotRegistered();
    error HookAttestationServiceManager__InvalidSlashing();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event TaskManagerUpdated(address indexed oldTaskManager, address indexed newTaskManager);
    event AttestationRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    event OperatorSlashed(address indexed operator, uint256 amount, SlashableOffense offense);

    // ═══════════════════════════════════════════════════════════════════════
    // SERVICE MANAGER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Initialize the service manager
    /// @param initialOwner The initial owner address
    /// @param rewardsInitiator The rewards initiator address
    /// @param taskManager The task manager address
    /// @param attestationRegistry The attestation registry address
    function initialize(
        address initialOwner,
        address rewardsInitiator,
        address taskManager,
        address attestationRegistry
    ) external;

    /// @notice Set the task manager
    /// @param taskManager The new task manager address
    function setTaskManager(address taskManager) external;

    /// @notice Set the attestation registry
    /// @param attestationRegistry The new attestation registry address
    function setAttestationRegistry(address attestationRegistry) external;

    /// @notice Slash an operator for misbehavior
    /// @param operator The operator to slash
    /// @param offense The slashable offense
    /// @param evidence Evidence hash
    function slashOperator(
        address operator,
        SlashableOffense offense,
        bytes32 evidence
    ) external;

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get the task manager
    /// @return taskManager The task manager address
    function getTaskManager() external view returns (address taskManager);

    /// @notice Get the attestation registry
    /// @return attestationRegistry The attestation registry address
    function getAttestationRegistry() external view returns (address attestationRegistry);

    /// @notice Check if operator is registered with this AVS
    /// @param operator The operator address
    /// @return isRegistered Whether operator is registered
    function isOperatorRegistered(address operator) external view returns (bool isRegistered);

    /// @notice Get operator stake for verification
    /// @param operator The operator address
    /// @return stake The operator's stake amount
    function getOperatorStake(address operator) external view returns (uint256 stake);
}
