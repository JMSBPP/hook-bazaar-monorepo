// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@uniswap/v4-periphery/src/utils/BaseHook.sol";


contract AllHook is BaseHook{
    constructor(address _poolManager) BaseHook(IPoolManager(_poolManager)){}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory){
        return Hooks.Permissions(true,true,true,true,true,true,true,true,true,true,true,true,true,true);
    }
}
