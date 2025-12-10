// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {ProtocolAdminPanel, IProtocolAdminPanel} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminPanel.sol";
import {ProtocolFactoryFacet, IProtocolFactory,IProtocolAdminPanelConsumer} from "@hook-bazaar/protocol-pkg/src/ProtocolFactoryFacet.sol";
import {ProtocolAdminRegistry, IProtocolAdminRegistry} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminRegistry.sol";
import {IProtocolAdminClient} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminClient.sol";
import {IProtocolAdminManager, ProtocolAdminManager} from  "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
import {ERC165Facet} from "Compose/interfaceDetection/ERC165/ERC165Facet.sol";
import {IERC1155} from "Compose/interfaces/IERC1155.sol";
import {DiamondLoupeFacet} from "Compose/diamond/DiamondLoupeFacet.sol";

contract ProtocolAdminPanelTest is Test{


    address protocol_admin_panel;
    address protocol_admin_registry;
    address protocol_factory_facet;
    address _admin_manager;
    address adminManagerImpl;    

    address protocol_deployer = makeAddr("deployer");
    address any_caller = makeAddr("anyCaller");

    address erc165;


    function setUp() public{

        vm.startPrank(any_caller);

        protocol_factory_facet = address(new ProtocolFactoryFacet());
        protocol_admin_registry = address(new ProtocolAdminRegistry());
        adminManagerImpl = address(new ProtocolAdminManager());
        erc165 = address(new ERC165Facet());
        vm.stopPrank();

        vm.startPrank(protocol_deployer);
        protocol_admin_panel = address(new ProtocolAdminPanel());
        vm.stopPrank();


    }

    function test__unit__initializeMustSucceed() public {
        //===============PRE-CONDITIONS=====================
        //====================TEST============================
        vm.startPrank(protocol_deployer);
        IProtocolAdminPanel(protocol_admin_panel).initialize(
            IProtocolAdminClient(address(new ERC165Facet())),
            IProtocolAdminRegistry(protocol_admin_registry),
            IProtocolFactory(protocol_factory_facet),
            "http://localhost:3000/metadata/"
        );            
        vm.stopPrank();
        //================POST-CONDITIONS=====================
        //===================DIAMOND-LOUPE=======================
        assertEq(3,DiamondLoupeFacet(protocol_admin_panel).facetAddresses().length);

    }
 
    function test__unit__initializeMustRevertDoubleInitialization() public{
        //========================PRE-CONDITIONS============================
        test__unit__initializeMustSucceed();
        // Create ERC165Facet before expectRevert so it doesn't consume the revert expectation
        IProtocolAdminClient client = IProtocolAdminClient(address(new ERC165Facet()));
        //=========================TEST=====================================
        vm.startPrank(protocol_deployer);
        vm.expectRevert();
        IProtocolAdminPanel(protocol_admin_panel).initialize(
            client,
            IProtocolAdminRegistry(protocol_admin_registry),
            IProtocolFactory(protocol_factory_facet),
            "http://localhost:3000/metadata/"
        );
        vm.stopPrank();
        //========================POST-CONDITIONS=========================
    }


    function test__unit__deployProtocolAdminManagerMustSucceed() public{
        //===============PRE-CONDITIONS=====================
        test__unit__initializeMustSucceed();
        vm.startPrank(protocol_deployer);
        IProtocolFactory(protocol_admin_panel).__initialize("localhost");
        IProtocolAdminRegistry(protocol_admin_panel)._initialize();
        vm.stopPrank();
        //====================TEST============================

        vm.startPrank(any_caller);
        _admin_manager = IProtocolAdminRegistry(protocol_admin_panel).setProtocolManager(uint256(0x01), any_caller);
        vm.stopPrank();

        //================POST-CONDITIONS=====================
        assertEq(_admin_manager, IProtocolAdminRegistry(protocol_admin_panel).getProtocolManager(uint256(0x01)));
        assertEq(protocol_admin_panel, IProtocolAdminPanelConsumer(_admin_manager).adminPanel());
        assertTrue(IProtocolAdminManager(_admin_manager).isCreator(any_caller));
        assertTrue(IProtocolAdminManager(_admin_manager).isPoolCreator(any_caller));

    }

    function test__unit__createProtocolMustSucceed() public {
        //=================PRE-CONDITIONS=======================
        test__unit__initializeMustSucceed();
        vm.startPrank(protocol_deployer);
 
        IProtocolFactory(protocol_admin_panel).__initialize("localhost");
        IProtocolAdminRegistry(protocol_admin_panel)._initialize();

        vm.stopPrank();

        vm.startPrank(any_caller);
        _admin_manager = IProtocolAdminRegistry(protocol_admin_panel).setProtocolManager(uint256(0x01), any_caller);
        vm.stopPrank();

        uint256[] memory beforeProtocols = IProtocolFactory(protocol_admin_panel).getProtocols(any_caller);
        
        //=====================TEST=============================
        vm.startPrank(any_caller);
        IProtocolFactory(protocol_admin_panel).create_protocol("DeFiHub",_admin_manager,uint256(0x01));
        vm.stopPrank();
       //=================POST-CONDITIONS======================
        //===================================ADMIN-MANAGER============================================
        assertEq(uint256(0x01),IERC1155(protocol_admin_panel).balanceOf(_admin_manager, uint256(0x01)));
        assertEq(uint256(0x01), IProtocolAdminManager(_admin_manager).protocolId());
        assertEq(keccak256(bytes("DeFiHub")),keccak256(bytes(IProtocolAdminManager(_admin_manager).protocolName())));

        //==================================FACTORY==================================================
        uint256[] memory afterProtocols = IProtocolFactory(protocol_admin_panel).getProtocols(any_caller);
        assertEq(afterProtocols.length, beforeProtocols.length + uint256(0x01));
        assertEq(uint256(0x01),afterProtocols[beforeProtocols.length]);
        assertGt(uint256(keccak256(bytes(IERC1155(protocol_admin_panel).uri(uint256(0x01))))),uint256(0x00));
        

    }

    function test__unit__createProtocolWithExistingNameMustRevert() public {
        //=========================PRE-CONDITIONS=================================
        test__unit__createProtocolMustSucceed();
        //============================TEST=====================================

        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolFactory(protocol_admin_panel).create_protocol("DeFiHub",_admin_manager,uint256(0x01));
        vm.stopPrank();
        
      //========================POST-CONDITIONS================================
    }



}