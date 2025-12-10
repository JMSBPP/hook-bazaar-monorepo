// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {console2} from "forge-std/console2.sol";

import {InitializableBase} from "compose-extensions/LibInitializable.sol";
import "Compose/access/AccessControl/AccessControlMod.sol" as AccessControlMod;
import {Authority} from "solmate/src/auth/Auth.sol";
import {IComponent} from "compose-extensions/LibGenericFactory.sol";

import {IERC1155Receiver} from "Compose/interfaces/IERC1155Receiver.sol";
import "Compose/libraries/NonReentrancyMod.sol" as NonReentrancy;

import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {DiamondLoupeFacet} from "Compose/diamond/DiamondLoupeFacet.sol";
import {IProtocolAdminRegistry} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminRegistry.sol";
import {IProtocolAdminPanelConsumer} from "@hook-bazaar/protocol-pkg/src/ProtocolFactoryFacet.sol";

library ProxyUtils{
    function metadata() internal pure returns(address _protocolCreator, address _adminPanel){
        assembly{
            // Metadata is appended to calldata as abi.encodePacked(protocolCreator, adminPanel)
            // Each address is 20 bytes, so last 40 bytes contain the metadata
            // adminPanel is at the very end (last 20 bytes, right-aligned in last 32 bytes)
            _adminPanel := calldataload(sub(calldatasize(), 32))
            // protocolCreator is 20 bytes before adminPanel
            _protocolCreator := calldataload(sub(calldatasize(), 52))
        }
    }
}

interface IProtocolAdminManager{

    error ProtocolAdminManagerNotClone();
    error ProtocolAdminManagerInvalidContextCall();
    error ProtocolAdminManagerCallerIsNotCreator();
    error ProtocolAdminManagerUninitialized();
    // event ProtocolAdminManagerInitialized(address indexed adminPanel, address indexed _protocolCreator);
    function __self() external view returns(address);
    function isCreator(address _account) external view returns(bool);


    // Throug the admin panel 
    function setPool(PoolId _poolId) external;
    // On individual storage
    function getPools() external view returns(PoolId[] memory);
    function delegatePoolCreatorRole(address _account) external;
    function isPoolCreator(address _account) external view returns(bool);
    function protocolId() external view returns(uint256);    
    function protocolName() external view returns(string memory);
    function setURI(URI_TYPE _uriType,string calldata _uri) external;
    function getURI(URI_TYPE _uriType) external view returns(string memory);
}

enum URI_TYPE{
    ZORA,
    WEBSITE,
    X,
    FARCASTER
}


// NOTE: ProtocolAdminManager is an operator

// NOTE: The stroage of this contract MUST not be on ProtocolAdminClient

