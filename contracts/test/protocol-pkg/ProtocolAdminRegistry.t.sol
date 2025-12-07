// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;


import {Test, console2} from "forge-std/Test.sol";
import {ProtocolAdminRegistry, IProtocolAdminRegistry} from "@hook-bazaar/protocol-pkg/ProtocolAdminRegistry.sol";
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
        // assertTrue(IProtocolAdminRegistry(proxy_helper).isUpgradeAdmin(proxy_helper));
        // assertEq(IProtocolAdminRegistry(proxy_helper).upgradeAdmin(),proxy_helper);
        assertNotEq(address(0x00), IProtocolAdminRegistry(proxy_helper).adminManagerTemplate());

    }

    function test__unit__deployAdminManagerMustSucceed() public{
        //=================PRE-CONDITIONS=========================
        vm.startPrank(proxy_helper);
        IProtocolAdminRegistry(proxy_helper)._initialize();
        vm.stopPrank();


        //====================TEST==============================
        vm.startPrank(any_caller);
        address _admin_manager = IProtocolAdminRegistry(proxy_helper).protocol_manager(uint256(0x01));
        vm.stopPrank();
    
        //====================POST-CONDITIONS====================
        assertEq(_admin_manager, IProtocolAdminRegistry(proxy_helper).protocol_manager(uint256(0x01)));

    }




    
}
