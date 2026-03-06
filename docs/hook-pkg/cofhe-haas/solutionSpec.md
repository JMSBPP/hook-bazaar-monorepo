# hook-pkg/cofhe-haas: CoFHE IP Protection Solution Specification

## Problem Description

Hook developers face IP theft risk because:
- Deployed bytecode is publicly readable
- Decompilation reveals algorithmic logic
- Competitors can copy and redeploy without compensation
- Premium algorithms (MEV protection, IL mitigation) lose competitive advantage

## Solution Overview

The CoFHE (Confidential FHE) subsystem provides IP protection through Fhenix encryption:

```mermaid
flowchart TB
    subgraph Context["CoFHE HaaS Context"]
        CoFHEHook["CoFHEHook<br/>(IHooks Wrapper)"]
        CoFHEHookMod["CoFHEHookMod<br/>(Encrypted Logic)"]
        EncryptedState["Encrypted State<br/>(euint256, eaddress, etc.)"]
    end

    PoolManager["Uniswap V4 PoolManager"] -->|"plaintext params"| CoFHEHook
    CoFHEHook -->|"encrypted params"| CoFHEHookMod
    CoFHEHookMod -->|"encrypted state"| EncryptedState
    CoFHEHookMod -->|"encrypted result"| CoFHEHook
    CoFHEHook -->|"decrypted result"| PoolManager

    Developer["Hook Developer"] -->|"setHookMod"| CoFHEHook
    Developer -->|"setVerifierAuthorization"| CoFHEHook
    AVSVerifier["AVS Verifier"] -->|"authorized access"| CoFHEHook
```

## Component Responsibilities

| Contract | Source | Responsibility |
|----------|--------|----------------|
| `CoFHEHook` | [src/hook-pkg/CoFHEHook.sol](../../../contracts/src/hook-pkg/CoFHEHook.sol) | IHooks interface, encryption/decryption boundary |
| `ICoFHEHookMod` | [src/hook-pkg/interfaces/ICoFHEHookMod.sol](../../../contracts/src/hook-pkg/interfaces/ICoFHEHookMod.sol) | Encrypted callback interface |
| `ICoFHETypes` | [src/hook-pkg/interfaces/ICoFHETypes.sol](../../../contracts/src/hook-pkg/interfaces/ICoFHETypes.sol) | Encrypted type definitions |

## Encryption Architecture

```mermaid
flowchart LR
    subgraph Plaintext["Plaintext Layer"]
        PoolKey["PoolKey"]
        SwapParams["SwapParams"]
        BalanceDelta["BalanceDelta"]
    end

    subgraph Encrypted["Encrypted Layer (Fhenix)"]
        EPoolKey["EPoolKey"]
        ESwapParams["ESwapParams"]
        EBalanceDelta["EBalanceDelta"]
    end

    subgraph FHETypes["Fhenix Types"]
        euint32["euint32"]
        euint128["euint128"]
        euint256["euint256"]
        eaddress["eaddress"]
        ebool["ebool"]
    end

    PoolKey -->|"_encryptPoolKey"| EPoolKey
    SwapParams -->|"_encryptSwapParams"| ESwapParams
    BalanceDelta -->|"_encryptBalanceDelta"| EBalanceDelta

    EPoolKey --> euint32 & eaddress
    ESwapParams --> ebool & euint256
    EBalanceDelta --> euint128
```

## Encrypted Type Definitions

```solidity
// Encrypted PoolKey
struct EPoolKey {
    eaddress currency0;
    eaddress currency1;
    euint32 fee;         // uint24 -> euint32
    euint32 tickSpacing; // int24 -> euint32
    eaddress hooks;
}

// Encrypted SwapParams
struct ESwapParams {
    ebool zeroForOne;
    euint256 amountSpecified; // int256 stored as magnitude
    euint256 sqrtPriceLimitX96;
}

// Encrypted ModifyLiquidityParams
struct EModifyLiquidityParams {
    euint32 tickLower;
    euint32 tickUpper;
    euint256 liquidityDelta;
    euint256 salt;
}

// Encrypted BalanceDelta
struct EBalanceDelta {
    euint128 amount0;
    euint128 amount1;
}

// Encrypted BeforeSwapDelta
struct EBeforeSwapDelta {
    euint128 deltaSpecified;
    euint128 deltaUnspecified;
}
```

