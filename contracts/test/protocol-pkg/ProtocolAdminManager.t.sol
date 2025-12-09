// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {ProtocolAdminManager, IProtocolAdminManager, Authority} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
import {IComponent} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";

contract ProtocolAdminManagerTest is Test{
    address protocol_admin = makeAddr("admin");
    address protocol_admin_manager_impl;
    address any_caller = makeAddr("anyCaller");

    function setUp() public{
        protocol_admin_manager_impl = address(new ProtocolAdminManager());
    }


    function test__unit__initializeMustSucceed() public{
        //============PRE-CONDITIONS==================


        //===============TEST=========================
        vm.startPrank(protocol_admin);
        IComponent(protocol_admin_manager_impl).initialize(protocol_admin);
        vm.stopPrank();
        
        //============POST-CONDITIONS==============
        assertTrue(IProtocolAdminManager(protocol_admin_manager_impl).isCreator(protocol_admin));
    }

    function test__unit__initializeDoubleMustRevert() public {
        //===============PRE-CONDITIONS=====================
        test__unit__initializeMustSucceed();
        //=================TEST===============================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IComponent(protocol_admin_manager_impl).initialize(any_caller);
        vm.stopPrank();

        //=================POST-CONDITIONS=======================
    }

    function test__unit__delegatePoolCreatorRoleMustSucceed() public {
        //=================PRE-CONDITIONS==========================
        test__unit__initializeMustSucceed();
        //==================TEST===================================
        vm.startPrank(protocol_admin);

        IProtocolAdminManager(protocol_admin_manager_impl).delegatePoolCreatorRole(any_caller);
        vm.stopPrank();
        //=================POST-CONDITIONS=========================
        // assertTrue(Authority(protocol_admin_manager_impl).canCall(any_caller, address(0x00), bytes4(keccak256("create_pool(bytes,uint160)"))));

    }

    function test__unit__makeCallsBeforeInitializingMustFail() public {
        //====================PRE-CONDITIONS=======================
        
        //======================TEST==============================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolAdminManager(protocol_admin_manager_impl).delegatePoolCreatorRole(any_caller);
        vm.stopPrank();

        //==================POST-CONDITIONS=======================
    }

    function test__unit__delegatePoolCreatorRoleUnauthorizedMustRevert() public{
        //====================PRE-CONDITIONS=======================
        test__unit__initializeMustSucceed();


        //======================TEST==============================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolAdminManager(protocol_admin_manager_impl).delegatePoolCreatorRole(any_caller);
        vm.stopPrank();
        //=====================POST-CONDITIONS=========================
    }


}

