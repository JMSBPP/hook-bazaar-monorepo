// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {LibInitializable} from "compose-extensions/libraries/LibInitializable.sol";


import {IERC165} from "forge-std/interfaces/IERC165.sol";
import {LibERC165} from "Compose/interfaceDetection/ERC165/LibERC165.sol";
import {ERC165Facet} from "Compose/interfaceDetection/ERC165/ERC165Facet.sol";


import {IERC1155} from "Compose/interfaces/IERC1155.sol";
import {LibERC1155} from "Compose/token/ERC1155/LibERC1155.sol";
import {ERC1155Facet} from "Compose/token/ERC1155/ERC1155Facet.sol";

// import {GenericFactory} from "euler-vault-kit/src/GenericFactory/GenericFactory.sol";

// interface IGenericFactory{
//     function createProxy(address desiredImplementation, bool upgradeable, bytes memory trailingData) external returns (address);
// }




interface IProtocolFactory{
    function __self() external view returns(address);

    error ProtocolFactoryFacetUninitialized();
    error ProtocolFactoryFacetInvalidInitializer();
    error ProtocolFactoryFacetNotDelegateCall();
    error ProtocolFactoryFacetInvalidDelegateCaller();

    function initialize(string calldata _baseURI) external;
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

contract ProtocolFactoryFacet is IProtocolFactory{
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

    // NOTE: This is owned by the protocol deployer
    // Implements initializer
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

    // It specifies the Base URI at initialization

    // This is called on regular call by the protocolAdminPanel

    function initialize(string calldata _baseURI) external initializer{
        ProtocolFactoryStorage storage $ = getStorage();
        // TODO: Stronger check to ensure the caller is the ProtocolAdminPanel,
        // HINT: Introspection on diamond interface id
        if (msg.sender.code.length == uint256(0x00)) revert ProtocolFactoryFacetInvalidInitializer();
        $.adminPanel = msg.sender;
        LibERC1155.setBaseURI(_baseURI);

    }

    function baseURI() public view returns(string memory){
        LibERC1155.ERC1155Storage storage e1155$ = LibERC1155.getStorage();
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
    modifier initialized(){
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) revert ProtocolFactoryFacetUninitialized();
        _;
    }
    // NOTE: This also needs protection against reentrancy

    function create_protocol(string calldata _name,address _protocol_admin, uint256 _token_id) external initialized onlyAdminPanel{
        // TODO: This library must also expose a payload to the protocol admin
        // and perform checks against the protocol_admin
        // TODO: This is missing the data param on the mint function
        LibERC1155.mint(_protocol_admin,_token_id,uint256(0x01),abi.encode(_token_id));       
        LibERC1155.setTokenURI(_token_id, _name);
    }


   function balanceOf(address _account, uint256 _id) external view returns (uint256){
        LibERC1155.ERC1155Storage storage e1155$ = LibERC1155.getStorage();
        return e1155$.balanceOf[_id][_account];
   }
   
   function uri(uint256 _id) external view returns (string memory){
        LibERC1155.ERC1155Storage storage e1155$ = LibERC1155.getStorage();
        return e1155$.tokenURIs[_id];
   }






}