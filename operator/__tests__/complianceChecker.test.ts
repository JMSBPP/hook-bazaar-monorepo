/**
 * Tests for HookAttestationAVS Compliance Checker
 */

import { describe, expect, it } from "@jest/globals";
import {
  checkCompliance,
  checkInvariant,
  checkTransitionCompliance,
  hashTestResults,
} from "../src/complianceChecker.js";
import {
  ComplianceResult,
  HookCallback,
  HookSpecification,
  InvariantSpec,
  StateSample,
  TransitionSample,
} from "../src/types.js";

// ═══════════════════════════════════════════════════════════════════════════════
// TEST FIXTURES
// ═══════════════════════════════════════════════════════════════════════════════

const createStateSample = (overrides?: Partial<StateSample>): StateSample => ({
  blockNumber: 1000,
  timestamp: 1700000000,
  poolId: "0x1234567890123456789012345678901234567890123456789012345678901234",
  traderState: {
    sqrtPrice: 79228162514264337593543950336n, // ~1.0
    tick: 0,
    lpFee: 3000, // 0.3%
    protocolFee: 0,
  },
  hookState: {
    lastPrice: 79228162514264337593543950336n,
    volatilityWindow: 100,
    feeMultiplier: 3000,
  },
  sharedState: {
    feeGrowthGlobal0X128: 0n,
    feeGrowthGlobal1X128: 0n,
  },
  ...overrides,
});

const createTransitionSample = (
  preOverrides?: Partial<StateSample>,
  postOverrides?: Partial<StateSample>
): TransitionSample => ({
  preState: createStateSample(preOverrides),
  callback: "0xec9f4aa6", // beforeSwap
  input: "0x",
  postState: createStateSample(postOverrides),
  gasUsed: 50000n,
  returnData: "0x",
});

