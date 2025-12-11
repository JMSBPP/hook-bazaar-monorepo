# Hook Bazaar – Market Structure Documentation

## Overview

Hook Bazaar is a marketplace for Uniswap v4 hooks, enabling hook developers to publish hook implementations and protocol designers to purchase hook licenses that can be deployed into specific pools. This document describes the underlying market structure, supported trading mechanisms, the role of LPs, and the design considerations for a sustainable and extensible hook marketplace.

Hooks are not tokens and are not traded using AMMs or liquidity pools. The marketplace provides discovery, pricing, and licensing for hook logic, not financial asset exchange.

---

## 1. Market Mechanisms for Hook Trading

Hook Bazaar supports two primary trading mechanisms.

### 1.1 Direct Marketplace Trading (Primary Mechanism)

This mechanism treats hooks as software modules. Developers register hook templates with metadata and pricing. Protocol designers browse listed hooks and purchase licenses for specific pools. The marketplace deploys parametric clones of the hook template and attaches them as facets to the pool’s MasterHook (Diamond).

Supported pricing models:
- Fixed price (one-time licensing fee)
- Revenue share (percentage of pool swap fees)
- Combined pricing (fixed price + revenue share)

This is the selected model for v1 due to simplicity, clarity, and ease of implementation.

### 1.2 Intent-Based Trading (Future Mechanism)

Protocol designers specify desired outcomes rather than selecting a specific hook. A solver or matching engine proposes suitable hooks using metadata-driven filtering. This mechanism requires standardized capability descriptors, ranking logic, and potential off-chain computation.

Intent-based trading is reserved for later versions due to its complexity.

---

## 2. Analysis of Trading Mechanisms

This section evaluates different marketplace models, their advantages and disadvantages, and their applicability to Hook Bazaar.

### 2.1 Fixed-Price Marketplace

Hooks are purchased at a static upfront cost.

Pros:
- Simple user experience and engineering.
- Predictable developer income.
- No ongoing dependency on pool performance.

Cons:
- May undervalue highly valuable hooks.
- No recurring revenue for developers.
- Higher upfront cost for protocol designers.

Applicability:
Highly suitable and selected as a core mechanism for v1.

---

### 2.2 Revenue-Share Marketplace

Developers receive a percentage of pool swap fees. A Split contract distributes fee revenue between developer, protocol, and optionally the marketplace.

Pros:
- Aligns developer incentives with pool performance.
- No large upfront cost for protocols.
- Suitable for enterprise-grade or high-value hooks.

Cons:
- Reduces the fee share available to LPs and protocol treasury.
- Requires fee distribution integration.
- May create complexity when multiple hooks draw revenue.

Applicability:
Included as an optional mechanism for v1 with safeguards around total revenue share.

---

### 2.3 Auction-Based Pricing

Hooks are sold via English or Dutch auctions.

Pros:
- Market-driven pricing.
- Potentially suitable for limited or premium editions.

Cons:
- Hooks are functional components, not scarce digital assets.
- Adds friction and delays for protocol designers.
- Increased engineering complexity.

Applicability:
Not recommended; excluded from v1.

---

### 2.4 Orderbook-Based Trading

Hooks are traded with bid/ask logic similar to token exchanges.

Pros:
- Strong price discovery.
- Enables secondary market dynamics.

Cons:
- Hooks are not fungible assets.
- Requires liquidity providers or market makers.
- High engineering and operational complexity.

Applicability:
Not suitable; excluded.

---

### 2.5 Subscription / SaaS Billing

Hooks charge recurring subscription fees.

Pros:
- Predictable and stable developer revenue.
- Familiar model for continuous services.

Cons:
- Requires subscription management and revocation logic.
- Less aligned with on-chain economics.
- More complex than revenue-share.

Applicability:
Optional future extension, not relevant for v1.

---

### 2.6 License NFT Model

Hook licenses are represented as NFTs and transferrable.

Pros:
- Supports secondary markets.
- Allows limited-edition licensing.

Cons:
- Encourages speculation rather than productive usage.
- Hooks are functional tools, not collectibles.
- Poor alignment with long-term marketplace goals.

