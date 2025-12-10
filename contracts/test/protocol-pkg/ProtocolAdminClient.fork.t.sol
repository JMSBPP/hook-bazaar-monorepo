// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@hook-bazaar/master-hook-pkg/test/MasterHook.fork.t.sol";
import "@hook-bazaar/protocol-pkg/src/ProtocolAdminClient.sol";
import "@hook-bazaar/protocol-hook-pkg/src/ProtocolHookMediator.sol";
import {ProtocolAdminRegistry} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminRegistry.sol";
import {ProtocolFactoryFacet} from "@hook-bazaar/protocol-pkg/src/ProtocolFactoryFacet.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";

contract ProtocolAdminClientForkTest is Test, SwapHelper, LiquidityHelper{
    bool forked;
    uint256 eth_mainnet_fork;

    uint160 hookPermissionCount = 14;
    uint160 clearAllHookPermissionsMask = ~uint160(0) << hookPermissionCount;


    PoolKey poolKey;
    address masterHook;
    address allHook;

    address protocolAdminClient;
    address protocolHookMediator;
    
    address protocolAdminRegistry;
    address protocolFactory;
    address adminPanel;


    IPoolManager poolManager;
    IUniversalRouter swapRouter;


    address protocol_admin = makeAddr("protocol_admin");
    address any_caller = makeAddr("anyCaller");
    address any_caller2 = makeAddr("anyCaller2");





    function setUp() public{
        console2.log("Forked Ethereum mainnet");
        try vm.envString("ALCHEMY_API_KEY") returns (string memory){
            eth_mainnet_fork = vm.createSelectFork("mainnet");

            poolManager = IPoolManager(EthereumMainnet.POOL_MANAGER);
            lpm = IPositionManager(EthereumMainnet.POSITION_MANAGER);
            swapRouter = IUniversalRouter(EthereumMainnet.UNIVERSAL_ROUTER);

            protocolAdminClient = address(new ProtocolAdminClient());
            protocolAdminRegistry = address(new ProtocolAdminRegistry());
            protocolFactory = address(new ProtocolFactoryFacet());


            masterHook = address(IMasterHook(MasterHook(payable(address(uint160((type(uint160).max & clearAllHookPermissionsMask) | Hooks.ALL_HOOK_MASK))))));
            allHook = address(AllHook(payable(address(uint160(((type(uint160).max & clearAllHookPermissionsMask) | Hooks.ALL_HOOK_MASK) & (type(uint160).max - 2 ** 156))))));

            deployCodeTo("MasterHook.sol:MasterHook", abi.encode("0x00"), masterHook);
            deployCodeTo("AllHook.sol:AllHook", abi.encode(address(poolManager)), allHook);

            protocolHookMediator = address(new ProtocolHookMediator());

            poolKey = PoolKey(Currency.wrap(EthereumMainnet.ETH),Currency.wrap(EthereumMainnet.USDC), uint24(0x00), int24(0x3c), IHooks(masterHook));


            forked = true;

        } catch {
            console2.log(
                "Skipping forked tests, no alchemy key found. Add ALCHEMY_API_KEY env var to .env to run forked tests."
            );
            forked = false;

        }

    }

    function test__fork__callingFunctionsBeforeInitializeMustRevert() public {
        //======================PRE-CONDITIONS=====================================

        //========================TEST============================================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolAdminClient(protocolAdminClient).create_pool(1,abi.encode(poolKey), Constants.SQRT_PRICE_1_1);

        vm.stopPrank();

        //=====================POST-CONDITIONS====================================
    }

    function test__fork__setProtocolHookMediatorMustSucceed() public {
        //======================PRE-CONDITIONS===========================
        vm.startPrank(protocol_admin);
        IProtocolAdminClient(protocolAdminClient).initialize(IProtocolAdminRegistry(protocolAdminRegistry),IProtocolFactory(protocolFactory), "localhost");
        vm.stopPrank();

        //========================TEST==================================
        vm.prank(protocol_admin);
        IProtocolAdminClient(protocolAdminClient).setProtocolHookMediator(IProtocolHookMediator(protocolHookMediator));


        //======================POST-CONDITIONS=======================
        assertEq(protocolHookMediator, address(IProtocolAdminClient(protocolAdminClient).protocolHookMediator()));

    }

    function test__fork__NotOwnerSetProtocolHookMediatorMustRevert() public {
        //======================PRE-CONDITIONS===========================
        vm.startPrank(protocol_admin);
        IProtocolAdminClient(protocolAdminClient).initialize(IProtocolAdminRegistry(protocolAdminRegistry),IProtocolFactory(protocolFactory), "localhost");
        vm.stopPrank();
        //========================TEST==================================
        vm.prank(any_caller);
        vm.expectRevert();
        IProtocolAdminClient(protocolAdminClient).setProtocolHookMediator(IProtocolHookMediator(protocolHookMediator));


        //======================POST-CONDITIONS=======================
    }

    function test__fork__createPoolWitNoProtocolAttachedMustRevert() public{
        //=======================PRE-CONDITIONS============================
        vm.startPrank(protocol_admin);
        IProtocolAdminClient(protocolAdminClient).initialize(IProtocolAdminRegistry(protocolAdminRegistry),IProtocolFactory(protocolFactory), "localhost");
        adminPanel = IProtocolAdminPanelConsumer(protocolAdminClient).adminPanel();
      
        vm.stopPrank();


        //==========================TEST===================================
        vm.startPrank(any_caller);
        vm.expectRevert();
        IProtocolAdminClient(protocolAdminClient).create_pool(1,abi.encode(poolKey), Constants.SQRT_PRICE_1_1);
        vm.stopPrank();
        //========================POST-CONDITIONS===========================
    }

    function test__fork__createPoolWithUnauthorizedPermsMustRevert() public {
        //====================PRE-CONDITIONS====================================
        vm.prank(protocol_admin);
        IProtocolAdminClient(protocolAdminClient).initialize(IProtocolAdminRegistry(protocolAdminRegistry), IProtocolFactory(protocolFactory), "localhost");
        adminPanel = IProtocolAdminPanelConsumer(protocolAdminClient).adminPanel();
        vm.prank(any_caller);

        IProtocolAdminClient(protocolAdminClient).create_protocol("MyProtocol1");

        //=======================TEST===========================================
        vm.prank(any_caller2);
        vm.expectRevert();
        IProtocolAdminClient(protocolAdminClient).create_pool(1,abi.encode(poolKey), Constants.SQRT_PRICE_1_1);
        //======================POST-CONDITIONS==================================
    }

    function test__fork__createPoolMustSucceed() public {
        //===================PRE-CONDITIONS===================
        vm.startPrank(protocol_admin);
        IMasterHook(masterHook).initialize(address(poolManager), address(allHook));
        IProtocolAdminClient(protocolAdminClient).initialize(IProtocolAdminRegistry(protocolAdminRegistry), IProtocolFactory(protocolFactory), "localhost");
        IProtocolHookMediator(protocolHookMediator).initialize(IMasterHook(masterHook),IProtocolAdminClient(protocolAdminClient),lpm);
        IProtocolAdminClient(protocolAdminClient).setProtocolHookMediator(IProtocolHookMediator(protocolHookMediator));
        

        vm.stopPrank();


        vm.prank(any_caller);
        (uint256 protocolId, address adminManager) = IProtocolAdminClient(protocolAdminClient).create_protocol("MyProtocol1");
        PoolId[] memory prevProtocolPools = IProtocolAdminClient(protocolAdminClient).getProtocolActivePools(protocolId);

        
        //=====================TEST=============================
        vm.prank(any_caller);

        (PoolId poolId, int24 _initialTick) = IProtocolAdminClient(protocolAdminClient).create_pool(1,abi.encode(poolKey), Constants.SQRT_PRICE_1_1);
        

        //======================POST-CONDITIONS========================
        PoolId[] memory postProtocolPools = IProtocolAdminClient(protocolAdminClient).getProtocolActivePools(protocolId);

        assertEq(PoolId.unwrap(PoolIdLibrary.toId(poolKey)),PoolId.unwrap(poolId));
        (, int24 tick,, uint24 lpFee) = IStateView(EthereumMainnet.STATE_VIEW).getSlot0(poolId);       
        assertEq(tick, _initialTick);
        assertEq(lpFee, poolKey.fee);
        // assertEq(prevProtocolPools.length + uint256(0x01),postProtocolPools.length);
        assertEq(PoolId.unwrap(poolId),PoolId.unwrap(postProtocolPools[prevProtocolPools.length]));
    }




}