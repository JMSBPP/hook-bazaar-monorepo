# hook-pkg/market: Hook Marketplace Solution Specification

## Problem Description

The Uniswap V4 hooks ecosystem lacks:
- Centralized discovery for hook implementations
- Standardized pricing and licensing models
- Safe deployment and attachment mechanisms
- Revenue distribution for hook developers

## Solution Overview

The market subsystem provides infrastructure for hook discovery, licensing, and deployment:

```mermaid
flowchart TB
    subgraph Context["Hook Marketplace Context"]
        HooksMarket["IHaaSMarket<br/>(Marketplace Interface)"]
        HookLicenseIssuer["IHookLicenseIssuer<br/>(License Management)"]
        HookRegistry["Hook Registry<br/>(Discovery)"]
        SplitsIntegration["Splits Protocol<br/>(Revenue Distribution)"]
    end

    HookDeveloper["Hook Developer"] -->|"register hook template"| HookRegistry
    HookDeveloper -->|"set pricing model"| HooksMarket
    ProtocolAdmin["Protocol Admin"] -->|"browse hooks"| HookRegistry
    ProtocolAdmin -->|"purchase license"| HooksMarket
    HooksMarket -->|"issue license"| HookLicenseIssuer
    HooksMarket -->|"configure splits"| SplitsIntegration
    HooksMarket -->|"deploy clone"| MasterHook["MasterHook Diamond"]
```

## Context Diagram

```mermaid
flowchart TB
    subgraph Environment["Hook Market Environment"]
        subgraph Marketplace["Hook Bazaar Marketplace"]
            Registry["Hook Registry"]
            Pricing["Pricing Engine"]
            Licensing["License Manager"]
            Deployment["Clone Deployer"]
        end
    end

    Developer["Hook Developer"] -->|"register"| Registry
    Developer -->|"set price"| Pricing

    Protocol["Protocol Admin"] -->|"browse"| Registry
    Protocol -->|"purchase"| Pricing
    Protocol -->|"receive"| Licensing

    Pricing -->|"fixed/revenue-share"| Splits["Splits Protocol"]
    Licensing -->|"unlock"| Deployment
    Deployment -->|"attach facet"| MasterHook["MasterHook"]
```

## Pricing Models

### Fixed Price Licensing

```mermaid
sequenceDiagram
    participant Protocol as Protocol Admin
    participant Market as HooksMarket
    participant Treasury as Developer Treasury
    participant Diamond as MasterHook

    Protocol->>Market: purchaseHook(hookId, poolId, FIXED_PRICE)
    Market->>Treasury: transfer(fixedAmount)
    Market->>Market: issueLicense(protocol, hookId, poolId)
    Market->>Diamond: attachFacet(hookFacet, poolId)
    Market-->>Protocol: License NFT
```

### Revenue Share Licensing

```mermaid
sequenceDiagram
    participant Protocol as Protocol Admin
    participant Market as HooksMarket
    participant Splits as Splits Protocol
    participant Diamond as MasterHook
    participant Swap as Swap Execution

    Protocol->>Market: purchaseHook(hookId, poolId, REVENUE_SHARE)
    Market->>Splits: createSplit(developer, protocol, shares)
    Splits-->>Market: splitAddress
    Market->>Diamond: attachFacet(hookFacet, poolId)
    Market->>Diamond: configureFeeRecipient(splitAddress)
    Market-->>Protocol: License with Split

    Note over Swap: Later, during swaps...
    Swap->>Diamond: afterSwap() collects fees
    Diamond->>Splits: distribute(fees)
    Splits->>Developer: developer share
    Splits->>Protocol: protocol share
```

### Hybrid Pricing

```mermaid
flowchart LR
    subgraph Hybrid["Hybrid Model"]
        Fixed["Fixed Upfront<br/>One-time payment"]
        Revenue["Revenue Share<br/>Ongoing distribution"]
    end

    Purchase["Purchase"] --> Fixed
    Fixed --> Revenue
    Revenue -->|"swap fees"| Distribution["Fee Distribution"]
```

