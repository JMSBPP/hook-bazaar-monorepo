// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

// ═══════════════════════════════════════════════════════════════════════
// IAggregator — interface for combining multi-facet return values
// Invariant: INV-006 — invoked iff >1 facet returns a value
// Invariant: INV-007 — missing aggregator with >1 result reverts
// ═══════════════════════════════════════════════════════════════════════

interface IAggregator {
    /// @notice Combine multiple facet return values into a single result
    /// @param results Array of raw return bytes from each executed facet
    /// @return combined Single combined return value for the PoolManager
    function aggregate(bytes[] calldata results) external pure returns (bytes memory combined);
}
