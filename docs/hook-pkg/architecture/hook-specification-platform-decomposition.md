# Hook Specification Platform: System Decomposition

> **Document Type:** Implementation TODO System
> **Last Updated:** 2025-12-09
> **Status:** Ready for Implementation
> **Related:** [State-Space Model](../mathematical-models/state-space-model.md) | [System Overview](./system-overview.md)

---

## 1. Executive Summary

This document decomposes the **Hook Specification Platform** into implementable components. The platform enables:

1. **Public system state documentation** - Read-only `system-state.md` derived from `IStateView`
2. **HookSpec upload & validation** - Verify spec compliance with system state schema
3. **IPFS storage** - Generate content-addressed URIs for specifications
4. **NFT minting** - Issue `HookLicense` NFTs with IPFS URI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOOK SPECIFICATION PLATFORM FLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │  system-state.md │◀───── IStateView Interface Parsing                    │
│  │  (READ ONLY)     │                                                        │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    HOOK DEVELOPER UPLOADS                             │   │
│  │  ┌──────────────────┐                                                │   │
│  │  │  HookSpec.md     │ ─── Contains: hook state vars + system funcs   │   │
│  │  │  (or .tex/.pdf)  │                                                │   │
│  │  └────────┬─────────┘                                                │   │
│  └───────────┼──────────────────────────────────────────────────────────┘   │
│              │                                                               │
│              ▼                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    VALIDATION SERVICE                                 │   │
│  │                                                                       │   │
│  │  1. Parse HookSpec document                                          │   │
│  │  2. Extract declared state variables                                  │   │
│  │  3. Verify all referenced pool vars exist in system-state.md         │   │
│  │  4. Validate function signatures reference valid state               │   │
│  │  5. Check mathematical notation compliance                           │   │
│  │                                                                       │   │
│  │  ┌─────────────┐      ┌─────────────┐                               │   │
│  │  │  ACCEPT ✓   │      │  REJECT ✗   │                               │   │
│  │  │  (compliant)│      │  (invalid)  │                               │   │
│  │  └──────┬──────┘      └─────────────┘                               │   │
│  └─────────┼────────────────────────────────────────────────────────────┘   │
│            │                                                                 │
│            ▼                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    IPFS UPLOAD SERVICE                                │   │
│  │                                                                       │   │
│  │  1. Pin document to IPFS                                             │   │
│  │  2. Generate CID (content-addressed hash)                            │   │
│  │  3. Associate CID with uploader address                              │   │
│  │                                                                       │   │
│  │  Output: ipfs://Qm... or ipfs://bafy...                              │   │
│  └────────┬─────────────────────────────────────────────────────────────┘   │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    HOOKLICENSE NFT MINTING                            │   │
│  │                                                                       │   │
│  │  tokenURI = IPFS CID                                                 │   │
│  │  owner = uploader (hook developer)                                   │   │
│  │  metadata = { name, description, specVersion, ... }                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Decomposition

### 2.1 Component Overview

| ID | Component | Type | Priority | Dependencies |
|----|-----------|------|----------|--------------|
| C1 | System State Document | Documentation | P0 | IStateView interface |
| C2 | HookSpec Schema | Schema/Spec | P0 | C1 |
| C3 | Validation Service | Backend Service | P1 | C1, C2 |
| C4 | IPFS Integration | Backend Service | P1 | C3 |
| C5 | HookLicense NFT | Smart Contract | P1 | C4 |
| C6 | Platform Frontend | Web App | P2 | C3, C4, C5 |

---

## 3. C1: System State Document (`system-state.md`)

### 3.1 Purpose

A **canonical, read-only document** that defines all pool state variables available for hooks to reference. Derived directly from parsing the `IStateView` interface.

### 3.2 TODO Tasks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ C1: SYSTEM STATE DOCUMENT                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ □ C1.1 Parse IStateView Interface                                           │
│   ├── Read contracts/lib/v4-periphery/src/interfaces/IStateView.sol         │
│   ├── Extract all function signatures                                        │
│   ├── Map return types to state variable definitions                         │
│   └── Output: structured JSON of state variables                             │
│                                                                              │
│ □ C1.2 Generate system-state.md Document                                    │
│   ├── Create markdown template with sections:                                │
│   │   ├── Pool Configuration Variables                                       │
│   │   ├── LP Index Variables (positions, ticks)                              │
│   │   ├── Trader Index Variables (slot0, liquidity)                          │
│   │   └── Shared Variables (fee growth)                                      │
│   ├── Include mathematical notation for each variable                        │
│   ├── Include Solidity type for each variable                                │
│   └── Include IStateView getter mapping                                      │
│                                                                              │
│ □ C1.3 Version Control & Immutability                                       │
│   ├── Pin system-state.md to IPFS                                           │
│   ├── Store IPFS CID in platform contract                                   │
│   └── Document versioning strategy for V4 upgrades                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Output Schema

