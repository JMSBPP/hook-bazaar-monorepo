// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import {Test, console2} from "forge-std/Test.sol";
// import "@uniswap/v4-periphery/test/shared/PosmTestSetup.sol";
// import {IMasterHook} from "../src/interfaces/IMasterHook.sol";
// import  "@uniswap/v4-periphery/src/utils/HookMiner.sol";
// import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
// import {AllHook} from "../src/AllHook.sol";
// import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";
// import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
// import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
// import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol"; 
// import  "../script/DeployMasterHook.s.sol";

// contract MasterHookTest is Test,PosmTestSetup{
//     address master_hook;
    
//     address protocol_admin = makeAddr("protocolAdmin");
//     address any_caller = makeAddr("anyCaller");
//     AllHook all_hook;
//     PoolKey poolKey;
//     uint160 initSqrtPriceX96;

//     function setUp() public{
//         deployFreshManagerAndRouters();
//         deployMintAndApprove2Currencies();
//         deployAndApprovePosm(manager); 
//         all_hook = AllHook(
//             address(uint160(type(uint160).max & clearAllHookPermissionsMask | Hooks.ALL_HOOK_MASK))
//         );
//         deployCodeTo("AllHook", abi.encode(manager), address(all_hook));
        
//         vm.startPrank(protocol_admin);

//         (address _expectedMasterHook, bytes32 _salt) = HookMiner.find(protocol_admin, Hooks.ALL_HOOK_MASK, MASTER_HOOK_BYTECODE, abi.encode(manager));
        
//         assembly{
//             master_hook := create2(0x00, add(MASTER_HOOK_BYTECODE, 0x20), mload(MASTER_HOOK_BYTECODE), _salt)
//         }


//         vm.stopPrank();
//         initSqrtPriceX96 = uint160(TickMath.getSqrtPriceAtTick(0));
//         initPoolAndAddLiquidity(currency0, currency1, IHooks(master_hook), Constants.FEE_LOW, initSqrtPriceX96);

//         deal(Currency.unwrap(currency0), any_caller, uint256(type(uint112).max));
//         deal(Currency.unwrap(currency1), any_caller, uint256(type(uint112).max));
//         vm.deal(any_caller, 1 ether);
//         vm.deal(protocol_admin, 1 ether);

//     }

//     function test__unit__initializeMustSucceed() public {
//         //==========PRE-CONDITIONS==================
//         // PoolSwapTest.TestSettings memory testSettings =
//         //     PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false});
//         // vm.startPrank(any_caller);
//         // vm.expectRevert();

//         // swapRouter.swap(
//         //     poolKey,
//         //     SwapParams(true,-int256(1e18),TickMath.MIN_SQRT_PRICE + 1),
//         //     PoolSwapTest.TestSettings(false, false),
//         //     Constants.ZERO_BYTES
//         // );
//         // vm.stopPrank();        

//         //==============TEST========================
        
//         // vm.startPrank(protocol_admin);
        
//         // IMasterHook(master_hook).initialize(address(manager), address(all_hook));
//         // vm.stopPrank();

//         //==========POST-CONDTIONS==================
//     }

// }