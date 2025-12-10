/**
 * HookAttestationAVS Configuration Module
 *
 * Loads and validates operator configuration from environment variables.
 */

import * as dotenv from "dotenv";
import { z } from "zod";
import type { OperatorConfig } from "./types.js";

dotenv.config();

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const ConfigSchema = z.object({
  // Required
  RPC_URL: z.string().url("RPC_URL must be a valid URL"),
  PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "PRIVATE_KEY must be a valid 32-byte hex string"),

  // Contract addresses (optional for dry-run mode)
  TASK_MANAGER_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  ATTESTATION_REGISTRY_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  HOOK_STATE_VIEW_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),

  // IPFS
  IPFS_GATEWAY: z.string().url().default("https://ipfs.io/ipfs/"),

  // Operator settings
  COMPLIANCE_TOLERANCE_BPS: z.coerce.number().int().min(0).max(10000).default(100), // 1% default
  DRY_RUN: z
    .string()
    .transform((v) => v === "1" || v === "true")
    .default("false"),
  POLLING_INTERVAL_MS: z.coerce.number().int().min(1000).default(10000), // 10 seconds default

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

type RawConfig = z.infer<typeof ConfigSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION LOADING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Load and validate configuration from environment
 */
export function loadConfig(): OperatorConfig {
  const result = ConfigSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Configuration validation failed:");
    for (const error of result.error.errors) {
      console.error(`  - ${error.path.join(".")}: ${error.message}`);
    }
    throw new Error("Invalid configuration");
  }

  const raw = result.data;

  // Warn about missing contract addresses in non-dry-run mode
  if (!raw.DRY_RUN) {
    if (!raw.TASK_MANAGER_ADDRESS) {
      console.warn(
        "WARNING: TASK_MANAGER_ADDRESS not set. Set DRY_RUN=1 for testing without contracts."
      );
    }
    if (!raw.ATTESTATION_REGISTRY_ADDRESS) {
      console.warn(
        "WARNING: ATTESTATION_REGISTRY_ADDRESS not set. Attestation recording will be skipped."
      );
    }
  }

  return {
    rpcUrl: raw.RPC_URL,
    privateKey: raw.PRIVATE_KEY,
    taskManagerAddress: raw.TASK_MANAGER_ADDRESS ?? "",
    attestationRegistryAddress: raw.ATTESTATION_REGISTRY_ADDRESS ?? "",
    ipfsGateway: raw.IPFS_GATEWAY,
    complianceTolerance: raw.COMPLIANCE_TOLERANCE_BPS,
    dryRun: raw.DRY_RUN,
    pollingIntervalMs: raw.POLLING_INTERVAL_MS,
  };
}

/**
 * Get log level from environment
 */
export function getLogLevel(): "debug" | "info" | "warn" | "error" {
  const level = process.env.LOG_LEVEL ?? "info";
  if (["debug", "info", "warn", "error"].includes(level)) {
    return level as "debug" | "info" | "warn" | "error";
  }
  return "info";
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT / MOCK CONFIGURATION (for testing)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a mock configuration for testing
 */
export function createMockConfig(overrides?: Partial<OperatorConfig>): OperatorConfig {
  return {
    rpcUrl: "http://127.0.0.1:8545",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Anvil account 0
    taskManagerAddress: "0x0000000000000000000000000000000000000001",
    attestationRegistryAddress: "0x0000000000000000000000000000000000000002",
    ipfsGateway: "https://ipfs.io/ipfs/",
    complianceTolerance: 100, // 1%
    dryRun: true,
    pollingIntervalMs: 5000,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Basis points divisor */
export const BPS_DIVISOR = 10000n;

/** Default gas limit for transactions */
export const DEFAULT_GAS_LIMIT = 500000n;

/** Maximum samples per task */
export const MAX_SAMPLES_PER_TASK = 1000;

/** IPFS timeout (ms) */
export const IPFS_TIMEOUT_MS = 30000;

/** State sampling timeout (ms) */
export const SAMPLING_TIMEOUT_MS = 60000;
