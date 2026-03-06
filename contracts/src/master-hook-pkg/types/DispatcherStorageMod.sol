// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {FacetConfig} from "./FacetConfigMod.sol";
import {IAggregator} from "./IAggregator.sol";
import {HookBitmap, MAX_FACETS} from "./HookBitmapMod.sol";

// ═══════════════════════════════════════════════════════════════════════
// DispatcherStorage — namespaced storage for the HookDispatcher Diamond
// Invariant: INV-001 — registry length per hook point <= MAX_FACETS
// Invariant: INV-002 — no duplicate facet addresses per hook point
// Invariant: INV-005 — diamond cut preserves this storage
// ═══════════════════════════════════════════════════════════════════════

bytes32 constant DISPATCHER_STORAGE_POSITION = keccak256("hook-bazaar.dispatcher.storage");

struct DispatcherStorage {
    // hook point selector (bytes4) => ordered array of registered facets
    mapping(bytes4 => FacetConfig[]) facetRegistry;
    // hook point selector (bytes4) => aggregator contract for combining returns
    mapping(bytes4 => IAggregator) aggregatorRegistry;
    // hook point selector (bytes4) => facet address => true if registered (duplicate guard)
    mapping(bytes4 => mapping(address => bool)) registeredFacets;
}

error DispatcherStorageMod__MaxFacetsExceeded(bytes4 selector, uint8 current);
error DispatcherStorageMod__DuplicateFacet(bytes4 selector, address facet);
error DispatcherStorageMod__FacetNotRegistered(bytes4 selector, address facet);
error DispatcherStorageMod__NoAggregatorForMultiResult(bytes4 selector);

function getDispatcherStorage() pure returns (DispatcherStorage storage $) {
    bytes32 position = DISPATCHER_STORAGE_POSITION;
    assembly {
        $.slot := position
    }
}

function registryLength(bytes4 selector) view returns (uint8) {
    DispatcherStorage storage $ = getDispatcherStorage();
    return uint8($.facetRegistry[selector].length);
}

function getFacetConfig(bytes4 selector, uint8 index) view returns (FacetConfig storage) {
    return getDispatcherStorage().facetRegistry[selector][index];
}

function getAggregator(bytes4 selector) view returns (IAggregator) {
    return getDispatcherStorage().aggregatorRegistry[selector];
}

function isFacetRegistered(bytes4 selector, address facet) view returns (bool) {
    return getDispatcherStorage().registeredFacets[selector][facet];
}
