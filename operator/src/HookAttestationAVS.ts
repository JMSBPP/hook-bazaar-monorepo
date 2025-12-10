/**
 * HookAttestationAVS Operator Runtime
 *
 * Main entry point for the HookAttestationAVS operator.
 * Listens for AttestationTaskCreated events and processes tasks.
 *
 * Based on: avs-verification-system.md
 * Reference: Bonded-hooks/operator/DegenAVS.ts
 */

import { ethers } from "ethers";
import { loadConfig, createMockConfig } from "./config.js";
import {
  createMockDependencies,
  processAttestationTask,
  ProcessorDependencies,
  summarizeResults,
} from "./processor.js";
import { createMockStateView, createStateViewContract } from "./stateSampler.js";
import {
  AttestationTask,
  AttestationResponse,
  TaskProcessingResult,
  TASK_MANAGER_ABI,
} from "./types.js";

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface OperatorState {
  isRunning: boolean;
  lastProcessedTaskIndex: number;
  processedTasks: number;
  successfulTasks: number;
  failedTasks: number;
}

const state: OperatorState = {
  isRunning: false,
  lastProcessedTaskIndex: -1,
  processedTasks: 0,
  successfulTasks: 0,
  failedTasks: 0,
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle AttestationTaskCreated event
 */
async function handleAttestationTaskCreated(
  taskIndex: number,
  task: AttestationTask,
  deps: ProcessorDependencies,
  wallet: ethers.Wallet,
  taskManager: ethers.Contract | null,
  dryRun: boolean
): Promise<void> {
  console.log(`\n[AVS] ════════════════════════════════════════════════════════`);
  console.log(`[AVS] New AttestationTaskCreated event received`);
  console.log(`[AVS] Task Index: ${taskIndex}`);
  console.log(`[AVS] Hook: ${task.hook}`);
  console.log(`[AVS] ════════════════════════════════════════════════════════\n`);

  // Skip if already processed
  if (taskIndex <= state.lastProcessedTaskIndex) {
    console.log(`[AVS] Task ${taskIndex} already processed, skipping`);
    return;
  }

  // Process the task
  const result = await processAttestationTask(task, taskIndex, deps);
  state.processedTasks++;

  if (result.success && result.response) {
    state.successfulTasks++;
    state.lastProcessedTaskIndex = taskIndex;

    if (dryRun) {
      console.log(`[AVS] DRY RUN - Would submit response:`);
      console.log(`[AVS]   specCompliant: ${result.response.specCompliant}`);
      console.log(`[AVS]   invariantsVerified: ${result.response.invariantsVerified}`);
      console.log(`[AVS]   invariantsFailed: ${result.response.invariantsFailed}`);
      console.log(`[AVS]   stateSamplesHash: ${result.response.stateSamplesHash}`);
      console.log(`[AVS]   testResultsHash: ${result.response.testResultsHash}`);
    } else if (taskManager) {
      // Submit response on-chain
      await submitResponse(taskManager, task, result.response, wallet);
    }
  } else {
    state.failedTasks++;
    console.error(`[AVS] Task ${taskIndex} failed: ${result.error}`);
  }

  // Log stats
  console.log(`\n[AVS] Stats: ${state.processedTasks} processed, ${state.successfulTasks} successful, ${state.failedTasks} failed`);
}

/**
 * Submit attestation response to TaskManager
 * TODO: Implement BLS signature aggregation when EigenLayer integration is complete
 */
async function submitResponse(
  taskManager: ethers.Contract,
  task: AttestationTask,
  response: AttestationResponse,
  wallet: ethers.Wallet
): Promise<void> {
  console.log(`[AVS] Submitting response for task ${response.referenceTaskIndex}...`);

  try {
    // NOTE: Full implementation requires BLS signature infrastructure
    // For now, we log the intended submission
    console.log(`[AVS] Response ready for submission:`);
    console.log(`[AVS]   Task: ${JSON.stringify(task, null, 2)}`);
    console.log(`[AVS]   Response: ${JSON.stringify(response, null, 2)}`);

    // TODO: When BLS infrastructure is ready:
    // const nonSignerStakesAndSignature = await aggregateSignatures(response);
    // const tx = await taskManager.respondToAttestationTask(
    //   task,
    //   response,
    //   nonSignerStakesAndSignature
    // );
    // await tx.wait();
    // console.log(`[AVS] Response submitted: ${tx.hash}`);

    console.warn(
      `[AVS] WARNING: BLS signature submission not yet implemented. ` +
        `Response logged but not submitted on-chain.`
    );
  } catch (error) {
    console.error(`[AVS] Failed to submit response: ${error}`);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Start the HookAttestationAVS operator
 */
export async function startOperator(): Promise<void> {
  console.log(`\n`);
  console.log(`╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║           HookAttestationAVS Operator Starting                 ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝`);
  console.log(``);

  // Load configuration
  let config;
  try {
    config = loadConfig();
    console.log(`[AVS] Configuration loaded successfully`);
  } catch (error) {
    console.error(`[AVS] Failed to load configuration: ${error}`);
    console.log(`[AVS] Using mock configuration for testing...`);
    config = createMockConfig();
  }

  console.log(`[AVS] RPC URL: ${config.rpcUrl}`);
  console.log(`[AVS] Task Manager: ${config.taskManagerAddress || "(not configured)"}`);
  console.log(`[AVS] IPFS Gateway: ${config.ipfsGateway}`);
  console.log(`[AVS] Dry Run: ${config.dryRun}`);
  console.log(`[AVS] Compliance Tolerance: ${config.complianceTolerance} bps`);

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  console.log(`[AVS] Operator address: ${wallet.address}`);

  // Create dependencies
  const deps: ProcessorDependencies = {
    provider,
    stateView: config.dryRun
      ? createMockStateView()
      : createStateViewContract(
          process.env.HOOK_STATE_VIEW_ADDRESS ?? "",
          provider
        ),
    ipfsGateway: config.ipfsGateway,
    complianceTolerance: config.complianceTolerance,
    dryRun: config.dryRun,
  };

  // Create task manager contract (if configured)
  let taskManager: ethers.Contract | null = null;
  if (config.taskManagerAddress) {
    taskManager = new ethers.Contract(
      config.taskManagerAddress,
      TASK_MANAGER_ABI,
      wallet
    );
    console.log(`[AVS] Task Manager contract connected`);
  } else {
    console.warn(`[AVS] Task Manager not configured - running in listener-only mode`);
  }

  // Set up event listener
  if (taskManager) {
    console.log(`[AVS] Setting up AttestationTaskCreated event listener...`);

    taskManager.on(
      "AttestationTaskCreated",
      async (
        taskIndex: number,
        taskTuple: {
          hook: string;
          specificationURI: string;
          poolIds: string[];
          callbacks: string[];
          sampleCount: number;
          taskCreatedBlock: number;
          quorumNumbers: string;
          quorumThresholdPercentage: number;
        }
      ) => {
        const task: AttestationTask = {
          hook: taskTuple.hook,
          specificationURI: taskTuple.specificationURI,
          poolIds: taskTuple.poolIds,
          callbacks: taskTuple.callbacks,
          sampleCount: taskTuple.sampleCount,
          taskCreatedBlock: taskTuple.taskCreatedBlock,
          quorumNumbers: taskTuple.quorumNumbers,
          quorumThresholdPercentage: taskTuple.quorumThresholdPercentage,
        };

        await handleAttestationTaskCreated(
          taskIndex,
          task,
          deps,
          wallet,
          taskManager,
          config.dryRun
        );
      }
    );

    console.log(`[AVS] Event listener active`);
  }

  // Mark as running
  state.isRunning = true;

  console.log(`\n[AVS] ════════════════════════════════════════════════════════`);
  console.log(`[AVS] HookAttestationAVS operator running`);
  console.log(`[AVS] Listening for AttestationTaskCreated events...`);
  console.log(`[AVS] Press Ctrl+C to stop`);
  console.log(`[AVS] ════════════════════════════════════════════════════════\n`);
}

/**
 * Stop the operator gracefully
 */
export function stopOperator(): void {
  console.log(`\n[AVS] Shutting down HookAttestationAVS...`);
  state.isRunning = false;

  // Log final stats
  console.log(`[AVS] Final Stats:`);
  console.log(`[AVS]   Tasks Processed: ${state.processedTasks}`);
  console.log(`[AVS]   Successful: ${state.successfulTasks}`);
  console.log(`[AVS]   Failed: ${state.failedTasks}`);
  console.log(`[AVS]   Last Processed Index: ${state.lastProcessedTaskIndex}`);

  console.log(`[AVS] Goodbye!`);
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MANUAL TASK PROCESSING (for testing)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process a task manually (for testing without events)
 */
export async function processTaskManually(
  task: AttestationTask,
  taskIndex: number
): Promise<TaskProcessingResult> {
  const config = createMockConfig({ dryRun: true });
  const deps = createMockDependencies();

  return processAttestationTask(task, taskIndex, deps);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

process.on("SIGINT", stopOperator);
process.on("SIGTERM", stopOperator);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

// Start operator if running as main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  startOperator().catch((error) => {
    console.error(`[AVS] Fatal error: ${error}`);
    process.exit(1);
  });
}