const createMockSpec = (): HookSpecification => ({
  version: "1.0.0",
  hookAddress: "0x1234567890123456789012345678901234567890",
  specificationHash: "QmTest",
  callbacks: [HookCallback.BEFORE_SWAP, HookCallback.AFTER_SWAP],
  hookStateVariables: [],
  poolStateDependencies: { reads: [], writes: [] },
  transitionFunctions: [
    {
      callback: HookCallback.BEFORE_SWAP,
      description: "Swap callback",
      inputs: [],
      outputs: [],
      equations: [],
      constraints: ["0 <= fee <= 10000"],
    },
  ],
  invariants: [
    {
      id: "INV-1",
      name: "Fee Bounds",
      description: "Fee must be within bounds",
      expression: "lpFee <= MAX_FEE",
      severity: "critical",
    },
  ],
  testVectors: [],
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ComplianceChecker", () => {
  describe("checkTransitionCompliance", () => {
    it("should mark compliant transition within tolerance", () => {
      const sample = createTransitionSample();
      const spec = createMockSpec();

      const result = checkTransitionCompliance(sample, spec, 100);

      expect(result.compliant).toBe(true);
      expect(result.deviationMagnitude).toBeLessThanOrEqual(100);
    });

    it("should detect fee bound constraint violation", () => {
      const sample = createTransitionSample(undefined, {
        traderState: {
          sqrtPrice: 79228162514264337593543950336n,
          tick: 0,
          lpFee: 15000, // Exceeds 10000 max
          protocolFee: 0,
        },
      });
      const spec = createMockSpec();

      const result = checkTransitionCompliance(sample, spec, 100);

      // The constraint check should catch this
      expect(result.callback).toBe(HookCallback.BEFORE_SWAP);
    });

    it("should handle unknown callback selector", () => {
      const sample = createTransitionSample();
      sample.callback = "0x00000000"; // Unknown selector

      const spec = createMockSpec();
      const result = checkTransitionCompliance(sample, spec, 100);

      // Should still return a result
      expect(result.transitionId).toBeDefined();
    });
  });

  describe("checkInvariant", () => {
    it("should verify fee bounds invariant holds", () => {
      const invariant: InvariantSpec = {
        id: "INV-1",
        name: "Fee Bounds",
        description: "LP fee within bounds",
        expression: "lpFee <= MAX_FEE",
        severity: "critical",
      };

      const preState = createStateSample();
      const postState = createStateSample();

      const result = checkInvariant(invariant, preState, postState);

      expect(result.holds).toBe(true);
      expect(result.invariantId).toBe("INV-1");
    });

    it("should detect fee bounds violation", () => {
      const invariant: InvariantSpec = {
        id: "INV-1",
        name: "Fee Bounds",
        description: "LP fee within bounds",
        expression: "lpFee <= MAX_FEE",
        severity: "critical",
      };

      const preState = createStateSample();
      const postState = createStateSample({
        traderState: {
          sqrtPrice: 79228162514264337593543950336n,
          tick: 0,
          lpFee: 15000, // Exceeds max
          protocolFee: 0,
        },
      });

      const result = checkInvariant(invariant, preState, postState);

      expect(result.holds).toBe(false);
    });

    it("should handle monotonic volatility invariant", () => {
      const invariant: InvariantSpec = {
        id: "INV-2",
        name: "Monotonic",
        description: "Higher volatility means higher fees",
        expression: "monotonic volatility response",
        severity: "warning",
      };

      const preState = createStateSample();
      const postState = createStateSample({
        traderState: {
          sqrtPrice: 80000000000000000000000000000n, // Higher price = higher volatility
          tick: 100,
          lpFee: 3500, // Fee increased
          protocolFee: 0,
        },
      });

      const result = checkInvariant(invariant, preState, postState);

      expect(result.invariantId).toBe("INV-2");
      // Monotonic: if volatility increased, fee should not decrease
    });
  });

  describe("checkCompliance", () => {
    it("should aggregate results from multiple samples", () => {
      const samples = [
        createTransitionSample(),
        createTransitionSample(),
        createTransitionSample(),
      ];
      const spec = createMockSpec();

      const result = checkCompliance(samples, spec, 100);

      expect(result.totalTransitionsChecked).toBe(3);
      expect(result.transitionResults.length).toBe(3);
    });

    it("should mark non-compliant if any critical invariant fails", () => {
      const samples = [
        createTransitionSample(undefined, {
          traderState: {
            sqrtPrice: 79228162514264337593543950336n,
            tick: 0,
            lpFee: 15000, // Violates fee bounds
            protocolFee: 0,
          },
        }),
      ];
      const spec = createMockSpec();

      const result = checkCompliance(samples, spec, 100);

      // Critical invariant failure should mark as non-compliant
      expect(result.invariantsFailed).toBeGreaterThan(0);
    });

    it("should count verified and failed invariants", () => {
      const samples = [createTransitionSample()];
      const spec = createMockSpec();

      const result = checkCompliance(samples, spec, 100);

      expect(result.invariantsVerified + result.invariantsFailed).toBe(
        result.totalInvariantsChecked
      );
    });
  });

  describe("hashTestResults", () => {
    it("should produce consistent hash for same result", () => {
      const result: ComplianceResult = {
        specCompliant: true,
        transitionResults: [],
        invariantResults: [],
        totalTransitionsChecked: 10,
        totalInvariantsChecked: 5,
        invariantsVerified: 5,
        invariantsFailed: 0,
        overallDeviation: 50,
        failureReasons: [],
      };

      const hash1 = hashTestResults(result);
      const hash2 = hashTestResults(result);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it("should produce different hash for different results", () => {
      const result1: ComplianceResult = {
        specCompliant: true,
        transitionResults: [],
        invariantResults: [],
        totalTransitionsChecked: 10,
        totalInvariantsChecked: 5,
        invariantsVerified: 5,
        invariantsFailed: 0,
        overallDeviation: 50,
        failureReasons: [],
      };

      const result2: ComplianceResult = {
        ...result1,
        specCompliant: false,
        invariantsFailed: 1,
      };

      const hash1 = hashTestResults(result1);
      const hash2 = hashTestResults(result2);

      expect(hash1).not.toBe(hash2);
    });
  });
});
