// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IHooksOperatorAVSTypes
/// @notice Type definitions for the Hook Attestation AVS system
/// @dev Types for attestation tasks, verification results, and slashing conditions
/// @dev Reference: docs/hook-pkg/architecture/avs-verification-system.md
interface IHooksOperatorAVSTypes {

    // ═══════════════════════════════════════════════════════════════════════
    // ATTESTATION TASK TYPES
    // Based on Incredible Squaring AVS task pattern
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice An attestation task to verify hook specification compliance
    /// @dev Operators verify hook behavior matches spec WITHOUT seeing source code
    struct AttestationTask {
        /// @dev The hook contract address to verify
        address hook;
        /// @dev IPFS CID of the formal specification
        string specificationURI;
        /// @dev Pool IDs to sample state from
        bytes32[] poolIds;
        /// @dev Callbacks to test (e.g., beforeSwap.selector)
        bytes4[] callbacks;
        /// @dev Number of state samples required
        uint32 sampleCount;
        /// @dev Block when task was created
        uint32 taskCreatedBlock;
        /// @dev Quorum configuration
        bytes quorumNumbers;
        /// @dev Threshold percentage for consensus (basis points)
        uint32 quorumThresholdPercentage;
    }

    /// @notice Response from operators after verification
    struct AttestationResponse {
        /// @dev Reference to the task being responded to
        uint32 referenceTaskIndex;
        /// @dev Whether the hook passes all spec tests
        bool specCompliant;
        /// @dev Hash of all state samples collected
        bytes32 stateSamplesHash;
        /// @dev Hash of test results
        bytes32 testResultsHash;
        /// @dev Number of invariants verified
        uint32 invariantsVerified;
        /// @dev Number of invariants failed
        uint32 invariantsFailed;
    }

    /// @notice Metadata about the response
    struct AttestationResponseMetadata {
        uint32 taskRespondedBlock;
        bytes32 hashOfNonSigners;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATE SAMPLING TYPES
    // For behavioral verification without code disclosure
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice A state sample collected during verification
    struct StateSample {
        /// @dev Block number when sampled
        uint256 blockNumber;
        /// @dev Timestamp when sampled
        uint256 timestamp;
        /// @dev Pool identifier
        bytes32 poolId;
        /// @dev Encoded LP state
        bytes lpState;
        /// @dev Encoded Trader state
        bytes traderState;
        /// @dev Encoded Hook state (hook-specific)
        bytes hookState;
        /// @dev Encoded shared state
        bytes sharedState;
    }

    /// @notice A state transition sample for verification
    struct TransitionSample {
        /// @dev State before callback
        StateSample preState;
        /// @dev Callback executed
        bytes4 callback;
        /// @dev Callback input parameters
        bytes input;
        /// @dev State after callback
        StateSample postState;
        /// @dev Gas consumed
        uint256 gasUsed;
        /// @dev Return data from callback
        bytes returnData;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ATTESTATION REGISTRY TYPES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice On-chain attestation record
    struct Attestation {
        bytes32 attestationId;
        address hook;
        string specificationURI;
        bool isValid;
        uint256 attestedAt;
        uint256 expiresAt;
        uint32 taskIndex;
        bytes32 responsesHash;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HOOK LICENSE / HAAS TYPES
    // HookDeveloper operates HookContracts compliant with HookSpec
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Strategy parameters for quorum weighting
    struct StrategyParams {
        address strategy;
        uint96 multiplier;
    }

    /// @notice Hook license representing permission to operate hook contracts
    struct HookLicense {
        uint256 licenseId;
        StrategyParams[] haasStrategies;
        address socketManager;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SLASHING TYPES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Types of slashable offenses
    enum SlashableOffense {
        FALSE_POSITIVE,           // Attested non-compliant hook as compliant
        FALSE_NEGATIVE,           // Rejected compliant hook
        SAMPLE_MANIPULATION,      // Manipulated verification samples
        OPERATOR_COLLUSION        // Colluded with other operators
    }

    /// @notice Compliance result from spec checker
    struct ComplianceResult {
        bool compliant;
        uint256 deviationMagnitude;
        bytes32 failedInvariant;
        string failureReason;
    }
}
