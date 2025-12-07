// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IMasterHook} from "@hook-bazaar/master-hook-pkg/MasterHook.sol";
import {IProtocolAdminPanel} from "@hook-bazaar/protocol-pkg/ProtocolAdminPanel.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

interface IProtocolHookMediator{
    function notify(bytes4 _funcSig, bytes memory _data) external returns(bytes memory);
}

contract ProtocolHookMediator is IProtocolHookMediator, Context{

    bytes32 constant STORAGE_POSITION = keccak256("hook-bazaar.protocol-hook-mediator");

    struct ProtocolHookMediatorStorage{
        IMasterHook masterHook;
        IProtocolAdminPanel protocolAdminPanel;
        IPositionManager positionManager;
    }

    function getStorage() internal pure returns (ProtocolHookMediatorStorage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }


    function notify(bytes4 _funcSig, bytes memory _data) external returns(bytes memory){
        ProtocolHookMediatorStorage storage $ = getStorage();
        
        bytes memory res;
        if (_msgSender() == address($.protocolAdminPanel)){
            res = reactOnProtocolAdmin(_funcSig, _data);

        }

        return res;

    }

    function reactOnProtocolAdmin(bytes4 _funcSig, bytes memory _data) internal returns(bytes memory){
        ProtocolHookMediatorStorage storage $ = getStorage();
        
        if (_funcSig == bytes4(keccak256("create_pool(bytes calldata,uint160)"))){
            (PoolKey memory poolKey, uint160 _initialSqrtPrice)  = abi.decode(_data, (PoolKey, uint160));
            poolKey.hooks = IHooks(address($.masterHook));
            int24 tick = IPoolInitializer_v4($.positionManager).initializePool(
                poolKey,
                _initialSqrtPrice                
            );

            return abi.encode(tick);     
        }
    }
}