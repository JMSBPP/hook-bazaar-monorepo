// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

// ═══════════════════════════════════════════════════════════════════════
// FacetConfig — per-facet configuration for the dispatcher registry
// Invariant: INV-008 — critical flag determines failure propagation
// ═══════════════════════════════════════════════════════════════════════

struct FacetConfig {
    address facet;
    bool critical;    // true = revert on failure, false = skip and continue
}

error FacetConfigMod__ZeroAddress();

function newFacetConfig(address facet, bool critical) pure returns (FacetConfig memory) {
    if (facet == address(0)) {
        revert FacetConfigMod__ZeroAddress();
    }
    return FacetConfig({facet: facet, critical: critical});
}

function facetAddress(FacetConfig memory self) pure returns (address) {
    return self.facet;
}

function isCritical(FacetConfig memory self) pure returns (bool) {
    return self.critical;
}
