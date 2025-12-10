// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {ERC20Facet} from "Compose/token/ERC20/ERC20/ERC20Facet.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {ProtocolAdminManager, IProtocolAdminManager, Authority, URI_TYPE} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
import {IComponent} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
import {GenericFactory} from "@euler/GenericFactory/GenericFactory.sol";
import {PoolId, PoolIdLibrary, PoolKey} from "@uniswap/v4-core/src/types/PoolId.sol";
import {IProtocolAdminPanelConsumer} from "@hook-bazaar/protocol-pkg/src/ProtocolFactoryFacet.sol";


contract ProtocolAdminManagerTest is Test{
    address protocol_admin = makeAddr("admin");
    address protocol_admin_manager_impl;

    address any_caller = makeAddr("anyCaller");
    address any_caller2 = makeAddr("anyCaller2");

    address anyAddress = makeAddr("anyAddress");
    address mockAdminPanel = makeAddr("mockAdminPanel");
    address adminManagerFactory;
    address adminManager;

    function setUp() public{
        protocol_admin_manager_impl = address(new ProtocolAdminManager());
        vm.prank(protocol_admin);
        adminManagerFactory = address(new GenericFactory(protocol_admin));
    }


    function test__unit__ImplInitializeMustSucceed() public{
        //============PRE-CONDITIONS==================
        

        //===============TEST=========================
        vm.startPrank(protocol_admin);
        IComponent(protocol_admin_manager_impl).initialize(anyAddress);
        vm.stopPrank();
        
        //============POST-CONDITIONS==============
        assertEq(anyAddress, IProtocolAdminPanelConsumer(protocol_admin_manager_impl).adminPanel());

    }

    function test__unit__ImplInitializeDoubleMustRevert() public {
        //===============PRE-CONDITIONS=====================
        test__unit__ImplInitializeMustSucceed();
        //=================TEST===============================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IComponent(protocol_admin_manager_impl).initialize(any_caller);
        vm.stopPrank();

        //=================POST-CONDITIONS=======================
    }
    
    function test__unit__CloneInitializationMustSucceed() public {
        //================PRE-CONDITIONS====================
        vm.prank(protocol_admin);
        GenericFactory(adminManagerFactory).setImplementation(protocol_admin_manager_impl);

        //===================TEST==========================
        vm.prank(any_caller);
        // Pass both protocolCreator and adminPanel as metadata
        adminManager = GenericFactory(adminManagerFactory).createProxy(protocol_admin_manager_impl, false, abi.encodePacked(any_caller, mockAdminPanel));

        //=================POST-CONDITIONS=================
        assertEq(IProtocolAdminPanelConsumer(adminManager).adminPanel(), mockAdminPanel);
        assertTrue(IProtocolAdminManager(adminManager).isCreator(any_caller));
        assertTrue(IProtocolAdminManager(adminManager).isPoolCreator(any_caller));
    }

    function test__unit__CloneSetURIProtocolCreatorMustSucceed() public {
        //====================PRE-CONDITIONS===========================
        test__unit__CloneInitializationMustSucceed();

        //=====================TEST================================
        vm.prank(any_caller);
        IProtocolAdminManager(adminManager).setURI(URI_TYPE.WEBSITE, "myProtocol.com");
        //====================POST-CONDITIONS========================
        assertEq(keccak256(bytes("myProtocol.com")), keccak256(bytes(IProtocolAdminManager(adminManager).getURI(URI_TYPE.WEBSITE))));        
    }

    function test__unit__CloneSetURINotProtocolCreatorMustFail() public {
        //====================PRE-CONDITIONS===========================
        test__unit__CloneInitializationMustSucceed();

        //=====================TEST================================
        vm.prank(any_caller2);
        vm.expectRevert();
        IProtocolAdminManager(adminManager).setURI(URI_TYPE.WEBSITE, "myProtocol.com");

        //====================POST-CONDITIONS========================
    }

    function test__unit__CloneInitializationDoubleMustReveert() public {
        //======================PRE-CONDITIONS============================
        test__unit__CloneInitializationMustSucceed();
        //=======================TEST=====================================
        vm.prank(any_caller);
        vm.expectRevert();
        IComponent(adminManager).initialize(address(0x12));

        //=======================POST-CONDITIONS==========================
    }



    function test__unit__delegatePoolCreatorRoleMustSucceed() public {
        //=================PRE-CONDITIONS==========================
        test__unit__CloneInitializationMustSucceed();
        //==================TEST===================================
        vm.startPrank(any_caller);

        IProtocolAdminManager(adminManager).delegatePoolCreatorRole(any_caller2);
        vm.stopPrank();
        //=================POST-CONDITIONS=========================
        assertTrue(IProtocolAdminManager(adminManager).isPoolCreator(any_caller));
        assertTrue(IProtocolAdminManager(adminManager).isPoolCreator(any_caller2));

    }

    function test__unit__setPoolsOnInvalidContextMustRevert() public {
        //===================PRE-CONDITIONS ===========================
        test__unit__delegatePoolCreatorRoleMustSucceed();

        // Create PoolId before expectRevert
        PoolId poolId = PoolIdLibrary.toId(
            PoolKey(
                Currency.wrap(address(new ERC20Facet())),
                Currency.wrap(address(new ERC20Facet())),
                uint24(0x00),
                int24(60),
                IHooks(address(0x00))
            )
        );
        //======================TEST===================================
        vm.prank(any_caller2);
        vm.expectRevert();
        IProtocolAdminManager(adminManager).setPool(poolId);
        //====================POST-CONDITIONS=========================
    }

    function test__unit__ImplMakeCallsBeforeInitializingMustFail() public {
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
        test__unit__CloneInitializationMustSucceed();
        

        //======================TEST==============================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolAdminManager(protocol_admin_manager_impl).delegatePoolCreatorRole(any_caller2);
        vm.stopPrank();
        //=====================POST-CONDITIONS=========================
    }






}

