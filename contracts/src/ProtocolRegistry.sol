// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {DiamondCutFacet} from "Compose/src/diamond/DiamondCutFacet.sol";
import {AccessControlFacet} from "Compose/src/access/AccessControl/AccessControlFacet.sol";

// NOTE:  Each tokenId is a protocol instance


// NOTE: Needs to deploy using createX a minimal proxy that 
// serves as PoolBuilder, which has 
interface IProtocolRegistry{

    function createProtocol(string calldata _name) external;    
    
    
}

contract ProtocolFactory is DiamondCutFacet{
    error FunctionNotFound(bytes4 selector);


    bytes32 constant PROTOCOL_ENGINEER = bytes32(uint256(0x01));
    
    struct ProtocolFactoryStorage{
        address access_control;
    }

    // keccak256("hook-bazzar.protocol-registry")
    bytes32 constant STORAGE_POSITION = 0xdede46c1d9753a45431c4eed17267e8925ce5799faa83b1d7909fcb39670b161;


    // TODO: This needs to be mmodifed to allow 
    // for access control
    constructor() {
        OwnerStorage storage o$ = getOwnerStorage();
        o$.owner = msg.sender;
    }


    fallback() external payable {
        DiamondStorage storage s = getDiamondStorage();
        address facet = s.facetAndPosition[msg.sig].facet;
        if (facet == address(0)) revert FunctionNotFound(msg.sig);

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(0, 0, size)
            switch result
            case 0 { revert(0, size) }
            default { return(0, size) }
        }
    }

    receive() external payable {}

}


// contract ProtocolRegistry is IProtocolRegistry,  Exttload, ERC1155{

//     // // keccak256("hook-bazaar.transient.protocol-registry")
//     // bytes32 constant public TRANSIENT_STORAGE_POSITION = 0xaccc49d8894b294c1c858334db7d7c34f5ff7af17cfa41f89c7d7e3c71f49393;
//     // keccak256("hook-bazzar.protocol-registry")
//     bytes32 constant STORAGE_POSITION = 0xdede46c1d9753a45431c4eed17267e8925ce5799faa83b1d7909fcb39670b161;

//     struct ProtocolRegistryStorage{
//         uint256 nextTokenId;
//     }


//     function getStorage() internal pure returns (ProtocolRegistryStorage storage s) {
//         bytes32 position = STORAGE_POSITION;
//         assembly {
//             s.slot := position
//         }
//     }

//     function createProtocol(string calldata _name) external {
//         // TODO: Here it deploys a protocol_admin using CREATE_X

//         address _protocol_admin = CREATE3.deploy(
//             keccak256(
//                 abi.encodePacked(
//                     "hook-bazaar",
//                     msg.sender,
//                     _name
//                 )
//             ), 
//             type(ProtocolAdmin).creationCode,
//             uint256(0x00)
//         );

//         ProtocolRegistryStorage storage $ = getStorage();
//         this.setApprovalForAll(_protocol_admin, true);

        


//         // NOTE: Now that is deployed it sends the data
//         // transiently to the ProtocolAdmin
        
//         _mint(
//             _protocol_admin,
//             $.nextTokenId,
//             uint256(uint8(Status.LIVE)),
//             bytes(_name)
//         );

//         $.nextTokenId += uint256(0x01);
        
//     }

//     function uri(uint256 id) public view override returns (string memory){
//         return string.concat("protocols/",Strings.toString(id));
//     }
// }
