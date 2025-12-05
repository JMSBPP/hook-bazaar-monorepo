// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import "compose-extensions/BaseDiamond.sol";
import {LibOwner} from "Compose/access/Owner/LibOwner.sol";
import {LibDiamond} from "Compose/diamond/LibDiamond.sol";
import {IDiamond} from "Compose/diamond/IDiamond.sol";
import {IERC165} from "forge-std/interfaces/IERC165.sol";

import "./facets/HookRegistryFacet.sol";
import "./facets/HookFactoryFacet.sol";
import "./facets/HookOwnershipFacet.sol";
import "./interfaces/IHookRegistry.sol";
import "./interfaces/IHookFactory.sol";
import "./interfaces/IHookOwnership.sol";

interface IMasterHookDiamond {
    error MasterHookDiamondAlreadyInitialized();
    error MasterHookDiamondInvalidFacet(address facet);
    error MasterHookDiamondInvalidInitializer();

    function initialize(
        address hookRegistryFacet,
        address hookFactoryFacet,
        address hookOwnershipFacet
    ) external;
}

/**
 * @title MasterHookDiamond
 * @notice Central Diamond contract that aggregates all hook functionalities
 * @dev Follows EIP-2535 Diamond Standard and Compose library patterns
 */
contract MasterHookDiamond is BaseDiamond, IMasterHookDiamond {
    struct MasterHookDiamondStorage {
        bool _initialized;
    }

    bytes32 constant MASTER_HOOK_DIAMOND_STORAGE = keccak256("hook-bazaar.master-hook-diamond");

    function getStorage() internal pure returns (MasterHookDiamondStorage storage s) {
        bytes32 position = MASTER_HOOK_DIAMOND_STORAGE;
        assembly {
            s.slot := position
        }
    }

    constructor() {
        MasterHookDiamondStorage storage $ = getStorage();
        LibOwner.OwnerStorage storage o$ = LibOwner.getStorage();
        o$.owner = msg.sender;
        $._initialized = false;
    }

    /**
     * @notice Initialize the Master Hook Diamond with all facets
     * @dev Adds HookRegistryFacet, HookFactoryFacet, and HookOwnershipFacet
     * @param hookRegistryFacet Address of HookRegistryFacet
     * @param hookFactoryFacet Address of HookFactoryFacet
     * @param hookOwnershipFacet Address of HookOwnershipFacet
     */
    function initialize(
        address hookRegistryFacet,
        address hookFactoryFacet,
        address hookOwnershipFacet
    ) external {
        LibOwner.requireOwner();

        MasterHookDiamondStorage storage $ = getStorage();
        if ($._initialized) revert MasterHookDiamondAlreadyInitialized();

        // Validate facets have code
        if (hookRegistryFacet.code.length == 0) {
            revert MasterHookDiamondInvalidFacet(hookRegistryFacet);
        }
        if (hookFactoryFacet.code.length == 0) {
            revert MasterHookDiamondInvalidFacet(hookFactoryFacet);
        }
        if (hookOwnershipFacet.code.length == 0) {
            revert MasterHookDiamondInvalidFacet(hookOwnershipFacet);
        }

        // Add HookRegistryFacet
        {
            bytes4[] memory _interface = new bytes4[](uint256(0x07));
            
            _interface[0x00] = IHookRegistry.registerHookImplementation.selector;
            _interface[0x01] = IHookRegistry.getHookImplementation.selector;
            _interface[0x02] = IHookRegistry.getHookMetadata.selector;
            _interface[0x03] = IHookRegistry.listHooks.selector;
            _interface[0x04] = IHookRegistry.getHooksByDeveloper.selector;
            _interface[0x05] = IHookRegistry.isSelectorRegistered.selector;
            _interface[0x06] = IHookRegistry.deactivateHook.selector;

            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](uint256(0x01));
            _cut[0x00] = LibDiamond.FacetCut(
                hookRegistryFacet,
                LibDiamond.FacetCutAction.Add,
                _interface
            );
            IDiamond(address(this)).call_diamondCut(_cut, address(0x00), bytes(""));
        }

        // Add HookFactoryFacet
        {
            bytes4[] memory _interface = new bytes4[](uint256(0x05));

            _interface[0x00] = IHookFactory.deployHookClone.selector;
            _interface[0x01] = IHookFactory.initializeHookClone.selector;
            _interface[0x02] = IHookFactory.getHookClone.selector;
            _interface[0x03] = IHookFactory.getCloneInfo.selector;
            _interface[0x04] = IHookFactory.getAllClones.selector;

            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](uint256(0x01));
            _cut[0x00] = LibDiamond.FacetCut(
                hookFactoryFacet,
                LibDiamond.FacetCutAction.Add,
                _interface
            );
            IDiamond(address(this)).call_diamondCut(_cut, address(0x00), bytes(""));
        }

        // Add HookOwnershipFacet
        {
            bytes4[] memory _interface = new bytes4[](uint256(0x04));

            _interface[0x00] = IHookOwnership.transferHookOwnership.selector;
            _interface[0x01] = IHookOwnership.getHookOwner.selector;
            _interface[0x02] = IHookOwnership.getClonesByOwner.selector;
            _interface[0x03] = IHookOwnership.canManageHook.selector;

            LibDiamond.FacetCut[] memory _cut = new LibDiamond.FacetCut[](uint256(0x01));
            _cut[0x00] = LibDiamond.FacetCut(
                hookOwnershipFacet,
                LibDiamond.FacetCutAction.Add,
                _interface
            );
            IDiamond(address(this)).call_diamondCut(_cut, address(0x00), bytes(""));
        }

        // Add ERC165 support (if needed)
        {
            bytes4[] memory _interface = new bytes4[](uint256(0x01));
            _interface[0x00] = IERC165.supportsInterface.selector;
            
            // Note: ERC165Facet should be added separately if needed
            // For now, we'll skip it as it's optional
        }

        $._initialized = true;
    }
}