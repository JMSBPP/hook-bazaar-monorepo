// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {console2} from "forge-std/console2.sol";
import {LibGenericFactory} from "compose-extensions/LibGenericFactory.sol";
import "compose-extensions/GenericFactoryMod.sol" as GenericFactoryMod;
import {GenericFactory} from "@euler/GenericFactory/GenericFactory.sol";
import {InitializableBase} from "compose-extensions/LibInitializable.sol";
import "compose-extensions/InitializableMod.sol" as InitializableMod;
import "Compose/access/AccessControl/AccessControlMod.sol" as AccessControlMod; 

import {ProtocolAdminManager, IProtocolAdminManager} from "./ProtocolAdminManager.sol";
import {Authority} from "solmate/src/auth/Auth.sol";

// import "./ProtocolAdminClient.sol";
import {IERC165} from "forge-std/interfaces/IERC165.sol";

import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";


import {DiamondLoupeFacet} from "Compose/diamond/DiamondLoupeFacet.sol";
import {IProtocolAdminPanelConsumer} from "@hook-bazaar/protocol-pkg/src/ProtocolFactoryFacet.sol";

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


interface IProtocolAdminRegistry{

    error ProtocolAdminRegistryInvalidTokenId();
    error ProtocolAdminRegistryUninitialized();
    error ProtocolAdminRegistryNotDelegateCall();
    error ProtocolAdminRegistryInvalidDelegateCaller();
    error ProtocolAdminRegistryInvalidContextCall();
    error ProtocolAdminRegistryInvalidInitializer();

    function __self() external view returns(address);
    function _initialize() external;

    function adminManagerTemplate() external returns(address);
    function upgradeAdmin() external returns(address);

    function setProtocolManager(uint256 _protocolId,address _protocolCreator) external returns(address);
    function getProtocolManager(uint256 _protcolId) external view returns(address);

    function addPool(address _protocolAdminManager, PoolId _poolId) external;
    function getProtocolPools(address _protocolAdminManager) external returns(PoolId[] memory);
    function isPoolCreator(address _adminManager,address _account) external returns(bool);
}

contract ProtocolAdminRegistry is IProtocolAdminRegistry, InitializableBase, IProtocolAdminPanelConsumer{
    
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
        address adminPanel;
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

    function adminPanel() public view returns(address){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        return $.adminPanel;
    }

    function version() public view returns(uint64){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        return $.version;
    }
    // TODO: This needs access control protection

    function _updateVersion() private returns(uint64){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        $.version = $.version == uint64(0x00) ? STARTER_VERSION : $.version++;
        return $.version;
    }

    function _initialize() external reinitializer(_updateVersion()){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        LibGenericFactory.GenericFactoryStorage storage g$ = LibGenericFactory.getStorage();
        g$.upgradeAdmin = msg.sender;
        $.adminPanel = address(this);
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
    
    modifier onlyAdminPanel(){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        address registryOnPanel = DiamondLoupeFacet($.adminPanel).facetAddress(IProtocolAdminRegistry.setProtocolManager.selector);
        if (address(this) == __self || registryOnPanel != __self) revert ProtocolAdminRegistryNotDelegateCall();
        _;        
    }

    function upgradeAdmin() public initialized returns(address){
        return LibGenericFactory.upgradeAdmin();
    }

    function setProtocolManager(uint256 _protocolId, address _protocolCreator) external initialized onlyAdminPanel returns(address){
        ProtocolAdminRegistryStorage storage $ = getStorage();

        if ($.protocol_managers[_protocolId] == address(0x00)){
            // Pass both protocolCreator and adminPanel (address(this) in delegatecall context)
            $.protocol_managers[_protocolId] = LibGenericFactory.createProxy(adminManagerTemplate(), false, abi.encodePacked(_protocolCreator, address(this)));
        }

        return $.protocol_managers[_protocolId];
    }

    function getProtocolManager(uint256 _tokenId) external view returns(address){
        ProtocolAdminRegistryStorage storage $ = getStorage();
        return $.protocol_managers[_tokenId];
        
    }

    function isPoolCreator(address _adminManager, address _account) external returns(bool){
        // TODO: Targert is the DEX engine entry point address
        return Authority(_adminManager).canCall(_account, address(0x00), bytes4(keccak256("create_pool(uint256,bytes,uint160)")));
    }

    function addPool(address _protocolAdminManager, PoolId _poolId) external onlyAdminPanel{
        IProtocolAdminManager(_protocolAdminManager).setPool(_poolId);
    }

    function getProtocolPools(address _protocolAdminManager) external returns(PoolId[] memory){
        return IProtocolAdminManager(_protocolAdminManager).getPools();
    }

 
 
}