// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

library LibHookFactory {
    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.hook-factory");

    struct CloneInfo {
        uint256 hookId;
        uint256 protocolId;
        bytes32 poolId;
        address owner;
        bool initialized;
    }

    struct HookFactoryStorage {
        mapping(address => CloneInfo) clones;
        mapping(uint256 => mapping(bytes32 => mapping(uint256 => address))) protocolPoolHookToClone;
        address[] allClones;
    }

    function getStorage() internal pure returns (HookFactoryStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    function registerClone(
        address clone,
        uint256 hookId,
        uint256 protocolId,
        bytes32 poolId,
        address owner
    ) internal {
        HookFactoryStorage storage $ = getStorage();
        
        require($.clones[clone].owner == address(0), "Clone already registered");
        
        $.clones[clone] = CloneInfo({
            hookId: hookId,
            protocolId: protocolId,
            poolId: poolId,
            owner: owner,
            initialized: false
        });

        $.protocolPoolHookToClone[protocolId][poolId][hookId] = clone;
        $.allClones.push(clone);
    }

    function getCloneInfo(address clone) internal view returns (CloneInfo storage) {
        return getStorage().clones[clone];
    }

    function getClone(
        uint256 protocolId,
        bytes32 poolId,
        uint256 hookId
    ) internal view returns (address) {
        return getStorage().protocolPoolHookToClone[protocolId][poolId][hookId];
    }

    function markInitialized(address clone) internal {
        getStorage().clones[clone].initialized = true;
    }

    function isInitialized(address clone) internal view returns (bool) {
        return getStorage().clones[clone].initialized;
    }

    function getAllClones() internal view returns (address[] memory) {
        return getStorage().allClones;
    }
}