## Marketplace Interface

```solidity
interface IHaaSMarket {
    /// @notice Unlock a hook license for a pool
    function unlock(IHookLicenseIssuer licenseIssuer, PoolId poolId) external;

    /// @notice Register a new hook template
    function registerHook(
        address hookTemplate,
        PricingModel pricing,
        bytes calldata metadata
    ) external returns (uint256 hookId);

    /// @notice Purchase a hook license
    function purchaseHook(
        uint256 hookId,
        PoolId targetPool,
        PricingModel selectedModel
    ) external payable returns (uint256 licenseId);

    /// @notice Get hook metadata
    function getHookMetadata(uint256 hookId) external view returns (HookMetadata memory);
}

enum PricingModel {
    FIXED_PRICE,
    REVENUE_SHARE,
    HYBRID
}

struct HookMetadata {
    address developer;
    address template;
    string name;
    string description;
    string specificationURI;
    uint256 fixedPrice;
    uint256 revenueShareBps;
    bool isAttested;
    uint256 attestationExpiry;
}
```

## Integration with Splits Protocol

Reference: [integrations.md](../../hook-market-pkg/integrations.md)

```mermaid
flowchart TB
    subgraph Splits["0xSplits Integration"]
        SplitMain["SplitMain<br/>(Factory)"]
        Split["Split Contract<br/>(Per License)"]
        Warehouse["Warehouse<br/>(Fee Collection)"]
    end

    subgraph HookBazaar["Hook Bazaar"]
        Market["HooksMarket"]
        Hook["Hook Facet"]
    end

    Market -->|"createSplit"| SplitMain
    SplitMain -->|"deploy"| Split
    Hook -->|"afterSwap fees"| Warehouse
    Warehouse -->|"distribute"| Split
    Split -->|"developer %"| Developer["Developer"]
    Split -->|"protocol %"| Protocol["Protocol"]
    Split -->|"marketplace %"| Marketplace["Marketplace Fee"]
```

## Revenue Share Safeguards

| Safeguard | Limit | Enforcement |
|-----------|-------|-------------|
| Max developer share | 30% | Marketplace contract |
| Max total hook share | 50% | ProtocolAdmin |
| Min LP share | 50% | Diamond facet |

## Hook Registration Flow

```mermaid
sequenceDiagram
    participant Dev as Hook Developer
    participant Market as HooksMarket
    participant Registry as Hook Registry
    participant AVS as Attestation AVS

    Dev->>Market: registerHook(template, pricing, metadata)
    Market->>Registry: store hook metadata
    Registry-->>Market: hookId

    opt Request Attestation
        Dev->>AVS: createAttestationTask(hook, specURI)
        AVS-->>AVS: verify compliance
        AVS->>Registry: updateAttestationStatus(hookId, attested)
    end

    Market-->>Dev: hookId (listed in marketplace)
```

## Discovery Interface

```mermaid
flowchart LR
    subgraph Query["Discovery Queries"]
        ByCategory["filterByCategory()"]
        ByPrice["filterByPrice()"]
        ByAttestation["filterByAttestation()"]
        ByDeveloper["filterByDeveloper()"]
    end

    subgraph Results["Query Results"]
        Metadata["Hook Metadata"]
        Pricing["Pricing Info"]
        Attestation["Attestation Status"]
        Usage["Usage Stats"]
    end

    ByCategory --> Results
    ByPrice --> Results
    ByAttestation --> Results
    ByDeveloper --> Results
```

## State Transition: License Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unlisted: Developer creates hook

    Unlisted --> Listed: registerHook()
    Listed --> Attested: AVS verification

    Listed --> Licensed: purchaseHook()
    Attested --> Licensed: purchaseHook()

    Licensed --> Active: attachToPool()
    Active --> Revoked: revokeLicense()
    Active --> Expired: attestation expires
    Expired --> Active: renewAttestation()
```