contract ProtocolAdminManager is IComponent, IERC1155Receiver, IProtocolAdminManager, Authority, InitializableBase, IProtocolAdminPanelConsumer{
    address public immutable __self;
    // function __self() public view returns(address){
    //     return __self;
    // }
    
    bytes32 constant CREATOR = keccak256("hook-bazaar.creator");
    bytes32 constant POOL_CREATOR = keccak256("hook-bazaar.pool-creator"); 

    bytes32 constant STORAGE_POSITION = keccak256("wvs-finance.protocolAdminManager");

    struct ProtocolAdminManagerStorage{
        address adminPanel;
        bool isClone;
        uint256 tokenId;
        string name;
        mapping(URI_TYPE => string uri) uris;
        PoolId[] pools;
    }

    function getStorage() internal pure returns (ProtocolAdminManagerStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    function adminPanel() public view returns(address){
        ProtocolAdminManagerStorage storage $ = getStorage();
        return $.adminPanel;
    }

    constructor(){}

    modifier onlyClone(){
        ProtocolAdminManagerStorage storage $ = getStorage();
        if (!$.isClone) revert ProtocolAdminManagerNotClone();
        _;
    }

    function initialize(address creator) external initializer {
        ProtocolAdminManagerStorage storage $ = getStorage();
        (address _protocolCreator, address _adminPanel) = ProxyUtils.metadata();
        $.isClone = _protocolCreator != address(0x00);
        // Use adminPanel from metadata if clone, otherwise use creator (for implementation)
        $.adminPanel = $.isClone ? _adminPanel : creator;
        if ($.isClone){
            AccessControlMod.grantRole(CREATOR, _protocolCreator);
            AccessControlMod.grantRole(POOL_CREATOR, _protocolCreator);
        }
    }


    function isCreator(address _account) public view returns(bool){
        return AccessControlMod.hasRole(CREATOR, _account);
    }

    modifier onlyCreator(){
        if (!isCreator(msg.sender)) revert ProtocolAdminManagerCallerIsNotCreator();
        _;
    }

    modifier onlyPoolCreator(){
        AccessControlMod.requireRole(POOL_CREATOR, msg.sender);        
        _;
    }

    function delegatePoolCreatorRole(address _account) external onlyCreator{
        AccessControlMod.grantRole(POOL_CREATOR, _account);
    }

    function setURI(URI_TYPE _uriType,string calldata _uri) external onlyCreator onlyClone{
        ProtocolAdminManagerStorage storage $ = getStorage();
        $.uris[_uriType] = _uri;
    }

    function getURI(URI_TYPE _uriType) external onlyClone view returns(string memory){
        ProtocolAdminManagerStorage storage $ = getStorage();
        return $.uris[_uriType];
    }
    
    function protocolName() external onlyClone view returns(string memory) {
        ProtocolAdminManagerStorage storage $ = getStorage();
        return $.name;
    }
    
    // TODO: Function is only callable during mints triggered by the create_protocol flow ...
    modifier nonReentrant(){
        NonReentrancy.enter();
        _;
        NonReentrancy.exit();
    }

    function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data)
        external
        onlyClone
        nonReentrant
        returns (bytes4){
            ProtocolAdminManagerStorage storage $ = getStorage();

            $.tokenId = _id;
            $.name = abi.decode(_data, (string));
            return IERC1155Receiver.onERC1155Received.selector;
            
            // TODO: It sets the protocoll as created and this uncloks the create_pool to be called
            // // by the caller address, additioanlly the caller can now use this contract
            // to custom his protocol
        }
    
    function protocolId() external view onlyClone returns(uint256){
        ProtocolAdminManagerStorage storage $ = getStorage();
        return $.tokenId;
    }    

    

    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external returns (bytes4){}


    function canCall(
        address user,
        address target,
        bytes4 functionSig
    ) public view onlyClone returns (bool){
        bool _canCall;
        if (functionSig == bytes4(keccak256("create_pool(uint256,bytes,uint160)"))){
            _canCall = (AccessControlMod.hasRole(POOL_CREATOR, user));
        }
        return _canCall;
    }

    function isPoolCreator(address _account) external view returns(bool){
        return AccessControlMod.hasRole(POOL_CREATOR,_account);
    }
    // TODO: Function only callable through the create pool flow
    // client --> panel --> registry --> manager
    modifier onlyCreatePoolContext(){
        ProtocolAdminManagerStorage storage $ = getStorage();
        // Verify the call is coming from the adminPanel (diamond) and that addPool selector is registered
        try DiamondLoupeFacet($.adminPanel).facetAddress(IProtocolAdminRegistry.addPool.selector) returns(address registryFacet){
             // Call must come from the diamond (adminPanel), and the addPool selector must be registered
             if (msg.sender != $.adminPanel || registryFacet == address(0)) revert ProtocolAdminManagerInvalidContextCall();
        } catch {
            revert ProtocolAdminManagerInvalidContextCall();
        }
        _;
    }

    // Note: Pool creator permission is checked in ProtocolAdminClient.create_pool() before calling addPool
    // onlyCreatePoolContext ensures this is called only from the correct facet through the diamond
    function setPool(PoolId _poolId) external onlyClone onlyCreatePoolContext{
        ProtocolAdminManagerStorage storage $ = getStorage();
        $.pools.push(_poolId);

    }
 
    function getPools() external view onlyClone returns(PoolId[] memory) {
        ProtocolAdminManagerStorage storage $ = getStorage();
        return $.pools;
    }




}

