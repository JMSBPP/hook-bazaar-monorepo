// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;
import {IProtocolRegistry} from "./ProtocolRegistry.sol";
import {IERC5169} from "./interfaces/IERC5169.sol";
import {IERC1155Receiver} from "Compose/src/token/ERC1155/LibERC1155.sol";
import {LibERC1155} from "Compose/src/token/ERC1155/LibERC1155.sol";
import {IExttload} from "@uniswap/v4-core/src/interfaces/IExttload.sol";
import {LibOwner} from "Compose/src/access/Owner/LibOwner.sol";
import {OwnerFacet} from "Compose/src/access/Owner/OwnerFacet.sol";
import {IERC165} from "Compose/src/interfaceDetection/ERC165/ERC165Facet.sol";

// NOTE: This contract is the interaction point for protocol
// developers, AI agents 
interface IProtocolAdmin{
    error InvalidDeployer(address);
}

abstract contract ProtocolAdmin is IProtocolAdmin, IERC1155Receiver, IERC5169, OwnerFacet{
    
    constructor(){

        if (
            !IERC165(msg.sender).supportsInterface(
                type(IProtocolRegistry).interfaceId
            )
        )
        {
            revert InvalidDeployer(msg.sender);
        }

        LibOwner.transferOwnership(msg.sender);
    }


// function setTokenURI(uint256 _tokenId, string memory _tokenURI) internal {

    function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data)
        external
        returns (bytes4){
            LibOwner.requireOwner();
            address protocol_registry = LibOwner.owner(); 
            
            bytes32 encodedName = IExttload(protocol_registry).exttload(
                IProtocolAdmin(protocol_registry).PROTOCOL_TRANSIENT_STORAGE_METADATA_SLOT()
            );

        
            /// TODO: A DECODER HELPER TO MAKE THEM STRINGS
            
            string memory _name = "whatever";
            // TODO: THis needs to be a valid URI 
            LibERC1155.setTokenURI(_id, _name);


            return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
        }
}