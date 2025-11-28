// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import "../src/ProtocolAdminClient.sol";


contract ProtocolAdminClientTest is Test{


    address protocol_admin_client;
    address protocol_admin_registry;
    address protocol_factory_facet;

    address protocol_deployer = makeAddr("deployer");
    address any_caller = makeAddr("anyCaller");

    function setUp() public{
        vm.startPrank(any_caller);

        protocol_admin_client = address(new ProtocolAdminClient());
        protocol_admin_registry = address(new ProtocolAdminRegistry());
        protocol_factory_facet = address(new ProtocolFactoryFacet());
        
        vm.stopPrank();
    }

    function test__unit__MustHaveInitiatedValidTokenId() public{
        //==============PRE-CONDITIONS=================

        //=================TEST===========================
        
        //================POST-CONDITIONS====================
        assertEq(IProtocolAdminClient(protocol_admin_client).nextTokenId(), uint256(0x01));
    }

    function test__unit__initializeMustSucceed() public{
        //===============PRE-CONDITIONS=====================
        //====================TEST============================
        vm.startPrank(protocol_deployer);
        IProtocolAdminClient(protocol_admin_client).initialize();
        vm.stopPrank();
        //================POST-CONDITIONS====================
        assertNotEq(IProtocolAdminClient(protocol_admin_client).adminPanel(), address(0x00));
        assertGt(IProtocolAdminClient(protocol_admin_client).adminPanel().code.length, uint256(0x00));
    }

    function test__unit__initializeAdminProtocolMustSucceed() public {
        //======================PRE-CONDITIONS=============================
        vm.startPrank(protocol_deployer);
        IProtocolAdminClient(protocol_admin_client).initialize();
        vm.stopPrank();

        
        //=========================TEST===================================
        vm.startPrank(protocol_deployer);
        IProtocolAdminClient(protocol_admin_client).initialize_admin_panel(protocol_admin_registry, protocol_factory_facet, "http://localhost:3000/metadata/");
        vm.stopPrank();
        //=======================POST-CONDITIONS==========================
    }

    function test__unit__createProtocolMustSucceed() public {
        //=================PRE-CONDITIONS=======================    
        vm.startPrank(protocol_deployer);
        IProtocolAdminClient(protocol_admin_client).initialize();
        vm.stopPrank();
        
        vm.startPrank(protocol_deployer);
        IProtocolAdminClient(protocol_admin_client).initialize_admin_panel(protocol_admin_registry, protocol_factory_facet, "http://localhost:3000/metadata/");
        vm.stopPrank();
        
        //=======================TEST================================
        vm.startPrank(any_caller);
    
        IProtocolAdminClient(protocol_admin_client).create_protocol("DefiHub");
        vm.stopPrank();
        //=====================POST-CONDITIONS=====================
    }
}