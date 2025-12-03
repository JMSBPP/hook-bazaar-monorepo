// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.19;

// import "forge-std/Script.sol";
// import "../src/MasterHook.sol";
// import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
// import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";
// import {AllHook} from "../src/AllHook.sol";

// contract DeployMasterHookScript is Script{
//     address constant CREATE2_DEPLOYER = address(0x4e59b44847b379578588920cA78FbF26c0B4956C);
//     IPoolManager constant POOLMANAGER = IPoolManager(address(0xE03A1074c86CFeDd5C142C4F04F1a1536e203543));

//     function setUp() public {}

//     function run() public {
//         bytes memory constructorArgs = abi.encode(POOLMANAGER);
//         (address masterHookExpectedAddress, bytes32 salt) =
//             HookMiner.find(CREATE2_DEPLOYER, Hooks.ALL_HOOK_MASK, type(MasterHook).creationCode, abi.encode("0x00"));
//         vm.broadcast();
    
//         MasterHook masterHook = new MasterHook{salt salt}();
//         require(address(masterHook), masterHookExpectedAddress);
    
//         (address allHookImplExpectedAddress, bytes salt2) = HookMiner.find(
//             CREATE2_DEPLOYER, Hooks.ALL_HOOK_MASK, type(AllHook).creationCode, constructorArgs
//         );

//         vm.broadcast();
//         AllHook allHook = new AllHook{salt:salt2}(IPoolManager(POOLMANAGER));
//         require(address(allHook),allHookImplExpectedAddress);

//     }

// }
