// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import "Compose/diamond/DiamondMod.sol" as DiamondMod;
import "@uniswap/v4-core/src/libraries/Hooks.sol";
import "@uniswap/v4-core/src/interfaces/IHooks.sol";

// NOTE: This type is used to store hook selectors for diamond facet cuts 

struct HookSelectors{
    bytes4[] _hookSelectors;
}

library LibHookSelectors{
    
    function hookSelectors(IHooks _hook) internal pure returns(bytes4[] memory){
        bytes4[] memory __hookSelectors = new bytes4[](uint256(0x10));
        uint256 finalLen = 0;
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_INITIALIZE_FLAG)){
            __hookSelectors[0x00] = IHooks.beforeInitialize.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_INITIALIZE_FLAG)){
            __hookSelectors[0x01] = IHooks.afterInitialize.selector;
            finalLen++;
        }
        
        // Add liquidity hooks
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_ADD_LIQUIDITY_FLAG)){
            __hookSelectors[0x02] = IHooks.beforeAddLiquidity.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_ADD_LIQUIDITY_FLAG)){
            __hookSelectors[0x03] = IHooks.afterAddLiquidity.selector;
            finalLen++;
        }
        
        // Remove liquidity hooks
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG)){
            __hookSelectors[0x04] = IHooks.beforeRemoveLiquidity.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_REMOVE_LIQUIDITY_FLAG)){
            __hookSelectors[0x05] = IHooks.afterRemoveLiquidity.selector;
            finalLen++;
        }
        
        // Swap hooks
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_SWAP_FLAG)){
            __hookSelectors[0x06] = IHooks.beforeSwap.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_SWAP_FLAG)){
            __hookSelectors[0x07] = IHooks.afterSwap.selector;
            finalLen++;
        }
        
        // Donate hooks
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_DONATE_FLAG)){
            __hookSelectors[0x08] = IHooks.beforeDonate.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_DONATE_FLAG)){
            __hookSelectors[0x09] = IHooks.afterDonate.selector;
            finalLen++;
        }
        
        // Delta return flags (map to same selectors as their base hooks)
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG)){
            __hookSelectors[0x0A] = IHooks.beforeSwap.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG)){
            __hookSelectors[0x0B] = IHooks.afterSwap.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG)){
            __hookSelectors[0x0C] = IHooks.afterAddLiquidity.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG)){
            __hookSelectors[0x0D] = IHooks.afterRemoveLiquidity.selector;
            finalLen++;
        }

        bytes4[] memory _resHookSelectors = new bytes4[](finalLen);
        uint256 resIndex = 0;
        for (uint256 i = 0; i < __hookSelectors.length; i++) {
            if (__hookSelectors[i] != bytes4(0x00)) {
                _resHookSelectors[resIndex] = __hookSelectors[i];
                resIndex++;
            }
        }
        return _resHookSelectors;
    }

    function appendSelectors(bytes4[] memory _self, bytes4[] memory _additionalSelectors) internal pure returns(bytes4[] memory){
        bytes4[] memory result = new bytes4[](_self.length + _additionalSelectors.length);
        
        for (uint256 i = 0; i < _self.length; i++) {
            result[i] = _self[i];
        }
        
        for (uint256 i = 0; i < _additionalSelectors.length; i++) {
            result[_self.length + i] = _additionalSelectors[i];
        }
        
        return result;
    }
}