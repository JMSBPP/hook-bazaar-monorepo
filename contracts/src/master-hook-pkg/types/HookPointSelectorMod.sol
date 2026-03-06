// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";

// ═══════════════════════════════════════════════════════════════════════
// HookPointSelector — UDVT wrapping only valid IHooks callback selectors
// Invariant: INV-012 — only the 10 valid hook point selectors accepted
// ═══════════════════════════════════════════════════════════════════════

type HookPointSelector is bytes4;

uint8 constant NUM_HOOK_POINTS = 10;

error HookPointSelectorMod__InvalidSelector(bytes4 selector);

function newHookPointSelector(bytes4 raw) pure returns (HookPointSelector) {
    if (!_isValidHookSelector(raw)) {
        revert HookPointSelectorMod__InvalidSelector(raw);
    }
    return HookPointSelector.wrap(raw);
}

function _isValidHookSelector(bytes4 sel) pure returns (bool) {
    if (sel == IHooks.beforeInitialize.selector) return true;
    if (sel == IHooks.afterInitialize.selector) return true;
    if (sel == IHooks.beforeAddLiquidity.selector) return true;
    if (sel == IHooks.afterAddLiquidity.selector) return true;
    if (sel == IHooks.beforeRemoveLiquidity.selector) return true;
    if (sel == IHooks.afterRemoveLiquidity.selector) return true;
    if (sel == IHooks.beforeSwap.selector) return true;
    if (sel == IHooks.afterSwap.selector) return true;
    if (sel == IHooks.beforeDonate.selector) return true;
    if (sel == IHooks.afterDonate.selector) return true;
    return false;
}

function toBytes4(HookPointSelector self) pure returns (bytes4) {
    return HookPointSelector.unwrap(self);
}

function eq(HookPointSelector a, HookPointSelector b) pure returns (bool) {
    return HookPointSelector.unwrap(a) == HookPointSelector.unwrap(b);
}

using {toBytes4, eq} for HookPointSelector global;
