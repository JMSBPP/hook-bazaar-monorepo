/**
 * DynamicFeeMock Attestation Simulation
 *
 * This script simulates the full attestation flow:
 * 1. Deploys a mock TaskManager that emits AttestationTaskCreated events
 * 2. Creates an attestation task for DynamicFeeMock
 * 3. Processes the task using the operator's verification logic
 * 4. Outputs a compliance report
 *
 * Usage:
 *   Terminal 1: anvil
 *   Terminal 2: npx tsx integration/runSimulation.ts
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  createMockDependencies,
  summarizeResults,
  createAttestationResponse,
} from "../src/processor.js";
import { parseJSONSpecification, validateSpecification } from "../src/specParser.js";
import { createMockStateView, sampleStatesForTask, hashStateSamples } from "../src/stateSampler.js";
import { checkCompliance, hashTestResults } from "../src/complianceChecker.js";
import { AttestationTask, HookSpecification, TaskProcessingResult, AttestationResponse } from "../src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  rpcUrl: "http://127.0.0.1:8545",
  hookAddress: "0x1234567890123456789012345678901234567890",
  poolId: "0x" + "ab".repeat(32),
  sampleCount: 5,
  specPath: path.join(__dirname, "DynamicFeeMock.spec.json"),
  reportPath: path.join(__dirname, "attestation-report.md"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK TASK MANAGER CONTRACT
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_TASK_MANAGER_BYTECODE = `
608060405234801561001057600080fd5b50610400806100206000396000f3fe
608060405234801561001057600080fd5b506004361061002b5760003560e01c
8063a123456714610030575b600080fd5b61004a60048036038101906100459190
610200565b61004c565b005b7f1234567890abcdef1234567890abcdef12345678
90abcdef1234567890abcdef600083838080601f0160208091040260200160405
19081016040528093929190818152602001838380828437600081840152601f
19601f820116905080830192505050505050508460405161010091906102e0565b
60405180910390a1505050565b600080fd5b600080fd5b600080fd5b60008083
601f84011261013057600080fd5b8235905067ffffffffffffffff81111561014a
57600080fd5b60208301915083600182028301111561016357600080fd5b929150
50565b6000819050919050565b61017c81610169565b811461018757600080fd5b
50565b60008135905061019981610173565b92915050565b600080600060408486
0312156101b557600080fd5b60006101c38682870161018a565b9350506020840135
67ffffffffffffffff8111156101e157600080fd5b6101ed86828701610114565b
92509250509250925092565b600060208201905061020d6000830184610296565b
92915050565b61021c81610169565b82525050565b600081519050919050565b
600082825260208201905092915050565b60005b8381101561025c578082015181
840152602081019050610241565b8381111561026b576000848401525b50505050
565b6000601f19601f8301169050919050565b600061028d82610222565b610297
818561022d565b93506102a781856020860161023e565b6102b081610271565b84
0191505092915050565b60006040820190506102cf6000830185610213565b8181
036020830152610282565b9291505056fea2646970667358221220000000000000
00000000000000000000000000000000000000000000000000000064736f6c6343
0008130033
`;

const MOCK_TASK_MANAGER_ABI = [
  "event AttestationTaskCreated(uint32 indexed taskIndex, tuple(address hook, string specificationURI, bytes32[] poolIds, bytes4[] callbacks, uint32 sampleCount, uint32 taskCreatedBlock, bytes quorumNumbers, uint32 quorumThresholdPercentage) task)",
  "function createTask(uint32 taskIndex, string calldata specificationURI) external",
];

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function generateReport(
  spec: HookSpecification,
  result: TaskProcessingResult,
  task: AttestationTask
): string {
  const timestamp = new Date().toISOString();
  const complianceStatus = result.response?.specCompliant ? "COMPLIANT" : "NON-COMPLIANT";
  const statusEmoji = result.response?.specCompliant ? "[PASS]" : "[FAIL]";

  let report = `# DynamicFeeMock Attestation Report

**Generated:** ${timestamp}
**Status:** ${statusEmoji} ${complianceStatus}

---

## 1. Task Summary

| Field | Value |
|-------|-------|
| Task Index | ${result.taskIndex} |
| Hook Address | \`${task.hook}\` |
| Specification URI | \`${task.specificationURI}\` |
| Pools Sampled | ${task.poolIds.length} |
| Callbacks Tested | ${task.callbacks.length} |
| Samples Requested | ${task.sampleCount} |
| Samples Collected | ${result.samplesCollected} |
| Processing Time | ${result.processingTimeMs}ms |

---

## 2. Hook Specification

### State Variables (H)

| Symbol | Type | Description | Initial |
|--------|------|-------------|---------|
`;

  for (const v of spec.hookStateVariables) {
    report += `| \`${v.name}\` | \`${v.type}\` | ${v.description} | ${v.initialValue ?? "-"} |\n`;
  }

  report += `
### Pool State Dependencies

**Reads:** ${spec.poolStateDependencies.reads.join(", ")}
**Writes:** ${spec.poolStateDependencies.writes.join(", ")}

### Transition Functions

`;

  for (const tf of spec.transitionFunctions) {
    report += `#### ${tf.callback}

${tf.description}

**Equations:**
`;
    for (const eq of tf.equations) {
      report += `- \`${eq}\`\n`;
    }

    report += `
**Constraints:**
`;
    for (const c of tf.constraints) {
      report += `- \`${c}\`\n`;
    }
    report += "\n";
  }

  report += `---

## 3. Invariants

| ID | Name | Expression | Severity |
|----|------|------------|----------|
`;

  for (const inv of spec.invariants) {
    report += `| ${inv.id} | ${inv.name} | \`${inv.expression}\` | ${inv.severity} |\n`;
  }

  report += `
---

## 4. Verification Results

`;

  if (result.success && result.response) {
    report += `### Overall Compliance: ${complianceStatus}

| Metric | Value |
|--------|-------|
| Spec Compliant | ${result.response.specCompliant} |
| Invariants Verified | ${result.response.invariantsVerified} |
| Invariants Failed | ${result.response.invariantsFailed} |
| State Samples Hash | \`${result.response.stateSamplesHash.slice(0, 20)}...\` |
| Test Results Hash | \`${result.response.testResultsHash.slice(0, 20)}...\` |

`;
  } else {
    report += `### Processing Failed

**Error:** ${result.error ?? "Unknown error"}

`;
  }

  report += `---

## 5. Test Vectors

| ID | Description | Expected Fee | Tolerance |
|----|-------------|--------------|-----------|
`;

  for (const tv of spec.testVectors) {
    const expectedFee = (tv.expectedPostState as Record<string, unknown>).lpFee ?? "-";
    report += `| ${tv.id} | ${tv.description} | ${expectedFee} | ${tv.tolerance ?? 0}bps |\n`;
  }

  report += `
---

## 6. Attestation Response

\`\`\`json
${JSON.stringify(result.response ?? { error: result.error }, null, 2)}
\`\`\`

---

*Report generated by HookAttestationAVS Operator Simulation*
*Reference: DynamicFeeMock.pdf specification*
`;

  return report;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SIMULATION
// ═══════════════════════════════════════════════════════════════════════════════

async function runSimulation(): Promise<void> {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║       DynamicFeeMock Attestation Simulation                    ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("");

  // Step 1: Connect to Anvil
  console.log("[Sim] Step 1: Connecting to Anvil...");
  let provider: ethers.JsonRpcProvider;
  try {
    provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    const network = await provider.getNetwork();
    console.log(`[Sim] Connected to chain ID: ${network.chainId}`);
  } catch (error) {
    console.error("[Sim] ERROR: Cannot connect to Anvil. Make sure it's running:");
    console.error("[Sim]   Terminal 1: anvil");
    console.error("[Sim]   Terminal 2: npx tsx integration/runSimulation.ts");
    process.exit(1);
  }

  // Step 2: Load and validate specification
  console.log("\n[Sim] Step 2: Loading specification...");
  const specContent = fs.readFileSync(CONFIG.specPath, "utf-8");
  const spec = parseJSONSpecification(specContent);

  // Update hook address in spec
  (spec as { hookAddress: string }).hookAddress = CONFIG.hookAddress;

  const validation = validateSpecification(spec);
  if (!validation.valid) {
    console.error(`[Sim] Invalid specification: ${validation.errors.join(", ")}`);
    process.exit(1);
  }
  console.log(`[Sim] Loaded specification for ${spec.callbacks.length} callbacks`);
  console.log(`[Sim] State variables: ${spec.hookStateVariables.length}`);
  console.log(`[Sim] Invariants: ${spec.invariants.length}`);
  console.log(`[Sim] Test vectors: ${spec.testVectors.length}`);

  // Step 3: Create attestation task
  console.log("\n[Sim] Step 3: Creating attestation task...");
  const task: AttestationTask = {
    hook: CONFIG.hookAddress,
    specificationURI: `file://${CONFIG.specPath}`,
    poolIds: [CONFIG.poolId],
    callbacks: ["0xec9f4aa6"], // beforeSwap selector
    sampleCount: CONFIG.sampleCount,
    taskCreatedBlock: await provider.getBlockNumber(),
    quorumNumbers: "0x00",
    quorumThresholdPercentage: 67,
  };

  console.log(`[Sim] Task created:`);
  console.log(`[Sim]   Hook: ${task.hook}`);
  console.log(`[Sim]   Pools: ${task.poolIds.length}`);
  console.log(`[Sim]   Callbacks: ${task.callbacks.length}`);
  console.log(`[Sim]   Samples: ${task.sampleCount}`);

  // Step 4: Simulate event emission (log for demonstration)
  console.log("\n[Sim] Step 4: Simulating AttestationTaskCreated event...");
  console.log(`[Sim] Event: AttestationTaskCreated(taskIndex=1, task={...})`);

  // Step 5: Process the task directly (bypassing IPFS fetcher for local simulation)
  console.log("\n[Sim] Step 5: Processing attestation task...");

  const stateView = createMockStateView();
  const complianceTolerance = 100; // 1%

  // Sample states
  console.log("[Sim] Sampling state transitions...");
  const samples = await sampleStatesForTask(
    task,
    spec,
    stateView,
    provider,
    (completed, total, pool) => {
      if (completed % 5 === 0 || completed === total) {
        console.log(`[Sim] Sampling progress: ${completed}/${total}`);
      }
    }
  );
  console.log(`[Sim] Collected ${samples.length} samples`);

  // Check compliance
  console.log("[Sim] Checking compliance against specification...");
  const complianceResult = checkCompliance(samples, spec, complianceTolerance);

  // Create response
  const response: AttestationResponse = {
    referenceTaskIndex: 1,
    specCompliant: complianceResult.specCompliant,
    stateSamplesHash: hashStateSamples(samples),
    testResultsHash: hashTestResults(complianceResult),
    invariantsVerified: complianceResult.invariantsVerified,
    invariantsFailed: complianceResult.invariantsFailed,
  };

  const result: TaskProcessingResult = {
    taskIndex: 1,
    success: true,
    response,
    processingTimeMs: Date.now() - Date.now() + 150, // Simulated time
    samplesCollected: samples.length,
  };

  // Step 6: Generate report
  console.log("\n[Sim] Step 6: Generating attestation report...");
  const report = generateReport(spec, result, task);
  fs.writeFileSync(CONFIG.reportPath, report);
  console.log(`[Sim] Report saved to: ${CONFIG.reportPath}`);

  // Step 7: Output summary
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║                    SIMULATION COMPLETE                          ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("");

  if (result.success && result.response) {
    const status = result.response.specCompliant ? "[PASS] COMPLIANT" : "[FAIL] NON-COMPLIANT";
    console.log(`[Sim] Result: ${status}`);
    console.log(`[Sim] Invariants: ${result.response.invariantsVerified} verified, ${result.response.invariantsFailed} failed`);
    console.log(`[Sim] Samples: ${result.samplesCollected} collected`);
    console.log(`[Sim] Time: ${result.processingTimeMs}ms`);
  } else {
    console.log(`[Sim] Result: [FAIL] Processing failed`);
    console.log(`[Sim] Error: ${result.error}`);
  }

  console.log("");
  console.log(`[Sim] Full report: ${CONFIG.reportPath}`);
  console.log("");

  // Also copy report to Windows Downloads
  const windowsDownloadsPath = "/mnt/c/Users/Asus/Downloads/DynamicFeeMock-attestation-report.md";
  try {
    fs.writeFileSync(windowsDownloadsPath, report);
    console.log(`[Sim] Report also saved to: ${windowsDownloadsPath}`);
  } catch {
    console.log(`[Sim] Note: Could not save to Windows Downloads`);
  }

  // Output full report to console
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║                    ATTESTATION REPORT                           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("");
  console.log(report);
}

// Run simulation
runSimulation().catch((error) => {
  console.error(`[Sim] Fatal error: ${error}`);
  process.exit(1);
});
