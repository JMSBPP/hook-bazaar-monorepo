// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {console2} from "forge-std/console2.sol";
 
import "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IMasterHook} from "@hook-bazaar/master-hook-pkg/src/MasterHook.sol";
import {IProtocolAdminPanel} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminPanel.sol";
import {IProtocolAdminClient} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminClient.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {InitializableBase} from "compose-extensions/LibInitializable.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";

interface IProtocolHookMediator{
    function initialize(IMasterHook _masterHook,IProtocolAdminClient protocolAdminClient,IPositionManager positionManager) external;

    function notify(address notifier, bytes4 _funcSig, bytes memory _data) external returns(bytes memory);
}

contract ProtocolHookMediator is IProtocolHookMediator, Context, InitializableBase{

    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.protocol-hook-mediator");

    struct ProtocolHookMediatorStorage{
        IMasterHook masterHook;
        IProtocolAdminClient protocolAdminClient;
        IPositionManager positionManager;
    }

    function getStorage() internal pure returns (ProtocolHookMediatorStorage storage s){
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

  
    function initialize(IMasterHook _masterHook,IProtocolAdminClient protocolAdminClient,IPositionManager positionManager) external initializer {
        ProtocolHookMediatorStorage storage $ = getStorage();
        $.masterHook = _masterHook;
        $.positionManager = positionManager;
        $.protocolAdminClient = protocolAdminClient;
    }



    function notify(address notifier, bytes4 _funcSig, bytes memory _data) external onlyInitialized returns(bytes memory){
        ProtocolHookMediatorStorage storage $ = getStorage();
        
        bytes memory res;
        if (notifier == address($.protocolAdminClient)){
            res = reactOnProtocolClient(_funcSig, _data);
       }

        return res;

    }

    function reactOnProtocolClient(bytes4 _funcSig, bytes memory _data) internal returns(bytes memory){
        console2.logBytes4(_funcSig);
        ProtocolHookMediatorStorage storage $ = getStorage();

        if (_funcSig == bytes4(keccak256("create_pool(uint256,bytes,uint160)"))){
            (uint256 _protocolId, PoolKey memory poolKey, uint160 _initialSqrtPrice) = abi.decode(_data, (uint256, PoolKey, uint160));
            poolKey.hooks = IHooks(address($.masterHook));
            int24 tick = $.positionManager.initializePool(
                poolKey,
                _initialSqrtPrice
            );
            

            return abi.encode(tick, PoolIdLibrary.toId(poolKey));
        }
    }
}