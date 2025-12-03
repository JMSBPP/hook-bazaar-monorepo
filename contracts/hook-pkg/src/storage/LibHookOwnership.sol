// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

library LibHookOwnership {
    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.hook-ownership");

    struct HookOwnershipStorage {
        mapping(address => address) cloneToOwner;
        mapping(address => address[]) ownerToClones;
    }

    function getStorage() internal pure returns (HookOwnershipStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    function setOwner(address clone, address owner) internal {
        HookOwnershipStorage storage $ = getStorage();
        
        address previousOwner = $.cloneToOwner[clone];
        if (previousOwner != address(0)) {
            // Remove from previous owner's list
            _removeCloneFromOwner(previousOwner, clone);
        }
        
        $.cloneToOwner[clone] = owner;
        $.ownerToClones[owner].push(clone);
    }

    function getOwner(address clone) internal view returns (address) {
        return getStorage().cloneToOwner[clone];
    }

    function getClonesByOwner(address owner) internal view returns (address[] memory) {
        return getStorage().ownerToClones[owner];
    }

    function transferOwnership(address clone, address newOwner) internal {
        HookOwnershipStorage storage $ = getStorage();
        address currentOwner = $.cloneToOwner[clone];
        
        require(currentOwner != address(0), "Clone has no owner");
        require(newOwner != address(0), "New owner cannot be zero");
        
        _removeCloneFromOwner(currentOwner, clone);
        $.cloneToOwner[clone] = newOwner;
        $.ownerToClones[newOwner].push(clone);
    }

    function _removeCloneFromOwner(address owner, address clone) private {
        HookOwnershipStorage storage $ = getStorage();
        address[] storage clones = $.ownerToClones[owner];
        
        for (uint256 i = 0; i < clones.length; i++) {
            if (clones[i] == clone) {
                clones[i] = clones[clones.length - 1];
                clones.pop();
                break;
            }
        }
    }
}