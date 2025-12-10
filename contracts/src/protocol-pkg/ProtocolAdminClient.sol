// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;
import {console2} from "forge-std/console2.sol";

import {InitializableBase} from "compose-extensions/LibInitializable.sol";
import "Compose/access/Owner/OwnerMod.sol" as OwnerMod;
import {ProtocolAdminPanel, IProtocolAdminPanel} from "./ProtocolAdminPanel.sol";
import {IProtocolAdminRegistry} from "./ProtocolAdminRegistry.sol";
import {IProtocolFactory, IProtocolAdminPanelConsumer} from "./ProtocolFactoryFacet.sol";
import {IProtocolAdminManager, Authority} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
import {IProtocolHookMediator} from "@hook-bazaar/protocol-hook-pkg/src/ProtocolHookMediator.sol";

import {PoolId, PoolKey, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";


interface IProtocolAdminClient{
    error ProtocolAdminClientUninitialized();
    error ProtocolAdminClientUnSetAdminClient();
    error ProtocolAdminClientUnauthorizedCaller();
    //======================PROTOCOL-DEPLOYER ACTIONS =================================================
    function initialize( 
        IProtocolAdminRegistry _protocol_admin_registry,
        IProtocolFactory _protocol_factory,
        string calldata _baseURI
    ) external;

 
    //==================================================================================================================

    function nextTokenId() external view returns(uint256);

    //====================================PROTOCOL-CREATOR===============================================================
    function create_protocol(string calldata _name) external returns(uint256, address _adminManager);
    event ProtocolCreated(address indexed protocolCaller, uint256 indexed tokenId, address indexed __adminManager);


    function getProtocols() external returns(uint256[] memory);
    function getProtocolRevenue(uint256 protocolId) external returns(uint256);
    function getPoolRevenue(uint256 protocolId, PoolId poolId) external returns(uint256);



    //======================================POOL-CREATOR=======================================================================
    function create_pool(uint256 protocolId, bytes calldata _encoded_pool_key, uint160 initialSqrtPrice) external returns(PoolId, int24);
    function getProtocolActivePools(uint256 protocolId) external returns(PoolId[] memory);
    function getNumberOfActivePools(uint256 protocolId) external returns(uint256);


        
    function setProtocolHookMediator(IProtocolHookMediator _hookMediator) external;

    
    function protocolHookMediator() external view returns(IProtocolHookMediator);


}

interface IOwnable{
    function owner() external view returns(address);
}



contract ProtocolAdminClient is IProtocolAdminClient, IProtocolAdminPanelConsumer ,InitializableBase, IOwnable{
    
    bytes32 constant PROTOCOL_ADMIN_CLIENT_POSITION = keccak256("hook-bazaar.protocol.admin-client");    

    struct ProtocolAdminClientStorage{
        address admin_panel;
        address protocolHookMediator;
        uint256 nextTokenId;
    }

    constructor(){
        ProtocolAdminClientStorage storage $ = getStorage();
        $.nextTokenId = uint256(0x01);

    }

    function nextTokenId() public view returns(uint256){
        ProtocolAdminClientStorage storage $ = getStorage();
        return $.nextTokenId;
    }

    function adminPanel() public view returns(address){
        ProtocolAdminClientStorage storage $ = getStorage();
        return $.admin_panel;
    }

    function getStorage() internal pure returns (ProtocolAdminClientStorage storage s) {
        bytes32 position = PROTOCOL_ADMIN_CLIENT_POSITION;
        assembly {
            s.slot := position
        }
    }

    // TODO: This function is onwed by the protocol deployer
    // and implements the initializer on initializable    
    function initialize(
        IProtocolAdminRegistry _protocol_admin_registry,
        IProtocolFactory _protocol_factory,
        string calldata _baseURI
    ) external initializer{
        OwnerMod.OwnerStorage storage o$ = OwnerMod.getStorage();
        o$.owner = msg.sender;
        // TODO: Strong check for admin panel impl contract
        ProtocolAdminClientStorage storage $  = getStorage();
        // LibERC165.registerInterface(type(IProtocolAdminClient).interfaceId);
        $.admin_panel = address(new ProtocolAdminPanel());
        IProtocolAdminPanel($.admin_panel).initialize(IProtocolAdminClient(address(this)), _protocol_admin_registry, _protocol_factory, _baseURI);

        IProtocolFactory($.admin_panel).__initialize(_baseURI);
        IProtocolAdminRegistry($.admin_panel)._initialize();
    }

    function owner() public view returns(address){
        OwnerMod.OwnerStorage storage o$ = OwnerMod.getStorage();
        return o$.owner;
    }


    // NOTE: The caller can delegate ownership of the protocol to an __auth address, defaults to msg.sender

    // if __auth is 0, the name is only for visibilty

    function create_protocol(string calldata _name) external onlyInitialized returns(uint256, address){

        ProtocolAdminClientStorage storage $ = getStorage();
        
        uint256 _token_id = $.nextTokenId;
        address _protocol_admin_manager = IProtocolAdminRegistry($.admin_panel).setProtocolManager(_token_id, msg.sender);
        IProtocolFactory($.admin_panel).create_protocol(_name,  _protocol_admin_manager, _token_id);

        emit ProtocolCreated(msg.sender, _token_id,_protocol_admin_manager);
        $.nextTokenId++;        
        
        return (_token_id, _protocol_admin_manager);
    }
    
    function getProtocols() external returns(uint256[] memory){
        ProtocolAdminClientStorage storage $ = getStorage();
        return IProtocolFactory($.admin_panel).getProtocols(msg.sender);
    }

    function getProtocolRevenue(uint256 protocolId) external returns(uint256){}
    function getPoolRevenue(uint256 protocolId, PoolId poolId) external returns(uint256){}


    function create_pool(uint256 protocolId, bytes calldata _encoded_pool_key, uint160 initialSqrtPrice) external onlyInitialized returns(PoolId, int24){

        ProtocolAdminClientStorage storage $ = getStorage();
        console2.log("Protocol Creator:", msg.sender);
        bytes4 createPoolSig = msg.sig;
        console2.logBytes4(createPoolSig);
        // NOTE: With protocolId one can fetch the associated adminManager
        address adminManager = IProtocolAdminRegistry($.admin_panel).getProtocolManager(protocolId);
        bool _isPoolCreator = IProtocolAdminRegistry($.admin_panel).isPoolCreator(adminManager, msg.sender);
        
        if (!_isPoolCreator) revert ProtocolAdminClientUnauthorizedCaller();

        PoolKey memory poolKey = abi.decode(_encoded_pool_key, (PoolKey));

        (int24 _initialTick, PoolId poolId) = abi.decode(
           IProtocolHookMediator($.protocolHookMediator).notify(
                address(this) ,
                createPoolSig,
                abi.encode(protocolId, poolKey, initialSqrtPrice)),
               (int24, PoolId)
           );
        IProtocolAdminRegistry($.admin_panel).addPool(adminManager, poolId);
        return (poolId,_initialTick);
    }

    function getProtocolActivePools(uint256 protocolId) public returns(PoolId[] memory){
        ProtocolAdminClientStorage storage $ = getStorage();
        address protocolManager = IProtocolAdminRegistry($.admin_panel).getProtocolManager(protocolId);
        PoolId[] memory protocolPools = IProtocolAdminRegistry($.admin_panel).getProtocolPools(protocolManager);
        return protocolPools;

        // protocols per accout are stored on protocolFactory
        // pools per protocol are created on protocolHookMediator
        // pools per protocol MUST be each stored on ProtocolAdminManager
        // one protocol can have many pools
        // one pool can be attached to many protocols (this is more complex)
    }

    function getNumberOfActivePools(uint256 protocolId) external returns(uint256){
        return getProtocolActivePools(protocolId).length;
    }



//  - getProtocols() --> uint256[] protocols
// 	- for protocol in protocols:
// 		- getPools(protocol)
// 		- getTotalRevenue(protocol)
// 		- getProtocolMetadata(protocol)




    
    function supportsInterface(bytes4 interfaceID) external view returns (bool){
        return interfaceID == type(IProtocolAdminClient).interfaceId;
    }

    function setProtocolHookMediator(IProtocolHookMediator _hookMediator) external onlyInitialized{
        OwnerMod.requireOwner();
        ProtocolAdminClientStorage storage $ = getStorage();
        $.protocolHookMediator = address(_hookMediator);
    }

    
    function protocolHookMediator() external view returns(IProtocolHookMediator){
        ProtocolAdminClientStorage storage $ = getStorage();
        return IProtocolHookMediator($.protocolHookMediator);
    }   
    

}