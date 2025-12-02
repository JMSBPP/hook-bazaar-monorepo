// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import {MasterHook} from "../src/MasterHook.sol";
import {MasterHook0_8_26} from "./helpers/MasterHook0_8_26.sol";
import {Test, console2} from "forge-std/Test.sol";
import "@uniswap/v4-periphery/test/shared/PosmTestSetup.sol";
import {IMasterHook} from "../src/interfaces/IMasterHook.sol";
import  "@uniswap/v4-periphery/src/utils/HookMiner.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {AllHook} from "../src/AllHook.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
// import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
// import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol"; 
// import  "../script/DeployMasterHook.s.sol";

contract MasterHookTest is Test, PosmTestSetup{
    MasterHook0_8_26 master_hook;
    
    address protocol_admin = makeAddr("protocolAdmin");
    address any_caller = makeAddr("anyCaller");
    AllHook all_hook;
    PoolKey poolKey;
    uint160 initSqrtPriceX96;

    function setUp() public{
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();
        deployAndApprovePosm(manager); 

        all_hook = AllHook(
            address(uint160(type(uint160).max & clearAllHookPermissionsMask | Hooks.ALL_HOOK_MASK))
        );
        deployCodeTo("AllHook", abi.encode(manager), address(all_hook));
        
        vm.startPrank(protocol_admin);

        master_hook = MasterHook0_8_26(
            address(uint160(type(uint160).max & clearAllHookPermissionsMask | Hooks.ALL_HOOK_MASK))
        );

        deployCodeTo("MasterHook0_8_26", abi.encode("0x00"), address(master_hook));
        initSqrtPriceX96 = uint160(TickMath.getSqrtPriceAtTick(0));
        poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: Constants.FEE_LOW,
            tickSpacing: 60,
            hooks: IHooks(address(master_hook))
        });
 
        // IMasterHook(master_hook).initialize(address(manager), address(all_hook));
        // vm.startPrank(any_caller);
        // master_hook.initialize(address(manager), address(all_hook));
        // vm.stopPrank();

        
        }


        vm.stopPrank();

        deal(Currency.unwrap(currency0), any_caller, uint256(type(uint112).max));
        deal(Currency.unwrap(currency1), any_caller, uint256(type(uint112).max));
        vm.deal(any_caller, 1 ether);
        vm.deal(protocol_admin, 1 ether);

//     }

    function test__unit__initializeMustSucceed() public {
//         //==========PRE-CONDITIONS==================
//         vm.startPrank(protocol_admin);
//         vm.expectRevert(BaseHook.HookNotImplemented.selector);
//         manager.initialize(poolKey, initSqrtPriceX96);
//         vm.stopPrank();


// //         //==============TEST========================
        
//         vm.startPrank(protocol_admin);
        
//         IMasterHook(master_hook).initialize(address(manager), address(all_hook));
//         vm.stopPrank();

//         //==========POST-CONDTIONS==================
    }

}