// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;


import {ERC1155Facet,IERC1155Receiver} from "Compose/src/token/ERC1155/ERC1155Facet.sol";
import {LibERC1155} from "Compose/src/token/ERC1155/LibERC1155.sol";
import {Exttload} from "@uniswap/v4-core/src/Exttload.sol";

// NOTE:  Each tokenId is a protocol instance


// NOTE: Needs to deploy using createX a minimal proxy that 
// serves as PoolBuilder, which has 
interface IProtocolRegistry{
    
    enum Status{
        LIVE,
        OUT
    }

    function PROTOCOL_TRANSIENT_STORAGE_METADATA_SLOT() external returns(bytes32);
    
    
}

abstract contract ProtocolRegistry is IProtocolRegistry, Exttload{

    // keccak256("hook-bazaar.transient.protocol-registry")
    bytes32 constant public TRANSIENT_STORAGE_POSITION = 0xaccc49d8894b294c1c858334db7d7c34f5ff7af17cfa41f89c7d7e3c71f49393;
    // keccak256("hook-bazzar.protocol-registry")
    bytes32 constant STORAGE_POSITION = 0xdede46c1d9753a45431c4eed17267e8925ce5799faa83b1d7909fcb39670b161;

    struct ProtocolRegistryStorage{
        uint256 nextTokenId;
    }

    constructor(){
        ProtocolRegistryStorage storage $ = getStorage();
        $.nextTokenId += uint256(0x01);

    }

    function getStorage() internal pure returns (ProtocolRegistryStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    function createProtocol(
        string calldata _name
    ) external {
        // TODO: Here it deploys a protocol_admin using CREATE_X

        address _protocol_admin;
        
        bytes32 encodedName = abi.encodePacked(_name);
    
        assembly("memory-safe"){
            tstore(PROTOCOL_TRANSIENT_STORAGE_METADATA_SLOT,encodedName)
        }

        // NOTE: Now that is deployed it sends the data
        // transiently to the ProtocolAdmin
        ProtocolRegistry  $ = getStorage();
        
        LibERC1155.mint(
            _protocol_admin,
            $.nextTokenId,
            uint256(uint8(Status.LIVE))
        );

        $.nextTokenId += uint256(0x01);
        
  
    }
}
