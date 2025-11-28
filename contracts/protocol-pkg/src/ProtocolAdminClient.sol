// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {LibInitializable} from "compose-extensions/libraries/LibInitializable.sol";
import {LibOwner} from "Compose/access/Owner/LibOwner.sol";

import  "./ProtocolAdminPanel.sol";



interface IProtocolAdminClient{
    error ProtocolAdminClientUninitialized();
    error ProtocolAdminClientUnSetAdminClient();

    function initialize() external;

    function initialize_admin_panel(
        address _protocol_admin_registry,
        address _protocol_factory,
        string calldata _baseURI

    ) external;
    function adminPanel() external view returns(address);
    function nextTokenId() external view returns(uint256);

    function create_protocol(string calldata _name) external returns(uint256);
    function create_pool(bytes calldata _encoded_pool_key) external returns(bytes32);
}


contract ProtocolAdminClient is IProtocolAdminClient, IERC165{
    
    bytes32 constant PROTOCOL_ADMIN_CLIENT_POSITION = keccak256("hook-bazaar.protocol.admin-client");    

    struct ProtocolAdminClientStorage{
        address admin_panel;
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

    // TODO: This function is onwed by the protocol deployer
    // and implements the initializer on initializable    
    function initialize() external initializer{
        LibOwner.OwnerStorage storage o$ = LibOwner.getStorage();
        o$.owner = msg.sender;
        // TODO: Strong check for admin panel impl contract
        ProtocolAdminClientStorage storage $  = getStorage();
        // LibERC165.registerInterface(type(IProtocolAdminClient).interfaceId);
        $.admin_panel = address(new ProtocolAdminPanel());

    }

    modifier initialized(){
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) revert ProtocolAdminClientUninitialized();
        _;
    }
    // TODO: Possible protection needed for delegate calls
    
    function initialize_admin_panel(
        address _protocol_admin_registry,
        address _protocol_factory,
        string calldata _baseURI
    ) external initialized {
        ProtocolAdminClientStorage storage $ = getStorage();
        LibOwner.requireOwner();
        IProtocolAdminPanel($.admin_panel).initialize(address(this),_protocol_admin_registry, _protocol_factory, _baseURI);
    }



    
    function create_protocol(string calldata _name) external initialized returns(uint256){
        ProtocolAdminClientStorage storage $ = getStorage();

        // NOTE: This only checks the address is not Zero, which
        // is equivalent to checking the contract has been initialized
        // because the code on address requirement is checked at __init__


        // address _protocol_factory = IProtocolAdminPanel($.admin_panel).registry();
        uint256 _token_id = $.nextTokenId;
        address _protocol_admin_manager = IProtocolAdminRegistry($.admin_panel).protocol_manager(_token_id);
        IProtocolFactory($.admin_panel).create_protocol(_name, _protocol_admin_manager, _token_id);
        // NOTE: Here it deploys and assigns a protocolAdmin
        // contract to the caller if it does not have one
        // already, if it has one it a
        
        return _token_id;
    }

    function create_pool(bytes calldata _encoded_pool_key) external initialized returns(bytes32){}
    
    function supportsInterface(bytes4 interfaceID) external view returns (bool){
        return interfaceID == type(IProtocolAdminClient).interfaceId;
    }
}