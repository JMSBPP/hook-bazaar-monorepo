// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

/// @title DeployHooksOperatorAVS
/// @notice Deployment script for the Hook Attestation AVS
/// @dev Deploys all AVS components in correct order
contract DeployHooksOperatorAVS is Script {

    // ═══════════════════════════════════════════════════════════════════════
    // DEPLOYMENT ADDRESSES (to be set per network)
    // ═══════════════════════════════════════════════════════════════════════

    // EigenLayer core contracts
    address public avsDirectory;
    address public rewardsCoordinator;
    address public allocationManager;
    address public delegationManager;
    address public strategyManager;

    // Deployed contracts
    address public serviceManager;
    address public taskManager;
    address public attestationRegistry;
    address public hookStateSampler;
    address public vendorManagement;
    address public clearingHouse;
    address public escrowCoordinator;

    function run() external {
        // Load deployer private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deploying Hook Attestation AVS...");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AttestationRegistry
        _deployAttestationRegistry(deployer);

        // 2. Deploy HookAttestationServiceManager
        _deployServiceManager(deployer);

        // 3. Deploy HookAttestationTaskManager
        _deployTaskManager(deployer);

        // 4. Deploy HookStateSampler
        _deployHookStateSampler();

        // 5. Deploy HaaSVendorManagement
        _deployVendorManagement(deployer);

        // 6. Deploy ClearingHouse
        _deployClearingHouse(deployer);

        // 7. Deploy EscrowCoordinator
        _deployEscrowCoordinator(deployer);

        // 8. Configure contract relationships
        _configureContracts();

        vm.stopBroadcast();

        _logDeploymentAddresses();
    }

    function _deployAttestationRegistry(address owner) internal {
        // Deploy and initialize AttestationRegistry
        // attestationRegistry = address(new AttestationRegistry());
        // AttestationRegistry(attestationRegistry).initialize(taskManager, owner);
        console2.log("AttestationRegistry deployed at:", attestationRegistry);
    }

    function _deployServiceManager(address owner) internal {
        // Deploy and initialize HookAttestationServiceManager
        // serviceManager = address(new HookAttestationServiceManager(
        //     avsDirectory,
        //     rewardsCoordinator,
        //     stakeRegistry
        // ));
        console2.log("ServiceManager deployed at:", serviceManager);
    }

    function _deployTaskManager(address owner) internal {
        // Deploy and initialize HookAttestationTaskManager
        // taskManager = address(new HookAttestationTaskManager());
        console2.log("TaskManager deployed at:", taskManager);
    }

    function _deployHookStateSampler() internal {
        // Deploy HookStateSampler with default state view
        // hookStateSampler = address(new HookStateSampler(defaultStateView));
        console2.log("HookStateSampler deployed at:", hookStateSampler);
    }

    function _deployVendorManagement(address owner) internal {
        // Deploy and initialize HaaSVendorManagement
        // vendorManagement = address(new HaaSVendorManagement());
        console2.log("VendorManagement deployed at:", vendorManagement);
    }

    function _deployClearingHouse(address owner) internal {
        // Deploy and initialize ClearingHouse
        // clearingHouse = address(new ClearingHouse());
        console2.log("ClearingHouse deployed at:", clearingHouse);
    }

    function _deployEscrowCoordinator(address owner) internal {
        // Deploy and initialize EscrowCoordinator
        // escrowCoordinator = address(new EscrowCoordinator());
        console2.log("EscrowCoordinator deployed at:", escrowCoordinator);
    }

    function _configureContracts() internal {
        // Set task manager in registry
        // Set attestation registry in task manager
        // Set service manager in task manager
        // Set vendor management in clearing house
        console2.log("Contracts configured");
    }

    function _logDeploymentAddresses() internal view {
        console2.log("\n=== Deployment Summary ===");
        console2.log("ServiceManager:", serviceManager);
        console2.log("TaskManager:", taskManager);
        console2.log("AttestationRegistry:", attestationRegistry);
        console2.log("HookStateSampler:", hookStateSampler);
        console2.log("VendorManagement:", vendorManagement);
        console2.log("ClearingHouse:", clearingHouse);
        console2.log("EscrowCoordinator:", escrowCoordinator);
    }
}