Applicability:
Not recommended.

---

## 3. Selected Trading Model for Hook Bazaar

For v1, Hook Bazaar will use:

1. Direct marketplace trading with fixed-price licensing.
2. Optional revenue-share licensing, implemented using Split contracts.

### Rationale

- Simple and accessible user experience.
- Minimal engineering overhead for v1.
- Flexible monetization for developers.
- Sustainable for protocols of different sizes.
- Avoids unnecessary complexity present in auctions, orderbooks, and intent-based systems.
- Mirrors real-world plugin or module marketplaces while remaining extensible.

---

## 4. Role of LPs in the Hooks Marketplace

Liquidity Providers (LPs) do not participate in Hook Bazaar. Hooks are not financial assets and are not traded using liquidity.

However, hooks may indirectly affect LP economics when revenue-share models are used. Developer revenue is taken from the swap fees already collected by the pool. This reduces the remaining fees available for LPs and the protocol treasury.

LPs do not:
- buy hooks,
- provide liquidity for hooks,
- influence hook pricing or availability.

They are only indirectly affected through fee distribution within the Uniswap v4 pools.

### 4.1 Revenue Share Safeguard

To maintain sustainable pool economics, a cap should be placed on the total revenue share allocated to hooks in a pool. This cap can be enforced by:

- the marketplace at purchase time,
- ProtocolAdmin when attaching hooks,
- or both.

Fixed-price hook purchases do not affect LP yield.

---

## 5. Direct vs Intent-Based Trading Models

### 5.1 Direct Trading

Protocol designers explicitly select a hook from the marketplace. They inspect metadata, pricing, audit status, and capabilities before purchasing. The hook clone is deployed and attached to the target pool.

Advantages:
- Deterministic and transparent.
- Minimal integration complexity.
- No need for capability matching algorithms.

### 5.2 Intent-Based Trading

A future model in which protocol designers specify requirements and the system automatically suggests suitable hooks.

Requirements for this model:
- Capability definitions for hooks.
- Ranking or scoring mechanisms.
- Solver architecture.

Not part of v1 due to complexity.

---

## 6. Market Structure Design Considerations

### 6.1 Pricing Flexibility

Hooks must support fixed-price, revenue-share, and hybrid models to accommodate diverse developer needs.

### 6.2 Capability Metadata

Each hook must expose metadata describing its functionality. This enables discovery, filtering, compatibility checks, and future intent-based models.

### 6.3 Fee Distribution Safety

Total revenue-share across hooks in a pool must remain within acceptable limits to avoid harming LP yield and protocol economics.

### 6.4 Hook Composition

The Diamond architecture allows multiple hooks to be attached to a single pool. A compatibility mechanism must ensure hooks do not conflict, especially if they modify overlapping selectors.

### 6.5 Security and Auditing

Hooks must be accompanied by audit metadata, risk scoring, versioning, and developer reputation data to ensure safe adoption by protocols.

### 6.6 Upgradeability and Lifecycle Management

The system must support:
- upgrading hooks,
- removing or disabling hooks,
- migrating to new versions,
- maintaining state isolation across hooks.

Diamond facets and clone configurations enable these properties.

---

## 7. Clarification of LP Role in Hooks Market

LPs do not participate in the Hook Bazaar. They are not buyers or sellers of hooks. Their involvement is solely within Uniswap v4 pools, where they provide liquidity and receive swap fees.

Revenue-sharing hooks affect LPs only indirectly by modifying the distribution of swap fees inside a pool. This necessitates safeguards to maintain fair economics.

---

## Conclusion

Hook Bazaar is a licensing-based marketplace for Uniswap v4 hooks. After evaluating numerous trading models, the system adopts direct trading with optional revenue-share in v1. This approach balances usability, extensibility, and economic sustainability.

LPs do not directly participate in the marketplace but must be considered in fee distribution design when revenue-share hooks are used. The chosen market structure provides a robust foundation for evolving into more advanced mechanisms such as intent-based trading in future versions.
