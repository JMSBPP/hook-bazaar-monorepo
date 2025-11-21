// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {IComponent} from "euler-vault-kit/src/GenericFactory/GenericFactory.sol";

interface IProtocol{}

abstract contract Protocol is IProtocol, IComponent{

}
