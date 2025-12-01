
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

library LibHook{

    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.hook");
    
    struct HookStorage {
        bytes32 state;
        // Example: If you add mappings, consider adding counters:
        // mapping(address => uint256) balances;
        // uint256 balanceCount; // Track number of entries
    }

    function getStorage() internal pure returns (HookStorage storage $) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            $.slot := position
        }
    }

    function stateless() internal view returns(bool){
        HookStorage storage $ = getStorage();
        return abi.encode($.state).length == 0;
    }

}
