// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {InitializableBase} from "compose-extensions/LibInitializable.sol";
import "Compose/access/AccessControl/AccessControlMod.sol" as AccessControlMod;
import {Authority} from "solmate/src/auth/Auth.sol";
import {IComponent} from "compose-extensions/LibGenericFactory.sol";

import {IERC1155Receiver} from "Compose/interfaces/IERC1155Receiver.sol";



interface IProtocolAdminManager{
    error ProtocolAdminManagerCallerIsNotCreator();
    error ProtocolAdminManagerUninitialized();
    event ProtocolAdminManagerInitialized(address indexed creator);
    function isCreator(address _account) external view returns(bool);  
}


// NOTE: ProtocolAdminManager is an operator
contract ProtocolAdminManager is IComponent, IERC1155Receiver, IProtocolAdminManager, Authority, InitializableBase{
    
    bytes32 constant CREATOR = keccak256("hook-bazaar.creator");
    bytes32 constant POOL_CREATOR = keccak256("hook-bazaar.pool-creator"); 

    bytes32 constant STORAGE_POSITION = keccak256("wvs-finance.protocolAdminManager");

    struct ProtocolAdminManagerStorage{
        uint256 tokenId;
    }

    function getStorage() internal pure returns (ProtocolAdminManagerStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }





    // NOTE: Creator MUST be the address that called create_protocol


    // NOTE: The creator needs to be the caller of the create_protocol on ProtocolAdminClient
    function initialize(address creator) external initializer{

        ProtocolAdminManagerStorage storage $ = getStorage();
        AccessControlMod.grantRole(CREATOR, creator);
        AccessControlMod.grantRole(POOL_CREATOR, creator);
        // NOTE : creator is supposed to be the owner of the protocol
        // which is potentially a smart accounMT , regular EOA or governance contract
        emit ProtocolAdminManagerInitialized(creator);
    }



    function isCreator(address _account) public view returns(bool){
        AccessControlMod.hasRole(CREATOR, _account);
    }

    modifier onlyCreator(){
        if (!isCreator(msg.sender)) revert ProtocolAdminManagerCallerIsNotCreator();
        _;
    }
    // TODO: Function is only callable during mints triggered by the create_protocol flow ...
    function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data)
        external
        onlyInitialized
        returns (bytes4){
            ProtocolAdminManagerStorage storage $ = getStorage();
            $.tokenId = _id;
            return IERC1155Receiver.onERC1155Received.selector;
            // TODO: It sets the protocoll as created and this uncloks the create_pool to be called
            // by the caller address, additioanlly the caller can now use this contract
            // to custom his protocol
        }

    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external returns (bytes4){}

    function grantPoolCreator(address _account) external onlyCreator{
        AccessControlMod.grantRole(POOL_CREATOR, _account);
    }

    function canCall(
        address user,
        address target,
        bytes4 functionSig
    ) external view returns (bool){
        bool _canCall;
        if (functionSig == bytes4(keccak256("create_pool(bytes memory)"))){
            _canCall = AccessControlMod.hasRole(POOL_CREATOR, user);
        }

        return _canCall;
    }






}