## Callback Flow

```mermaid
sequenceDiagram
    participant PM as PoolManager
    participant Hook as CoFHEHook
    participant Mod as CoFHEHookMod
    participant FHE as Fhenix FHE

    PM->>Hook: beforeSwap(sender, key, params, data)

    Note over Hook: Encryption Phase
    Hook->>FHE: FHE.asEaddress(sender)
    FHE-->>Hook: eaddress sender
    Hook->>FHE: _encryptPoolKey(key)
    FHE-->>Hook: EPoolKey
    Hook->>FHE: _encryptSwapParams(params)
    FHE-->>Hook: ESwapParams

    Hook->>Mod: beforeSwap(eSender, eKey, eParams, data)
    Note over Mod: Encrypted computation<br/>(logic hidden)
    Mod-->>Hook: (selector, EBeforeSwapDelta, euint32 fee)

    Note over Hook: Decryption Phase
    Hook->>FHE: FHE.decrypt(eDelta)
    FHE-->>Hook: BeforeSwapDelta
    Hook->>FHE: FHE.decrypt(eFee)
    FHE-->>Hook: uint24 fee

    Hook-->>PM: (selector, delta, fee)
```

## Authorization Model

```mermaid
flowchart TB
    subgraph Access["Access Control"]
        Developer["developer<br/>(immutable)"]
        Verifiers["authorizedVerifiers<br/>(mapping)"]
    end

    subgraph Actions["Authorized Actions"]
        SetMod["setHookMod()"]
        SetAuth["setVerifierAuthorization()"]
        StateAccess["Decrypt state access"]
    end

    Developer -->|"onlyDeveloper"| SetMod
    Developer -->|"onlyDeveloper"| SetAuth
    Developer -->|"onlyAuthorized"| StateAccess
    Verifiers -->|"onlyAuthorized"| StateAccess
```

## State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Deployed: constructor(poolManager, developer)

    Deployed --> ModSet: setHookMod(mod)
    ModSet --> Ready: hookMod != address(0)

    Ready --> Processing: PoolManager callback
    Processing --> Encrypting: receive plaintext
    Encrypting --> Computing: call hookMod
    Computing --> Decrypting: receive encrypted result
    Decrypting --> Ready: return plaintext

    Ready --> ModSet: setHookMod(newMod)
```

## Security Considerations

| Consideration | Mitigation |
|---------------|------------|
| Developer key compromise | Immutable developer address |
| Verifier collusion | Limited verifier set, slashing via AVS |
| Decryption oracle attacks | onlyAuthorized modifier |
| Gas cost overhead | Batch operations where possible |
| Fhenix availability | Fallback to non-encrypted mode (future) |

## Integration with AVS Verification

```mermaid
flowchart TB
    subgraph Verification["AVS Verification Layer"]
        Operator["AVS Operator"]
        TaskManager["HookAttestationTaskManager"]
    end

    subgraph CoFHE["CoFHE Hook"]
        Hook["CoFHEHook"]
        Auth["authorizedVerifiers"]
    end

    Developer["Developer"] -->|"setVerifierAuthorization"| Auth
    Operator -->|"authorized"| Auth
    Auth -->|"allows"| Hook
    Operator -->|"sample encrypted state"| Hook
    Operator -->|"verify against spec"| TaskManager
```

## Gas Considerations

| Operation | Estimated Overhead |
|-----------|-------------------|
| Encryption (per param) | ~10-50k gas |
| Decryption (per return) | ~10-50k gas |
| Encrypted computation | ~2-10x plaintext |
| beforeSwap total | ~100-300k gas (vs ~20-50k plaintext) |

Note: Gas costs depend on Fhenix network conditions and encryption complexity.
