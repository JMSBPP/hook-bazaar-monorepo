// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {LibInitializable} from "compose-extensions/libraries/LibInitializable.sol";

import "../interfaces/IHookOwnership.sol";
import "../storage/LibHookOwnership.sol";
import "../storage/LibHookFactory.sol";

contract HookOwnershipFacet is IHookOwnership {
    address immutable public __self;

    constructor() {
        __self = address(this);
    }

    modifier initialized() {
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) {
            revert HookOwnershipUnauthorized();
        }
        _;
    }

    function transferHookOwnership(address clone, address newOwner) external initialized {
        address currentOwner = LibHookOwnership.getOwner(clone);
        
        if (currentOwner == address(0)) {
            revert HookOwnershipInvalidClone(clone);
        }

        if (currentOwner != msg.sender) {
            revert HookOwnershipNotOwner(clone, msg.sender);
        }

        if (newOwner == address(0)) {
            revert HookOwnershipInvalidOwner(newOwner);
        }

        address previousOwner = currentOwner;
        LibHookOwnership.transferOwnership(clone, newOwner);

        emit HookOwnershipTransferred(clone, previousOwner, newOwner);
    }

    function getHookOwner(address clone) external view returns (address) {
        address owner = LibHookOwnership.getOwner(clone);
        if (owner == address(0)) {
            revert HookOwnershipInvalidClone(clone);
        }
        return owner;
    }

    function getClonesByOwner(address owner) external view returns (address[] memory) {
        return LibHookOwnership.getClonesByOwner(owner);
    }

    function canManageHook(address clone, address account) external view returns (bool) {
        address owner = LibHookOwnership.getOwner(clone);
        if (owner == address(0)) {
            return false;
        }
        return owner == account;
    }
}