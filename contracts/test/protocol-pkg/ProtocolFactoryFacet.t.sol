// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {ProtocolFactoryFacet, IProtocolFactory} from "@hook-bazaar/protocol-pkg/src/ProtocolFactoryFacet.sol";
import {ProxyHelper} from "./helpers/ProxyHelper.sol";
import {ProtocolAdminManager, IComponent} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
import {IERC1155} from "Compose/interfaces/IERC1155.sol";

contract ProtocolFactoryFacetTest is Test{

    address admin = makeAddr("admin");
    address proxy_helper;
    address any_caller = makeAddr("anyCaller");

    address protocol_factory_facet;
    address protocol_admin_manager_impl;
    function setUp() public{
    
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
        assertEq(IProtocolFactory(proxy_helper).adminPanel(), proxy_helper);
        assertEq(keccak256(bytes("http://localhost:3000/metadata/")), keccak256(bytes(IProtocolFactory(proxy_helper).baseURI())));

    }

    function test__unit__createProtocolMustSucceed() public {
        //============PRE-CONDITIONS=============
        test__unit__initializeMustSucceed();
        // 
        vm.startPrank(proxy_helper);
        IComponent(protocol_admin_manager_impl).initialize(any_caller);
        vm.stopPrank();
        uint256 beforeProtocolsBalance = IERC1155(proxy_helper).balanceOf(protocol_admin_manager_impl, uint256(0x01));

        //===============TEST====================

        vm.startPrank(any_caller);
        IProtocolFactory(proxy_helper).create_protocol("DeFi Hub",protocol_admin_manager_impl,uint256(0x01));
        vm.stopPrank();


        //=========POST-CONDITIONS===============
        uint256 afterProtocolBalance = IERC1155(proxy_helper).balanceOf(protocol_admin_manager_impl, uint256(0x01));
        assertEq(afterProtocolBalance, uint256(0x01) +beforeProtocolsBalance); 
    //     assertEq(uint256(0x01),IERC1155(proxy_helper).balanceOf(protocol_admin_manager_impl, uint256(0x01)));
    // //     assertEq(keccak256(bytes("DeFi Hub")),keccak256(bytes(IERC1155(proxy_helper).uri(uint256(0x01)))));
    }

    
}