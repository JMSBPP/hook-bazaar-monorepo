/**
 * HookAttestationAVS Specification Parser
 *
 * Parses hook specifications from IPFS in markdown or JSON format.
 * Specifications follow the format defined in avs-verification-system.md Section 3.1
 */

import { z } from "zod";
import { IPFS_TIMEOUT_MS } from "./config.js";
import {
  HookCallback,
  HookSpecification,
  InvariantSpec,
  StateVariableSpec,
  TestVector,
  TransitionFunctionSpec,
} from "./types.js";

// ═══════════════════════════════════════════════════════════════════════════════
// IPFS FETCHING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch specification content from IPFS
 */
export async function fetchFromIPFS(
  specificationURI: string,
  gateway: string
): Promise<string> {
  // Extract CID from URI formats: ipfs://Qm..., /ipfs/Qm..., or just Qm...
  let cid = specificationURI;
  if (specificationURI.startsWith("ipfs://")) {
    cid = specificationURI.slice(7);
  } else if (specificationURI.startsWith("/ipfs/")) {
    cid = specificationURI.slice(6);
  }

  const url = `${gateway}${cid}`;
  console.log(`[SpecParser] Fetching specification from: ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IPFS_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`IPFS fetch failed: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIFICATION SCHEMA (JSON Format)
// ═══════════════════════════════════════════════════════════════════════════════

const StateVariableSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  initialValue: z.string().optional(),
});

const InvariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  expression: z.string(),
  severity: z.enum(["critical", "warning", "info"]).default("warning"),
});

const TransitionFunctionSchema = z.object({
  callback: z.nativeEnum(HookCallback),
  description: z.string(),
  inputs: z.array(StateVariableSchema).default([]),
  outputs: z.array(StateVariableSchema).default([]),
  equations: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
});

const TestVectorSchema = z.object({
  id: z.string(),
  description: z.string(),
  preState: z.record(z.unknown()),
  input: z.record(z.unknown()),
  expectedPostState: z.record(z.unknown()),
  tolerance: z.number().optional(),
});

const HookSpecificationSchema = z.object({
  version: z.string().default("1.0.0"),
  hookAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  specificationHash: z.string().optional(),
  callbacks: z.array(z.nativeEnum(HookCallback)),
  hookStateVariables: z.array(StateVariableSchema).default([]),
  poolStateDependencies: z
    .object({
      reads: z.array(z.string()).default([]),
      writes: z.array(z.string()).default([]),
    })
    .default({ reads: [], writes: [] }),
  transitionFunctions: z.array(TransitionFunctionSchema).default([]),
  invariants: z.array(InvariantSchema).default([]),
  testVectors: z.array(TestVectorSchema).default([]),
});

// ═══════════════════════════════════════════════════════════════════════════════
// PARSING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse hook specification from JSON content
 */
