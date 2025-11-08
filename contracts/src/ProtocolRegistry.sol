// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;


import {ERC1155Facet} from "Compose/src/token/ERC1155/ERC1155Facet.sol";
import {IERC1155} from "Compose/src/interfaces/IERC1155.sol";
import {LibERC1155} from "Compose/src/token/ERC1155/LibERC1155.sol";
import {Exttload} from "@uniswap/v4-core/src/Exttload.sol";

import {CREATE3} from "solmate/src/utils/CREATE3.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import "./ProtocolAdmin.sol";
import {ERC1155} from "solmate/src/tokens/ERC1155.sol";

// import {DiamondCutFacet} from "Compose/src/diamond/DiamondCutFacet.sol";
// NOTE:  Each tokenId is a protocol instance


// NOTE: Needs to deploy using createX a minimal proxy that 
// serves as PoolBuilder, which has 
interface IProtocolRegistry{

    function createProtocol(string calldata _name) external;    
    
    enum Status{
        LIVE,
        OUT
    }


    function __init__(address _erc_1155) external;

    function TRANSIENT_STORAGE_POSITION() external returns(bytes32);
    
    
}

contract ProtocolRegistry is IProtocolRegistry,  Exttload, ERC1155{

    // keccak256("hook-bazaar.transient.protocol-registry")
    bytes32 constant public TRANSIENT_STORAGE_POSITION = 0xaccc49d8894b294c1c858334db7d7c34f5ff7af17cfa41f89c7d7e3c71f49393;
    // keccak256("hook-bazzar.protocol-registry")
    bytes32 constant STORAGE_POSITION = 0xdede46c1d9753a45431c4eed17267e8925ce5799faa83b1d7909fcb39670b161;

    struct ProtocolRegistryStorage{
        uint256 nextTokenId;
    }

    function __init__(address _erc_1155) external{
        ProtocolRegistryStorage storage $ = getStorage();
        $.nextTokenId += uint256(0x01);
        // $.erc_1155 = _erc_1155;

    }

    function getStorage() internal pure returns (ProtocolRegistryStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    function createProtocol(string calldata _name) external {
        // TODO: Here it deploys a protocol_admin using CREATE_X

        address _protocol_admin = CREATE3.deploy(
            keccak256(
                abi.encodePacked(
                    "hook-bazaar",
                    msg.sender,
                    _name
                )
            ), 
            type(ProtocolAdmin).creationCode,
            uint256(0x00)
        );

        ProtocolRegistryStorage storage $ = getStorage();
        this.setApprovalForAll(_protocol_admin, true);

        


        // NOTE: Now that is deployed it sends the data
        // transiently to the ProtocolAdmin
        
        _mint(
            _protocol_admin,
            $.nextTokenId,
            uint256(uint8(Status.LIVE)),
            bytes(_name)
        );

        $.nextTokenId += uint256(0x01);
        
    }

    function uri(uint256 id) public view override returns (string memory){
        return string.concat("protocols/",Strings.toString(id));
    }
}
