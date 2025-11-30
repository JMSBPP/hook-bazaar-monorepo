// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@uniswap/v4-periphery/src/utils/BaseHook.sol";

library LibHooks{
    error NotPoolManager();

    // NOTE: This is to be implememted on the contract using this library to inherit Hooks 
    // services
    // /// @notice Only allow calls from the PoolManager contract
    // modifier onlyPoolManager() {
    //     if (msg.sender != address(poolManager)) revert NotPoolManager();
    //     _;
    // }

    bytes32 constant STORAGE_POSITION = keccak256("hook-bazar.hooks");

    struct HookStorage{
        IPoolManager poolManager;
    }

    function getStorage() internal pure returns (HookStorage storage $) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            $.slot := position
        }
    }



}