// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {LibInitializable} from "compose-extensions/libraries/LibInitializable.sol";
import {LibOwner} from "Compose/access/Owner/LibOwner.sol";
import {LibAccessControl} from "Compose/access/AccessControl/LibAccessControl.sol";

import "../interfaces/IHookRegistry.sol";
import "../storage/LibHookRegistry.sol";

contract HookRegistryFacet is IHookRegistry {
    address immutable public __self;

    constructor() {
        __self = address(this);
    }

    bytes32 constant HOOK_DEVELOPER_ROLE = keccak256("HOOK_DEVELOPER_ROLE");

    modifier initialized() {
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) {
            revert HookRegistryUnauthorized();
        }
        _;
    }

    modifier onlyDeveloper() {
        LibAccessControl.requireRole(HOOK_DEVELOPER_ROLE);
        _;
    }

    function registerHookImplementation(
        address implementation,
        string calldata name,
        string calldata category,
        bytes4[] calldata selectors
    ) external initialized onlyDeveloper returns (uint256 hookId) {
        // Validate implementation
        if (implementation == address(0) || implementation.code.length == 0) {
            revert HookRegistryInvalidImplementation();
        }

        // Check for selector conflicts
        for (uint256 i = 0; i < selectors.length; i++) {
            if (LibHookRegistry.isSelectorRegistered(selectors[i])) {
                revert HookRegistrySelectorConflict(selectors[i]);
            }
        }

        // Register hook
        hookId = LibHookRegistry.registerHook(
            implementation,
            name,
            category,
            msg.sender,
            selectors
        );

        emit HookRegistered(hookId, implementation, msg.sender, name, category);
    }

    function getHookImplementation(uint256 hookId) external view returns (address) {
        LibHookRegistry.HookMetadata storage hook = LibHookRegistry.getHook(hookId);
        if (hook.implementation == address(0)) {
            revert HookRegistryHookNotFound(hookId);
        }
        return hook.implementation;
    }

    function getHookMetadata(uint256 hookId) external view returns (HookMetadata memory) {
        LibHookRegistry.HookMetadata storage hook = LibHookRegistry.getHook(hookId);
        if (hook.implementation == address(0)) {
            revert HookRegistryHookNotFound(hookId);
        }

        return HookMetadata({
            name: hook.name,
            category: hook.category,
            developer: hook.developer,
            implementation: hook.implementation,
            selectors: hook.selectors,
            active: hook.active
        });
    }

    function listHooks() external view returns (uint256[] memory) {
        LibHookRegistry.HookRegistryStorage storage $ = LibHookRegistry.getStorage();
        uint256 nextId = $.nextHookId;
        uint256[] memory hooks = new uint256[](nextId);
        
        uint256 count = 0;
        for (uint256 i = 1; i <= nextId; i++) {
            if ($.hooks[i].implementation != address(0)) {
                hooks[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        assembly {
            mstore(hooks, count)
        }
        return hooks;
    }

    function getHooksByDeveloper(address developer) external view returns (uint256[] memory) {
        LibHookRegistry.HookRegistryStorage storage $ = LibHookRegistry.getStorage();
        return $.developerHooks[developer];
    }

    function isSelectorRegistered(bytes4 selector) external view returns (bool) {
        return LibHookRegistry.isSelectorRegistered(selector);
    }

    function deactivateHook(uint256 hookId) external initialized {
        LibHookRegistry.HookMetadata storage hook = LibHookRegistry.getHook(hookId);
        
        if (hook.implementation == address(0)) {
            revert HookRegistryHookNotFound(hookId);
        }

        // Only owner or hook developer can deactivate
        if (msg.sender != hook.developer) {
            LibOwner.requireOwner();
        }

        hook.active = false;
        emit HookDeactivated(hookId);
    }
}