// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooksOperatorAVSTypes} from "./IHooksOperatorAVSTypes.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title IEscrowCoordinator
/// @notice Manages escrow-conditioned service delivery for HookLicenses
/// @dev Handles bond posting and release for HaaS engagement
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
interface IEscrowCoordinator is IHooksOperatorAVSTypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error EscrowCoordinator__InvalidLicense();
    error EscrowCoordinator__BondAlreadyPosted();
    error EscrowCoordinator__InsufficientBond();
    error EscrowCoordinator__BondNotPosted();
    error EscrowCoordinator__BondLocked();
    error EscrowCoordinator__TransferFailed();
    error EscrowCoordinator__Unauthorized();

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event BondPosted(
        uint256 indexed licenseId,
        address indexed depositor,
        address token,
        uint256 amount
    );

    event BondReleased(
        uint256 indexed licenseId,
        address indexed recipient,
        address token,
        uint256 amount
    );

    event BondSlashed(
        uint256 indexed licenseId,
        address indexed slashedParty,
        uint256 amount,
        string reason
    );

    // ═══════════════════════════════════════════════════════════════════════
    // BOND TYPES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Bond details for a license
    struct BondDetails {
        IERC20 paymentToken;
        uint256 bondAmount;
        uint256 depositedAmount;
        address depositor;
        uint256 lockedUntil;
        bool isActive;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BOND MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Post bond for a HookLicense
    /// @dev Protocol posts bond to obtain HookLicense access
    /// @param licenseId The license ID
    function postBond(uint256 licenseId) external;

    /// @notice Post bond with specific amount
    /// @param licenseId The license ID
    /// @param amount The bond amount
    function postBondWithAmount(uint256 licenseId, uint256 amount) external;

    /// @notice Release bond after service completion
    /// @param licenseId The license ID
    function releaseBond(uint256 licenseId) external;

    /// @notice Slash bond for service failure
    /// @param licenseId The license ID
    /// @param slashAmount Amount to slash
    /// @param reason Slashing reason
    function slashBond(uint256 licenseId, uint256 slashAmount, string calldata reason) external;

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get bond details for a license
    /// @param licenseId The license ID
    /// @return details The bond details
    function getBondDetails(uint256 licenseId) external view returns (BondDetails memory details);

    /// @notice Get required bond amount for a license
    /// @param licenseId The license ID
    /// @return token The payment token
    /// @return amount The required bond amount
    function getRequiredBond(uint256 licenseId) external view returns (IERC20 token, uint256 amount);

    /// @notice Check if bond is posted for a license
    /// @param licenseId The license ID
    /// @return isPosted Whether bond is posted
    function isBondPosted(uint256 licenseId) external view returns (bool isPosted);

    /// @notice Get the market oracle
    /// @return oracle The market oracle address
    function getMarketOracle() external view returns (address oracle);

    /// @notice Get the deposit strategy
    /// @return strategy The strategy manager address
    function getDepositStrategy() external view returns (address strategy);
}
