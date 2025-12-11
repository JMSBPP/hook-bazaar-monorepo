# protocol-pkg: Solution Specification

## Problem Description

Protocol designers require permissioned interfaces to:
- Create and manage Uniswap V4 pool configurations
- Delegate pool creation authority to team members
- Track protocol revenue and pool metrics
- Maintain protocol metadata and identity

Without standardized tooling, each protocol must build custom administration infrastructure.

## Solution Overview

The `protocol-pkg` provides a hierarchical administration system using the Diamond pattern:

```mermaid
flowchart TB
    subgraph Context["protocol-pkg Context"]
        ProtocolAdminClient["ProtocolAdminClient<br/>(Entry Point)"]
        ProtocolAdminPanel["ProtocolAdminPanel<br/>(Diamond)"]
        ProtocolAdminRegistry["ProtocolAdminRegistry<br/>(Facet)"]
        ProtocolFactoryFacet["ProtocolFactoryFacet<br/>(Facet)"]
        ProtocolAdminManager["ProtocolAdminManager<br/>(Clone per Protocol)"]
    end

    ProtocolAdmin["Protocol Admin"] -->|"create_protocol\ncreate_pool"| ProtocolAdminClient
    ProtocolAdminClient --> ProtocolAdminPanel
    ProtocolAdminPanel --> ProtocolAdminRegistry
    ProtocolAdminPanel --> ProtocolFactoryFacet
    ProtocolAdminRegistry -->|"clone"| ProtocolAdminManager
    ProtocolAdminClient -->|"notify"| ProtocolHookMediator["ProtocolHookMediator"]
    ProtocolHookMediator -->|"initialize"| UniswapV4["Uniswap V4 PoolManager"]
```

## Component Responsibilities

| Contract | Source | Responsibility |
|----------|--------|----------------|
| `ProtocolAdminClient` | [src/protocol-pkg/ProtocolAdminClient.sol](../../contracts/src/protocol-pkg/ProtocolAdminClient.sol) | Entry point for protocol and pool creation |
| `ProtocolAdminPanel` | [src/protocol-pkg/ProtocolAdminPanel.sol](../../contracts/src/protocol-pkg/ProtocolAdminPanel.sol) | Diamond container for facets |
| `ProtocolAdminRegistry` | [src/protocol-pkg/ProtocolAdminRegistry.sol](../../contracts/src/protocol-pkg/ProtocolAdminRegistry.sol) | Protocol-to-manager mapping, pool tracking |
| `ProtocolFactoryFacet` | [src/protocol-pkg/ProtocolFactoryFacet.sol](../../contracts/src/protocol-pkg/ProtocolFactoryFacet.sol) | ERC1155 protocol token minting |
| `ProtocolAdminManager` | [src/protocol-pkg/ProtocolAdminManager.sol](../../contracts/src/protocol-pkg/ProtocolAdminManager.sol) | Per-protocol access control and pool storage |

## Workflow Activity Diagram

```mermaid
sequenceDiagram
    participant PA as ProtocolAdmin
    participant Client as ProtocolAdminClient
    participant Panel as ProtocolAdminPanel
    participant Registry as ProtocolAdminRegistry
    participant Factory as ProtocolFactoryFacet
    participant Manager as ProtocolAdminManager
    participant Mediator as ProtocolHookMediator
    participant V4 as UniswapV4

    %% Protocol Creation
    PA->>Client: create_protocol(name)
    Client->>Panel: setProtocolManager(tokenId, caller)
    Panel->>Registry: setProtocolManager()
    Registry-->>Manager: clone + initialize
    Panel->>Factory: create_protocol(name, manager, tokenId)
    Factory-->>Manager: mint ERC1155 token
    Manager-->>Manager: store tokenId, name via onERC1155Received
    Client-->>PA: (tokenId, managerAddress)

    %% Pool Creation
    PA->>Client: create_pool(protocolId, poolKey, sqrtPrice)
    Client->>Panel: isPoolCreator(manager, caller)
    Panel->>Registry: isPoolCreator()
    Registry->>Manager: isPoolCreator(caller)
    Manager-->>Registry: true/false
    alt is pool creator
        Client->>Mediator: notify(create_pool, encoded params)
        Mediator->>V4: initialize(poolKey, sqrtPrice)
        V4-->>Mediator: (tick, poolId)
        Mediator-->>Client: (tick, poolId)
        Client->>Panel: addPool(manager, poolId)
        Panel->>Registry: addPool()
        Registry->>Manager: setPool(poolId)
        Client-->>PA: (poolId, tick)
    else not pool creator
        Client-->>PA: revert UnauthorizedCaller
    end
```

## State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Uninitialized: Deploy
    Uninitialized --> Initialized: initialize()

    state Initialized {
        [*] --> NoProtocols
        NoProtocols --> HasProtocols: create_protocol()

        state HasProtocols {
            [*] --> NoPools
            NoPools --> HasPools: create_pool()
            HasPools --> HasPools: create_pool()
        }
    }
```

## Access Control Model

```mermaid
flowchart TB
    subgraph Roles["Access Control Roles"]
        Owner["Owner<br/>(Protocol Deployer)"]
        Creator["CREATOR Role<br/>(Protocol Creator)"]
        PoolCreator["POOL_CREATOR Role<br/>(Delegated)"]
    end

    Owner -->|"initialize"| ProtocolAdminClient
    Creator -->|"delegatePoolCreatorRole"| PoolCreator
    Creator -->|"setURI"| ProtocolAdminManager
    PoolCreator -->|"create_pool"| ProtocolAdminClient
```

## Data Structures

```solidity
// ProtocolAdminManager storage
struct ProtocolAdminManagerStorage {
    address adminPanel;
    bool isClone;
    uint256 tokenId;
    string name;
    mapping(URI_TYPE => string) uris;
    PoolId[] pools;
}

enum URI_TYPE {
    ZORA,
    WEBSITE,
    X,
    FARCASTER
}
```

## Integration Points

| Integration | Direction | Purpose |
|-------------|-----------|---------|
| ProtocolHookMediator | Outbound | Pool initialization via Uniswap V4 |
| Uniswap V4 PoolManager | Indirect | Pool state management |
| ERC1155 Token | Ownership | Protocol identity and transferability |
