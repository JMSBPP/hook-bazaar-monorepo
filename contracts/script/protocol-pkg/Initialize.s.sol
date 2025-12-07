// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {IProtocolAdminClient} from "@hook-bazaar/protocol-pkg/ProtocolAdminClient.sol";
import {IProtocolAdminRegistry} from "@hook-bazaar/protocol-pkg/ProtocolAdminRegistry.sol";
import {IProtocolFactory} from "@hook-bazaar/protocol-pkg/ProtocolFactoryFacet.sol";
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
        IProtocolAdminClient(protocol_admin_client).initialize(
            IProtocolAdminRegistry(protocol_admin_registry),
            IProtocolFactory(protocol_factory_facet),
            _baseURI
        );
        vm.stopBroadcast();
    }
}