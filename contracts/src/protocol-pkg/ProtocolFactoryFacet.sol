// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {InitializableBase} from "compose-extensions/LibInitializable.sol";


import {IERC165} from "forge-std/interfaces/IERC165.sol";

import {IERC1155} from "Compose/interfaces/IERC1155.sol";
import "Compose/token/ERC1155/ERC1155Mod.sol" as ERC1155Mod;
import {ERC1155Facet} from "Compose/token/ERC1155/ERC1155Facet.sol";
import "Compose/access/Owner/OwnerMod.sol" as OwnerMod;

interface IProtocolFactory{
    function __self() external view returns(address);

    error ProtocolFactoryFacetUninitialized();
    error ProtocolFactoryFacetInvalidInitializer();
    error ProtocolFactoryFacetNotDelegateCall();
    error ProtocolFactoryFacetInvalidDelegateCaller();

    function __initialize(string calldata _baseURI) external;
    function baseURI() external view returns(string memory);
    function adminPanel() external view returns(address);
    function create_protocol(string calldata _name, address _protocol_admin, uint256 _token_id) external;
}


// @notice Storage slot identifier for ERC-165 interface detection
// @dev Defined using keccak256 hash following ERC-8042 standard
// keccak256(hooks-bazaar.protocol-factory)

// uint256 constant PROTOCOL_FACTORY_STORAGE_POSITION = 2220184280574732288333510600956514732965581379269956828305363449220455080129; 

// contract ProtocolFactory is IProtocolFactory, GenericFactory layout at 2220184280574732288333510600956514732965581379269956828305363449220455080129{
//     constructor() GenericFactory(msg.sender){}
// } 

contract ProtocolFactoryFacet is IProtocolFactory, InitializableBase{
    address immutable public __self;

    constructor(){
        __self = address(this);
    }

    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.protocol-factory");
    

    struct ProtocolFactoryStorage{
        address adminPanel;
    }

    function getStorage() internal pure returns (ProtocolFactoryStorage storage $) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            $.slot := position
        }
    }

    // It specifies the Base URI at initialization

    // This is called on regular call by the protocolAdminPanel

    function __initialize(string calldata _baseURI) external initializer{
        OwnerMod.OwnerStorage storage o$ = OwnerMod.getStorage();
        ProtocolFactoryStorage storage $ = getStorage();
        o$.owner = msg.sender;
        ERC1155Mod.setBaseURI(_baseURI);
        $.adminPanel = address(this);
    
    }


    function baseURI() public view returns(string memory){
        ERC1155Mod.ERC1155Storage storage e1155$ = ERC1155Mod.getStorage();
        return e1155$.baseURI;
    }
    

    function adminPanel() public view returns(address){
        ProtocolFactoryStorage storage $ = getStorage();
        return $.adminPanel;
    }

    // TODO: This needs to check protocolAdmin is compliant and tokenId
    // is compliant too
    // TODO: This is called only on delegate call by the adminPanel
    modifier onlyAdminPanel(){
        if (address(this) == __self) revert ProtocolFactoryFacetNotDelegateCall();
        if (address(this) != adminPanel()) revert ProtocolFactoryFacetInvalidDelegateCaller();
        _;
    }

    // This is only callable after the contract has been initialized
   // NOTE: This also needs protection against reentrancy

    function create_protocol(string calldata _name,address _protocol_admin, uint256 _token_id) external onlyInitialized onlyAdminPanel{
        // TODO: This library must also expose a payload to the protocol admin
        // and perform checks against the protocol_admin
        // TODO: This is missing the data param on the mint function
        ERC1155Mod.mint(_protocol_admin,_token_id,uint256(0x01),abi.encode(_token_id));
        // NOTE: Needs to concat /ProtocolDashboard/protocolName ?= _name        
        ERC1155Mod.setTokenURI(_token_id, _name);
    }


   function balanceOf(address _account, uint256 _id) external view returns (uint256){
        ERC1155Mod.ERC1155Storage storage e1155$ = ERC1155Mod.getStorage();
        return e1155$.balanceOf[_id][_account];
   }
   
   function uri(uint256 _id) external view returns (string memory){
        ERC1155Mod.ERC1155Storage storage e1155$ = ERC1155Mod.getStorage();
        return e1155$.tokenURIs[_id];
   }

   fallback() external payable{}

}