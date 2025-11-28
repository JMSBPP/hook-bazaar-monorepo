// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {LibInitializable} from "compose-extensions/libraries/LibInitializable.sol";

import {IComponent} from "compose-extensions/GenericFactory/LibGenericFactory.sol";

import {IERC1155Receiver} from "Compose/interfaces/IERC1155Receiver.sol";

interface IPoolCreator{
    function create_pool(bytes calldata _encoded_pool_key) external;
}

interface IProtocolAdminManager{
    error ProtocolAdminManagerCallerIsNotCreator();
    error ProtocolAdminManagerUninitialized();
    event ProtocolAdminManagerInitialized(address indexed creator);
    function creator() external view returns(address);
}

contract ProtocolAdminManager is IComponent, IERC1155Receiver, IProtocolAdminManager, IPoolCreator{
    
    bytes32 constant STORAGE_POSITION = keccak256("wvs-finance.protocolAdminManager");

    struct ProtocolAdminManagerStorage{
        address creator;
        uint256 tokenId;
    }

    function getStorage() internal pure returns (ProtocolAdminManagerStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }



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


    // NOTE: Creator MUST be the address that called create_protocol


    // NOTE: This needs to implement the initializer
    //of initializable
    function initialize(address creator) external initializer{
        ProtocolAdminManagerStorage storage $ = getStorage();
        $.creator = creator;
        // NOTE : creator is supposed to be the owner of the protocol
        // which is potentially a smart accounMT , regular EOA or governance contract
        emit ProtocolAdminManagerInitialized(creator);
    }

    // NOTE: The creator is the ProtocolAdminClient, we need enforcements
    // that the creator implements the IUnlockCallback interface and the
    // IProtocolAdminClient interface

    function creator() public view returns(address){
        ProtocolAdminManagerStorage storage $ = getStorage();
        return $.creator;
    }

    // Only callable once initialized. MUST be guarded
    modifier initialized(){
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) revert ProtocolAdminManagerUninitialized();
        _;
    }

    modifier onlyCreator(){
        if (msg.sender != creator()) revert ProtocolAdminManagerCallerIsNotCreator();
        _;
    }
    // TODO: Function is only callable during mints triggered by the create_protocol flow ...
    function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data)
        external
        initialized
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

    function create_pool(bytes calldata _encoded_pool_key) external onlyCreator{}


}

