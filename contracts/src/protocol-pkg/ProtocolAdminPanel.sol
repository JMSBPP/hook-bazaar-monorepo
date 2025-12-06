// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "compose-extensions/BaseDiamond.sol";

import {IERC1155} from "Compose/interfaces/IERC1155.sol";
import {ERC1155Facet} from "Compose/token/ERC1155/ERC1155Facet.sol";
import "./ProtocolFactoryFacet.sol";
import "./ProtocolAdminRegistry.sol";
import "compose-extensions/GenericFactory/GenericFactoryFacet.sol";
import {LibOwner} from "Compose/access/Owner/LibOwner.sol";

// // NOTE: This contract is the interaction point for protocol
// // developers, AI agents 


interface IProtocolAdminPanel{
    error ProtocolAdminPanelAlreadyInitialized();
    error InvalidDeployer(address);
    error ProtocolAdminPanelInvalidProtocolFactoryInstance(address);
    error ProtocolAdminPanelInvalidProtocolAdminRegistry(address);
    function initialize(address _client,address _protocol_admin_registry, address _protocol_factory, string calldata _baseURI) external;

}

// TODO: To be considered : IERC5169
// TODO: To be considered: IERC1155Receiver

contract ProtocolAdminPanel is BaseDiamond, IProtocolAdminPanel{
    
    struct ProtocolAdminPanelStorage{
        bool _initialized;
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
        LibOwner.OwnerStorage storage o$ = LibOwner.getStorage();
        o$.owner = msg.sender;
        $._initialized = false;
    }

    function initialize(
        address _client,
        address _protocol_admin_registry,
        address _protocol_factory,
        string calldata _baseURI
    ) external{
        LibOwner.requireOwner();

        ProtocolAdminPanelStorage storage $ = getStorage();
        if ($._initialized) revert ProtocolAdminPanelAlreadyInitialized();
        // TODO: Introspection checks ...

        {
            bytes4[] memory  _interface = new bytes4[](uint256(0x06));
            
            _interface[0x00] = IProtocolFactory.__initialize.selector;
            _interface[0x01] = IProtocolFactory.adminPanel.selector;
            _interface[0x02] = IProtocolFactory.baseURI.selector;
            _interface[0x03] = IProtocolFactory.create_protocol.selector;
            _interface[0x04] = IERC1155.balanceOf.selector;
            _interface[0x05] = IERC1155.uri.selector;
            
            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](uint256(0x01));
            _cut[0x00] = LibDiamond.FacetCut(_protocol_factory, LibDiamond.FacetCutAction.Add, _interface);
            this._diamondCut(_cut, _protocol_factory, abi.encodeCall(IProtocolFactory.__initialize, _baseURI));

        }
        {   
            bytes4[] memory  _interface = new bytes4[](uint256(0x05));

            _interface[0x00] = IProtocolAdminRegistry._initialize.selector;
            _interface[0x01] = IProtocolAdminRegistry.protocol_manager.selector;
            _interface[0x02] = IProtocolAdminRegistry.protocol_admin_template.selector;
            _interface[0x03] = IProtocolAdminRegistry.upgradeAdmin.selector;
            _interface[0x04] = IProtocolAdminRegistry.isUpgradeAdmin.selector;
            // _interface[0x05] = IERC165.supportsInterface.selector;

            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](uint256(0x01));
            _cut[0x00] = LibDiamond.FacetCut(_protocol_admin_registry, LibDiamond.FacetCutAction.Add, _interface);
            this._diamondCut(_cut, _protocol_admin_registry, abi.encodeCall(IProtocolAdminRegistry._initialize, ()));

        }
        {
            bytes4[] memory  _interface = new bytes4[](uint256(0x01));
            _interface[0x00] = IERC165.supportsInterface.selector;
            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](uint256(0x01));
            _cut[0x00] = LibDiamond.FacetCut(_client, LibDiamond.FacetCutAction.Add, _interface);
            this._diamondCut(_cut, address(0x00),bytes(""));

        }

        $._initialized = true;

    }
    // TODO: It must verify the _account is compliant
    // with the adminManager, msg.sender MUST be
    // ProtocolAdminClient
        // NOTE: Checks

        // NOTE: After checks
        // If first time enabling create pool. Enable it

}
