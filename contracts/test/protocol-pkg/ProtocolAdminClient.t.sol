// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {ProtocolAdminClient, IProtocolAdminClient, IOwnable} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminClient.sol";
import {ProtocolAdminRegistry, IProtocolAdminRegistry} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminRegistry.sol";
import {ProtocolFactoryFacet, IProtocolFactory, IProtocolAdminPanelConsumer} from "@hook-bazaar/protocol-pkg/src/ProtocolFactoryFacet.sol";
import {IProtocolAdminManager} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";

 
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
        IProtocolAdminClient(protocol_admin_client).initialize(
            IProtocolAdminRegistry(protocol_admin_registry),
            IProtocolFactory(protocol_factory_facet),
            "http://localhost:3000/metadata/"
        );
        vm.stopPrank();
        //================POST-CONDITIONS====================
        assertEq(protocol_deployer, IOwnable(protocol_admin_client).owner());
        assertNotEq(IProtocolAdminPanelConsumer(protocol_admin_client).adminPanel(), address(0x00));
        assertGt(IProtocolAdminPanelConsumer(protocol_admin_client).adminPanel().code.length, uint256(0x00));
        
    }

    function test__unit__initializeDoubleMustRevert() public {
        //======================PRE-CONDITIONS=============================
        test__unit__initializeMustSucceed();
        //=========================TEST===================================
        vm.startPrank(protocol_deployer);
        vm.expectRevert();
        IProtocolAdminClient(protocol_admin_client).initialize(
            IProtocolAdminRegistry(protocol_admin_registry),
            IProtocolFactory(protocol_factory_facet),
            "http://localhost:3000/metadata/"
        );
        vm.stopPrank();
        //=======================POST-CONDITIONS==========================
    }

    function test__unit__createProtocolMustSucceed() public {
        //=================PRE-CONDITIONS=======================    
        test__unit__initializeMustSucceed();
        
        uint256 beforeTokenId = IProtocolAdminClient(protocol_admin_client).nextTokenId();
        //=======================TEST================================
        vm.startPrank(any_caller);
        (uint256 _protocolId, address _protocolAdminManager) = IProtocolAdminClient(protocol_admin_client).create_protocol("DefiHub");
        vm.stopPrank();
        //=====================POST-CONDITIONS=====================
        //======================CLIENT=============================
        uint256 afterTokenId = IProtocolAdminClient(protocol_admin_client).nextTokenId();
        assertEq(afterTokenId,beforeTokenId + uint256(0x01));
        assertEq(beforeTokenId, _protocolId);
        //================ADMIN-MANAGER====================================
        assertEq(_protocolId, IProtocolAdminManager(_protocolAdminManager).protocolId());
        assertEq(IProtocolAdminPanelConsumer(protocol_admin_client).adminPanel(),IProtocolAdminPanelConsumer(_protocolAdminManager).adminPanel());
    }

    function test__unit__createProtocolsWithDuplicateNamesMustRevert() public{
        //==================PRE-CONDITIONS========================================
        test__unit__createProtocolMustSucceed();
        //======================TEST=============================================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolAdminClient(protocol_admin_client).create_protocol("DefiHub");
        vm.stopPrank();
        //===================POST-CONDITIONS=====================================
    }
}