export function parseJSONSpecification(content: string): HookSpecification {
  try {
    const data = JSON.parse(content);
    const result = HookSpecificationSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new Error(`Invalid specification format: ${errors}`);
    }

    return result.data as HookSpecification;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Parse hook specification from Markdown content
 * Extracts structured data from markdown format defined in avs-verification-system.md
 */
export function parseMarkdownSpecification(content: string): HookSpecification {
  const spec: Partial<HookSpecification> = {
    version: "1.0.0",
    callbacks: [],
    hookStateVariables: [],
    poolStateDependencies: { reads: [], writes: [] },
    transitionFunctions: [],
    invariants: [],
    testVectors: [],
  };

  // Extract hook address
  const hookAddressMatch = content.match(/\*\*Hook Address:\*\*\s*(0x[a-fA-F0-9]{40})/);
  if (hookAddressMatch) {
    spec.hookAddress = hookAddressMatch[1];
  }

  // Extract specification hash
  const specHashMatch = content.match(/\*\*Specification Hash:\*\*\s*(\S+)/);
  if (specHashMatch) {
    spec.specificationHash = specHashMatch[1];
  }

  // Extract callbacks implemented
  const callbacksMatch = content.match(
    /\*\*Callbacks Implemented:\*\*\s*([^\n]+)/
  );
  if (callbacksMatch) {
    const callbackNames = callbacksMatch[1].split(",").map((s) => s.trim());
    spec.callbacks = callbackNames
      .map((name) => {
        const enumValue = Object.values(HookCallback).find(
          (v) => v.toLowerCase() === name.toLowerCase()
        );
        return enumValue;
      })
      .filter((v): v is HookCallback => v !== undefined);
  }

  // Extract state variables from table
  const stateVarsSection = content.match(
    /##\s*\d*\.?\s*State Variables[\s\S]*?\|([^#]+)/i
  );
  if (stateVarsSection) {
    const tableRows = stateVarsSection[1].match(/\|[^|]+\|[^|]+\|[^|]+\|/g) || [];
    for (const row of tableRows.slice(2)) {
      // Skip header and separator
      const cells = row.split("|").filter((c) => c.trim());
      if (cells.length >= 3) {
        spec.hookStateVariables!.push({
          name: cells[0].trim(),
          type: cells[1].trim(),
          description: cells[2].trim(),
        });
      }
    }
  }

  // Extract pool state dependencies
  const depsMatch = content.match(/###\s*Pool State Dependencies[^#]*([\s\S]*?)(?=##|$)/i);
  if (depsMatch) {
    const readsMatch = depsMatch[1].match(/Reads:\s*([^\n]+)/i);
    const writesMatch = depsMatch[1].match(/Writes:\s*([^\n]+)/i);
    if (readsMatch) {
      spec.poolStateDependencies!.reads = readsMatch[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (writesMatch) {
      spec.poolStateDependencies!.writes = writesMatch[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  // Extract invariants
  const invariantsSection = content.match(
    /##\s*\d*\.?\s*Invariants([\s\S]*?)(?=##\s*\d|$)/i
  );
  if (invariantsSection) {
    const invariantBlocks = invariantsSection[1].match(/###\s*INV-\d+[^#]*/g) || [];
    for (const block of invariantBlocks) {
      const idMatch = block.match(/###\s*(INV-\d+)/);
      const nameMatch = block.match(/###\s*INV-\d+:\s*([^\n]+)/);
      const exprMatch = block.match(/\$\$([\s\S]*?)\$\$/);
      if (idMatch) {
        spec.invariants!.push({
          id: idMatch[1],
          name: nameMatch ? nameMatch[1].trim() : idMatch[1],
          description: block.replace(/###[^\n]+\n/, "").trim().slice(0, 200),
          expression: exprMatch ? exprMatch[1].trim() : "",
          severity: "critical",
        });
      }
    }
  }

  // Extract test vectors from table
  const testVectorsSection = content.match(
    /##\s*\d*\.?\s*Test Vectors([\s\S]*?)(?=##|$)/i
  );
  if (testVectorsSection) {
    const tableRows =
      testVectorsSection[1].match(/\|[^|]+\|[^|]+\|[^|]+\|/g) || [];
    let idx = 0;
    for (const row of tableRows.slice(2)) {
      // Skip header and separator
      const cells = row.split("|").filter((c) => c.trim());
      if (cells.length >= 3) {
        spec.testVectors!.push({
          id: `TV-${++idx}`,
          description: `Test vector ${idx}`,
          preState: parseKeyValueString(cells[0].trim()),
          input: parseKeyValueString(cells[1].trim()),
          expectedPostState: parseKeyValueString(cells[2].trim()),
        });
      }
    }
  }

  // Validate required fields
  if (!spec.hookAddress) {
    throw new Error("Specification missing required field: hookAddress");
  }
  if (!spec.callbacks || spec.callbacks.length === 0) {
    throw new Error("Specification missing required field: callbacks");
  }

  return spec as HookSpecification;
}

/**
 * Parse key-value string like "key1=value1, key2=value2" into object
 */
function parseKeyValueString(str: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const pairs = str.split(",").map((s) => s.trim());
  for (const pair of pairs) {
    const [key, value] = pair.split("=").map((s) => s.trim());
    if (key && value !== undefined) {
      // Try to parse as number
      const numValue = parseFloat(value);
      result[key] = isNaN(numValue) ? value : numValue;
    }
  }
  return result;
}

/**
 * Detect format and parse specification
 */
export function parseSpecification(content: string): HookSpecification {
  const trimmed = content.trim();

  // Try JSON first
  if (trimmed.startsWith("{")) {
    return parseJSONSpecification(content);
  }

  // Fall back to Markdown
  return parseMarkdownSpecification(content);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIFICATION VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate specification completeness and consistency
 */
export function validateSpecification(spec: HookSpecification): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!spec.hookAddress || !/^0x[a-fA-F0-9]{40}$/.test(spec.hookAddress)) {
    errors.push("Invalid or missing hookAddress");
  }

  if (!spec.callbacks || spec.callbacks.length === 0) {
    errors.push("At least one callback must be specified");
  }

  // Check transition functions match callbacks
  const declaredCallbacks = new Set(spec.callbacks);
  for (const tf of spec.transitionFunctions) {
    if (!declaredCallbacks.has(tf.callback)) {
      warnings.push(
        `Transition function for ${tf.callback} not in declared callbacks`
      );
    }
  }

  // Check invariants have expressions
  for (const inv of spec.invariants) {
    if (!inv.expression || inv.expression.trim() === "") {
      warnings.push(`Invariant ${inv.id} has empty expression`);
    }
  }

  // Check test vectors
  if (spec.testVectors.length === 0) {
    warnings.push("No test vectors defined - verification will rely on sampling only");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT: Fetch and Parse
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch and parse a hook specification from IPFS
 */
export async function fetchAndParseSpecification(
  specificationURI: string,
  ipfsGateway: string
): Promise<HookSpecification> {
  console.log(`[SpecParser] Fetching specification: ${specificationURI}`);

  const content = await fetchFromIPFS(specificationURI, ipfsGateway);
  console.log(`[SpecParser] Fetched ${content.length} bytes`);

  const spec = parseSpecification(content);
  console.log(
    `[SpecParser] Parsed specification for hook ${spec.hookAddress} with ${spec.callbacks.length} callbacks`
  );

  const validation = validateSpecification(spec);
  if (!validation.valid) {
    throw new Error(`Invalid specification: ${validation.errors.join("; ")}`);
  }

  for (const warning of validation.warnings) {
    console.warn(`[SpecParser] WARNING: ${warning}`);
  }

  return spec;
}
