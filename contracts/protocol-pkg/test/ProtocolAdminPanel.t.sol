// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import "../src/ProtocolAdminPanel.sol";
import "../src/ProtocolFactoryFacet.sol";
import {ERC165Facet} from "Compose/interfaceDetection/ERC165/ERC165Facet.sol";

contract ProtocolAdminPanelTest is Test{


    address protocol_admin_panel;
    address protocol_admin_registry;
    address protocol_factory_facet;



    address protocol_deployer = makeAddr("deployer");
    address any_caller = makeAddr("anyCaller");



    function setUp() public{

        vm.startPrank(any_caller);

        protocol_factory_facet = address(new ProtocolFactoryFacet());
        protocol_admin_registry = address(new ProtocolAdminRegistry());

        vm.stopPrank();

    }

    function test__unit__initializeMustSucceed() public {
        //===============PRE-CONDITIONS=====================
        vm.startPrank(protocol_deployer);
        protocol_admin_panel = address(new ProtocolAdminPanel());

        vm.stopPrank();

        //====================TEST============================
        vm.startPrank(protocol_deployer);
        IProtocolAdminPanel(protocol_admin_panel).initialize(address(new ERC165Facet()),protocol_admin_registry, protocol_factory_facet, "http://localhost:3000/metadata/");            
        vm.stopPrank();
        //================POST-CONDITIONS=====================
        //============================FACTORY=====================================================
        assertEq(IProtocolFactory(protocol_admin_panel).adminPanel(), protocol_admin_panel);
        assertEq(IProtocolFactory(protocol_factory_facet).adminPanel(), address(0x00));
        assertEq(keccak256(bytes("http://localhost:3000/metadata/")), keccak256(bytes(IProtocolFactory(protocol_admin_panel).baseURI())));
        //=========================ADMIN-REGISTRY================================================================
        assertTrue(IProtocolAdminRegistry(protocol_admin_panel).isUpgradeAdmin(protocol_admin_panel));
        assertEq(IProtocolAdminRegistry(protocol_admin_panel).upgradeAdmin(),protocol_admin_panel);
        assertNotEq(address(0x00), IProtocolAdminRegistry(protocol_admin_panel).protocol_admin_template());

    }

    function test__unit__deployProtocolAdminManagerMustSucceed() public{
        //===============PRE-CONDITIONS=====================
        vm.startPrank(protocol_deployer);

        protocol_admin_panel = address(new ProtocolAdminPanel());

        vm.stopPrank();
        vm.startPrank(protocol_deployer);

        IProtocolAdminPanel(protocol_admin_panel).initialize(address(0x01),protocol_admin_registry, protocol_factory_facet, "http://localhost:3000/metadata/");            

        vm.stopPrank();
        //====================TEST============================

        vm.startPrank(any_caller);
        address _admin_manager = IProtocolAdminRegistry(protocol_admin_panel).protocol_manager(uint256(0x01));
        vm.stopPrank();

        //================POST-CONDITIONS=====================
        assertEq(_admin_manager, IProtocolAdminRegistry(protocol_admin_panel).protocol_manager(uint256(0x01)));
    }

    function test__unit__createProtocolMustSucceed() public {
        //=================PRE-CONDITIONS=======================
        vm.startPrank(protocol_deployer);

        protocol_admin_panel = address(new ProtocolAdminPanel());

        vm.stopPrank();
        vm.startPrank(protocol_deployer);

        IProtocolAdminPanel(protocol_admin_panel).initialize(address(0x012),protocol_admin_registry, protocol_factory_facet, "http://localhost:3000/metadata/");            

        vm.stopPrank();

        vm.startPrank(any_caller);

        address _admin_manager = IProtocolAdminRegistry(protocol_admin_panel).protocol_manager(uint256(0x01));

        vm.stopPrank();



        //=====================TEST=============================
        vm.startPrank(protocol_admin_panel);
        IProtocolFactory(protocol_admin_panel).create_protocol("DeFiHub",_admin_manager,uint256(0x01));
        vm.stopPrank();

        
        //=================POST-CONDITIONS======================

        assertEq(uint256(0x01),IERC1155(protocol_admin_panel).balanceOf(_admin_manager, uint256(0x01)));
        assertEq(keccak256(bytes("DeFiHub")),keccak256(bytes(IERC1155(protocol_admin_panel).uri(uint256(0x01)))));
    }



}