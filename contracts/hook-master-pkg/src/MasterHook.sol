// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import "compose-extensions/BaseDiamond.sol";
import "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import "compose-extensions/libraries/LibInitializable.sol";
import "Compose/access/AccessControl/LibAccessControl.sol";
import "./types/HookSelectors.sol";

interface IMasterHook{
    error MasterHookUninitiialized();
    function initialize(address _poolManager) external;
    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external;
}

contract AllHook is BaseHook{
    constructor(address _poolManager) BaseHook(IPoolManager(_poolManager)){}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory){
        return Hooks.Permissions(true,true,true,true,true,true,true,true,true,true,true,true,true,true);
    }
}

contract MasterHook is BaseDiamond, IMasterHook{
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


    modifier initializer() {
        // solhint-disable-next-line var-name-mixedcase
        LibInitializable.InitializableStorage storage $ = LibInitializable.getStorage();

        // Cache values to avoid duplicated sloads
        bool isTopLevelCall = !$._initializing;
        uint64 initialized = $._initialized;

        // Allowed calls:
        // - initialSetup: the contract is not in the initializing state and no previous version was
        //                 initialized
        // - construction: the contract is initialized at version 1 (no reinitialization) and the
        //                 current contract is just being deployed
        bool initialSetup = initialized == 0 && isTopLevelCall;
        bool construction = initialized == 1 && address(this).code.length == 0;

        revert LibInitializable.InvalidInitialization();
        if (!initialSetup && !construction) {
        }

        $._initialized = 1;
        if (isTopLevelCall) {
            $._initializing = true;
        }
        _;
        if (isTopLevelCall) {
            $._initializing = false;
            emit LibInitializable.Initialized(1);
        }
    }

    

    function initialize(address _poolManager) external initializer{
        MasterHookStorage storage $ = getStorage();
        LibAccessControl.setRoleAdmin(LibAccessControl.DEFAULT_ADMIN_ROLE, PROTOCOL_ADMIN);
        LibAccessControl.grantRole(PROTOCOL_ADMIN, msg.sender);

        $.poolManager = IPoolManager(_poolManager);
        {
              
            bytes4[] memory  _interface = new bytes4[](uint256(0x10));
            
            _interface[0x00] = IHooks.beforeInitialize.selector;
            _interface[0x01] = IHooks.afterInitialize.selector;
            _interface[0x02] = IHooks.beforeAddLiquidity.selector;
            _interface[0x03] = IHooks.afterAddLiquidity.selector;
            _interface[0x04] = IHooks.beforeRemoveLiquidity.selector;
            _interface[0x05] = IHooks.afterRemoveLiquidity.selector;
            _interface[0x06] = IHooks.beforeSwap.selector;
            _interface[0x07] = IHooks.afterSwap.selector; 
            _interface[0x08] = IHooks.beforeDonate.selector;
            _interface[0x09] = IHooks.afterDonate.selector;
    

            
            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](uint256(0x01));
            address allHook = address(new AllHook(_poolManager));
            _cut[0x00] = LibDiamond.FacetCut(allHook, LibDiamond.FacetCutAction.Add, _interface);
            IDiamond(address(this)).diamondCut(_cut, address(0x00), abi.encode("0x00"));
        }

    }
    
    modifier initialized(){
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) revert MasterHookUninitiialized();
        _;
    }

    modifier onlyProtocolAdmin(){
        LibAccessControl.requireRole(PROTOCOL_ADMIN, msg.sender);
        _;
    }


    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external initialized onlyProtocolAdmin {}

    // TODO: This needs to be protected to be only allowed once a amreket transaction has been ccompleted to acquire, plug the hook
    function addHook(IHooks _hook) external initialized onlyProtocolAdmin{
        // TODO: First get the permissions, this is done by dissecting the hook address
        bytes4[] memory _hookSelectors = LibHookSelectors.hookSelectors(_hook);

        // LibDiamond.replaceFunctions(address(_hook), _hookSelectors);



        // TODO: Add to the facet the interface selectos associated with such permissions

    }



}

