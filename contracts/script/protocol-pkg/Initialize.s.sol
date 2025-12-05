// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import "../src/ProtocolAdminClient.sol";
import {DevOpsTools} from "foundry-devops/DevOpsTools.sol";


contract Initialize is Script{
    function run(string calldata _baseURI) public{
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        
        address protocol_admin_client = DevOpsTools.get_most_recent_deployment(
            "ProtocolAdminClient",
            block.chainid
        );

        address protocol_admin_registry = DevOpsTools.get_most_recent_deployment(
            "ProtocolAdminRegistry",
            block.chainid
        );
        address protocol_factory_facet = DevOpsTools.get_most_recent_deployment(
            "ProtocolFactoryFacet",
            block.chainid
        );

        vm.startBroadcast(privateKey);
        IProtocolAdminClient(protocol_admin_client).initialize();
        IProtocolAdminClient(protocol_admin_client).initialize_admin_panel(
            protocol_admin_registry, protocol_factory_facet, _baseURI);
        vm.stopBroadcast();
    }
}