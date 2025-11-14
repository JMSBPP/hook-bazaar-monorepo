// // SPDX-License-Identifier: MIT
// pragma solidity >=0.8.30;


// import {IProtocolRegistry} from "./ProtocolRegistry.sol";
// import {IERC5169} from "./interfaces/IERC5169.sol";
// import {IERC1155Receiver} from "Compose/src/token/ERC1155/LibERC1155.sol";
// import {LibERC1155} from "Compose/src/token/ERC1155/LibERC1155.sol";
// import {IExttload} from "@uniswap/v4-core/src/interfaces/IExttload.sol";
// import {LibOwner} from "Compose/src/access/Owner/LibOwner.sol";
// import {OwnerFacet} from "Compose/src/access/Owner/OwnerFacet.sol";
// import {IERC165} from "Compose/src/interfaceDetection/ERC165/ERC165Facet.sol";
// import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";
// import {IERC1155} from "Compose/src/interfaces/IERC1155.sol";


// // NOTE: This contract is the interaction point for protocol
// // developers, AI agents 
// interface IProtocolAdmin{
//     error InvalidDeployer(address);
// }

// contract ProtocolAdmin is IProtocolAdmin, IERC1155Receiver, IERC5169, OwnerFacet{
    


// // function setTokenURI(uint256 _tokenId, string memory _tokenURI) internal {

//     function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data)
//         external
//         returns (bytes4){
//             // // LibOwner.requireOwner();
//             // address protocol_registry = LibOwner.owner(); 
//             // string memory _tokenURI = string.concat("protocols/",Strings.toString(_id), ".json");


        
//             // /// TODO: A DECODER HELPER TO MAKE THEM STRINGS
//             // // TODO: This needs to be a valid URI 
//             // IERC1155(msg.sender).setTokenURI(_id, _tokenURI);


//             return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
//     }

//         function onERC1155BatchReceived(
//             address _operator,
//             address _from,
//             uint256[] calldata _ids,
//             uint256[] calldata _values,
//             bytes calldata _data
//         ) external returns (bytes4){

//         }
//         function scriptURI() external view returns(string[] memory){}
//         function setScriptURI(string[] memory newScriptURI) external{}


// }