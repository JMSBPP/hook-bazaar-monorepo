# Hook Bazaar – Integration Architecture (Splits & Fhenix)

## Overview

This document describes the integration points between Hook Bazaar and two external systems:

1. **Splits (0xSplits v2)** — used for automated and programmable revenue distribution for hooks that include a revenue-share pricing model.
2. **Fhenix / Fully Homomorphic Encryption (FHE)** — used to protect hook developer intellectual property and support confidential hook computations using encrypted data.

Both integrations are optional and apply to different classes of hooks and use cases. Hook Bazaar must remain architecture-neutral, allowing hook developers to choose between plain Solidity, Splits-based fee sharing, and FHE-enhanced execution models.

---

# 1. Splits Integration for Revenue Distribution

## 1.1 Purpose

Splits provides a programmable, trust-minimized mechanism to distribute revenue among multiple parties. For Hook Bazaar, Splits is used to distribute:

- Developer share of pool swap fees
- Marketplace (Hook Bazaar) share
- Protocol share (if applicable)

This integration is required only for hooks that use the *revenue-share* or *hybrid pricing* model.

---

## 1.2 Revenue Flow

For every swap in a Uniswap v4 pool:

1. Uniswap v4 collects fees proportional to the pool’s fee tier.
2. The MasterHook Diamond receives hook callbacks (beforeSwap / afterSwap).
3. If any attached hook is configured with a revenue-share model:
   - The hook reports its fee entitlement to the MasterHook.
   - The MasterHook routes the portion of collected fees to a Split contract.
4. The Split contract automatically distributes the fee according to predefined weights.

This ensures consistent, transparent distribution without requiring trusted off-chain accounting.

---

## 1.3 Split Contract Configuration

When a protocol designer purchases a hook with a revenue-share model, the marketplace deploys a minimal Split contract using the published hook metadata. The Split includes:

- **Developer address**
- **Protocol treasury address**
- **Hook Bazaar marketplace address**
- **Distribution weights** (for example 50–40–10)

### Example Configuration

| Recipient          | Weight | Notes                                |
|-------------------|--------|----------------------------------------|
| Hook Developer     | 50%    | Incentivizes long-term maintenance    |
| Protocol Treasury  | 40%    | Offsets protocol operational expenses |
| Hook Bazaar        | 10%    | Marketplace sustainability             |

The actual weights are configurable per hook.

---

## 1.4 Deployment Model

The deployment flow proceeds as follows:

1. **Hook purchase transaction** triggers marketplace logic.
2. Marketplace:
   - Instantiates a Split contract with the appropriate recipients and weights.
   - Deploys a parametric clone of the hook.
   - Stores Split address in hook metadata for the target pool.
3. MasterHook:
   - Uses the Split address to forward revenue.
   - Remains agnostic to the actual recipients.

This model isolates revenue logic from hook logic and avoids coupling fee computation with fee distribution.

---

## 1.5 Interaction Surface

Hooks do not need direct knowledge of Splits. The only required behavior is:

- A hook must expose a function returning its revenue-share basis points.
- The MasterHook Diamond aggregates all hook revenue shares.
- The MasterHook forwards appropriate portions of swap fees to the Split.

This separation ensures hook developers can focus solely on hook behavior.

---

# 2. Fhenix Integration for Confidential Hook Execution

## 2.1 Purpose

Hook Bazaar aims to support “premium” hooks whose proprietary logic must remain confidential. Since contract bytecode on public blockchains is always visible, conventional contract deployment cannot protect hook developer intellectual property.

Fhenix provides a secure execution environment using Fully Homomorphic Encryption (FHE), enabling the evaluation of encrypted data without revealing:

- inputs,
- intermediate values,
- or internal logic parameters.

Hook Bazaar leverages Fhenix to protect sensitive hook logic by offloading confidential computation to the FHE coprocessor while keeping public-facing logic on-chain.

---

## 2.2 Integration Model

The hook implementation is split into two layers:

1. **On-Chain HookFacet (Diamond facet)**
   - Receives swap callback input data.
   - Prepares and encrypts values for confidential evaluation.
   - Sends encrypted payload to the Fhenix coprocessor.
   - Receives encrypted results.
   - Applies hook behavior using the result.

2. **Fhenix CoFHE Coprocessor**
   - Performs computations over encrypted data.
   - Applies proprietary algorithms defined by the hook developer.
   - Returns encrypted results to the HookFacet.

This architecture prevents extraction of the hook's algorithmic logic from contract bytecode alone.

---

## 2.3 Use Case Categories

Fhenix integration is suitable for:

- **Premium, proprietary hooks**, such as:
  - MEV mitigation engines
  - IL protection algorithms
  - Complex fee-modulation mechanisms
  - Private trading strategy evaluators

- **Hooks that require confidential parameters**, including:
  - private thresholds
  - proprietary coefficients
  - private model weights
  - encrypted configuration constants

Hooks that do not require confidentiality can remain fully on-chain and do not need Fhenix.

---

## 2.4 Execution Flow

1. A swap occurs in a pool.
2. Uniswap v4 invokes the MasterHook Diamond callback.
3. The HookFacet associated with the pool:
   - Extracts relevant state/input values.
   - Encrypts the data or retrieves pre-encrypted values.
   - Sends the encrypted input to the Fhenix coprocessor.
4. The Fhenix coprocessor:
   - Executes the proprietary logic homomorphically.
   - Returns an encrypted result.
5. The HookFacet:
   - Interprets and applies the result in hook logic (e.g., modifying fees, rejecting swaps, etc.).
6. Swap execution continues in the Uniswap v4 pool.

At no point does the blockchain reveal sensitive logic or raw parameters.

---

## 2.5 Supported Confidential Logic Types

The following operations are well-suited for FHE integration:

- Fee curve evaluation
- Risk score modeling
- Threshold checks
- Partial order or inequality evaluation
- Parameterized state machines
- MEV protection heuristics
- Private condition-based swap rejection

Wherever computation must remain private, Fhenix can be used as a secure computation layer.

---

## 2.6 Storage and Configuration

Hook Bazaar supports stateful hooks through Diamond storage slots. When Fhenix is used:

- Sensitive configuration variables may be stored encrypted.
- Updates to encrypted parameters may be done through specialized admin calls.
- Non-sensitive configuration remains on-chain.

This hybrid model supports both transparency and confidentiality.

---

# 3. Summary

Splits and Fhenix support different dimensions of Hook Bazaar’s marketplace architecture:

| Integration | Purpose | Use Cases |
|-------------|----------|-----------|
| **Splits** | Automated revenue distribution | Hooks using revenue-share licensing |
| **Fhenix** | Confidential computation and IP protection | Premium hooks or hooks requiring private logic/parameters |

Both systems extend Hook Bazaar beyond conventional on-chain hook execution, enabling:

- sustainable developer monetization,
- protection of proprietary algorithms,
- high-value hook production,
- flexible pricing models,
- and enterprise-grade confidentiality where needed.

These integrations are optional and composable, allowing hook developers to choose the most appropriate model for their product.

