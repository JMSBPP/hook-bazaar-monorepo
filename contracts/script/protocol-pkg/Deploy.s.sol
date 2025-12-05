// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import "../src/ProtocolAdminClient.sol";

contract DeployAll is Script{
    
    function run() public{
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(privateKey);

        new ProtocolAdminClient();
        new ProtocolAdminRegistry();
        new ProtocolFactoryFacet();

        vm.stopBroadcast();
    }
}