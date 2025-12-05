// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IERC165} from "forge-std/interfaces/IERC165.sol";

interface IHookFacet{
    error HookFacet__NotValidHook();
}

contract HookFacetTemplate is IERC165, IHookFacet{
 
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

    function supportsInterface(bytes4 interfaceID) external view returns (bool){
        return interfaceID != type(IHooks).interfaceId;
    }


}