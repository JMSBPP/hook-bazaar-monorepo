// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {ProtocolFactoryFacet, IProtocolFactory, IProtocolAdminPanelConsumer} from "@hook-bazaar/protocol-pkg/src/ProtocolFactoryFacet.sol";
import {ProtocolAdminRegistry,IProtocolAdminRegistry} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminRegistry.sol";
import {ProxyHelper} from "./helpers/ProxyHelper.sol";
import {ProtocolAdminManager, IComponent} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
import {IERC1155} from "Compose/interfaces/IERC1155.sol";
import {GenericFactory} from "@euler/GenericFactory/GenericFactory.sol";

contract ProtocolFactoryFacetTest is Test{

    address admin = makeAddr("admin");
    address proxy_helper;
    address any_caller = makeAddr("anyCaller");
     
    address protocol_factory_facet;
    address protocol_admin_manager_impl;
    address protocolAdminRegistry;
    address adminManagerDeployer;
    function setUp() public{
        protocolAdminRegistry = address(new ProtocolAdminRegistry());
        protocol_factory_facet = address(new ProtocolFactoryFacet());
        proxy_helper = address(new ProxyHelper(protocol_factory_facet));
        protocol_admin_manager_impl = address(new ProtocolAdminManager());
        
    }

    function test__unit__initializeMustSucceed() public{
        //==========PRE-CONDITIONS==================
        assertEq(protocol_factory_facet, IProtocolFactory(protocol_factory_facet).__self());
        //=============TEST=======================
        vm.startPrank(admin);
        IProtocolFactory(proxy_helper).__initialize("http://localhost:3000/metadata/");
        vm.stopPrank();

        //============POST-CONDITIONS=============
        assertEq(proxy_helper,IProtocolAdminPanelConsumer(proxy_helper).adminPanel());
        assertEq(keccak256(bytes("http://localhost:3000/metadata/")), keccak256(bytes(IProtocolFactory(proxy_helper).baseURI())));

    }

    function test__unit__initializeMustRevertDoubleInitialization() public {
        //=====================PRE-CONDTIONS======================
        test__unit__initializeMustSucceed();
        //=======================TEST=================================
        vm.startPrank(admin);
        vm.expectRevert();
        IProtocolFactory(proxy_helper).__initialize("http://localhost:3000/metadata/");
        vm.stopPrank();

        //======================POST-CONDITIONS======================

    }

    function test__unit__createProtocolMustRevertOnInvalidContext() public {
        //============PRE-CONDITIONS=============
        test__unit__initializeMustSucceed();

        vm.startPrank(admin);
        adminManagerDeployer = address(new GenericFactory(admin));
        GenericFactory(adminManagerDeployer).setImplementation(protocol_admin_manager_impl);
        address adminManager = GenericFactory(adminManagerDeployer).createProxy(protocol_admin_manager_impl,false,abi.encode(msg.sender));

        vm.stopPrank();
        
        //===============TEST====================

        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolFactory(proxy_helper).create_protocol("MyProtocol1", adminManager, uint256(0x01));
        vm.stopPrank();
    

        //=========POST-CONDITIONS===============
    }

    
}