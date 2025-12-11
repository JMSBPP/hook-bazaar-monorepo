// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AllHook.sol";
import {InitializableBase} from "compose-extensions/LibInitializable.sol";

import "Compose/access/AccessControl/AccessControlMod.sol" as AccessControlMod;
import "Compose/diamond/DiamondCutMod.sol" as DiamondCutMod;
import "./types/HookSelectors.sol";
import "./HookFacetTemplate.sol";

interface IMasterHook{
    event MasterHook__HookAdded(address indexed mediator, address indexed _hook, bytes selectors);
    error MasterHook__NotValidHook();     
    error MasterHook__Uninitiialized();
    function initialize(address _poolManager, address _allHookImpl) external;
    // function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external;
    function addHook(address _hook,bytes4[] memory _additionalSelectors) external;
}


contract MasterHook is IMasterHook, InitializableBase{
    bytes32 constant PROTOCOL_ADMIN = keccak256("protocol-admin");
    bytes32 constant STORAGE_POSITION = keccak256("hook-bazar.hooks");
    
    struct MasterHookStorage{
        IPoolManager poolManager;
    }

    function getStorage() internal pure returns (MasterHookStorage storage $) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            $.slot := position
        }
    }

    function initialize(address _poolManager, address _allHookImpl) external initializer{
        MasterHookStorage storage $ = getStorage();
        AccessControlMod.setRoleAdmin(AccessControlMod.DEFAULT_ADMIN_ROLE, PROTOCOL_ADMIN);
        AccessControlMod.grantRole(PROTOCOL_ADMIN, msg.sender);

        $.poolManager = IPoolManager(_poolManager);
        {
            bytes4[] memory _interface = new bytes4[](10);
            
            _interface[0] = IHooks.beforeInitialize.selector;
            _interface[1] = IHooks.afterInitialize.selector;
            _interface[2] = IHooks.beforeAddLiquidity.selector;
            _interface[3] = IHooks.afterAddLiquidity.selector;
            _interface[4] = IHooks.beforeRemoveLiquidity.selector;
            _interface[5] = IHooks.afterRemoveLiquidity.selector;
            _interface[6] = IHooks.beforeSwap.selector;
            _interface[7] = IHooks.afterSwap.selector; 
            _interface[8] = IHooks.beforeDonate.selector;
            _interface[9] = IHooks.afterDonate.selector;
    
            DiamondMod.FacetCut[] memory _cut = new DiamondMod.FacetCut[](1);
            _cut[0] = DiamondMod.FacetCut(_allHookImpl, DiamondMod.FacetCutAction.Add, _interface);
            DiamondMod.addFacets(_cut);
        }

    }
    
    

    modifier onlyProtocolAdmin(){
        AccessControlMod.requireRole(PROTOCOL_ADMIN, msg.sender);
        _;
    }


    // function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external initialized onlyProtocolAdmin {}
    

    
    // TODO: This needs to be protected to be only allowed once a amreket transaction has been ccompleted to acquire, plug the hook
    function addHook(address _hook, bytes4[] calldata _additionalSelectors) external onlyInitialized onlyProtocolAdmin{
        // if (!IERC165(_hook).supportsInterface(type(IHooks).interfaceId)) revert MasterHook__NotValidHook();       
        bytes4[] memory _hookSelectors = LibHookSelectors.hookSelectors(IHooks(_hook));
        bytes4[] memory _allSelectors = LibHookSelectors.appendSelectors(_hookSelectors, _additionalSelectors);
        _replaceHookFunctions(_hook, _hookSelectors);
        _addHookFunctions(_hook, _additionalSelectors);
        
        emit MasterHook__HookAdded(msg.sender, address(_hook), abi.encode(_allSelectors));
    }
    
    function _replaceHookFunctions(address _hook, bytes4[] memory _selectors) private {
        // Create a temporary array to work around calldata requirement
        // We'll call the functions in a way that works with memory arrays
        DiamondCutMod.DiamondStorage storage s = DiamondCutMod.getStorage();
        for (uint256 i; i < _selectors.length; i++) {
            bytes4 selector = _selectors[i];
            address oldFacet = s.facetAndPosition[selector].facet;
            if (oldFacet == address(0)) {
                revert DiamondCutMod.CannotReplaceFunctionThatDoesNotExists(selector);
            }
            s.facetAndPosition[selector].facet = _hook;
        }
    }
    
    function _addHookFunctions(address _hook, bytes4[] calldata _selectors) private {
        DiamondCutMod.addFunctions(_hook, _selectors);
    }

    fallback() external payable {
       DiamondMod.diamondFallback();    
    }




}

