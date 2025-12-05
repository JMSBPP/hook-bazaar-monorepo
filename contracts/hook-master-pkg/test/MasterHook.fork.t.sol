// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console2} from "forge-std/Test.sol";
import {Script} from "forge-std/Script.sol";
import {EthereumMainnet} from "./utils/ForkUtils.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";

import "../src/MasterHook.sol";
import "../src/AllHook.sol";

import "@uniswap/v4-core/src/types/Currency.sol";
import "@uniswap/v4-core/src/types/PoolId.sol";
import {PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import "@uniswap/v4-periphery/test/shared/LiquidityOperations.sol";

import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";

import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import "@uniswap/v4-periphery/src/utils/HookMiner.sol";

import {MockCounterHook} from "@uniswap/v4-periphery/test/mocks/MockCounterHook.sol";
import {MockCounterHook2} from "../src/mocks/MockCounterHook2.sol";


import {IERC20} from "forge-std/interfaces/IERC20.sol";

interface IMockCounterHook{
    function beforeSwapCount(PoolId) external view returns(uint256);
    function afterSwapCount(PoolId) external view returns(uint256);

    function beforeAddLiquidityCount(PoolId) external view returns(uint256);
    function beforeRemoveLiquidityCount(PoolId) external view returns(uint256);
}

uint256 constant DEFAULT_DEADLINE = uint256(type(uint48).max);
    
contract SwapHelper{
    uint128 constant DEFAULT_SWAP_ZERO_ONE_AMOUNT_IN = uint128(1e18);
    uint128 constant DEFAULT_AMOUNT_OUT_MINIMUM = uint128(0x00);

    function swapDefaultParams(PoolKey memory poolKey) internal pure returns(bytes memory, bytes[] memory){
        bytes memory commands = abi.encodePacked(bytes1(uint8(Commands.V4_SWAP)));
        bytes[] memory inputs = new bytes[](1);
        
        // V4_SWAP expects: abi.encode(bytes actions, bytes[] params)
        // where actions is the action bytes and params is array of encoded parameters
        bytes memory actions = abi.encodePacked(bytes1(uint8(Actions.SWAP_EXACT_IN_SINGLE)));
        bytes[] memory params = new bytes[](1);
        params[0] = abi.encode(IV4Router.ExactInputSingleParams(poolKey, true, DEFAULT_SWAP_ZERO_ONE_AMOUNT_IN, DEFAULT_AMOUNT_OUT_MINIMUM, Constants.ZERO_BYTES));
        inputs[0] = abi.encode(actions, params);
        
        return (commands, inputs);
    }
}

contract LiquidityHelper is LiquidityOperations{
    uint256 constant DEFAULT_ADD_LIQUIDITY_DELTA = uint256(1e05);
    int24 constant DEFAULT_LOWER_TICK = int24(-120);
    int24 constant DEFAULT_UPPER_TICK = int24(120);
    
    function mintDefaultLiquidity(address receiver, PoolKey memory poolKey, IPoolManager _poolManager) internal{
        PositionConfig memory config = PositionConfig(poolKey, DEFAULT_LOWER_TICK, DEFAULT_UPPER_TICK);
        bytes memory calls = getMintEncoded(config, DEFAULT_ADD_LIQUIDITY_DELTA, receiver, Constants.ZERO_BYTES);
        
        // If currency0 is native (ETH), calculate and send ETH amount
        if (Currency.unwrap(poolKey.currency0) == address(0)) {
            // Get current sqrt price from pool
            (uint160 sqrtPriceX96,,,) = StateLibrary.getSlot0(_poolManager, PoolIdLibrary.toId(poolKey));
            
            // Calculate ETH amount needed
            (uint256 amount0,) = LiquidityAmounts.getAmountsForLiquidity(
                sqrtPriceX96,
                TickMath.getSqrtPriceAtTick(config.tickLower),
                TickMath.getSqrtPriceAtTick(config.tickUpper),
                uint128(DEFAULT_ADD_LIQUIDITY_DELTA)
            );
            
            // Send ETH with the transaction (add extra wei for rounding)
            lpm.modifyLiquidities{value: amount0 + 1}(calls, DEFAULT_DEADLINE);
        } else {
            lpm.modifyLiquidities(calls, DEFAULT_DEADLINE);
        }
    }
}

contract MasterHookForkTest is Test, SwapHelper, LiquidityHelper{
    bool forked;

    PoolKey poolKey;

    address master_hook;
    address all_hook_impl;
    address mockCounterHook;
    address mockCounterHook2;

    IPoolManager poolManager;
    IUniversalRouter swapRouter;
    
    uint256 eth_mainnet_fork;
    uint160 hookPermissionCount = 14;
    uint160 clearAllHookPermissionsMask = ~uint160(0) << hookPermissionCount;


    address protocol_admin = makeAddr("protocol_admin");
    address any_caller = makeAddr("anyCaller");

    function setUp() public {
            console2.log("Forked Ethereum mainnet");
        try vm.envString("ALCHEMY_API_KEY") returns (string memory){
            eth_mainnet_fork = vm.createSelectFork("mainnet");

            poolManager = IPoolManager(EthereumMainnet.POOL_MANAGER);
            lpm = IPositionManager(EthereumMainnet.POSITION_MANAGER);
            swapRouter = IUniversalRouter(EthereumMainnet.UNIVERSAL_ROUTER);

            master_hook = address(MasterHook(payable(address(uint160((type(uint160).max & clearAllHookPermissionsMask) | Hooks.ALL_HOOK_MASK)))));
            all_hook_impl = address(AllHook(payable(address(uint160(((type(uint160).max & clearAllHookPermissionsMask) | Hooks.ALL_HOOK_MASK) & (type(uint160).max - 2 ** 156))))));
            
            // MockCounterHook needs: beforeAddLiquidity, beforeRemoveLiquidity, beforeSwap, afterSwap
            uint160 mockCounterHookFlags = Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG;
            mockCounterHook = address(MockCounterHook(payable(address(uint160(((type(uint160).max & clearAllHookPermissionsMask) | mockCounterHookFlags) & (type(uint160).max - 2 ** 157))))));
            mockCounterHook2 = address(MockCounterHook2(payable(address(uint160(((type(uint160).max & clearAllHookPermissionsMask) | mockCounterHookFlags) & (type(uint160).max - 2 ** 156))))));
            deployCodeTo("MasterHook.sol:MasterHook", abi.encode("0x00"), master_hook);
            deployCodeTo("AllHook.sol:AllHook", abi.encode(address(poolManager)), all_hook_impl);
            deployCodeTo("lib/v4-periphery/test/mocks/MockCounterHook.sol:MockCounterHook", abi.encode(address(poolManager)), mockCounterHook);
            deployCodeTo("mocks/MockCounterHook2.sol:MockCounterHook2", abi.encode(address(poolManager)), mockCounterHook2);
            poolKey = PoolKey(Currency.wrap(EthereumMainnet.ETH),Currency.wrap(EthereumMainnet.USDC), uint24(0x00), int24(0x3c), IHooks(master_hook));
            vm.deal(protocol_admin, 100 ether);
            bytes memory commands = abi.encodePacked(bytes1(uint8(Commands.SWEEP)));
            forked = true;

            /// swap set up
            vm.deal(any_caller, 10_000_000 ether);
            deal(EthereumMainnet.USDC, any_caller, 10_000_000 ether);
            
            vm.startPrank(any_caller);
            IERC20(EthereumMainnet.USDC).approve(address(swapRouter),type(uint256).max - uint256(0x01));
            IERC20(EthereumMainnet.USDC).approve(address(address(lpm)),type(uint256).max - uint256(0x01));
            vm.stopPrank();


        } catch {
            console2.log(
                "Skipping forked tests, no alchemy key found. Add ALCHEMY_API_KEY env var to .env to run forked tests."
            );
            forked = false;

        }
 
    }

    function test__fork__initializeMasterHookMustSucceed() public{
        vm.startPrank(protocol_admin);
        //================PRE-CONDITIONS====================
        vm.expectRevert();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);
        vm.stopPrank();

        //====================TEST=============================
        vm.startPrank(protocol_admin);
        IMasterHook(master_hook).initialize(address(poolManager), all_hook_impl);
        vm.stopPrank();
    
    
        //===============POST-CONDITIONS===================
    }

    function test__fork__initializePoolWithMasterHookMustSucceed() public {
        //====================PRE-CONDITIONS===========================
        test__fork__initializeMasterHookMustSucceed();

        vm.startPrank(protocol_admin);
        //======================TEST===================================
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);
        vm.stopPrank();



        //====================POST-CONDITIONS=========================
    }

    function test__fork__addHookMustSucceed() public {
        //================PRE-CONDITIONS=======================
        test__fork__initializePoolWithMasterHookMustSucceed();
        //====================TEST===========================
        bytes4[] memory mockCounterSelectors = new bytes4[](2);
        mockCounterSelectors[0] = IMockCounterHook.beforeSwapCount.selector;
        mockCounterSelectors[1] = IMockCounterHook.afterSwapCount.selector;

        vm.startPrank(protocol_admin);

        IMasterHook(master_hook).addHook(mockCounterHook,mockCounterSelectors);
        vm.stopPrank();
        //===============POST-CONDITIONS==================
        uint256 beforeSwapCountBeforeSwap = MockCounterHook(master_hook).beforeSwapCount(PoolIdLibrary.toId(poolKey));
        uint256 afterSwapCountBeforeSwap = MockCounterHook(master_hook).afterSwapCount(PoolIdLibrary.toId(poolKey));
        
        (bytes memory commands, bytes[] memory inputs) = swapDefaultParams(poolKey);
        vm.startPrank(any_caller);
            
        IUniversalRouter(address(swapRouter)).execute(commands,inputs, DEFAULT_DEADLINE);
        vm.stopPrank();

        uint256 beforeSwapCountAfterSwap = MockCounterHook(master_hook).beforeSwapCount(PoolIdLibrary.toId(poolKey));
        uint256 afterSwapCountAfterSwap = MockCounterHook(master_hook).afterSwapCount(PoolIdLibrary.toId(poolKey));
        assertEq(beforeSwapCountBeforeSwap + uint256(0x01), beforeSwapCountAfterSwap);
        assertEq(afterSwapCountBeforeSwap + uint256(0x01),afterSwapCountAfterSwap);        

    }

    function test__fork__replaceHookWithConflictingSelectorsMustSucceed() public {
        //=============PRE-CONDITIONS=======================
        test__fork__addHookMustSucceed();
        //================TEST==============================

        //===============POST-CONDITIONS====================
    }

    function test__fork__replaceHookWithNonConflictingSelectorsMustSucceed() public {
        //===================PRE-CONDITIONS===========================
        test__fork__addHookMustSucceed();
        //======================TEST==================================
        bytes4[] memory mockCounterSelectors2 = new bytes4[](1);
        mockCounterSelectors2[0] = IMockCounterHook.beforeAddLiquidityCount.selector;
        vm.startPrank(protocol_admin);

        IMasterHook(master_hook).addHook(mockCounterHook2,mockCounterSelectors2);
        vm.stopPrank();

        //=====================POST-CONDITIONS========================
        uint256 beforeAddLiquidityCountBeforeAddLiquidity = MockCounterHook(master_hook).beforeAddLiquidityCount(PoolIdLibrary.toId(poolKey));
        
        vm.startPrank(any_caller);
        mintDefaultLiquidity(any_caller, poolKey, poolManager);
        vm.stopPrank();

        uint256 beforeAddLiquidityCountAfterAddLiquidity = MockCounterHook(master_hook).beforeAddLiquidityCount(PoolIdLibrary.toId(poolKey));
        assertEq(beforeAddLiquidityCountAfterAddLiquidity, beforeAddLiquidityCountBeforeAddLiquidity + uint256(0x01));


    }





}