// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;


import {IProtocolAdminPanel} from "./ProtocolAdminPanel.sol";
import {ProtocolFactory, IGenericFactory} from "./ProtocolFactory.sol"; 

interface IProtocolAdminClient{
    function __init__(address _admin_panel) external;
    function create_protocol(string calldata _name) external returns(uint256);
    function factory() external returns(address);
}


contract ProtocolAdminClient is IProtocolAdminClient{
    
    bytes32 constant PROTOCOL_ADMIN_CLIENT_POSITION = keccak256("hook-bazaar.protocol.admin-client");    

    struct ProtocolAdminClientStorage{
        address protocol_implementation;
        address admin_panel;
        address factory;
        uint256 nextTokenId;
    }

    constructor(){
        ProtocolAdminClientStorage storage $ = getStorage();
        $.nextTokenId = uint256(0x01);

    }

    function getStorage() internal pure returns (ProtocolAdminClientStorage storage s) {
        bytes32 position = PROTOCOL_ADMIN_CLIENT_POSITION;
        assembly {
            s.slot := position
        }
    }

    
    function __init__(address _admin_panel) external{
        ProtocolAdminClientStorage storage $ = getStorage();
        $.admin_panel = _admin_panel;     
    }

    
    function create_protocol(string calldata _name) external returns(uint256){
        ProtocolAdminClientStorage storage $ = getStorage();
        
        require($.admin_panel != address(0x00) && IProtocolAdminPanel($.admin_panel).registry() != address(0x00),"Admin Panel not set");
        
        uint256 _token_id = $.nextTokenId;
        

        // IERC1155($.admin_panel).mint(_token_id)

    }

    function factory() external returns(address){
        ProtocolAdminClientStorage storage $ = getStorage();
        address _factory = $.factory == address(0x00) ?  address(new ProtocolFactory()): $.factory;
        return _factory;
        address _protocol  = IGenericFactory(_factory).createProxy(
            $.protocol_implementation,
            false,
            abi.encode("0x00")
        );
    }
}