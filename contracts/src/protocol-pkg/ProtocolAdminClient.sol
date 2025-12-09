// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;
import {console2} from "forge-std/console2.sol";

import {InitializableBase} from "compose-extensions/LibInitializable.sol";
import "Compose/access/Owner/OwnerMod.sol" as OwnerMod;
import {ProtocolAdminPanel, IProtocolAdminPanel} from "./ProtocolAdminPanel.sol";
import {IProtocolAdminRegistry} from "./ProtocolAdminRegistry.sol";
import {IProtocolFactory} from "./ProtocolFactoryFacet.sol";
import {IProtocolAdminManager, Authority} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
import {IProtocolHookMediator} from "@hook-bazaar/protocol-hook-pkg/src/ProtocolHookMediator.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";



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

    function adminPanel() external view returns(address);
    function nextTokenId() external view returns(uint256);

    //====================================PROTOCOL-CREATOR===============================================================
    function create_protocol(string calldata _name) external returns(uint256);
    event ProtocolCreated(address indexed protocolCaller, uint256 indexed tokenId, address indexed __adminManager);

    function create_pool(uint256 protocolId, bytes calldata _encoded_pool_key, uint160 initialSqrtPrice) external returns(bytes32);

        
    function setProtocolHookMediator(IProtocolHookMediator _hookMediator) external;

    
    function protocolHookMediator() external view returns(IProtocolHookMediator);


}


contract ProtocolAdminClient is IProtocolAdminClient, InitializableBase{
    
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






    // NOTE: The caller can delegate ownership of the protocol to an __auth address, defaults to msg.sender

    // if __auth is 0, the name is only for visibilty
    function create_protocol(string calldata _name) external onlyInitialized returns(uint256){
  
        ProtocolAdminClientStorage storage $ = getStorage();
        uint256 _token_id = $.nextTokenId;
        address _protocol_admin_manager = IProtocolAdminRegistry($.admin_panel).protocol_manager(_token_id);
        IProtocolFactory($.admin_panel).create_protocol(_name,  _protocol_admin_manager, _token_id);
        IProtocolAdminPanel($.admin_panel).unlockAdminManager(IProtocolAdminManager(_protocol_admin_manager));

        emit ProtocolCreated(msg.sender, _token_id,_protocol_admin_manager);
        $.nextTokenId++;        
        return _token_id;
    }

    function create_pool(uint256 protocolId, bytes calldata _encoded_pool_key, uint160 initialSqrtPrice) external onlyInitialized returns(bytes32){

        ProtocolAdminClientStorage storage $ = getStorage();
        console2.log("Protocol Creator:", msg.sender);
        bytes4 createPoolSig = msg.sig;
        console2.logBytes4(createPoolSig);
        // NOTE: With protocolId one can fetch the associated adminManager
        address adminManager = IProtocolAdminRegistry($.admin_panel).protocol_manager(protocolId);
        // if (!Authority($.admin_panel).canCall(msg.sender, adminManager, createPoolSig)) revert ProtocolAdminClientUnauthorizedCaller();

        PoolKey memory poolKey = abi.decode(_encoded_pool_key, (PoolKey));
        int24 _initialTick = abi.decode(
           IProtocolHookMediator($.protocolHookMediator).notify(
                address(this) ,
                createPoolSig,
                abi.encode(protocolId, poolKey, initialSqrtPrice)),
               (int24)
           );

    }
    
    function supportsInterface(bytes4 interfaceID) external view returns (bool){
        return interfaceID == type(IProtocolAdminClient).interfaceId;
    }

    function setProtocolHookMediator(IProtocolHookMediator _hookMediator) external{
        OwnerMod.requireOwner();
        ProtocolAdminClientStorage storage $ = getStorage();
        $.protocolHookMediator = address(_hookMediator);
    }

    
    function protocolHookMediator() external view returns(IProtocolHookMediator){
        ProtocolAdminClientStorage storage $ = getStorage();
        return IProtocolHookMediator($.protocolHookMediator);
    }   
    

}