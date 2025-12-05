// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {Clones} from "openzeppelin-contracts/contracts/proxy/Clones.sol";
import {LibInitializable} from "compose-extensions/libraries/LibInitializable.sol";
import {LibOwner} from "Compose/access/Owner/LibOwner.sol";

import "../interfaces/IHookFactory.sol";
import "../interfaces/IHookRegistry.sol";
import "../storage/LibHookFactory.sol";
import "../storage/LibHookOwnership.sol";

contract HookFactoryFacet is IHookFactory {
    address immutable public __self;

    constructor() {
        __self = address(this);
    }

    modifier initialized() {
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) {
            revert HookFactoryUnauthorized();
        }
        _;
    }

    modifier onlyOwnerOrAuthorized() {
        // TODO: Add protocol-specific authorization check
        // For now, allow owner or any caller (will be restricted later)
        _;
    }

    function deployHookClone(
        uint256 hookId,
        uint256 protocolId,
        bytes32 poolId,
        bytes calldata initData
    ) external initialized onlyOwnerOrAuthorized returns (address clone) {
        // Check if hook exists and is active
        IHookRegistry hookRegistry = IHookRegistry(address(this));
        address implementation = hookRegistry.getHookImplementation(hookId);
        
        if (implementation == address(0)) {
            revert HookFactoryHookNotFound(hookId);
        }

        // Check if clone already exists
        address existingClone = LibHookFactory.getClone(protocolId, poolId, hookId);
        if (existingClone != address(0)) {
            revert HookFactoryCloneAlreadyExists(protocolId, poolId, hookId);
        }

        // Deploy minimal proxy (EIP-1167)
        clone = Clones.clone(implementation);

        // Register clone
        LibHookFactory.registerClone(clone, hookId, protocolId, poolId, msg.sender);
        LibHookOwnership.setOwner(clone, msg.sender);

        emit HookCloneDeployed(clone, hookId, protocolId, poolId, msg.sender);

        // Initialize if initData is provided
        if (initData.length > 0) {
            _initializeClone(clone, msg.sender, initData);
        }
    }

    function initializeHookClone(
        address clone,
        address owner,
        bytes calldata params
    ) external initialized {
        LibHookFactory.CloneInfo storage info = LibHookFactory.getCloneInfo(clone);
        
        if (info.owner == address(0)) {
            revert HookFactoryInvalidClone(clone);
        }

        if (LibHookFactory.isInitialized(clone)) {
            revert HookFactoryInvalidInitialization();
        }

        // Only owner can initialize
        if (LibHookOwnership.getOwner(clone) != msg.sender) {
            revert HookFactoryUnauthorized();
        }

        _initializeClone(clone, owner, params);
    }

    function _initializeClone(
        address clone,
        address owner,
        bytes calldata params
    ) internal {
        // Call initialize function on clone
        // Assuming hook implementations have an initialize(address owner, bytes params) function
        (bool success, ) = clone.call(
            abi.encodeWithSignature("initialize(address,bytes)", owner, params)
        );

        if (!success) {
            revert HookFactoryInvalidInitialization();
        }

        LibHookFactory.markInitialized(clone);
        LibHookOwnership.setOwner(clone, owner);
        
        emit HookCloneInitialized(clone, params);
    }

    function getHookClone(
        uint256 protocolId,
        bytes32 poolId,
        uint256 hookId
    ) external view returns (address) {
        return LibHookFactory.getClone(protocolId, poolId, hookId);
    }

    function getCloneInfo(address clone) external view returns (CloneInfo memory) {
        LibHookFactory.CloneInfo storage info = LibHookFactory.getCloneInfo(clone);
        
        if (info.owner == address(0)) {
            revert HookFactoryInvalidClone(clone);
        }

        return CloneInfo({
            hookId: info.hookId,
            protocolId: info.protocolId,
            poolId: info.poolId,
            owner: info.owner,
            initialized: info.initialized
        });
    }

    function getAllClones() external view returns (address[] memory) {
        return LibHookFactory.getAllClones();
    }
}