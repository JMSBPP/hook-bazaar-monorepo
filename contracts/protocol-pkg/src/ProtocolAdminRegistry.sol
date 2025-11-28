// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {LibGenericFactory} from "compose-extensions/GenericFactory/LibGenericFactory.sol";
import {LibInitializable} from "compose-extensions/libraries/LibInitializable.sol";
import {LibAccessControl} from "Compose/access/AccessControl/LibAccessControl.sol";

import "./ProtocolAdminManager.sol";
import "./ProtocolAdminClient.sol";
import {IERC165} from "forge-std/interfaces/IERC165.sol";

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
    function protocol_manager(uint256 _tokenId) external returns(address);
    function protocol_admin_template() external view returns(address);
    function upgradeAdmin() external view returns(address);
    function isUpgradeAdmin(address _account) external view returns(bool);
}

contract ProtocolAdminRegistry is IVersionControl ,IProtocolAdminRegistry{
    
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

    modifier reinitializer(uint64 version) {
        // solhint-disable-next-line var-name-mixedcase
        LibInitializable.InitializableStorage storage $ = LibInitializable.getStorage();

        if ($._initializing || $._initialized >= version) {
            revert LibInitializable.InvalidInitialization();
        }

        $._initialized = version;
        $._initializing = true;
        _;
        $._initializing = false;
        emit LibInitializable.Initialized(version);
    }


 

    function _initialize() external reinitializer(updateVersion()){
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
        if (LibInitializable.getInitializedVersion() < STARTER_VERSION) revert ProtocolAdminRegistryUninitialized();
        _;
    }

    // NOTE:The data passed to the clone is the tokenId

    // NOTE The function can only be called through delegate
    // call, and the delegate caller must be the admin panel
    function onlyAdminPanel() private {
        if (address(this) == __self) revert ProtocolAdminRegistryNotDelegateCall();
        if (address(this) != upgradeAdmin()) revert ProtocolAdminRegistryInvalidDelegateCaller();
        
    }

    function upgradeAdmin() public view initialized returns(address){
        LibGenericFactory.GenericFactoryStorage storage g$ = LibGenericFactory.getStorage();
        return g$.upgradeAdmin;
    }


     

    function protocol_manager(uint256 _tokenId) external initialized returns(address){
        if (_tokenId == uint256(0x00)) revert ProtocolAdminRegistryInvalidTokenId();
        ProtocolAdminRegistryStorage storage $ = getStorage();

        if ($.protocol_managers[_tokenId] == address(0x00)){
            // NOTE: This protects for the delegate call
            
            onlyAdminPanel();
            // TODO: Now we need protection for the Context to be msg.sender == protocolAdminClient AND 
            // msg.sig == IProtocolAdminClient.create_protocol.selector
            // msg.sender == protocolAdminClient needs to be checked with introspection on CLient since
            // Regiostry does not reference client

            // TODO: This
            // if (
            //     !IERC165(address(this)).supportsInterface(type(IProtocolAdminClient).interfaceId)
            //     ||
            //     _parentSig != CREATE_PROTOCOL_CLIENT_SIG
            // ) revert ProtocolAdminRegistryInvalidContextCall();

            $.protocol_managers[_tokenId] = LibGenericFactory.createProxy(protocol_admin_template(), false, abi.encode(msg.sender));
        }

        return $.protocol_managers[_tokenId];
    }

 






}