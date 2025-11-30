// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "compose-extensions/BaseDiamond.sol";
import "./LibHooks.sol";
import "compose-extensions/libraries/LibInitializable.sol";

interface IMasterHook{
    error MasterHookUninitiialized();
    function initialize(address _poolManager) external;
    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external;
}


contract MasterHook is BaseDiamond, IMasterHook{
    error MasterHookUninitiialized();
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

        revert LibInitializable.InvalidInitialization();
        if (!initialSetup && !construction) {
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

    

    function initialize(address _poolManager) external initializer{
        LibHooks.HookStorage storage $ = LibHooks.getStorage();
        $.poolManager = IPoolManager(_poolManager);
        {
              
            bytes4[] memory  _interface = new bytes4[](uint256(0x06));
            
            _interface[0x00] = IHooks.beforeInitialize.selector;
            _interface[0x01] = IHooks.afterInitialize.selector;
            _interface[0x02] = IHooks.beforeAddLiquidity.selector;
            _interface[0x03] = IHooks.afterAddLiquidity.selector;
            _interface[0x04] = IHooks.beforeRemoveLiquidity.selector;
            _interface[0x05] = IHooks.afterRemoveLiquidity.selector;
            _interface[0x06] = IHooks.beforeSwap.selector;
            _interface[0x07] = IHooks.afterSwap.selector;
            
            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](uint256(0x01));
            _cut[0x00] = LibDiamond.FacetCut(_protocol_factory, LibDiamond.FacetCutAction.Add, _interface);
            IDiamond(address(this)).call_diamondCut(_cut, _protocol_factory, abi.encodeCall(IProtocolFactory.__initialize, _baseURI));
        }

    }
    
    modifier initialized(){
        if (LibInitializable.getInitializedVersion() == uint256(0x00)) revert MasterHookUninitiialized();
        _;
    }


    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external initialized{}


    function beforeInitialize(address sender, PoolKey calldata key, uint160 sqrtPriceX96) external returns (bytes4);

    /// @notice The hook called after the state of a pool is initialized
    /// @param sender The initial msg.sender for the initialize call
    /// @param key The key for the pool being initialized
    /// @param sqrtPriceX96 The sqrt(price) of the pool as a Q64.96
    /// @param tick The current tick after the state of a pool is initialized
    /// @return bytes4 The function selector for the hook
    function afterInitialize(address sender, PoolKey calldata key, uint160 sqrtPriceX96, int24 tick)
        external
        returns (bytes4);

    function beforeAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4);

    function afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) external returns (bytes4, BalanceDelta);

    function beforeRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4);

    function afterRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) external returns (bytes4, BalanceDelta);

    function beforeSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata hookData)
        external
        returns (bytes4, BeforeSwapDelta, uint24);

    function afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external returns (bytes4, int128);

    function beforeDonate(
        address sender,
        PoolKey calldata key,
        uint256 amount0,
        uint256 amount1,
        bytes calldata hookData
    ) external returns (bytes4);

    function afterDonate(
        address sender,
        PoolKey calldata key,
        uint256 amount0,
        uint256 amount1,
        bytes calldata hookData
    ) external returns (bytes4);
}

