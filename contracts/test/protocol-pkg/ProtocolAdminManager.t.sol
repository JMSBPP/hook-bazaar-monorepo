// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {ProtocolAdminManager, IProtocolAdminManager} from "@hook-bazaar/protocol-pkg/ProtocolAdminManager.sol";
import {IComponent} from "@hook-bazaar/protocol-pkg/ProtocolAdminManager.sol";

contract ProtocolAdminManagerTest is Test{
    address admin = makeAddr("admin");
    address protocol_admin_manager_impl;
    address any_caller = makeAddr("anyCaller");

    function setUp() public{
        protocol_admin_manager_impl = address(new ProtocolAdminManager());
    }


    function test__unit__initializeMustSucceed() public{
        //============PRE-CONDITIONS==================


        //===============TEST=========================
        vm.startPrank(any_caller);
        IComponent(protocol_admin_manager_impl).initialize(any_caller);
        vm.stopPrank();
        
        //============POST-CONDITIONS==============
        assertTrue(IProtocolAdminManager(protocol_admin_manager_impl).isCreator(any_caller));
    }





}

