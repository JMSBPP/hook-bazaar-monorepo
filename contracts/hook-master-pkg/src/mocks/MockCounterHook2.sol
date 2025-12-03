// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v4-periphery/test/mocks/MockCounterHook.sol";

contract MockCounterHook2 is MockCounterHook{
    uint256 __slot;
    constructor(address _manager) MockCounterHook(IPoolManager(_manager)){}
}