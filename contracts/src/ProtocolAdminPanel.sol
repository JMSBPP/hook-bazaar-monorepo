// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import "compose-extensions/BaseDiamond.sol";

import {IERC1155} from "Compose/src/interfaces/IERC1155.sol";
import {ERC1155Facet} from "Compose/src/token/ERC1155/ERC1155Facet.sol";

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
interface IProtocolAdminPanel{
    error InvalidDeployer(address);
    function registry() external returns(address);
}

// TODO: To be considered : IERC5169
// TODO: To be considered: IERC1155Receiver

contract ProtocolAdminPanel is IProtocolAdminPanel, BaseDiamond{
    

    struct ProtocolAdminPanelStorage{
        address registry;

    }

    bytes32 constant PROTOCOL_ADMIN_PANEL_STORAGE = keccak256("hook-bazaar.protocol.admin-panel");    



    function getStorage() internal pure returns (ProtocolAdminPanelStorage storage s) {
        bytes32 position = PROTOCOL_ADMIN_PANEL_STORAGE;
        assembly {
            s.slot := position
        }
    }

    function registry() external returns(address){
        ProtocolAdminPanelStorage storage $ = getStorage();
        address _registry;

         if ($.registry == address(0x00)){
            {
                bytes4[] memory  _interface = new bytes4[](uint256(0x07));

                _interface[0x00] = IERC1155.balanceOf.selector;
                _interface[0x01] = IERC1155.balanceOfBatch.selector;
                _interface[0x02] = IERC1155.setApprovalForAll.selector;
                _interface[0x03] = IERC1155.isApprovedForAll.selector;
                _interface[0x04] = IERC1155.safeTransferFrom.selector;
                _interface[0x05] = IERC1155.safeBatchTransferFrom.selector;
                _interface[0x06] = IERC1155.uri.selector;

                DiamondCutFacet.FacetCut[] memory _cut = new DiamondCutFacet.FacetCut[](uint256(0x01));
                _cut[0x00] = DiamondCutFacet.FacetCut(address(new ERC1155Facet()), DiamondCutFacet.FacetCutAction.Add, _interface);
                IDiamondCutFacet(address(this)).diamondCut(_cut, address(0x00), abi.encode("0x00"));

                // TODO: Stronger verification suggested
                $.registry = IDiamondLoupeFacet(address(this)).facetAddress(
                    IERC1155.uri.selector
                );
            }

         }

        _registry = $.registry;
        return _registry;

    }


    


}

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