// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnableUpgradeable} from "@openzeppelin-upgrades/contracts/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IEscrowCoordinator} from "./interfaces/IEscrowCoordinator.sol";
import {IHooksOperatorAVSTypes} from "./interfaces/IHooksOperatorAVSTypes.sol";

/// @notice Market oracle interface for bond pricing
interface IMarketOracleSimple {
    function getBondDetails(uint256 licenseId) external view returns (IERC20 token, uint256 amount);
}

/// @notice Strategy manager interface for deposits
interface IStrategyManagerSimple {
    function deposit(address strategy, IERC20 token, uint256 amount) external;
    function withdraw(address strategy, IERC20 token, uint256 amount) external;
}

/// @title EscrowCoordinator
/// @notice Manages escrow-conditioned service delivery for HookLicenses
/// @dev Handles bond posting and release for HaaS engagement
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
contract EscrowCoordinator is IEscrowCoordinator, OwnableUpgradeable {
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Market oracle for bond pricing
    address public marketOracle;

    /// @notice Strategy manager for deposits
    address public depositStrategy;

    /// @notice Vendor management contract
    address public vendorManagement;

    /// @notice Bond lock period (7 days)
    uint256 public constant BOND_LOCK_PERIOD = 7 days;

    /// @notice License ID => bond details
    mapping(uint256 => BondDetails) private _bonds;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor() {
        _disableInitializers();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    function initialize(
        address _marketOracle,
        address _depositStrategy,
        address _vendorManagement,
        address initialOwner
    ) external initializer {
        __Ownable_init();
        if (initialOwner != msg.sender) {
            _transferOwnership(initialOwner);
        }
        marketOracle = _marketOracle;
        depositStrategy = _depositStrategy;
        vendorManagement = _vendorManagement;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BOND MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IEscrowCoordinator
    function postBond(uint256 licenseId) external {
        (IERC20 token, uint256 amount) = IMarketOracleSimple(marketOracle).getBondDetails(licenseId);
        _postBond(licenseId, token, amount);
    }

    /// @inheritdoc IEscrowCoordinator
    function postBondWithAmount(uint256 licenseId, uint256 amount) external {
        (IERC20 token, uint256 requiredAmount) = IMarketOracleSimple(marketOracle).getBondDetails(licenseId);
        if (amount < requiredAmount) revert EscrowCoordinator__InsufficientBond();
        _postBond(licenseId, token, amount);
    }

    function _postBond(uint256 licenseId, IERC20 token, uint256 amount) internal {
        if (_bonds[licenseId].isActive) revert EscrowCoordinator__BondAlreadyPosted();

        // Transfer tokens from depositor
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Deposit into strategy manager
        token.safeIncreaseAllowance(depositStrategy, amount);
        IStrategyManagerSimple(depositStrategy).deposit(vendorManagement, token, amount);

        // Record bond
        _bonds[licenseId] = BondDetails({
            paymentToken: token,
            bondAmount: amount,
            depositedAmount: amount,
            depositor: msg.sender,
            lockedUntil: block.timestamp + BOND_LOCK_PERIOD,
            isActive: true
        });

        emit BondPosted(licenseId, msg.sender, address(token), amount);
    }

    /// @inheritdoc IEscrowCoordinator
    function releaseBond(uint256 licenseId) external {
        BondDetails storage bond = _bonds[licenseId];

        if (!bond.isActive) revert EscrowCoordinator__BondNotPosted();
        if (block.timestamp < bond.lockedUntil) revert EscrowCoordinator__BondLocked();

        // Only depositor or owner can release
        if (msg.sender != bond.depositor && msg.sender != owner()) {
            revert EscrowCoordinator__Unauthorized();
        }

        uint256 amount = bond.depositedAmount;
        address recipient = bond.depositor;
        IERC20 token = bond.paymentToken;

        // Withdraw from strategy
        IStrategyManagerSimple(depositStrategy).withdraw(vendorManagement, token, amount);

        // Transfer back to depositor
        token.safeTransfer(recipient, amount);

        // Clear bond
        bond.isActive = false;
        bond.depositedAmount = 0;

        emit BondReleased(licenseId, recipient, address(token), amount);
    }

    /// @inheritdoc IEscrowCoordinator
    function slashBond(uint256 licenseId, uint256 slashAmount, string calldata reason) external onlyOwner {
        BondDetails storage bond = _bonds[licenseId];

        if (!bond.isActive) revert EscrowCoordinator__BondNotPosted();
        if (slashAmount > bond.depositedAmount) {
            slashAmount = bond.depositedAmount;
        }

        // Reduce deposited amount
        bond.depositedAmount -= slashAmount;

        // Transfer slashed amount to treasury (owner)
        IStrategyManagerSimple(depositStrategy).withdraw(vendorManagement, bond.paymentToken, slashAmount);
        bond.paymentToken.safeTransfer(owner(), slashAmount);

        emit BondSlashed(licenseId, bond.depositor, slashAmount, reason);

        // If fully slashed, deactivate bond
        if (bond.depositedAmount == 0) {
            bond.isActive = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc IEscrowCoordinator
    function getBondDetails(uint256 licenseId) external view returns (BondDetails memory) {
        return _bonds[licenseId];
    }

    /// @inheritdoc IEscrowCoordinator
    function getRequiredBond(uint256 licenseId) external view returns (IERC20 token, uint256 amount) {
        return IMarketOracleSimple(marketOracle).getBondDetails(licenseId);
    }

    /// @inheritdoc IEscrowCoordinator
    function isBondPosted(uint256 licenseId) external view returns (bool) {
        return _bonds[licenseId].isActive;
    }

    /// @inheritdoc IEscrowCoordinator
    function getMarketOracle() external view returns (address) {
        return marketOracle;
    }

    /// @inheritdoc IEscrowCoordinator
    function getDepositStrategy() external view returns (address) {
        return depositStrategy;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function setMarketOracle(address _marketOracle) external onlyOwner {
        marketOracle = _marketOracle;
    }

    function setDepositStrategy(address _depositStrategy) external onlyOwner {
        depositStrategy = _depositStrategy;
    }

    function setVendorManagement(address _vendorManagement) external onlyOwner {
        vendorManagement = _vendorManagement;
    }

    // Storage gap for upgrades
    uint256[44] private __gap;
}
