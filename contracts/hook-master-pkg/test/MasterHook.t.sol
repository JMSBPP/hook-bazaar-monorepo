// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import "../src/MasterHook.sol";

contract MasterHookTest is Test{
    address master_hook;
    

    address any_caller = makeAddr("anyCaller");

    function setUp() public{
        master_hook = address(new MasterHook());

    }

    function test__unit__initializeMustSucceed() public {
        //==========PRE-CONDITIONS==================
        console2.logBytes(abi.encode(Hooks.Permissions(true, true, true, true, true, true, true,true, true, true, true, true, true, true)));

        //==============TEST========================

        //==========POST-CONDTIONS==================
    }
}