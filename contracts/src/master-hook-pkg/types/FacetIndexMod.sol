// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

// ═══════════════════════════════════════════════════════════════════════
// FacetIndex — UDVT for indexing into a hook point's facet registry
// Invariant: INV-011 — always less than the registry length
// ═══════════════════════════════════════════════════════════════════════

type FacetIndex is uint8;

error FacetIndexMod__OutOfBounds(uint8 index, uint8 registryLength);

function newFacetIndex(uint8 index, uint8 registryLength) pure returns (FacetIndex) {
    if (index >= registryLength) {
        revert FacetIndexMod__OutOfBounds(index, registryLength);
    }
    return FacetIndex.wrap(index);
}

function toUint8(FacetIndex self) pure returns (uint8) {
    return FacetIndex.unwrap(self);
}

using {toUint8} for FacetIndex global;
