// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {IProtocolAdminClient} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminClient.sol";
import {DevOpsTools} from "foundry-devops/DevOpsTools.sol";

contract CreateProtocol is Script{

    function run(string calldata _name) public{
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address protocol_admin_client = DevOpsTools.get_most_recent_deployment(
            "ProtocolAdminClient",
            block.chainid
        );

        vm.startBroadcast(privateKey);

        IProtocolAdminClient(protocol_admin_client).create_protocol(_name);

        vm.stopBroadcast();

    }
}
