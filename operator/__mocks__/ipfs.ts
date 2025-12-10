/**
 * Mock IPFS responses for testing
 */

import { HookCallback } from "../src/types.js";

/**
 * Mock specification in JSON format
 */
export const MOCK_SPEC_JSON = {
  version: "1.0.0",
  hookAddress: "0x1234567890123456789012345678901234567890",
  specificationHash: "QmTest123",
  callbacks: [HookCallback.BEFORE_SWAP, HookCallback.AFTER_SWAP],
  hookStateVariables: [
    {
      name: "volatilityWindow",
      type: "uint256",
      description: "Rolling window for volatility calculation",
    },
    {
      name: "lastPrice",
      type: "uint160",
      description: "Last recorded sqrtPriceX96",
    },
    {
      name: "feeMultiplier",
      type: "uint24",
      description: "Dynamic fee adjustment factor",
    },
  ],
  poolStateDependencies: {
    reads: ["TRADER_SQRT_PRICE", "TRADER_TICK", "TRADER_LP_FEE"],
    writes: ["TRADER_LP_FEE"],
  },
  transitionFunctions: [
    {
      callback: HookCallback.BEFORE_SWAP,
      description: "Adjusts LP fee based on volatility",
      inputs: [
        { name: "sqrtPriceX96", type: "uint160", description: "Current price" },
      ],
      outputs: [
        { name: "deltaFee", type: "int24", description: "Fee adjustment" },
      ],
      equations: [
        "volatility = |sqrtP_current - sqrtP_last| / sqrtP_last",
        "feeMultiplier' = min(MAX_FEE, baseFee * (1 + volatility * sensitivity))",
        "deltaFee = feeMultiplier' - lpFee",
      ],
      constraints: [
        "0 <= feeMultiplier' <= MAX_FEE (10000 = 1%)",
        "volatility computed over volatilityWindow blocks",
      ],
    },
  ],
  invariants: [
    {
      id: "INV-1",
      name: "Fee Bounds",
      description: "LP fee must always be within bounds",
      expression: "forall t: baseFee <= lpFee(t) <= MAX_FEE",
      severity: "critical",
    },
    {
      id: "INV-2",
      name: "Monotonic Volatility Response",
      description: "Higher volatility should not decrease fees",
      expression: "volatility_1 < volatility_2 => lpFee_1 <= lpFee_2",
      severity: "warning",
    },
  ],
  testVectors: [
    {
      id: "TV-1",
      description: "Small price change - minimal fee adjustment",
      preState: { lastPrice: 1e18, fee: 3000 },
      input: { sqrtP: 1.01e18 },
      expectedPostState: { fee: 3030 },
      tolerance: 50,
    },
    {
      id: "TV-2",
      description: "Large price change - max fee",
      preState: { lastPrice: 1e18, fee: 3000 },
      input: { sqrtP: 1.1e18 },
      expectedPostState: { fee: 10000 },
      tolerance: 0,
    },
    {
      id: "TV-3",
      description: "Tiny price change - no adjustment",
      preState: { lastPrice: 1e18, fee: 3000 },
      input: { sqrtP: 1.001e18 },
      expectedPostState: { fee: 3000 },
      tolerance: 0,
    },
  ],
};

/**
 * Mock specification in Markdown format
 */
export const MOCK_SPEC_MARKDOWN = `
# Hook Specification: DynamicFeeHook v1.0.0

## 1. Hook Identity
- **Hook Address:** 0x1234567890123456789012345678901234567890
- **Callbacks Implemented:** beforeSwap, afterSwap
- **Specification Hash:** QmTest123

## 2. State Variables

### Hook State (H)
| Variable | Type | Description |
|----------|------|-------------|
| volatilityWindow | uint256 | Rolling window for volatility calculation |
| lastPrice | uint160 | Last recorded sqrtPriceX96 |
| feeMultiplier | uint24 | Dynamic fee adjustment factor |

### Pool State Dependencies (P)
- Reads: TRADER_SQRT_PRICE, TRADER_TICK, TRADER_LP_FEE
- Writes: TRADER_LP_FEE (via beforeSwap return)

## 3. State Transition Functions

### beforeSwap(H, P) → (H', δfee)

$$
\\text{volatility} = |\\sqrt{P}_{current} - \\sqrt{P}_{last}| / \\sqrt{P}_{last}
$$

$$
\\text{feeMultiplier}' = \\min(\\text{MAX\\_FEE}, \\text{baseFee} \\times (1 + \\text{volatility} \\times \\text{sensitivity}))
$$

### Constraints
- \`0 <= feeMultiplier' <= MAX_FEE (10000 = 1%)\`

## 4. Invariants

### INV-1: Fee Bounds
$$
\\forall t: \\text{baseFee} \\leq \\phi_{lp}(t) \\leq \\text{MAX\\_FEE}
$$

### INV-2: Monotonic Volatility Response
$$
\\text{volatility}_1 < \\text{volatility}_2 \\Rightarrow \\phi_{lp,1} \\leq \\phi_{lp,2}
$$

## 5. Test Vectors

| Pre-State | Input | Expected Post-State |
|-----------|-------|---------------------|
| lastPrice=1e18, fee=3000 | sqrtP=1.01e18 | fee=3030 |
| lastPrice=1e18, fee=3000 | sqrtP=1.10e18 | fee=MAX_FEE |
| lastPrice=1e18, fee=3000 | sqrtP=1.001e18 | fee=3000 (no change) |
`;

/**
 * Mock IPFS fetch function
 */
export function createMockIPFSFetch(): (url: string) => Promise<Response> {
  return async (url: string): Promise<Response> => {
    // Determine format based on URL
    const isJson = url.includes("json") || url.includes("QmJson");
    const content = isJson
      ? JSON.stringify(MOCK_SPEC_JSON)
      : MOCK_SPEC_MARKDOWN;

    return new Response(content, {
      status: 200,
      headers: { "Content-Type": isJson ? "application/json" : "text/markdown" },
    });
  };
}

/**
 * Mock failed IPFS fetch
 */
export function createFailingIPFSFetch(): (url: string) => Promise<Response> {
  return async (_url: string): Promise<Response> => {
    return new Response("Not found", { status: 404 });
  };
}
