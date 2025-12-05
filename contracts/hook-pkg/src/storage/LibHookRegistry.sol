// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

library LibHookRegistry {
    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.hook-registry");

    struct HookMetadata {
        string name;
        string category;
        address developer;
        address implementation;
        bytes4[] selectors;
        bool active;
    }

    struct HookRegistryStorage {
        uint256 nextHookId;
        mapping(uint256 => HookMetadata) hooks;
        mapping(bytes4 => uint256) selectorToHookId;
        mapping(address => uint256[]) developerHooks;
    }

    function getStorage() internal pure returns (HookRegistryStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    function getHook(uint256 hookId) internal view returns (HookMetadata storage) {
        return getStorage().hooks[hookId];
    }

    function getNextHookId() internal view returns (uint256) {
        HookRegistryStorage storage $ = getStorage();
        return $.nextHookId;
    }

    function incrementHookId() internal returns (uint256) {
        HookRegistryStorage storage $ = getStorage();
        $.nextHookId++;
        return $.nextHookId;
    }

    function registerHook(
        address implementation,
        string memory name,
        string memory category,
        address developer,
        bytes4[] memory selectors
    ) internal returns (uint256 hookId) {
        HookRegistryStorage storage $ = getStorage();
        hookId = incrementHookId();

        HookMetadata storage hook = $.hooks[hookId];
        hook.name = name;
        hook.category = category;
        hook.developer = developer;
        hook.implementation = implementation;
        hook.selectors = selectors;
        hook.active = true;

        // Register selectors
        for (uint256 i = 0; i < selectors.length; i++) {
            require($.selectorToHookId[selectors[i]] == 0, "Selector conflict");
            $.selectorToHookId[selectors[i]] = hookId;
        }

        $.developerHooks[developer].push(hookId);
    }

    function isSelectorRegistered(bytes4 selector) internal view returns (bool) {
        return getStorage().selectorToHookId[selector] != 0;
    }

    function getHookBySelector(bytes4 selector) internal view returns (uint256) {
        return getStorage().selectorToHookId[selector];
    }
}