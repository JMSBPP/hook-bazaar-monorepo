// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {GenericFactory} from "euler-vault-kit/src/GenericFactory/GenericFactory.sol";

interface IGenericFactory{
    function createProxy(address desiredImplementation, bool upgradeable, bytes memory trailingData) external returns (address);
}


interface IProtocolFactory{}


// @notice Storage slot identifier for ERC-165 interface detection
// @dev Defined using keccak256 hash following ERC-8042 standard
// keccak256(hooks-bazaar.protocol-factory)

uint256 constant PROTOCOL_FACTORY_STORAGE_POSITION = 2220184280574732288333510600956514732965581379269956828305363449220455080129; 

contract ProtocolFactory is IProtocolFactory, GenericFactory layout at 2220184280574732288333510600956514732965581379269956828305363449220455080129{
    constructor() GenericFactory(msg.sender){}
} 