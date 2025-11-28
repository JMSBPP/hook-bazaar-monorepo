// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {LibGenericFactory} from "compose-extensions/GenericFactory/LibGenericFactory.sol";
import {LibInitializable} from "compose-extensions/libraries/LibInitializable.sol";
import {LibAccessControl} from "Compose/access/AccessControl/LibAccessControl.sol";

import "./ProtocolAdminManager.sol";

interface IProtocolAdminRegistry{
    error ProtocolAdminRegistryInvalidTokenId();
    error ProtocolAdminRegistryUninitialized();
    error ProtocolAdminRegistryNotDelegateCall();
    error ProtocolAdminRegistryInvalidDelegateCaller();
    error ProtocolAdminRegistryInvalidInitializer();

    function __self() external view returns(address);
    function initialize() external;
    function protocol_manager(uint256 _tokenId) external returns(address);
    function protocol_admin_template() external view returns(address);
    function upgradeAdmin() external view returns(address);
    function isUpgradeAdmin(address _account) external view returns(bool);
}

contract ProtocolAdminRegistry is IProtocolAdminRegistry{
    
    // NOTE: delegate call only guard
    address immutable public __self;
    
    constructor(){
        __self = address(this);
    }

    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.adminRegistry");

    struct ProtocolAdminRegistryStorage{
        // NOTE: One protocol has one admin
        mapping(uint256 tokenId => address protocol_manager) protocol_managers;
        mapping(uint256 tokenId => address protocol_admin_operator) protocol_admin_operators;
    }


    function getStorage() internal pure returns (ProtocolAdminRegistryStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
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

 

    function initialize() external initializer{
        // TODO: Further introspection checks are suggested here
        if (msg.sender.code.length == uint256(0x00)) revert ProtocolAdminRegistryInvalidInitializer();
        // NOTE: The msg.sender in our implementation
        // is the ProtocolAdminPanel
        LibGenericFactory.initialize(msg.sender);
        LibGenericFactory.setImplementation(address(new ProtocolAdminManager()));
        

    }

    function isUpgradeAdmin(address _account) public view returns(bool){
        LibGenericFactory.GenericFactoryStorage storage g$ = LibGenericFactory.getStorage();
       
        return g$.upgradeAdmin == _account && LibAccessControl.hasRole(LibGenericFactory.UPGRADE_ADMIN_ROLE, _account);
    }

    function protocol_admin_template() public view returns(address){
        return LibGenericFactory.implementation();
    }

    // NOTE: This function can not be called if the contract is not initialized
    // The createProxy factory will revert but we want to enforce our own error
    

    modifier initialized(){
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) revert ProtocolAdminRegistryUninitialized();
        _;
    }

    // NOTE:The data passed to the clone is the tokenId

    // NOTE The function can only be called through delegate
    // call, and the delegate caller must be the admin panel
    function onlyAdminPanel() private {
        if (address(this) == __self) revert ProtocolAdminRegistryNotDelegateCall();
        if (address(this) != upgradeAdmin()) revert ProtocolAdminRegistryInvalidDelegateCaller();
        
    }

    function upgradeAdmin() public view returns(address){
        LibGenericFactory.GenericFactoryStorage storage g$ = LibGenericFactory.getStorage();
        return g$.upgradeAdmin;
    }



    function protocol_manager(uint256 _tokenId) external initialized returns(address){
        if (_tokenId == uint256(0x00)) revert ProtocolAdminRegistryInvalidTokenId();
        ProtocolAdminRegistryStorage storage $ = getStorage();

        if ($.protocol_managers[_tokenId] == address(0x00)){
            onlyAdminPanel();
            $.protocol_managers[_tokenId] = LibGenericFactory.createProxy(protocol_admin_template(), false, abi.encode(msg.sender));
        }

        return $.protocol_managers[_tokenId];
    }

 






}