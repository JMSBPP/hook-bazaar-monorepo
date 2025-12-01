// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;


contract HookFacet{
    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.hook");
    struct HookStorage {
        bytes hookState;
    }

    function getStorage() internal pure returns (HookStorage storage $) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            $.slot := position
        }
    }


}