```yaml
# system-state.schema.yaml
version: "1.0.0"
uniswap_version: "v4"

state_indices:
  lp_index:
    description: "Variables accessed by liquidity providers"
    variables:
      - name: "position_liquidity"
        symbol: "L_k"
        type: "uint128"
        getter: "getPositionLiquidity(PoolId, bytes32)"
        description: "Liquidity amount for a specific position"

      - name: "tick_lower"
        symbol: "t_l^k"
        type: "int24"
        getter: "getPositionInfo(PoolId, bytes32)"
        description: "Lower tick bound of position"

      # ... more variables

  trader_index:
    description: "Variables accessed by traders during swaps"
    variables:
      - name: "sqrt_price"
        symbol: "√P"
        type: "uint160"
        getter: "getSlot0(PoolId)"
        description: "Current sqrt price in Q64.96 format"

      # ... more variables

  shared:
    description: "Variables accessed by both LPs and traders"
    variables:
      - name: "fee_growth_global_0"
        symbol: "f_0^{global}"
        type: "uint256"
        getter: "getFeeGrowthGlobals(PoolId)"
        description: "Cumulative fee growth for token0"

      # ... more variables
```

### 3.4 Example system-state.md Output

```markdown
# System State Variables

> **Version:** 1.0.0
> **Uniswap Version:** V4
> **IPFS CID:** QmXxx...
> **Status:** READ ONLY - Canonical Reference

---

## 1. LP Index Variables ($\mathcal{S}_{LP}$)

Variables primarily accessed by liquidity providers.

### 1.1 Position Variables

| Variable | Symbol | Type | IStateView Getter |
|----------|--------|------|-------------------|
| Position Liquidity | $L_k$ | `uint128` | `getPositionLiquidity(poolId, positionId)` |
| Tick Lower | $t_l^k$ | `int24` | `getPositionInfo(poolId, positionId)` |
| Tick Upper | $t_u^k$ | `int24` | `getPositionInfo(poolId, positionId)` |
| Fee Growth Inside 0 | $f_{0,k}^{in}$ | `uint256` | `getPositionInfo(poolId, positionId)` |
| Fee Growth Inside 1 | $f_{1,k}^{in}$ | `uint256` | `getPositionInfo(poolId, positionId)` |

### 1.2 Tick Variables

| Variable | Symbol | Type | IStateView Getter |
|----------|--------|------|-------------------|
| Liquidity Gross | $L_g^{tick}$ | `uint128` | `getTickLiquidity(poolId, tick)` |
| Liquidity Net | $L_n^{tick}$ | `int128` | `getTickLiquidity(poolId, tick)` |
| Fee Growth Outside 0 | $f_0^{out,tick}$ | `uint256` | `getTickFeeGrowthOutside(poolId, tick)` |
| Fee Growth Outside 1 | $f_1^{out,tick}$ | `uint256` | `getTickFeeGrowthOutside(poolId, tick)` |

---

## 2. Trader Index Variables ($\mathcal{S}_T$)

Variables primarily accessed by traders during swaps.

| Variable | Symbol | Type | IStateView Getter |
|----------|--------|------|-------------------|
| Sqrt Price | $\sqrt{P}$ | `uint160` | `getSlot0(poolId)` |
| Current Tick | $t_c$ | `int24` | `getSlot0(poolId)` |
| LP Fee | $\phi_{lp}$ | `uint24` | `getSlot0(poolId)` |
| Protocol Fee | $\phi_{proto}$ | `uint24` | `getSlot0(poolId)` |
| Active Liquidity | $L_{act}$ | `uint128` | `getLiquidity(poolId)` |
| Tick Bitmap | $B_{tick}$ | `uint256` | `getTickBitmap(poolId, wordPos)` |

---

## 3. Shared Variables ($\mathcal{S}_{shared}$)

Variables accessed by both LPs and traders.

| Variable | Symbol | Type | IStateView Getter |
|----------|--------|------|-------------------|
| Fee Growth Global 0 | $f_0^{global}$ | `uint256` | `getFeeGrowthGlobals(poolId)` |
| Fee Growth Global 1 | $f_1^{global}$ | `uint256` | `getFeeGrowthGlobals(poolId)` |

---

## 4. Usage in HookSpec Documents

When writing a HookSpec, you MUST reference state variables using:
- The **Symbol** (e.g., $L_k$) for mathematical equations
- The **Variable Name** (e.g., `position_liquidity`) for schema declarations

Example:
```yaml
hook_state:
  - name: "accumulated_fees"
    symbol: "F_{acc}"
    type: "uint256"

