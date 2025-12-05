// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

interface IHookOwnership {
    error HookOwnershipNotOwner(address clone, address account);
    error HookOwnershipInvalidClone(address clone);
    error HookOwnershipInvalidOwner(address owner);
    error HookOwnershipUnauthorized();

    event HookOwnershipTransferred(
        address indexed clone,
        address indexed previousOwner,
        address indexed newOwner
    );

    function transferHookOwnership(address clone, address newOwner) external;

    function getHookOwner(address clone) external view returns (address);

    function getClonesByOwner(address owner) external view returns (address[] memory);

    function canManageHook(address clone, address account) external view returns (bool);
}