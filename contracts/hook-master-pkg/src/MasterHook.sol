// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "compose-extensions/BaseDiamond.sol";
import "./AllHook.sol";
import "compose-extensions/libraries/LibInitializable.sol";
import "Compose/access/AccessControl/LibAccessControl.sol";
import "./types/HookSelectors.sol";
import "./HookFacetTemplate.sol";

interface IMasterHook{
    event MasterHook__HookAdded(address indexed mediator, address indexed _hook, bytes selectors);
    error MasterHook__NotValidHook();     
    error MasterHook__Uninitiialized();
    function initialize(address _poolManager, address _allHookImpl) external;
    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external;
    function addHook(address _hook,bytes4[] memory _additionalSelectors) external;
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

        if (!initialSetup && !construction) {
            revert LibInitializable.InvalidInitialization();
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

    

    function initialize(address _poolManager, address _allHookImpl) external initializer{
        MasterHookStorage storage $ = getStorage();
        LibAccessControl.setRoleAdmin(LibAccessControl.DEFAULT_ADMIN_ROLE, PROTOCOL_ADMIN);
        LibAccessControl.grantRole(PROTOCOL_ADMIN, msg.sender);

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
    
            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](1);
            _cut[0] = LibDiamond.FacetCut(_allHookImpl, LibDiamond.FacetCutAction.Add, _interface);
            this._diamondCut(_cut, address(0x00), abi.encode("0x00"));
        }

    }
    
    modifier initialized(){
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) revert MasterHook__Uninitiialized();
        _;
    }

    modifier onlyProtocolAdmin(){
        LibAccessControl.requireRole(PROTOCOL_ADMIN, msg.sender);
        _;
    }


    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external initialized onlyProtocolAdmin {}
    

    
    // TODO: This needs to be protected to be only allowed once a amreket transaction has been ccompleted to acquire, plug the hook
    function addHook(address _hook, bytes4[] memory _additionalSelectors) external initialized onlyProtocolAdmin{
        // if (!IERC165(_hook).supportsInterface(type(IHooks).interfaceId)) revert MasterHook__NotValidHook();       
        bytes4[] memory _hookSelectors = LibHookSelectors.hookSelectors(IHooks(_hook));
        bytes4[] memory _allSelectors = LibHookSelectors.appendSelectors(_hookSelectors, _additionalSelectors);
        this._replaceFunctions(_hook, _hookSelectors);
        this._addFunctions(_hook, _additionalSelectors);
        emit MasterHook__HookAdded(msg.sender, address(_hook), abi.encode(_allSelectors));
    }



}

