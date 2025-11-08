// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


import {Script} from "forge-std/Script.sol";
import {IProtocolRegistry} from "../../src/contracts/ProtocolRegitry.sol";
import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";
import {Deploy} from "../deployments/DeployProtocolContracts.sol";

contract Initialize is Script{
    function run() public{
      address protocol_registry = DevOpsTools.get_most_recent_deployment("DeployStuff", block.chainid);  
      if (protocol_registry == address(0x00)){
            Deploy.run();
            run();
      }
      IProtocolRegistry(protocol_registry).__init__(address(0x123));
      
    }
}