system_functions:
  - callback: "afterSwap"
    reads: ["sqrt_price", "active_liquidity"]
    writes: ["accumulated_fees"]
    equation: "F_{acc}' = F_{acc} + \phi_{lp} \cdot \Delta"
```
```

---

## 4. C2: HookSpec Schema

### 4.1 Purpose

Define the **schema and validation rules** for HookSpec documents that developers upload.

### 4.2 TODO Tasks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ C2: HOOKSPEC SCHEMA                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ □ C2.1 Define HookSpec JSON Schema                                          │
│   ├── Required sections:                                                     │
│   │   ├── metadata (name, version, author, description)                     │
│   │   ├── hook_state (custom state variables)                               │
│   │   ├── system_functions (callback specifications)                        │
│   │   └── invariants (constraints that must hold)                           │
│   ├── Optional sections:                                                     │
│   │   ├── examples (usage examples)                                         │
│   │   └── references (citations, related work)                              │
│   └── Output: hookspec.schema.json                                          │
│                                                                              │
│ □ C2.2 Define Validation Rules                                              │
│   ├── Rule V1: All referenced pool vars MUST exist in system-state.md      │
│   ├── Rule V2: Hook state vars MUST have unique names                       │
│   ├── Rule V3: System functions MUST map to valid callbacks                 │
│   ├── Rule V4: Equations MUST use valid symbols from state defs             │
│   ├── Rule V5: Types MUST be valid Solidity types                           │
│   └── Output: validation-rules.md                                           │
│                                                                              │
│ □ C2.3 Support Multiple Formats                                             │
│   ├── Primary: YAML/JSON (machine-readable)                                 │
│   ├── Secondary: Markdown with YAML frontmatter                             │
│   ├── Tertiary: LaTeX with structured comments                              │
│   └── Define format detection and parsing strategy                          │
│                                                                              │
│ □ C2.4 Create Example HookSpecs                                             │
│   ├── Example 1: Simple fee accumulator hook                                │
│   ├── Example 2: TWAP oracle hook                                           │
│   ├── Example 3: Dynamic fee hook                                           │
│   └── Example 4: Liquidity mining hook                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 HookSpec Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hookbazaar.io/schemas/hookspec/v1.0.0",
  "title": "HookSpec",
  "description": "Schema for Hook Specification documents",
  "type": "object",
  "required": ["metadata", "hook_state", "system_functions"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["name", "version", "author"],
      "properties": {
        "name": {
          "type": "string",
          "description": "Human-readable hook name",
          "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{2,63}$"
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        },
        "author": {
          "type": "string",
          "description": "Ethereum address or ENS name"
        },
        "description": {
          "type": "string",
          "maxLength": 1000
        },
        "license": {
          "type": "string",
          "enum": ["MIT", "GPL-3.0", "BUSL-1.1", "PROPRIETARY"]
        },
        "system_state_version": {
          "type": "string",
          "description": "IPFS CID of system-state.md this spec targets"
        }
      }
    },
    "hook_state": {
      "type": "array",
      "description": "Custom state variables maintained by the hook",
      "items": {
        "$ref": "#/definitions/StateVariable"
      }
    },
    "system_functions": {
      "type": "array",
      "description": "Callback specifications",
      "items": {
        "$ref": "#/definitions/SystemFunction"
      }
    },
    "invariants": {
      "type": "array",
      "description": "Constraints that must always hold",
      "items": {
        "$ref": "#/definitions/Invariant"
      }
    }
  },
  "definitions": {
    "StateVariable": {
      "type": "object",
      "required": ["name", "symbol", "type"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9_]*$"
        },
        "symbol": {
          "type": "string",
          "description": "LaTeX symbol (e.g., 'F_{acc}')"
        },
        "type": {
          "type": "string",
          "enum": ["uint8", "uint16", "uint24", "uint32", "uint64", "uint128", "uint256",
                   "int8", "int16", "int24", "int32", "int64", "int128", "int256",
                   "address", "bool", "bytes32"]
        },
        "description": {
          "type": "string"
        },
        "initial_value": {
          "type": "string",
          "description": "Initial value expression"
        }
      }
    },
    "SystemFunction": {
      "type": "object",
      "required": ["callback", "reads", "writes", "transition"],
      "properties": {
        "callback": {
          "type": "string",
          "enum": ["beforeInitialize", "afterInitialize",
                   "beforeAddLiquidity", "afterAddLiquidity",
                   "beforeRemoveLiquidity", "afterRemoveLiquidity",
                   "beforeSwap", "afterSwap",
                   "beforeDonate", "afterDonate"]
        },
        "reads": {
          "type": "array",
          "description": "Pool state variables read (from system-state.md)",
          "items": { "type": "string" }
        },
        "writes": {
          "type": "array",
          "description": "Hook state variables modified",
          "items": { "type": "string" }
        },
        "transition": {
          "type": "object",
          "description": "State transition specification",
          "properties": {
            "preconditions": {
              "type": "array",
              "items": { "type": "string" }
            },
            "equation": {
              "type": "string",
              "description": "LaTeX equation: H' = f(H, P)"
            },
            "postconditions": {
              "type": "array",
              "items": { "type": "string" }
            },
            "delta_returns": {
              "type": "object",
              "description": "BalanceDelta modifications",
              "properties": {
                "amount0": { "type": "string" },
                "amount1": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "Invariant": {
      "type": "object",
      "required": ["name", "expression"],
      "properties": {
        "name": {
          "type": "string"
        },
        "expression": {
          "type": "string",
          "description": "LaTeX boolean expression"
        },
        "description": {
          "type": "string"
        }
      }
    }
  }
}
```

### 4.4 Example HookSpec Document

```yaml
# HookSpec: Fee Accumulator
# Format: YAML with embedded LaTeX

metadata:
  name: "FeeAccumulatorHook"
  version: "1.0.0"
  author: "0x1234...abcd"
  description: "Accumulates swap fees for later distribution"
  license: "MIT"
  system_state_version: "QmSystemStateV1..."

hook_state:
  - name: "accumulated_fees_0"
    symbol: "F_0"
    type: "uint256"
    description: "Accumulated fees for token0"
    initial_value: "0"

  - name: "accumulated_fees_1"
    symbol: "F_1"
    type: "uint256"
    description: "Accumulated fees for token1"
    initial_value: "0"

  - name: "last_distribution_block"
    symbol: "b_{dist}"
    type: "uint256"
    description: "Block number of last fee distribution"
    initial_value: "block.number"

system_functions:
  - callback: "afterSwap"
    reads:
      - "sqrt_price"        # √P from trader index
      - "active_liquidity"  # L_act from trader index
      - "lp_fee"            # φ_lp from trader index
    writes:
      - "accumulated_fees_0"
      - "accumulated_fees_1"
    transition:
      preconditions:
        - "swapDelta.amount0 != 0 OR swapDelta.amount1 != 0"
      equation: |
        F_0' = F_0 + |Δ_0| \cdot \phi_{lp}
        F_1' = F_1 + |Δ_1| \cdot \phi_{lp}
      postconditions:
        - "F_0' >= F_0"
        - "F_1' >= F_1"
      delta_returns:
        amount0: "0"
        amount1: "0"

invariants:
  - name: "fees_non_negative"
    expression: "F_0 \\geq 0 \\land F_1 \\geq 0"
    description: "Accumulated fees cannot be negative"

  - name: "monotonic_accumulation"
    expression: "F_0' \\geq F_0 \\land F_1' \\geq F_1"
    description: "Fees only increase (within same epoch)"
```

---

## 5. C3: Validation Service

### 5.1 Purpose

Backend service that **validates HookSpec documents** against the system state schema.

### 5.2 TODO Tasks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ C3: VALIDATION SERVICE                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ □ C3.1 Document Parser                                                      │
│   ├── Implement YAML parser with schema validation                          │
│   ├── Implement Markdown+frontmatter parser                                 │
│   ├── Implement LaTeX parser (extract structured data)                      │
│   ├── Auto-detect format from file extension/content                        │
│   └── Output: Normalized HookSpec object                                    │
│                                                                              │
│ □ C3.2 State Variable Validator                                             │
│   ├── Load system-state.md (from IPFS or local cache)                       │
│   ├── Build lookup table of valid state variables                           │
│   ├── Validate all `reads` reference valid system variables                 │
│   ├── Validate all `writes` reference declared hook_state                   │
│   └── Output: ValidationResult with errors/warnings                         │
│                                                                              │
│ □ C3.3 Equation Validator                                                   │
│   ├── Parse LaTeX equations                                                 │
│   ├── Extract symbols used in equations                                     │
│   ├── Verify all symbols are declared (hook_state or system state)          │
│   ├── Check equation syntax validity                                        │
│   └── Output: EquationValidationResult                                      │
│                                                                              │
│ □ C3.4 Callback Validator                                                   │
│   ├── Verify callbacks are valid Uniswap V4 hook callbacks                  │
│   ├── Verify state access patterns match callback semantics                 │
│   │   ├── beforeSwap: can read trader state, cannot modify pool             │
│   │   ├── afterSwap: can read/modify, can return delta                      │
│   │   └── ... (define for each callback)                                    │
│   └── Output: CallbackValidationResult                                      │
│                                                                              │
│ □ C3.5 Invariant Validator                                                  │
│   ├── Parse invariant expressions                                           │
│   ├── Verify symbols are valid                                              │
│   ├── Check logical consistency (no contradictions)                         │
│   └── Output: InvariantValidationResult                                     │
│                                                                              │
│ □ C3.6 API Endpoints                                                        │
│   ├── POST /validate - Upload and validate HookSpec                         │
│   ├── GET /system-state - Retrieve current system-state.md                  │
│   ├── GET /schema - Retrieve HookSpec JSON schema                           │
│   └── GET /examples - Retrieve example HookSpecs                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Validation Rules Specification

```typescript
// validation-rules.ts

interface ValidationRule {
  id: string;
  name: string;
  severity: 'error' | 'warning';
  validate: (spec: HookSpec, systemState: SystemState) => ValidationResult;
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'V1',
    name: 'ValidPoolStateReferences',
    severity: 'error',
    validate: (spec, systemState) => {
      // All referenced pool vars MUST exist in system-state.md
      const invalidRefs: string[] = [];
      for (const func of spec.system_functions) {
        for (const readVar of func.reads) {
          if (!systemState.hasVariable(readVar)) {
            invalidRefs.push(`${func.callback}.reads: '${readVar}'`);
          }
        }
      }
      return {
        valid: invalidRefs.length === 0,
        errors: invalidRefs.map(ref => `Invalid state reference: ${ref}`)
      };
    }
  },
  {
    id: 'V2',
    name: 'UniqueHookStateNames',
    severity: 'error',
    validate: (spec, _) => {
      // Hook state vars MUST have unique names
      const names = spec.hook_state.map(v => v.name);
      const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
      return {
        valid: duplicates.length === 0,
        errors: duplicates.map(d => `Duplicate hook state variable: '${d}'`)
      };
    }
  },
  {
    id: 'V3',
    name: 'ValidCallbacks',
    severity: 'error',
    validate: (spec, _) => {
      // System functions MUST map to valid callbacks
      const validCallbacks = [
        'beforeInitialize', 'afterInitialize',
        'beforeAddLiquidity', 'afterAddLiquidity',
        'beforeRemoveLiquidity', 'afterRemoveLiquidity',
        'beforeSwap', 'afterSwap',
        'beforeDonate', 'afterDonate'
      ];
      const invalidCallbacks = spec.system_functions
        .filter(f => !validCallbacks.includes(f.callback))
        .map(f => f.callback);
      return {
        valid: invalidCallbacks.length === 0,
        errors: invalidCallbacks.map(c => `Invalid callback: '${c}'`)
      };
    }
  },
  {
    id: 'V4',
    name: 'ValidEquationSymbols',
    severity: 'error',
    validate: (spec, systemState) => {
      // Equations MUST use valid symbols from state defs
      const validSymbols = new Set([
        ...spec.hook_state.map(v => v.symbol),
        ...systemState.getAllSymbols()
      ]);
      const errors: string[] = [];
      for (const func of spec.system_functions) {
        const usedSymbols = extractLatexSymbols(func.transition.equation);
        for (const sym of usedSymbols) {
          if (!validSymbols.has(sym)) {
            errors.push(`Unknown symbol '${sym}' in ${func.callback} equation`);
          }
        }
      }
      return { valid: errors.length === 0, errors };
    }
  },
  {
    id: 'V5',
    name: 'ValidSolidityTypes',
    severity: 'error',
    validate: (spec, _) => {
      // Types MUST be valid Solidity types
      const validTypes = [
        'uint8', 'uint16', 'uint24', 'uint32', 'uint64', 'uint128', 'uint256',
        'int8', 'int16', 'int24', 'int32', 'int64', 'int128', 'int256',
        'address', 'bool', 'bytes32'
      ];
      const invalidTypes = spec.hook_state
        .filter(v => !validTypes.includes(v.type))
        .map(v => `${v.name}: ${v.type}`);
      return {
        valid: invalidTypes.length === 0,
        errors: invalidTypes.map(t => `Invalid Solidity type: ${t}`)
      };
    }
  },
  {
    id: 'V6',
    name: 'WritesMatchHookState',
    severity: 'error',
    validate: (spec, _) => {
      // All writes MUST reference declared hook_state variables
      const hookStateNames = new Set(spec.hook_state.map(v => v.name));
      const errors: string[] = [];
      for (const func of spec.system_functions) {
        for (const writeVar of func.writes) {
          if (!hookStateNames.has(writeVar)) {
            errors.push(`${func.callback} writes undeclared variable: '${writeVar}'`);
          }
        }
      }
      return { valid: errors.length === 0, errors };
    }
  }
];
```

---

## 6. C4: IPFS Integration

### 6.1 Purpose

Service to **pin validated HookSpecs to IPFS** and generate content-addressed URIs.

### 6.2 TODO Tasks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ C4: IPFS INTEGRATION                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ □ C4.1 IPFS Client Setup                                                    │
│   ├── Choose IPFS provider (Pinata, Infura, web3.storage, self-hosted)     │
│   ├── Implement upload/pin functionality                                     │
│   ├── Implement retrieval functionality                                      │
│   └── Handle CID v0 vs v1 format                                            │
│                                                                              │
│ □ C4.2 Document Packaging                                                   │
│   ├── Normalize document format before pinning                              │
│   ├── Add metadata wrapper with timestamp, uploader, version                │
│   ├── Generate deterministic CID (same content = same CID)                  │
│   └── Support both raw content and directory structures                      │
│                                                                              │
│ □ C4.3 Upload Registry                                                      │
│   ├── Store mapping: uploader_address => [CID, CID, ...]                   │
│   ├── Store mapping: CID => { uploader, timestamp, status }                 │
│   ├── Implement duplicate detection                                          │
│   └── Support revocation/deprecation marking                                 │
│                                                                              │
│ □ C4.4 Gateway & Retrieval                                                  │
│   ├── Configure IPFS gateway URLs                                           │
│   ├── Implement fallback to multiple gateways                               │
│   ├── Cache frequently accessed documents                                    │
│   └── Verify content hash on retrieval                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 IPFS Service Interface

```typescript
// ipfs-service.ts

interface IPFSService {
  /**
   * Pin a validated HookSpec document to IPFS
   * @param document - The validated HookSpec content
   * @param uploader - Ethereum address of uploader
   * @returns CID and full IPFS URI
   */
  pinDocument(document: HookSpec, uploader: string): Promise<{
    cid: string;
    uri: string;  // ipfs://Qm... or ipfs://bafy...
    timestamp: number;
  }>;

  /**
   * Retrieve a HookSpec document by CID
   */
  getDocument(cid: string): Promise<HookSpec>;

  /**
   * Check if a CID exists and is pinned
   */
  isPinned(cid: string): Promise<boolean>;

  /**
   * Get all CIDs uploaded by an address
   */
  getUploaderDocuments(uploader: string): Promise<string[]>;
}

// Document wrapper for IPFS storage
interface IPFSHookSpecWrapper {
  schema_version: "1.0.0";
  content_type: "hookspec";
  uploader: string;        // Ethereum address
  uploaded_at: number;     // Unix timestamp
  signature?: string;      // Optional EIP-712 signature
  content: HookSpec;       // The actual spec
}
```

---

## 7. C5: HookLicense NFT Contract

### 7.1 Purpose

ERC-721 NFT contract that **represents ownership of a HookSpec**, with `tokenURI` pointing to IPFS.

### 7.2 TODO Tasks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ C5: HOOKLICENSE NFT CONTRACT                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ □ C5.1 Contract Design                                                      │
│   ├── Inherit ERC721 + ERC721URIStorage                                     │
│   ├── Add minting function (callable by platform only)                      │
│   ├── Store IPFS URI as tokenURI                                            │
│   ├── Add on-chain metadata (name, version, author)                         │
│   └── Consider ERC-2981 royalty standard                                    │
│                                                                              │
│ □ C5.2 Access Control                                                       │
│   ├── Only validated specs can mint                                         │
│   ├── Platform address has MINTER_ROLE                                      │
│   ├── Developer (uploader) receives minted NFT                              │
│   └── Add pause functionality for emergencies                                │
│                                                                              │
│ □ C5.3 Metadata Standard                                                    │
│   ├── Define on-chain vs off-chain metadata split                           │
│   ├── Implement tokenURI returning IPFS gateway URL                         │
│   ├── Support ERC-721 Metadata JSON schema                                  │
│   └── Include hook-specific attributes                                       │
│                                                                              │
│ □ C5.4 Events & Indexing                                                    │
│   ├── HookSpecRegistered(tokenId, cid, developer)                           │
│   ├── HookSpecDeprecated(tokenId, reason)                                   │
│   ├── Design subgraph schema for indexing                                   │
│   └── Support querying by developer, CID, etc.                              │
│                                                                              │
│ □ C5.5 Integration Points                                                   │
│   ├── Link to HookImplementation registry (future)                          │
│   ├── Link to AVS attestation system (future)                               │
│   └── Support royalty distribution on hook usage                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Contract Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";

/// @title HookLicense
/// @notice ERC-721 NFT representing ownership of a validated HookSpec
/// @dev tokenURI points to IPFS CID of the HookSpec document
contract HookLicense is ERC721, ERC721URIStorage, ERC2981, AccessControl {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Counter for token IDs
    uint256 private _nextTokenId;

    /// @notice Mapping from IPFS CID to token ID
    mapping(string => uint256) public cidToTokenId;

    /// @notice Mapping from token ID to on-chain metadata
    mapping(uint256 => HookMetadata) public hookMetadata;

    /// @notice On-chain metadata for a HookSpec
    struct HookMetadata {
        string name;
        string version;
        address developer;
        uint256 registeredAt;
        bool deprecated;
    }

    /// @notice Emitted when a new HookSpec is registered
    event HookSpecRegistered(
        uint256 indexed tokenId,
        string indexed cid,
        address indexed developer,
        string name,
        string version
    );

    /// @notice Emitted when a HookSpec is deprecated
    event HookSpecDeprecated(
        uint256 indexed tokenId,
        string reason
    );

    constructor() ERC721("HookLicense", "HOOK") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Mint a new HookLicense NFT for a validated spec
    /// @param developer Address of the hook developer (receives NFT)
    /// @param ipfsCid IPFS CID of the validated HookSpec document
    /// @param name Human-readable name of the hook
    /// @param version Semantic version of the spec
    /// @param royaltyBps Royalty percentage in basis points (e.g., 500 = 5%)
    /// @return tokenId The minted token ID
    function mint(
        address developer,
        string calldata ipfsCid,
        string calldata name,
        string calldata version,
        uint96 royaltyBps
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        require(cidToTokenId[ipfsCid] == 0, "CID already registered");
        require(bytes(ipfsCid).length > 0, "Empty CID");
        require(developer != address(0), "Zero address developer");

        tokenId = ++_nextTokenId;

        _safeMint(developer, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsCid)));

        cidToTokenId[ipfsCid] = tokenId;
        hookMetadata[tokenId] = HookMetadata({
            name: name,
            version: version,
            developer: developer,
            registeredAt: block.timestamp,
            deprecated: false
        });

        // Set royalty for this token
        if (royaltyBps > 0) {
            _setTokenRoyalty(tokenId, developer, royaltyBps);
        }

        emit HookSpecRegistered(tokenId, ipfsCid, developer, name, version);
    }

    /// @notice Mark a HookSpec as deprecated
    /// @param tokenId Token ID to deprecate
    /// @param reason Reason for deprecation
    function deprecate(uint256 tokenId, string calldata reason) external {
        require(
            ownerOf(tokenId) == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        hookMetadata[tokenId].deprecated = true;
        emit HookSpecDeprecated(tokenId, reason);
    }

    /// @notice Get token ID by IPFS CID
    function getTokenByCid(string calldata cid) external view returns (uint256) {
        uint256 tokenId = cidToTokenId[cid];
        require(tokenId != 0, "CID not registered");
        return tokenId;
    }

    /// @notice Check if a CID is registered
    function isRegistered(string calldata cid) external view returns (bool) {
        return cidToTokenId[cid] != 0;
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

## 8. C6: Platform Frontend

### 8.1 Purpose

Web application for developers to **view system state, upload specs, and manage licenses**.

### 8.2 TODO Tasks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ C6: PLATFORM FRONTEND                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ □ C6.1 System State Viewer (READ ONLY)                                      │
│   ├── Display system-state.md in formatted view                             │
│   ├── Searchable table of state variables                                   │
│   ├── Copy-to-clipboard for symbols and types                               │
│   ├── Show IPFS CID and version info                                        │
│   └── Link to IStateView source code                                         │
│                                                                              │
│ □ C6.2 HookSpec Upload Flow                                                 │
│   ├── File upload (YAML, MD, LaTeX, JSON)                                   │
│   ├── Live validation feedback                                              │
│   ├── Error highlighting with fix suggestions                               │
│   ├── Preview rendered spec before submission                               │
│   └── Wallet connection for authentication                                   │
│                                                                              │
│ □ C6.3 Validation Results UI                                                │
│   ├── Show pass/fail for each validation rule                               │
│   ├── Display detailed error messages                                        │
│   ├── Link errors to relevant spec sections                                 │
│   └── Suggest corrections where possible                                     │
│                                                                              │
│ □ C6.4 IPFS & NFT Minting Flow                                              │
│   ├── Show IPFS upload progress                                             │
│   ├── Display generated CID                                                  │
│   ├── Trigger NFT mint transaction                                          │
│   ├── Show transaction confirmation                                          │
│   └── Display minted NFT with OpenSea link                                   │
│                                                                              │
│ □ C6.5 Developer Dashboard                                                  │
│   ├── List all HookLicense NFTs owned                                       │
│   ├── View spec details and IPFS link                                       │
│   ├── Deprecation controls                                                   │
│   └── Analytics (views, attestations, deployments)                          │
│                                                                              │
│ □ C6.6 HookSpec Editor (Optional)                                           │
│   ├── In-browser YAML/Markdown editor                                       │
│   ├── Syntax highlighting for LaTeX equations                               │
│   ├── Auto-complete for state variable names                                │
│   └── Real-time validation as you type                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Implementation Priority & Dependencies

### 9.1 Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION DEPENDENCY GRAPH                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    ┌─────────────────────┐                                   │
│                    │ C1: System State    │                                   │
│                    │ (system-state.md)   │                                   │
│                    └──────────┬──────────┘                                   │
│                               │                                              │
│                               ▼                                              │
│                    ┌─────────────────────┐                                   │
│                    │ C2: HookSpec Schema │                                   │
│                    │ (hookspec.schema)   │                                   │
│                    └──────────┬──────────┘                                   │
│                               │                                              │
│              ┌────────────────┼────────────────┐                             │
│              │                │                │                             │
│              ▼                ▼                ▼                             │
│    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐                  │
│    │ C3: Validation  │ │ C4: IPFS    │ │ C5: HookLicense │                  │
│    │ Service         │ │ Integration │ │ NFT Contract    │                  │
│    └────────┬────────┘ └──────┬──────┘ └────────┬────────┘                  │
│             │                 │                  │                           │
│             └─────────────────┼──────────────────┘                           │
│                               │                                              │
│                               ▼                                              │
│                    ┌─────────────────────┐                                   │
│                    │ C6: Platform        │                                   │
│                    │ Frontend            │                                   │
│                    └─────────────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Implementation Phases

| Phase | Components | Deliverables | Duration |
|-------|------------|--------------|----------|
| **Phase 1** | C1, C2 | system-state.md, hookspec.schema.json | - |
| **Phase 2** | C3, C4 | Validation API, IPFS service | - |
| **Phase 3** | C5 | HookLicense.sol deployed | - |
| **Phase 4** | C6 | MVP frontend | - |

### 9.3 Master TODO Checklist

```
PHASE 1: FOUNDATION
├── □ C1.1 Parse IStateView interface
├── □ C1.2 Generate system-state.md
├── □ C1.3 Pin to IPFS and version
├── □ C2.1 Define HookSpec JSON schema
├── □ C2.2 Define validation rules
├── □ C2.3 Support multiple formats
└── □ C2.4 Create example HookSpecs

PHASE 2: SERVICES
├── □ C3.1 Document parser
├── □ C3.2 State variable validator
├── □ C3.3 Equation validator
├── □ C3.4 Callback validator
├── □ C3.5 Invariant validator
├── □ C3.6 API endpoints
├── □ C4.1 IPFS client setup
├── □ C4.2 Document packaging
├── □ C4.3 Upload registry
└── □ C4.4 Gateway & retrieval

PHASE 3: CONTRACT
├── □ C5.1 Contract design
├── □ C5.2 Access control
├── □ C5.3 Metadata standard
├── □ C5.4 Events & indexing
└── □ C5.5 Integration points

PHASE 4: FRONTEND
├── □ C6.1 System state viewer
├── □ C6.2 HookSpec upload flow
├── □ C6.3 Validation results UI
├── □ C6.4 IPFS & NFT minting flow
├── □ C6.5 Developer dashboard
└── □ C6.6 HookSpec editor (optional)
```

---

## 10. References

- [State-Space Model](../mathematical-models/state-space-model.md)
- [System Overview](./system-overview.md)
- [Mission Statement](./mission-statement.md)
- [IStateView Interface](https://github.com/Uniswap/v4-periphery/blob/main/src/interfaces/IStateView.sol)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC-2981 Royalty Standard](https://eips.ethereum.org/EIPS/eip-2981)
- [IPFS Documentation](https://docs.ipfs.tech/)
