// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

interface IHookRegistry {
    error HookRegistryInvalidImplementation();
    error HookRegistrySelectorConflict(bytes4 selector);
    error HookRegistryHookNotFound(uint256 hookId);
    error HookRegistryUnauthorized();
    error HookRegistryHookInactive(uint256 hookId);

    event HookRegistered(
        uint256 indexed hookId,
        address indexed implementation,
        address indexed developer,
        string name,
        string category
    );

    event HookDeactivated(uint256 indexed hookId);

    struct HookMetadata {
        string name;
        string category;
        address developer;
        address implementation;
        bytes4[] selectors;
        bool active;
    }

    function registerHookImplementation(
        address implementation,
        string calldata name,
        string calldata category,
        bytes4[] calldata selectors
    ) external returns (uint256 hookId);

    function getHookImplementation(uint256 hookId) external view returns (address);

    function getHookMetadata(uint256 hookId) external view returns (HookMetadata memory);

    function listHooks() external view returns (uint256[] memory);

    function getHooksByDeveloper(address developer) external view returns (uint256[] memory);

    function isSelectorRegistered(bytes4 selector) external view returns (bool);

    function deactivateHook(uint256 hookId) external;
}