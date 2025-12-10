/**
 * HookAttestationAVS Task Processor
 *
 * Pure processing logic for attestation tasks.
 * Orchestrates: spec parsing → state sampling → compliance checking → response creation
 *
 * Based on: avs-verification-system.md Section 3.3 (Operator Verification Logic)
 */

import { ethers } from "ethers";
import { checkCompliance, hashTestResults } from "./complianceChecker.js";
import { fetchAndParseSpecification } from "./specParser.js";
import {
  createMockStateView,
  hashStateSamples,
  IStateViewContract,
  sampleStatesForTask,
} from "./stateSampler.js";
import {
  AttestationResponse,
  AttestationTask,
  ComplianceResult,
  HookSpecification,
  TaskProcessingResult,
  TransitionSample,
} from "./types.js";

// ═══════════════════════════════════════════════════════════════════════════════
// TASK PROCESSOR DEPENDENCIES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProcessorDependencies {
  provider: ethers.Provider;
  stateView: IStateViewContract;
  ipfsGateway: string;
  complianceTolerance: number;
  dryRun: boolean;
}

/**
 * Create mock dependencies for testing
 */
export function createMockDependencies(
  overrides?: Partial<ProcessorDependencies>
): ProcessorDependencies {
  return {
    provider: new ethers.JsonRpcProvider("http://127.0.0.1:8545"),
    stateView: createMockStateView(),
    ipfsGateway: "https://ipfs.io/ipfs/",
    complianceTolerance: 100, // 1%
    dryRun: true,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASK PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process an attestation task end-to-end
 *
 * Workflow (from avs-verification-system.md Section 3.3):
 * 1. RECEIVE TASK - Parse task, fetch specification
 * 2. SAMPLE STATE - Collect pre/post state for each callback
 * 3. EXECUTE CALLBACKS - Run callbacks as black box
 * 4. VERIFY AGAINST SPEC - Compare actual vs expected
 * 5. AGGREGATE RESULTS - Compute hashes, counts
 * 6. SIGN & SUBMIT - Create response (signing done externally)
 */
export async function processAttestationTask(
  task: AttestationTask,
  taskIndex: number,
  deps: ProcessorDependencies
): Promise<TaskProcessingResult> {
  const startTime = Date.now();
  console.log(`\n[Processor] ═══════════════════════════════════════════════════`);
  console.log(`[Processor] Processing task #${taskIndex}`);
  console.log(`[Processor] Hook: ${task.hook}`);
  console.log(`[Processor] Specification: ${task.specificationURI}`);
  console.log(`[Processor] Pools: ${task.poolIds.length}, Callbacks: ${task.callbacks.length}`);
  console.log(`[Processor] Samples required: ${task.sampleCount}`);

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: FETCH AND PARSE SPECIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[Processor] Step 1: Fetching specification...`);
    const spec = await fetchAndParseSpecification(task.specificationURI, deps.ipfsGateway);

    // Validate hook address matches
    if (spec.hookAddress.toLowerCase() !== task.hook.toLowerCase()) {
      throw new Error(
        `Specification hook address ${spec.hookAddress} does not match task hook ${task.hook}`
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2 & 3: SAMPLE STATE AND EXECUTE CALLBACKS
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[Processor] Step 2-3: Sampling state transitions...`);
    const samples = await sampleStatesForTask(
      task,
      spec,
      deps.stateView,
      deps.provider,
      (completed, total, pool) => {
        if (completed % 10 === 0 || completed === total) {
          console.log(`[Processor] Sampling progress: ${completed}/${total} (pool: ${pool.slice(0, 10)}...)`);
        }
      }
    );

    if (samples.length === 0) {
      throw new Error("No state samples collected");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: VERIFY AGAINST SPECIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[Processor] Step 4: Verifying compliance...`);
    const complianceResult = checkCompliance(samples, spec, deps.complianceTolerance);

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: AGGREGATE RESULTS
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[Processor] Step 5: Aggregating results...`);
    const response = createAttestationResponse(
      taskIndex,
      samples,
      complianceResult
    );

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6: RETURN (signing and submission done by caller)
    // ─────────────────────────────────────────────────────────────────────────
    const processingTimeMs = Date.now() - startTime;
    console.log(`\n[Processor] ═══════════════════════════════════════════════════`);
    console.log(`[Processor] Task #${taskIndex} completed in ${processingTimeMs}ms`);
    console.log(`[Processor] Spec Compliant: ${response.specCompliant}`);
    console.log(`[Processor] Invariants: ${response.invariantsVerified} verified, ${response.invariantsFailed} failed`);
    console.log(`[Processor] ═══════════════════════════════════════════════════\n`);

    return {
      taskIndex,
      success: true,
      response,
      processingTimeMs,
      samplesCollected: samples.length,
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`\n[Processor] Task #${taskIndex} FAILED: ${errorMessage}`);

    return {
      taskIndex,
      success: false,
      error: errorMessage,
      processingTimeMs,
      samplesCollected: 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE CREATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create an attestation response from processing results
 */
export function createAttestationResponse(
  taskIndex: number,
  samples: TransitionSample[],
  complianceResult: ComplianceResult
): AttestationResponse {
  return {
    referenceTaskIndex: taskIndex,
    specCompliant: complianceResult.specCompliant,
    stateSamplesHash: hashStateSamples(samples),
    testResultsHash: hashTestResults(complianceResult),
    invariantsVerified: complianceResult.invariantsVerified,
    invariantsFailed: complianceResult.invariantsFailed,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process multiple tasks in sequence
 */
export async function processTaskBatch(
  tasks: { task: AttestationTask; taskIndex: number }[],
  deps: ProcessorDependencies
): Promise<TaskProcessingResult[]> {
  const results: TaskProcessingResult[] = [];

  for (const { task, taskIndex } of tasks) {
    const result = await processAttestationTask(task, taskIndex, deps);
    results.push(result);

    // Small delay between tasks
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULT SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Summarize batch processing results
 */
export function summarizeResults(results: TaskProcessingResult[]): {
  total: number;
  successful: number;
  failed: number;
  compliant: number;
  nonCompliant: number;
  totalSamples: number;
  avgProcessingTimeMs: number;
} {
  const successful = results.filter((r) => r.success);
  const compliant = successful.filter((r) => r.response?.specCompliant);

  return {
    total: results.length,
    successful: successful.length,
    failed: results.length - successful.length,
    compliant: compliant.length,
    nonCompliant: successful.length - compliant.length,
    totalSamples: results.reduce((sum, r) => sum + r.samplesCollected, 0),
    avgProcessingTimeMs:
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.processingTimeMs, 0) / results.length)
        : 0,
  };
}
