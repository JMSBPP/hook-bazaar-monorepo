/**
 * Tests for HookAttestationAVS Task Processor
 */

import { describe, expect, it, jest } from "@jest/globals";
import {
  createAttestationResponse,
  summarizeResults,
} from "../src/processor.js";
import {
  ComplianceResult,
  TaskProcessingResult,
  TransitionSample,
} from "../src/types.js";

describe("Processor", () => {
  describe("createAttestationResponse", () => {
    it("should create response with correct structure", () => {
      // Use full bytes32 pool IDs for proper encoding
      const poolId = "0x1234567890123456789012345678901234567890123456789012345678901234";

      const samples: TransitionSample[] = [
        {
          preState: {
            blockNumber: 1000,
            timestamp: 1700000000,
            poolId,
            traderState: { sqrtPrice: 1n, tick: 0, lpFee: 3000, protocolFee: 0 },
            hookState: {},
            sharedState: { feeGrowthGlobal0X128: 0n, feeGrowthGlobal1X128: 0n },
          },
          callback: "0xec9f4aa6",
          input: "0x",
          postState: {
            blockNumber: 1001,
            timestamp: 1700000012,
            poolId,
            traderState: { sqrtPrice: 1n, tick: 0, lpFee: 3000, protocolFee: 0 },
            hookState: {},
            sharedState: { feeGrowthGlobal0X128: 0n, feeGrowthGlobal1X128: 0n },
          },
          gasUsed: 50000n,
          returnData: "0x",
        },
      ];

      const complianceResult: ComplianceResult = {
        specCompliant: true,
        transitionResults: [],
        invariantResults: [],
        totalTransitionsChecked: 1,
        totalInvariantsChecked: 1,
        invariantsVerified: 1,
        invariantsFailed: 0,
        overallDeviation: 50,
        failureReasons: [],
      };

      const response = createAttestationResponse(5, samples, complianceResult);

      expect(response.referenceTaskIndex).toBe(5);
      expect(response.specCompliant).toBe(true);
      expect(response.invariantsVerified).toBe(1);
      expect(response.invariantsFailed).toBe(0);
      expect(response.stateSamplesHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(response.testResultsHash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it("should create response with failing compliance", () => {
      // Use full bytes32 pool IDs for proper encoding
      const poolId = "0x1234567890123456789012345678901234567890123456789012345678901234";

      const samples: TransitionSample[] = [
        {
          preState: {
            blockNumber: 1000,
            timestamp: 1700000000,
            poolId,
            traderState: { sqrtPrice: 1n, tick: 0, lpFee: 3000, protocolFee: 0 },
            hookState: {},
            sharedState: { feeGrowthGlobal0X128: 0n, feeGrowthGlobal1X128: 0n },
          },
          callback: "0xec9f4aa6",
          input: "0x",
          postState: {
            blockNumber: 1001,
            timestamp: 1700000012,
            poolId,
            traderState: { sqrtPrice: 1n, tick: 0, lpFee: 15000, protocolFee: 0 },
            hookState: {},
            sharedState: { feeGrowthGlobal0X128: 0n, feeGrowthGlobal1X128: 0n },
          },
          gasUsed: 50000n,
          returnData: "0x",
        },
      ];

      const complianceResult: ComplianceResult = {
        specCompliant: false,
        transitionResults: [],
        invariantResults: [],
        totalTransitionsChecked: 1,
        totalInvariantsChecked: 1,
        invariantsVerified: 0,
        invariantsFailed: 1,
        overallDeviation: 500,
        failureReasons: ["Fee out of bounds"],
      };

      const response = createAttestationResponse(10, samples, complianceResult);

      expect(response.referenceTaskIndex).toBe(10);
      expect(response.specCompliant).toBe(false);
      expect(response.invariantsVerified).toBe(0);
      expect(response.invariantsFailed).toBe(1);
    });
  });

  describe("summarizeResults", () => {
    it("should correctly summarize batch results", () => {
      const results: TaskProcessingResult[] = [
        {
          taskIndex: 1,
          success: true,
          response: {
            referenceTaskIndex: 1,
            specCompliant: true,
            stateSamplesHash: "0x1",
            testResultsHash: "0x1",
            invariantsVerified: 5,
            invariantsFailed: 0,
          },
          processingTimeMs: 1000,
          samplesCollected: 10,
        },
        {
          taskIndex: 2,
          success: true,
          response: {
            referenceTaskIndex: 2,
            specCompliant: false,
            stateSamplesHash: "0x2",
            testResultsHash: "0x2",
            invariantsVerified: 3,
            invariantsFailed: 2,
          },
          processingTimeMs: 1500,
          samplesCollected: 10,
        },
        {
          taskIndex: 3,
          success: false,
          error: "Failed to fetch spec",
          processingTimeMs: 500,
          samplesCollected: 0,
        },
      ];

      const summary = summarizeResults(results);

      expect(summary.total).toBe(3);
      expect(summary.successful).toBe(2);
      expect(summary.failed).toBe(1);
      expect(summary.compliant).toBe(1);
      expect(summary.nonCompliant).toBe(1);
      expect(summary.totalSamples).toBe(20);
      expect(summary.avgProcessingTimeMs).toBe(1000); // (1000 + 1500 + 500) / 3
    });

    it("should handle empty results", () => {
      const summary = summarizeResults([]);

      expect(summary.total).toBe(0);
      expect(summary.successful).toBe(0);
      expect(summary.avgProcessingTimeMs).toBe(0);
    });

    it("should handle all failing results", () => {
      const results: TaskProcessingResult[] = [
        {
          taskIndex: 1,
          success: false,
          error: "Error 1",
          processingTimeMs: 100,
          samplesCollected: 0,
        },
        {
          taskIndex: 2,
          success: false,
          error: "Error 2",
          processingTimeMs: 200,
          samplesCollected: 0,
        },
      ];

      const summary = summarizeResults(results);

      expect(summary.total).toBe(2);
      expect(summary.successful).toBe(0);
      expect(summary.failed).toBe(2);
      expect(summary.compliant).toBe(0);
      expect(summary.nonCompliant).toBe(0);
    });

    it("should handle all compliant results", () => {
      const results: TaskProcessingResult[] = [
        {
          taskIndex: 1,
          success: true,
          response: {
            referenceTaskIndex: 1,
            specCompliant: true,
            stateSamplesHash: "0x1",
            testResultsHash: "0x1",
            invariantsVerified: 5,
            invariantsFailed: 0,
          },
          processingTimeMs: 1000,
          samplesCollected: 10,
        },
        {
          taskIndex: 2,
          success: true,
          response: {
            referenceTaskIndex: 2,
            specCompliant: true,
            stateSamplesHash: "0x2",
            testResultsHash: "0x2",
            invariantsVerified: 5,
            invariantsFailed: 0,
          },
          processingTimeMs: 1000,
          samplesCollected: 10,
        },
      ];

      const summary = summarizeResults(results);

      expect(summary.total).toBe(2);
      expect(summary.successful).toBe(2);
      expect(summary.compliant).toBe(2);
      expect(summary.nonCompliant).toBe(0);
    });
  });
});
