// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ebool, euint8, euint16, euint32, euint64, euint128, euint256, eaddress} from "fhenix-contracts/FHE.sol";

/// @title ICoFHETypes
/// @notice Encrypted equivalents of IHooks calldata types
/// @dev Direct mapping of IHooks parameter types to FHE encrypted versions
interface ICoFHETypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED POOLKEY
    // ═══════════════════════════════════════════════════════════════════════

    struct EPoolKey {
        eaddress currency0;
        eaddress currency1;
        euint32 fee;
        euint32 tickSpacing;
        eaddress hooks;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED MODIFYLIQUIDITYPARAMS
    // ═══════════════════════════════════════════════════════════════════════

    struct EModifyLiquidityParams {
        euint32 tickLower;
        euint32 tickUpper;
        euint256 liquidityDelta;
        euint256 salt;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED SWAPPARAMS
    // ═══════════════════════════════════════════════════════════════════════

    struct ESwapParams {
        ebool zeroForOne;
        euint256 amountSpecified;
        euint256 sqrtPriceLimitX96;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED BALANCEDELTA
    // ═══════════════════════════════════════════════════════════════════════

    struct EBalanceDelta {
        euint128 amount0;
        euint128 amount1;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENCRYPTED BEFORESWAPDELTA
    // ═══════════════════════════════════════════════════════════════════════

    struct EBeforeSwapDelta {
        euint128 deltaSpecified;
        euint128 deltaUnspecified;
    }
}
