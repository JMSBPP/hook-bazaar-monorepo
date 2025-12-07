// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;


import {IERC1155} from "Compose/interfaces/IERC1155.sol";
import {ERC1155Facet} from "Compose/token/ERC1155/ERC1155Facet.sol";
import "./ProtocolFactoryFacet.sol";
import "./ProtocolAdminRegistry.sol";
import {IProtocolHookMediator} from "@hook-bazaar/protocol-hook-pkg/src/ProtocolHookMediator.sol";
import "Compose/diamond/DiamondMod.sol" as DiamondMod;

// // NOTE: This contract is the interaction point for protocol
// // developers, AI agents 


interface IProtocolAdminPanel{
    error ProtocolAdminPanelAlreadyInitialized();
    error InvalidDeployer(address);
    error ProtocolAdminPanelInvalidProtocolFactoryInstance(address);
    error ProtocolAdminPanelInvalidProtocolAdminRegistry(address);
    function initialize(IProtocolAdminClient _client,IProtocolAdminRegistry _protocol_admin_registry, IProtocolFactory _protocol_factory, string calldata _baseURI) external;
    function setProtocolHookMediator(IProtocolHookMediator _hookMediator) external;
    function protocolHookMediator() external view returns(IProtocolHookMediator);


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
        // TODO: Introspection checks ...
        DiamondMod.FacetCut[] memory _cut = new DiamondMod.FacetCut[](uint256(0x02));
        {
            bytes4[] memory  _interface = new bytes4[](uint256(0x06));
            
            _interface[0x00] = _protocol_factory.__initialize.selector;
            _interface[0x01] = _protocol_factory.adminPanel.selector;
            _interface[0x02] = _protocol_factory.baseURI.selector;
            _interface[0x03] = _protocol_factory.create_protocol.selector;
            _interface[0x04] = IERC1155.balanceOf.selector;
            _interface[0x05] = IERC1155.uri.selector;
            
            
            _cut[0x00] = DiamondMod.FacetCut(address(_protocol_factory), DiamondMod.FacetCutAction.Add, _interface);
        }
        {   
            bytes4[] memory  _interface = new bytes4[](uint256(0x05));

            _interface[0x00] = _protocol_admin_registry._initialize.selector;
            _interface[0x01] = _protocol_admin_registry.protocol_manager.selector;
            _interface[0x02] = _protocol_admin_registry.adminManagerTemplate.selector;
            _interface[0x03] = _protocol_admin_registry.upgradeAdmin.selector;
            _interface[0x04] = _protocol_admin_registry.isUpgradeAdmin.selector;
            // _interface[0x05] = IERC165.supportsInterface.selector;

            _cut[0x01] = DiamondMod.FacetCut(address(_protocol_admin_registry), DiamondMod.FacetCutAction.Add, _interface);


        }
        DiamondMod.addFacets(_cut);

        $._initialized = true;

    }

    function setProtocolHookMediator(IProtocolHookMediator _hookMediator) external{
        OwnerMod.requireOwner();
        ProtocolAdminPanelStorage storage $ = getStorage();
        $.protocolHookMediator = _hookMediator;
    }

    function protocolHookMediator() public view returns(IProtocolHookMediator){
        ProtocolAdminPanelStorage storage $ = getStorage();
        return $.protocolHookMediator;
    }

    // TODO: It must verify the _account is compliant
    // with the adminManager, msg.sender MUST be
    // ProtocolAdminClient
    // NOTE: Checks

    // NOTE: After checks
    // If first time enabling create pool. Enable it
    fallback() external payable {
        DiamondMod.diamondFallback();
    }

}
