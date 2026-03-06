// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

// ═══════════════════════════════════════════════════════════════════════
// HookBitmap — UDVT for selecting which facets fire per hook call
// Invariant: INV-010 — only bits 0..MAX_FACETS-1 are meaningful
// ═══════════════════════════════════════════════════════════════════════

type HookBitmap is uint16;

uint8 constant MAX_FACETS = 16;
uint16 constant VALID_MASK = uint16((1 << MAX_FACETS) - 1); // 0xFFFF for 16 facets

error HookBitmapMod__InvalidBits(uint16 raw, uint16 invalidBits);

// ── Factory (opaque construction — no public wrap) ───────────────────

function newHookBitmap(uint16 raw) pure returns (HookBitmap) {
    uint16 invalid = raw & ~VALID_MASK;
    if (invalid != 0) {
        revert HookBitmapMod__InvalidBits(raw, invalid);
    }
    return HookBitmap.wrap(raw);
}

// ── Sentinel: all-ones bitmap means "dispatch to all registered" ─────

function allFacetsBitmap() pure returns (HookBitmap) {
    return HookBitmap.wrap(VALID_MASK);
}

function emptyBitmap() pure returns (HookBitmap) {
    return HookBitmap.wrap(0);
}

// ── Accessors ────────────────────────────────────────────────────────

function isSet(HookBitmap self, uint8 index) pure returns (bool) {
    return (HookBitmap.unwrap(self) >> index) & 1 == 1;
}

function popcount(HookBitmap self) pure returns (uint8 count) {
    uint16 bits = HookBitmap.unwrap(self);
    // Brian Kernighan's bit counting
    while (bits != 0) {
        bits = bits & (bits - 1);
        count++;
    }
}

function isEmpty(HookBitmap self) pure returns (bool) {
    return HookBitmap.unwrap(self) == 0;
}

function rawBits(HookBitmap self) pure returns (uint16) {
    return HookBitmap.unwrap(self);
}

using {isSet, popcount, isEmpty, rawBits} for HookBitmap global;
