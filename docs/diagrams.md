# Hook Bazaar: System Context Diagram

## Context Diagram

```mermaid
flowchart TB
    subgraph Environment["Hook Bazaar Environment"]
        subgraph HookBazaar["Hook Bazaar System"]
            ProtocolPkg["protocol-pkg"]
            HooksOperatorAVS["hooks-operator-avs"]
            HookPkg["hook-pkg"]
            MasterHookPkg["master-hook-pkg"]
        end
    end

    %% External Actors
    ProtocolAdmin["Protocol Admin"]
    HookDeveloper["Hook Developer"]
    AVSOperator["AVS Operator"]
    Trader["Trader/LP"]

    %% External Systems
    UniswapV4["Uniswap V4 PoolManager"]
    EigenLayer["EigenLayer AVSDirectory"]
    IPFS["IPFS (Specifications)"]
    Fhenix["Fhenix CoFHE"]

    %% Actor -> System flows
    ProtocolAdmin -->|"create_protocol\ncreate_pool"| ProtocolPkg
    HookDeveloper -->|"commitToHookSpec\npost implementation"| HookPkg
    AVSOperator -->|"acceptBondedEngagement\nrespondToTask"| HooksOperatorAVS
    Trader -->|"swap\naddLiquidity"| UniswapV4

    %% System -> External flows
    ProtocolPkg -->|"initialize pool"| UniswapV4
    HooksOperatorAVS -->|"registerOperator\nslash"| EigenLayer
    HookPkg -->|"fetch spec"| IPFS
    HookPkg -.->|"encrypted code (future)"| Fhenix
    MasterHookPkg -->|"hook callbacks"| UniswapV4

    %% Internal flows
    ProtocolPkg --> MasterHookPkg
    HooksOperatorAVS --> HookPkg
    HookPkg --> MasterHookPkg
```

## Actor Descriptions

| Actor | Role | Primary Interactions |
|-------|------|---------------------|
| **Protocol Admin** | Creates protocols and pools | `create_protocol`, `create_pool`, `delegatePoolCreatorRole` |
| **Hook Developer** | Builds and monetizes hooks | `commitToHookSpec`, deploy `HaaSFacet` implementations |
| **AVS Operator** | Verifies hook compliance | `acceptBondedEngagement`, `respondToAttestationTask` |
| **Trader/LP** | End user of pools | Swaps and liquidity operations via Uniswap V4 |

## External System Boundaries

| System | Interface Type | Purpose |
|--------|---------------|---------|
| **Uniswap V4 PoolManager** | Smart Contract | Pool initialization, swap execution, hook callbacks |
| **EigenLayer AVSDirectory** | Smart Contract | Operator registration, stake management, slashing |
| **IPFS** | Storage | Hook specification documents (JSON/YAML) |
| **Fhenix CoFHE** | Encryption | IP-protected hook implementations (future) |

## Communication Channels

```mermaid
flowchart LR
    subgraph OnChain["On-Chain"]
        ProtocolAdminClient
        HookAttestationTaskManager
        AttestationRegistry
        HaaSVendorManagement
        ClearingHouse
        EscrowCoordinator
        HaaSFacet
    end

    subgraph OffChain["Off-Chain"]
        OperatorRuntime["Operator Runtime (TypeScript)"]
        IPFSGateway["IPFS Gateway"]
    end

    OperatorRuntime -->|"event listener"| HookAttestationTaskManager
    OperatorRuntime -->|"state sampling"| HaaSFacet
    OperatorRuntime -->|"spec fetch"| IPFSGateway
    OperatorRuntime -->|"submit response"| HookAttestationTaskManager
```

## Data Flow Summary

1. **Protocol Creation**: `ProtocolAdmin` -> `ProtocolAdminClient` -> `ProtocolAdminRegistry` -> `ProtocolAdminManager`
2. **Pool Creation**: `ProtocolAdmin` -> `ProtocolAdminClient` -> `ProtocolHookMediator` -> `UniswapV4.initialize`
3. **Hook Registration**: `HookDeveloper` -> `HaaSVendorManagement.commitToHookSpec` -> `HookLicense NFT`
4. **Attestation Flow**: `createAttestationTask` -> `OperatorRuntime` -> `respondToAttestationTask` -> `AttestationRegistry`
5. **Bonded Engagement**: `HookDeveloper` -> `EscrowCoordinator.postBond` -> `ClearingHouse.acceptBondedEngagement`
