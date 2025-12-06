// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console2} from "forge-std/Test.sol";
import {Script} from "forge-std/Script.sol";
import {EthereumMainnet} from "./utils/ForkUtils.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";

// import "@hook-bazaar/master-hook-pkg/MasterHook.sol";

import "@uniswap/v4-periphery/src/utils/BaseHook.sol";

// import "@hook-bazaar/master-hook-pkg/AllHook.sol";


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
import "@uniswap/v4-periphery/src/utils/HookMiner.sol";

import {MockCounterHook} from "@uniswap/v4-periphery/test/mocks/MockCounterHook.sol";
// import {MockCounterHook2} from "@hook-bazaar/master-hook-pkg/mocks/MockCounterHook2.sol";


import {BalanceDeltaLibrary} from "@uniswap/v4-core/src/types/BalanceDelta.sol";

contract AllHook is BaseHook{
    constructor(address _poolManager) BaseHook(IPoolManager(_poolManager)){}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory){
        return Hooks.Permissions(true,true,true,true,true,true,true,true,true,true,true,true,true,true);
    }

    function _beforeInitialize(address, PoolKey calldata, uint160) internal pure override returns (bytes4) {
        return IHooks.beforeInitialize.selector;
    }

    function _afterInitialize(address, PoolKey calldata, uint160, int24) internal pure override returns (bytes4) {
        return IHooks.afterInitialize.selector;
    }

    function _beforeAddLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        internal
        pure
        override
        returns (bytes4)
    {
        return IHooks.beforeAddLiquidity.selector;
    }

    function _afterAddLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) internal pure override returns (bytes4, BalanceDelta) {
        return (IHooks.afterAddLiquidity.selector, BalanceDeltaLibrary.ZERO_DELTA);
    }

    function _beforeRemoveLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        internal
        pure
        override
        returns (bytes4)
    {
        return IHooks.beforeRemoveLiquidity.selector;
    }

    function _afterRemoveLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) internal pure override returns (bytes4, BalanceDelta) {
        return (IHooks.afterRemoveLiquidity.selector, BalanceDeltaLibrary.ZERO_DELTA);
    }

    function _beforeSwap(address, PoolKey calldata, SwapParams calldata, bytes calldata) internal pure override returns (bytes4, BeforeSwapDelta, uint24){
        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _afterSwap(address, PoolKey calldata, SwapParams calldata, BalanceDelta, bytes calldata) internal pure override returns (bytes4, int128){
        return (IHooks.afterSwap.selector, 0);
    }

    function _beforeDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        internal
        pure
        override
        returns (bytes4)
    {
        return IHooks.beforeDonate.selector;
    }

    function _afterDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        internal
        pure
        override
        returns (bytes4)
    {
        return IHooks.afterDonate.selector;
    }
}
import "compose-extensions/BaseDiamond.sol";
import "compose-extensions/libraries/LibInitializable.sol";
import "Compose/access/AccessControl/LibAccessControl.sol";


import "Compose/diamond/LibDiamond.sol";
import "@uniswap/v4-core/src/libraries/Hooks.sol";
import "@uniswap/v4-core/src/interfaces/IHooks.sol";

// NOTE: This type is used to store hook selectors for diamond facet cuts 

struct HookSelectors{
    bytes4[] _hookSelectors;
}

library LibHookSelectors{
    
    function hookSelectors(IHooks _hook) internal pure returns(bytes4[] memory){
        bytes4[] memory __hookSelectors = new bytes4[](uint256(0x10));
        uint256 finalLen = 0;
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_INITIALIZE_FLAG)){
            __hookSelectors[0x00] = IHooks.beforeInitialize.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_INITIALIZE_FLAG)){
            __hookSelectors[0x01] = IHooks.afterInitialize.selector;
            finalLen++;
        }
        
        // Add liquidity hooks
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_ADD_LIQUIDITY_FLAG)){
            __hookSelectors[0x02] = IHooks.beforeAddLiquidity.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_ADD_LIQUIDITY_FLAG)){
            __hookSelectors[0x03] = IHooks.afterAddLiquidity.selector;
            finalLen++;
        }
        
        // Remove liquidity hooks
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG)){
            __hookSelectors[0x04] = IHooks.beforeRemoveLiquidity.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_REMOVE_LIQUIDITY_FLAG)){
            __hookSelectors[0x05] = IHooks.afterRemoveLiquidity.selector;
            finalLen++;
        }
        
        // Swap hooks
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_SWAP_FLAG)){
            __hookSelectors[0x06] = IHooks.beforeSwap.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_SWAP_FLAG)){
            __hookSelectors[0x07] = IHooks.afterSwap.selector;
            finalLen++;
        }
        
        // Donate hooks
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_DONATE_FLAG)){
            __hookSelectors[0x08] = IHooks.beforeDonate.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_DONATE_FLAG)){
            __hookSelectors[0x09] = IHooks.afterDonate.selector;
            finalLen++;
        }
        
        // Delta return flags (map to same selectors as their base hooks)
        if (Hooks.hasPermission(_hook, Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG)){
            __hookSelectors[0x0A] = IHooks.beforeSwap.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG)){
            __hookSelectors[0x0B] = IHooks.afterSwap.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG)){
            __hookSelectors[0x0C] = IHooks.afterAddLiquidity.selector;
            finalLen++;
        }
        if (Hooks.hasPermission(_hook, Hooks.AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG)){
            __hookSelectors[0x0D] = IHooks.afterRemoveLiquidity.selector;
            finalLen++;
        }

        bytes4[] memory _resHookSelectors = new bytes4[](finalLen);
        uint256 resIndex = 0;
        for (uint256 i = 0; i < __hookSelectors.length; i++) {
            if (__hookSelectors[i] != bytes4(0x00)) {
                _resHookSelectors[resIndex] = __hookSelectors[i];
                resIndex++;
            }
        }
        return _resHookSelectors;
    }

    function appendSelectors(bytes4[] memory _self, bytes4[] memory _additionalSelectors) internal pure returns(bytes4[] memory){
        bytes4[] memory result = new bytes4[](_self.length + _additionalSelectors.length);
        
        for (uint256 i = 0; i < _self.length; i++) {
            result[i] = _self[i];
        }
        
        for (uint256 i = 0; i < _additionalSelectors.length; i++) {
            result[_self.length + i] = _additionalSelectors[i];
        }
        
        return result;
    }
}


