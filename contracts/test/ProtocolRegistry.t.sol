// // SPDX-License-Identifier: MIT
// pragma solidity >=0.8.30;

// import {Test} from "forge-std/Test.sol";
// import "../src/ProtocolRegistry.sol";


// contract ProtocolRegistryTest is Test{
    
    
//     address alice = makeAddr("alice");
//     address protocol_registry;
//     function setUp() public {
//         protocol_registry = address(new ProtocolRegistry());
//         IProtocolRegistry(protocol_registry).__init__(address(new ERC1155Facet()));
//         vm.label(alice, "alice");

//     }


//     function test__unit__mustCreateProtocol() external{
//         vm.startPrank(alice);
//         IProtocolRegistry(protocol_registry).createProtocol("DeFi Protocol Alpha");


//         vm.stopPrank();

//     }
// }