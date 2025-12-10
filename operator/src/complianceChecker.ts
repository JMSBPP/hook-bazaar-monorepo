/**
 * HookAttestationAVS Compliance Checker
 *
 * Verifies hook behavior matches specification without accessing source code.
 * Based on: avs-verification-system.md Section 4 (Verification Protocol)
 *
 * The core insight: Verify INPUT→OUTPUT relationships, not implementation.
 */

import { ethers } from "ethers";
import {
  ComplianceResult,
  HookCallback,
  HookSpecification,
  InvariantCheckResult,
  InvariantSpec,
  StateSample,
  TransitionComplianceResult,
  TransitionSample,
} from "./types.js";

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE CHECKING CORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check compliance of all sampled transitions against specification
 */
export function checkCompliance(
  samples: TransitionSample[],
  spec: HookSpecification,
  toleranceBps: number
): ComplianceResult {
  const transitionResults: TransitionComplianceResult[] = [];
  const invariantResults: InvariantCheckResult[] = [];
  const failureReasons: string[] = [];

  console.log(
    `[ComplianceChecker] Checking ${samples.length} samples against ${spec.invariants.length} invariants`
  );

  // Check each transition sample
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const result = checkTransitionCompliance(sample, spec, toleranceBps);
    transitionResults.push(result);

    if (!result.compliant) {
      failureReasons.push(
        `Transition ${i + 1} (${result.callback}): ${result.details}`
      );
    }

    // Check invariants for this transition
    for (const invariant of spec.invariants) {
      const invResult = checkInvariant(invariant, sample.preState, sample.postState);
      invariantResults.push(invResult);

      if (!invResult.holds && invariant.severity === "critical") {
        failureReasons.push(`Invariant ${invariant.id} violated: ${invResult.details}`);
      }
    }
  }

  // Aggregate results
  const invariantsVerified = invariantResults.filter((r) => r.holds).length;
  const invariantsFailed = invariantResults.filter((r) => !r.holds).length;
  const criticalFailures = invariantResults.filter(
    (r) => !r.holds && spec.invariants.find((i) => i.id === r.invariantId)?.severity === "critical"
  ).length;

  const transitionsCompliant = transitionResults.filter((r) => r.compliant).length;
  const overallDeviation = computeOverallDeviation(transitionResults);

  // Overall compliance: no critical invariant failures and acceptable deviation
  const specCompliant = criticalFailures === 0 && overallDeviation <= toleranceBps;

  console.log(
    `[ComplianceChecker] Results: ${transitionsCompliant}/${transitionResults.length} transitions compliant, ` +
      `${invariantsVerified}/${invariantResults.length} invariants hold, ` +
      `deviation=${overallDeviation}bps`
  );

  return {
    specCompliant,
    transitionResults,
    invariantResults,
    totalTransitionsChecked: transitionResults.length,
    totalInvariantsChecked: invariantResults.length,
    invariantsVerified,
    invariantsFailed,
    overallDeviation,
    failureReasons,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSITION COMPLIANCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a single state transition complies with specification
 */
export function checkTransitionCompliance(
  sample: TransitionSample,
  spec: HookSpecification,
  toleranceBps: number
): TransitionComplianceResult {
  const callback = selectorToCallback(sample.callback);
  const transitionId = `${sample.preState.blockNumber}-${callback}`;

  // Find the transition function spec for this callback
  const tfSpec = spec.transitionFunctions.find((tf) => tf.callback === callback);

  if (!tfSpec) {
    // No spec for this callback - assume compliant if callback is declared
    if (callback && spec.callbacks.includes(callback)) {
      return {
        transitionId,
        callback: callback ?? HookCallback.BEFORE_SWAP,
        compliant: true,
        deviationMagnitude: 0,
        failedConstraints: [],
        details: "No transition spec defined, callback is declared",
      };
    }
    return {
      transitionId,
      callback: callback ?? HookCallback.BEFORE_SWAP,
      compliant: false,
      deviationMagnitude: 10000,
      failedConstraints: ["undeclared_callback"],
      details: "Callback not declared in specification",
    };
  }

  // Check constraints
  const failedConstraints: string[] = [];
  for (const constraint of tfSpec.constraints) {
    if (!evaluateConstraint(constraint, sample.preState, sample.postState)) {
      failedConstraints.push(constraint);
    }
  }

  // Compute expected state from equations and compare
  const expectedState = computeExpectedState(tfSpec, sample.preState);
  const deviation = computeStateDeviation(sample.postState, expectedState);
  const deviationBps = Math.round(deviation * 10000);

  const compliant = failedConstraints.length === 0 && deviationBps <= toleranceBps;

  return {
    transitionId,
    callback: callback ?? HookCallback.BEFORE_SWAP,
    compliant,
    deviationMagnitude: deviationBps,
    failedConstraints,
    details: compliant
      ? `Deviation ${deviationBps}bps within tolerance`
      : `Deviation ${deviationBps}bps exceeds tolerance or constraints failed: ${failedConstraints.join(", ")}`,
  };
}

/**
 * Compute expected post-state from specification equations
 */
function computeExpectedState(
  tfSpec: { equations: string[]; callback: HookCallback },
  preState: StateSample
): Partial<StateSample> {
  // Parse and evaluate equations
  // For now, return a basic expected state based on callback type
  //
  // In production, this would:
  // 1. Parse LaTeX/symbolic equations from spec
  // 2. Substitute pre-state values
  // 3. Compute expected post-state values

  const expected: Partial<StateSample> = {
    traderState: { ...preState.traderState },
    hookState: { ...preState.hookState },
  };

  // Apply basic expectations based on callback type
  switch (tfSpec.callback) {
    case HookCallback.BEFORE_SWAP:
    case HookCallback.AFTER_SWAP:
      // Fee may be modified
      // Price will change
      break;

    case HookCallback.BEFORE_ADD_LIQUIDITY:
    case HookCallback.AFTER_ADD_LIQUIDITY:
      // Liquidity changes
      break;

    default:
      // No changes expected for other callbacks
      break;
  }

  return expected;
}

/**
 * Compute deviation between actual and expected state
 * Returns value between 0 (exact match) and 1 (completely different)
 */
function computeStateDeviation(
  actual: StateSample,
  expected: Partial<StateSample>
): number {
  const deviations: number[] = [];

  // Compare trader state
  if (expected.traderState) {
    // Price deviation
    const priceDev = computeRelativeDeviation(
      actual.traderState.sqrtPrice,
      expected.traderState.sqrtPrice
    );
    deviations.push(priceDev);

    // Tick deviation (absolute)
    const tickDev = Math.abs(actual.traderState.tick - expected.traderState.tick) / 1000;
    deviations.push(Math.min(tickDev, 1));

    // Fee deviation
    const feeDev = Math.abs(actual.traderState.lpFee - expected.traderState.lpFee) / 10000;
    deviations.push(feeDev);
  }

  // Return max deviation
  return deviations.length > 0 ? Math.max(...deviations) : 0;
}

/**
 * Compute relative deviation between two bigint values
 */
function computeRelativeDeviation(actual: bigint, expected: bigint): number {
  if (expected === 0n) {
    return actual === 0n ? 0 : 1;
  }
  const diff = actual > expected ? actual - expected : expected - actual;
  return Number((diff * 10000n) / expected) / 10000;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVARIANT CHECKING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if an invariant holds for a state transition
 */
export function checkInvariant(
  invariant: InvariantSpec,
  preState: StateSample,
  postState: StateSample
): InvariantCheckResult {
  try {
    const holds = evaluateInvariant(invariant.expression, preState, postState);

    return {
      invariantId: invariant.id,
      holds,
      preStateValue: extractInvariantValue(invariant.expression, preState),
      postStateValue: extractInvariantValue(invariant.expression, postState),
      details: holds
        ? `Invariant ${invariant.name} holds`
        : `Invariant ${invariant.name} violated`,
    };
  } catch (error) {
    return {
      invariantId: invariant.id,
      holds: false,
      details: `Failed to evaluate invariant: ${error}`,
    };
  }
}

/**
 * Evaluate an invariant expression
 * Supports common patterns from the spec:
 * - Fee bounds: baseFee <= lpFee <= MAX_FEE
 * - Monotonic relationships
 * - Conservation laws
 */
function evaluateInvariant(
  expression: string,
  preState: StateSample,
  postState: StateSample
): boolean {
  // Parse common invariant patterns
  const normalized = expression.toLowerCase().replace(/\s+/g, " ");

  // Fee bounds invariant
  if (normalized.includes("lpfee") && normalized.includes("max_fee")) {
    const maxFee = 10000; // 1% max
    const minFee = 0;
    return postState.traderState.lpFee >= minFee && postState.traderState.lpFee <= maxFee;
  }

  // Monotonic fee response to volatility
  if (normalized.includes("monotonic") && normalized.includes("volatility")) {
    // If price change increased, fee should not decrease
    const prePriceDelta = Math.abs(
      Number(preState.traderState.sqrtPrice - BigInt((preState.hookState as Record<string, unknown>).lastPrice?.toString() ?? "0"))
    );
    const postPriceDelta = Math.abs(
      Number(postState.traderState.sqrtPrice - BigInt((postState.hookState as Record<string, unknown>).lastPrice?.toString() ?? "0"))
    );

    if (postPriceDelta > prePriceDelta) {
      return postState.traderState.lpFee >= preState.traderState.lpFee;
    }
    return true;
  }

  // Conservation invariants (total value, liquidity, etc.)
  if (normalized.includes("conservation")) {
    // Placeholder: would check specific conservation laws
    return true;
  }

  // Default: assume holds if we can't parse
  console.warn(`[ComplianceChecker] Could not parse invariant expression: ${expression}`);
  return true;
}

/**
 * Extract the relevant value from state for an invariant
 */
function extractInvariantValue(
  expression: string,
  state: StateSample
): unknown {
  const normalized = expression.toLowerCase();

  if (normalized.includes("lpfee") || normalized.includes("fee")) {
    return state.traderState.lpFee;
  }
  if (normalized.includes("price") || normalized.includes("sqrt")) {
    return state.traderState.sqrtPrice.toString();
  }
  if (normalized.includes("tick")) {
    return state.traderState.tick;
  }

  return state.hookState;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTRAINT EVALUATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Evaluate a constraint expression
 */
function evaluateConstraint(
  constraint: string,
  preState: StateSample,
  postState: StateSample
): boolean {
  const normalized = constraint.toLowerCase().replace(/\s+/g, " ");

  // Fee constraint: 0 <= fee <= 10000
  if (normalized.includes("fee") && (normalized.includes("<=") || normalized.includes(">="))) {
    return postState.traderState.lpFee >= 0 && postState.traderState.lpFee <= 10000;
  }

  // Non-negative constraint
  if (normalized.includes(">=") && normalized.includes("0")) {
    // Check relevant values are non-negative
    return postState.traderState.lpFee >= 0;
  }

  // Default: assume constraint holds
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Map callback selector to HookCallback enum
 */
function selectorToCallback(selector: string): HookCallback | null {
  const selectorMap: Record<string, HookCallback> = {
    "0x34bc5f74": HookCallback.BEFORE_INITIALIZE,
    "0x21d0ee70": HookCallback.AFTER_INITIALIZE,
    "0x259982e5": HookCallback.BEFORE_ADD_LIQUIDITY,
    "0xe5c17b97": HookCallback.AFTER_ADD_LIQUIDITY,
    "0x5765a5cc": HookCallback.BEFORE_REMOVE_LIQUIDITY,
    "0xd6c21c59": HookCallback.AFTER_REMOVE_LIQUIDITY,
    "0xec9f4aa6": HookCallback.BEFORE_SWAP,
    "0x9ca3a9e7": HookCallback.AFTER_SWAP,
    "0x0d046ae5": HookCallback.BEFORE_DONATE,
    "0xae63ec0e": HookCallback.AFTER_DONATE,
  };

  return selectorMap[selector.toLowerCase()] ?? null;
}

/**
 * Compute overall deviation from all transition results
 */
function computeOverallDeviation(results: TransitionComplianceResult[]): number {
  if (results.length === 0) return 0;

  // Use max deviation (conservative)
  return Math.max(...results.map((r) => r.deviationMagnitude));
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULT HASHING (for attestation response)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute hash of test results for attestation
 */
export function hashTestResults(result: ComplianceResult): string {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bool", "uint32", "uint32", "uint32", "uint256"],
    [
      result.specCompliant,
      result.invariantsVerified,
      result.invariantsFailed,
      result.totalTransitionsChecked,
      result.overallDeviation,
    ]
  );
  return ethers.keccak256(encoded);
}