interface IMasterHook{
    event MasterHook__HookAdded(address indexed mediator, address indexed _hook, bytes selectors);
    error MasterHook__NotValidHook();     
    error MasterHook__Uninitiialized();
    function initialize(address _poolManager, address _allHookImpl) external;
    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external;
    function addHook(address _hook,bytes4[] memory _additionalSelectors) external;
}


contract MasterHook is BaseDiamond, IMasterHook{
    bytes32 constant PROTOCOL_ADMIN = keccak256("protocol-admin");
    bytes32 constant STORAGE_POSITION = keccak256("hook-bazar.hooks");
    
    struct MasterHookStorage{
        IPoolManager poolManager;
    }

    function getStorage() internal pure returns (MasterHookStorage storage $) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            $.slot := position
        }
    }


    modifier initializer() {
        // solhint-disable-next-line var-name-mixedcase
        LibInitializable.InitializableStorage storage $ = LibInitializable.getStorage();

        // Cache values to avoid duplicated sloads
        bool isTopLevelCall = !$._initializing;
        uint64 initialized = $._initialized;

        // Allowed calls:
        // - initialSetup: the contract is not in the initializing state and no previous version was
        //                 initialized
        // - construction: the contract is initialized at version 1 (no reinitialization) and the
        //                 current contract is just being deployed
        bool initialSetup = initialized == 0 && isTopLevelCall;
        bool construction = initialized == 1 && address(this).code.length == 0;

        if (!initialSetup && !construction) {
            revert LibInitializable.InvalidInitialization();
        }

        $._initialized = 1;
        if (isTopLevelCall) {
            $._initializing = true;
        }
        _;
        if (isTopLevelCall) {
            $._initializing = false;
            emit LibInitializable.Initialized(1);
        }
    }

    

    function initialize(address _poolManager, address _allHookImpl) external initializer{
        MasterHookStorage storage $ = getStorage();
        LibAccessControl.setRoleAdmin(LibAccessControl.DEFAULT_ADMIN_ROLE, PROTOCOL_ADMIN);
        LibAccessControl.grantRole(PROTOCOL_ADMIN, msg.sender);

        $.poolManager = IPoolManager(_poolManager);
        {
            bytes4[] memory _interface = new bytes4[](10);
            
            _interface[0] = IHooks.beforeInitialize.selector;
            _interface[1] = IHooks.afterInitialize.selector;
            _interface[2] = IHooks.beforeAddLiquidity.selector;
            _interface[3] = IHooks.afterAddLiquidity.selector;
            _interface[4] = IHooks.beforeRemoveLiquidity.selector;
            _interface[5] = IHooks.afterRemoveLiquidity.selector;
            _interface[6] = IHooks.beforeSwap.selector;
            _interface[7] = IHooks.afterSwap.selector; 
            _interface[8] = IHooks.beforeDonate.selector;
            _interface[9] = IHooks.afterDonate.selector;
    
            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](1);
            _cut[0] = LibDiamond.FacetCut(_allHookImpl, LibDiamond.FacetCutAction.Add, _interface);
            this._diamondCut(_cut, address(0x00), abi.encode("0x00"));
        }

    }
    
    modifier initialized(){
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) revert MasterHook__Uninitiialized();
        _;
    }

    modifier onlyProtocolAdmin(){
        LibAccessControl.requireRole(PROTOCOL_ADMIN, msg.sender);
        _;
    }


    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external initialized onlyProtocolAdmin {}
    

    
    // TODO: This needs to be protected to be only allowed once a amreket transaction has been ccompleted to acquire, plug the hook
    function addHook(address _hook, bytes4[] memory _additionalSelectors) external initialized onlyProtocolAdmin{
        // if (!IERC165(_hook).supportsInterface(type(IHooks).interfaceId)) revert MasterHook__NotValidHook();       
        bytes4[] memory _hookSelectors = LibHookSelectors.hookSelectors(IHooks(_hook));
        bytes4[] memory _allSelectors = LibHookSelectors.appendSelectors(_hookSelectors, _additionalSelectors);
        this._replaceFunctions(_hook, _hookSelectors);
        this._addFunctions(_hook, _additionalSelectors);
        emit MasterHook__HookAdded(msg.sender, address(_hook), abi.encode(_allSelectors));
    }



}




contract MockCounterHook2 is MockCounterHook{
    uint256 __slot;
    constructor(address _manager) MockCounterHook(IPoolManager(_manager)){}
}

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