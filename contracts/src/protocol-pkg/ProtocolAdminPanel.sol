// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;


import {IERC1155} from "Compose/interfaces/IERC1155.sol";
import {ERC1155Facet} from "Compose/token/ERC1155/ERC1155Facet.sol";
import {IProtocolFactory, IProtocolAdminPanelConsumer} from "./ProtocolFactoryFacet.sol";
import "Compose/access/Owner/OwnerMod.sol" as OwnerMod;
import {IProtocolAdminRegistry, IGenericFactory} from "./ProtocolAdminRegistry.sol";
import {IProtocolAdminClient} from "./ProtocolAdminClient.sol";
import {IProtocolHookMediator} from "@hook-bazaar/protocol-hook-pkg/src/ProtocolHookMediator.sol";
import "Compose/diamond/DiamondMod.sol" as DiamondMod;
import {DiamondLoupeFacet} from "Compose/diamond/DiamondLoupeFacet.sol";

import {IProtocolAdminManager, Authority} from "@hook-bazaar/protocol-pkg/src/ProtocolAdminManager.sol";
// // NOTE: This contract is the interaction point for protocol
// // developers, AI agents

interface IProtocolAdminPanel{
    error ProtocolAdminPanelAlreadyInitialized();
    error InvalidDeployer(address);
    error ProtocolAdminPanelInvalidProtocolFactoryInstance(address);
    error ProtocolAdminPanelInvalidProtocolAdminRegistry(address);
    //=============================================ADMIN-FUNCTIONS=====================================================================
    function initialize(IProtocolAdminClient _client,IProtocolAdminRegistry _protocol_admin_registry, IProtocolFactory _protocol_factory, string calldata _baseURI) external;


    //==============================CREATE-PROTOCOL-FLOW===================================================
    // function unlockAdminManager(IProtocolAdminManager _adminManager) external; 
    
    
    

}

// TODO: To be considered : IERC5169
// TODO: To be considered: IERC1155Receiver

contract ProtocolAdminPanel is IProtocolAdminPanel{
    
    struct ProtocolAdminPanelStorage{
        bool _initialized;
        IProtocolHookMediator protocolHookMediator;
    }

    bytes32 constant PROTOCOL_ADMIN_PANEL_STORAGE = keccak256("hook-bazaar.protocol.admin-panel");    

    function getStorage() internal pure returns (ProtocolAdminPanelStorage storage s) {
        bytes32 position = PROTOCOL_ADMIN_PANEL_STORAGE;
        assembly {
            s.slot := position
        }
    }

    // TODO: This needs to be owned by the protocol deployer
    
    constructor(){

       ProtocolAdminPanelStorage storage $ = getStorage();
       OwnerMod.OwnerStorage storage o$ = OwnerMod.getStorage();
       o$.owner = msg.sender;
       $._initialized = false;
       DiamondMod.FacetCut[] memory loupeFacetCut = new DiamondMod.FacetCut[](uint256(0x01));
       {
          bytes4[] memory  _interface = new bytes4[](uint256(0x04));
          _interface[0x00] = DiamondLoupeFacet.facetAddress.selector;
          _interface[0x01] = DiamondLoupeFacet.facets.selector;
          _interface[0x02] = DiamondLoupeFacet.facetFunctionSelectors.selector;
          _interface[0x03] = DiamondLoupeFacet.facetAddresses.selector;
          loupeFacetCut[0x00] = DiamondMod.FacetCut(address(new DiamondLoupeFacet()), DiamondMod.FacetCutAction.Add, _interface);

       }
        DiamondMod.addFacets(loupeFacetCut);

    }

   function initialize(
       IProtocolAdminClient _client,
       IProtocolAdminRegistry _protocol_admin_registry,
       IProtocolFactory _protocol_factory,
       string calldata _baseURI
   ) external{
       OwnerMod.requireOwner();

       ProtocolAdminPanelStorage storage $ = getStorage();
       if ($._initialized) revert ProtocolAdminPanelAlreadyInitialized();
        //TODO: Introspection checks ...
       DiamondMod.FacetCut[] memory _cut = new DiamondMod.FacetCut[](uint256(0x02));
       {
          bytes4[] memory  _interface = new bytes4[](uint256(0x07));
            
          _interface[0x00] = _protocol_factory.__initialize.selector;
          _interface[0x01] = _protocol_factory.baseURI.selector;
          _interface[0x02] = _protocol_factory.create_protocol.selector;
          _interface[0x03] = IERC1155.balanceOf.selector;
          _interface[0x04] = IERC1155.uri.selector;
          _interface[0x05] = _protocol_factory.getProtocols.selector;
          _interface[0x06] = IProtocolAdminPanelConsumer.adminPanel.selector;  

           _cut[0x00] = DiamondMod.FacetCut(address(_protocol_factory), DiamondMod.FacetCutAction.Add, _interface);
      }
       {
           bytes4[] memory  _interface = new bytes4[](uint256(0x08));

           _interface[0x00] = _protocol_admin_registry._initialize.selector;
           _interface[0x01] = _protocol_admin_registry.setProtocolManager.selector;
           _interface[0x02] = _protocol_admin_registry.getProtocolManager.selector;
           _interface[0x03] = _protocol_admin_registry.adminManagerTemplate.selector;
           _interface[0x04] = _protocol_admin_registry.upgradeAdmin.selector;
           _interface[0x05] = _protocol_admin_registry.addPool.selector;
           _interface[0x06] = _protocol_admin_registry.getProtocolPools.selector;
           _interface[0x07] = _protocol_admin_registry.isPoolCreator.selector;
           _cut[0x01] = DiamondMod.FacetCut(address(_protocol_admin_registry), DiamondMod.FacetCutAction.Add, _interface);
       }
       DiamondMod.addFacets(_cut);

       $._initialized = true;

   }

    fallback() external payable {
       DiamondMod.diamondFallback();    
    }

}
