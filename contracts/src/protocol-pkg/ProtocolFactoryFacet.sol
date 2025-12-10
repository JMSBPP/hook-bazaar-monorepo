// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {console2} from "forge-std/console2.sol";
import {InitializableBase} from "compose-extensions/LibInitializable.sol";

import {EnumerableMap} from "../../lib/openzeppelin-contracts/contracts/utils/structs/EnumerableMap.sol";

import {IERC165} from "forge-std/interfaces/IERC165.sol";

import {IERC1155} from "Compose/interfaces/IERC1155.sol";
import "Compose/token/ERC1155/ERC1155Mod.sol" as ERC1155Mod;
import {ERC1155Facet} from "Compose/token/ERC1155/ERC1155Facet.sol";
import "Compose/access/Owner/OwnerMod.sol" as OwnerMod;

import {DiamondLoupeFacet} from "Compose/diamond/DiamondLoupeFacet.sol";

interface IProtocolAdminPanelConsumer{
    function adminPanel() external view returns(address);
}

library ArrayUtils{

    function indexOf(uint256[] memory arr, uint256 target) internal pure returns (int) {
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return int(i); // Found
        }
        }
        return -1; // Not found
    }

}


interface IProtocolFactory{
    function __self() external view returns(address);

    error ProtocolFactoryFacetUninitialized();
    error ProtocolFactoryFacetInvalidInitializer();
    error ProtocolFactoryFacetNotDelegateCall();
    error ProtocolFactoryFacetInvalidDelegateCaller();
    error ProtocolFactoryAlreadyTaken();
    function __initialize(string calldata _baseURI) external;
    function baseURI() external view returns(string memory);
    function create_protocol(string calldata _name, address _protocol_admin, uint256 _token_id) external;
    function getProtocols(address _account) external returns(uint256[] memory);
}


// @notice Storage slot identifier for ERC-165 interface detection
// @dev Defined using keccak256 hash following ERC-8042 standard
// keccak256(hooks-bazaar.protocol-factory)

// uint256 constant PROTOCOL_FACTORY_STORAGE_POSITION = 2220184280574732288333510600956514732965581379269956828305363449220455080129; 

// contract ProtocolFactory is IProtocolFactory, GenericFactory layout at 2220184280574732288333510600956514732965581379269956828305363449220455080129{
//     constructor() GenericFactory(msg.sender){}
// } 

contract ProtocolFactoryFacet is InitializableBase, IProtocolAdminPanelConsumer, IProtocolFactory{
    address immutable public __self;

    constructor(){
        __self = address(this);
    }

    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.protocol-factory");
    

    struct ProtocolFactoryStorage{
        address adminPanel;
        mapping(address _creator => uint256[] creatorProtocols) protocols;
        uint256[] names;

        //address 1-->*uint256[]
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
    
    // TODO: This needs to check protocolAdmin is compliant and tokenId
    // is compliant too
    // TODO: This is called only on delegate call by the adminPanel
    modifier onlyAdminPanel(){
        ProtocolFactoryStorage storage $ = getStorage();
        address factoryOnPanel = DiamondLoupeFacet($.adminPanel).facetAddress(IProtocolFactory.create_protocol.selector);
        if (address(this) == __self || factoryOnPanel != __self) revert ProtocolFactoryFacetInvalidDelegateCaller();
        _;        
    }

    function adminPanel() external view returns(address){
        ProtocolFactoryStorage storage $ = getStorage();
        return $.adminPanel;    
    }

     // This is only callable after the contract has been initialized
     // NOTE: This also needs protection against reentrancy
    modifier nonRepeatedNames(string calldata _name){
        ProtocolFactoryStorage storage $ = getStorage();
        if (ArrayUtils.indexOf($.names,uint256(keccak256(bytes(_name)))) != int256(-1)) revert ProtocolFactoryAlreadyTaken();
        _;
    }


    function create_protocol(string calldata _name,address _protocol_admin, uint256 _token_id) external onlyInitialized onlyAdminPanel nonRepeatedNames(_name){
        ProtocolFactoryStorage storage $ = getStorage();
        ERC1155Mod.mint(_protocol_admin,_token_id,1,abi.encode(_name));
        ERC1155Mod.setTokenURI(_token_id, _name);
        $.protocols[msg.sender].push(_token_id);
        $.names.push(uint256(keccak256(bytes(_name))));
    }

    function getProtocols(address _account) external returns(uint256[] memory){
        ProtocolFactoryStorage storage $ = getStorage();
        return $.protocols[_account];
    }


   function balanceOf(address _from, uint256 _id) external view returns (uint256){
        ERC1155Mod.ERC1155Storage storage e1155$ = ERC1155Mod.getStorage();
        return e1155$.balanceOf[_id][_from];
   }
   
   function uri(uint256 _id) external view returns (string memory){
        ERC1155Mod.ERC1155Storage storage e1155$ = ERC1155Mod.getStorage();
        return e1155$.tokenURIs[_id];
   }


}