// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {LibGenericFactory} from "compose-extensions/LibGenericFactory.sol";
import "compose-extensions/GenericFactoryMod.sol" as GenericFactoryMod;
import {GenericFactory} from "@euler/GenericFactory/GenericFactory.sol";
import {InitializableBase} from "compose-extensions/LibInitializable.sol";
import "compose-extensions/InitializableMod.sol" as InitializableMod;
import "Compose/access/AccessControl/AccessControlMod.sol" as AccessControlMod; 

import {ProtocolAdminManager} from "./ProtocolAdminManager.sol";
// import "./ProtocolAdminClient.sol";
import {IERC165} from "forge-std/interfaces/IERC165.sol";

interface IGenericFactory{
    function implementation() external view returns(address);
    function upgradeAdmin() external view returns(address);
    function proxyList() external view returns(address[] memory);
    function createProxy(address desiredImplementation, bool upgradeable, bytes memory trailingData) external returns (address);
    function setImplementation(address newImplementation) external;
    function setUpgradeAdmin(address newUpgradeAdmin) external;
    function getProxyConfig(address proxy) external view returns (GenericFactory.ProxyConfig memory config);
    function isProxy(address proxy) external view returns (bool);
    function getProxyListLength() external view returns (uint256);
    function getProxyListSlice(uint256 start, uint256 end) external view returns (address[] memory list);
}
interface IVersionControl{
    // TODO: This needs protection for attackers altering versions on re-entrancy or multicalls

    function version() external view returns(uint64);
    function updateVersion() external returns(uint64);

}

interface IProtocolAdminRegistry{
    error ProtocolAdminRegistryInvalidTokenId();
    error ProtocolAdminRegistryUninitialized();
    error ProtocolAdminRegistryNotDelegateCall();
    error ProtocolAdminRegistryInvalidDelegateCaller();
    error ProtocolAdminRegistryInvalidContextCall();
    error ProtocolAdminRegistryInvalidInitializer();

    function __self() external view returns(address);
    function _initialize() external;
    function protocol_manager(uint256 _protocolId) external returns(address);

    function adminManagerTemplate() external returns(address);
    function upgradeAdmin() external returns(address);
}

contract ProtocolAdminRegistry is IVersionControl ,IProtocolAdminRegistry, InitializableBase{
    
    // NOTE: delegate call only guard
    address immutable public __self;
    // type(uint64).max/2
    uint64 constant STARTER_VERSION = uint64(0x7fffffffffffffff);
    
    // bytes4 constant CREATE_PROTOCOL_CLIENT_SIG = 0x8df28d95;
    
    constructor(){
        __self = address(this);
    }

    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.adminRegistry");

    struct ProtocolAdminRegistryStorage{
        // NOTE: One protocol has one admin
        uint64 version;
        mapping(uint256 tokenId => address protocol_manager) protocol_managers;
        mapping(uint256 tokenId => address protocol_admin_operator) protocol_admin_operators;
    }




    function getStorage() internal pure returns (ProtocolAdminRegistryStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    function version() public view returns(uint64){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        return $.version;
    }
    // TODO: This needs access control protection

    function updateVersion() public returns(uint64){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        $.version = $.version == uint64(0x00) ? STARTER_VERSION : $.version++;
        return $.version;
    }


 

    function _initialize() external reinitializer(updateVersion()){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        
        LibGenericFactory.GenericFactoryStorage storage g$ = LibGenericFactory.getStorage();
        g$.upgradeAdmin = msg.sender;
        // TODO: Further introspection checks are suggested here
        // if (msg.sender.code.length == uint256(0x00)) revert ProtocolAdminRegistryInvalidInitializer();
        // NOTE: The msg.sender in our implementation
        // is the ProtocolAdminPanel
        
        LibGenericFactory.setImplementation(address(new ProtocolAdminManager()));
         

    }

  
    function adminManagerTemplate() public returns(address){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        return LibGenericFactory.implementation();
    }

    // // NOTE: This function can not be called if the contract is not initialized
    // // The createProxy factory will revert but we want to enforce our own error
    

    modifier initialized(){
        InitializableMod.InitializableStorage storage $ = InitializableMod.getStorage();
        if ($._initialized < STARTER_VERSION) revert ProtocolAdminRegistryUninitialized();
        _;
    }

    // // NOTE:The data passed to the clone is the tokenId

    // // NOTE The function can only be called through delegate
    // // call, and the delegate caller must be the admin panel
    function onlyAdminPanel() private {
        if (address(this) == __self) revert ProtocolAdminRegistryNotDelegateCall();
        // if (address(this) != upgradeAdmin()) revert ProtocolAdminRegistryInvalidDelegateCaller();
        
    }

    function upgradeAdmin() public initialized returns(address){
        return LibGenericFactory.upgradeAdmin();
    }

    function protocol_manager(uint256 _protocolId) external initialized returns(address){
        if (_protocolId == uint256(0x00)) return address(0x00);
        ProtocolAdminRegistryStorage storage $ = getStorage();

        if ($.protocol_managers[_protocolId] == address(0x00)){
            // NOTE: This protects for the delegate call
            
            onlyAdminPanel();
            // TODO: Now we need protection for the Context to be msg.sender == protocolAdminClient AND 
            // msg.sig == IProtocolAdminClient.create_protocol.selector
            // Regiostry does not reference client

            // TODO: This
            // msg.sender == protocolAdminClient needs to be checked with introspection on CLient since
            // if (
            //     !IERC165(address(this)).supportsInterface(type(IProtocolAdminClient).interfaceId)
            //     ||
            //     _parentSig != CREATE_PROTOCOL_CLIENT_SIG
            // ) revert ProtocolAdminRegistryInvalidContextCall();

            $.protocol_managers[_protocolId] = LibGenericFactory.createProxy(adminManagerTemplate(), false, abi.encode("0x00"));
        }

        return $.protocol_managers[_protocolId];
    }

    function protocolManagers(uint256 _tokenId) external returns(address){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        return $.protocol_managers[_tokenId];
        
    }

 
}