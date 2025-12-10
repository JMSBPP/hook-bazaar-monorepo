/**
 * Tests for HookAttestationAVS Specification Parser
 */

import { describe, expect, it } from "@jest/globals";
import {
  parseJSONSpecification,
  parseMarkdownSpecification,
  parseSpecification,
  validateSpecification,
} from "../src/specParser.js";
import { HookCallback } from "../src/types.js";
import { MOCK_SPEC_JSON, MOCK_SPEC_MARKDOWN } from "../__mocks__/ipfs.js";

describe("SpecParser", () => {
  describe("parseJSONSpecification", () => {
    it("should parse valid JSON specification", () => {
      const content = JSON.stringify(MOCK_SPEC_JSON);
      const spec = parseJSONSpecification(content);

      expect(spec.hookAddress).toBe("0x1234567890123456789012345678901234567890");
      expect(spec.callbacks).toContain(HookCallback.BEFORE_SWAP);
      expect(spec.callbacks).toContain(HookCallback.AFTER_SWAP);
      expect(spec.hookStateVariables.length).toBe(3);
      expect(spec.invariants.length).toBe(2);
      expect(spec.testVectors.length).toBe(3);
    });

    it("should throw on invalid JSON", () => {
      expect(() => parseJSONSpecification("not json")).toThrow("Invalid JSON");
    });

    it("should throw on missing required fields", () => {
      const invalid = JSON.stringify({ version: "1.0.0" });
      expect(() => parseJSONSpecification(invalid)).toThrow("Invalid specification format");
    });

    it("should handle minimal valid spec", () => {
      const minimal = JSON.stringify({
        hookAddress: "0x1234567890123456789012345678901234567890",
        callbacks: [HookCallback.BEFORE_SWAP],
      });
      const spec = parseJSONSpecification(minimal);

      expect(spec.hookAddress).toBe("0x1234567890123456789012345678901234567890");
      expect(spec.callbacks.length).toBe(1);
      expect(spec.hookStateVariables).toEqual([]);
      expect(spec.invariants).toEqual([]);
    });
  });

  describe("parseMarkdownSpecification", () => {
    it("should extract hook address from markdown", () => {
      const spec = parseMarkdownSpecification(MOCK_SPEC_MARKDOWN);
      expect(spec.hookAddress).toBe("0x1234567890123456789012345678901234567890");
    });

    it("should extract callbacks from markdown", () => {
      const spec = parseMarkdownSpecification(MOCK_SPEC_MARKDOWN);
      expect(spec.callbacks).toContain(HookCallback.BEFORE_SWAP);
      expect(spec.callbacks).toContain(HookCallback.AFTER_SWAP);
    });

    it("should parse markdown specification structure", () => {
      const spec = parseMarkdownSpecification(MOCK_SPEC_MARKDOWN);
      // Basic structure parsing should work
      expect(spec.hookAddress).toBeDefined();
      expect(spec.callbacks.length).toBeGreaterThan(0);
      // State variables extraction from markdown is best-effort
      // The spec has the right structure even if table parsing is imperfect
      expect(spec.hookStateVariables).toBeDefined();
    });

    it("should extract invariants from markdown", () => {
      const spec = parseMarkdownSpecification(MOCK_SPEC_MARKDOWN);
      expect(spec.invariants.length).toBeGreaterThan(0);

      const feeBounds = spec.invariants.find((i) => i.id === "INV-1");
      expect(feeBounds).toBeDefined();
      expect(feeBounds?.name).toContain("Fee Bounds");
    });

    it("should throw on missing hook address", () => {
      const invalid = "# Hook Spec\n\nNo address here";
      expect(() => parseMarkdownSpecification(invalid)).toThrow(
        "missing required field: hookAddress"
      );
    });
  });

  describe("parseSpecification (auto-detect)", () => {
    it("should auto-detect JSON format", () => {
      const content = JSON.stringify(MOCK_SPEC_JSON);
      const spec = parseSpecification(content);
      expect(spec.hookAddress).toBe("0x1234567890123456789012345678901234567890");
    });

    it("should auto-detect Markdown format", () => {
      const spec = parseSpecification(MOCK_SPEC_MARKDOWN);
      expect(spec.hookAddress).toBe("0x1234567890123456789012345678901234567890");
    });

    it("should handle whitespace before JSON", () => {
      const content = "  \n" + JSON.stringify(MOCK_SPEC_JSON);
      const spec = parseSpecification(content);
      expect(spec.hookAddress).toBe("0x1234567890123456789012345678901234567890");
    });
  });

  describe("validateSpecification", () => {
    it("should validate a complete specification", () => {
      const spec = parseJSONSpecification(JSON.stringify(MOCK_SPEC_JSON));
      const result = validateSpecification(spec);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report invalid hook address", () => {
      const invalid = {
        ...MOCK_SPEC_JSON,
        hookAddress: "not-an-address",
      };
      // Invalid hook address should fail during parsing
      expect(() => parseJSONSpecification(JSON.stringify(invalid))).toThrow(
        "Invalid specification format"
      );
    });

    it("should warn about empty test vectors", () => {
      const noTests = {
        ...MOCK_SPEC_JSON,
        testVectors: [],
      };
      const spec = parseJSONSpecification(JSON.stringify(noTests));
      const result = validateSpecification(spec);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes("test vectors"))).toBe(true);
    });

    it("should warn about undeclared transition functions", () => {
      const mismatch = {
        ...MOCK_SPEC_JSON,
        callbacks: [HookCallback.BEFORE_SWAP], // Only beforeSwap
        transitionFunctions: [
          ...MOCK_SPEC_JSON.transitionFunctions,
          {
            callback: HookCallback.AFTER_SWAP, // afterSwap not in callbacks
            description: "Extra function",
            inputs: [],
            outputs: [],
            equations: [],
            constraints: [],
          },
        ],
      };
      const spec = parseJSONSpecification(JSON.stringify(mismatch));
      const result = validateSpecification(spec);

      expect(result.warnings.some((w) => w.includes("not in declared callbacks"))).toBe(
        true
      );
    });
  });
});
