// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;


import {Test, console2} from "forge-std/Test.sol";

import {
    ProtocolAdminRegistry,
    IProtocolAdminRegistry,
    IGenericFactory,
    IProtocolAdminPanelConsumer
} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminRegistry.sol";

import {ProxyHelper} from "./helpers/ProxyHelper.sol";

contract ProtocolAdminRegistryTest is Test{
    address protocol_admin_registry;


    address admin = makeAddr("admin");
    address proxy_helper;
    address any_caller = makeAddr("anyCaller");

    function setUp() public{
        protocol_admin_registry = address(new ProtocolAdminRegistry());
        proxy_helper = address(new ProxyHelper(protocol_admin_registry));
    }

    function test__unit__initializeMustSucceed() public{
        //===============PRE-CONDITIONS=====================
        assertEq(protocol_admin_registry, IProtocolAdminRegistry(protocol_admin_registry).__self());

        //====================TEST============================
        vm.startPrank(admin);
        IProtocolAdminRegistry(proxy_helper)._initialize();
        
        vm.stopPrank();
        //===============POST-CONDITIONS==================
        assertEq(IProtocolAdminRegistry(proxy_helper).upgradeAdmin(),admin);
        assertEq(proxy_helper, IProtocolAdminPanelConsumer(proxy_helper).adminPanel());
        assertNotEq(address(0x00), IProtocolAdminRegistry(proxy_helper).adminManagerTemplate());

    }

    function test__unit__initializeMustRevertDoubleInitialization() public {
        //================PRE-CONDITIONS==============================
        test__unit__initializeMustSucceed();
        //===================TEST=======================================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolAdminRegistry(proxy_helper)._initialize();
        vm.stopPrank();
        //===================POST-CONDITIONS===========================
    }

    function test__unit__deployAdminManagerMustRevertOnInvalidContext() public{
        //=================PRE-CONDITIONS=========================
        test__unit__initializeMustSucceed();

        address prevProtocolManager = IProtocolAdminRegistry(proxy_helper).getProtocolManager(uint256(0x01));
        //====================TEST==============================
        vm.startPrank(any_caller);
        vm.expectRevert();
        address _admin_manager = IProtocolAdminRegistry(proxy_helper).setProtocolManager(uint256(0x01), any_caller);
        vm.stopPrank();

        //====================POST-CONDITIONS====================
        address postProtocolManager = IProtocolAdminRegistry(proxy_helper).getProtocolManager(uint256(0x01));
        assertEq(prevProtocolManager, postProtocolManager);

    }

    function test__unit__addPoolMustRevertOnInvalidContext() public {
        //===================PRE-CONDITIONS=============================
        test__unit__initializeMustSucceed();
        //======================TEST====================================
        vm.prank(any_caller);
        vm.expectRevert();
        IProtocolAdminRegistry(proxy_helper).setProtocolManager(uint256(0x01),any_caller);
        //===================POST-CONDITIONS==========================
    }




    
}
