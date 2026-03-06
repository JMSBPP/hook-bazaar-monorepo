# hook-pkg/market: Roadmap

## Core Marketplace

| Status | Feature | Reference |
|--------|---------|-----------|
| Designed | IHaaSMarket interface | [HaaSMod.sol:19](../../../contracts/src/hook-pkg/HaaSMod.sol) |
| Designed | IHookLicenseIssuer interface | [HaaSMod.sol:17](../../../contracts/src/hook-pkg/HaaSMod.sol) |
| Designed | Fixed-price licensing | [market_structure_docs.md](../../hook-market-pkg/market_structure_docs.md) |
| Designed | Revenue-share licensing | [market_structure_docs.md](../../hook-market-pkg/market_structure_docs.md) |
| Designed | Hybrid pricing model | [market_structure_docs.md](../../hook-market-pkg/market_structure_docs.md) |
| TODO | HooksMarket contract implementation | Full marketplace logic |
| TODO | Hook Registry contract | Hook template storage |
| TODO | License NFT minting | ERC721 license tokens |
| TODO | Clone deployment logic | Parametric hook clones |

## Splits Integration

| Status | Feature | Reference |
|--------|---------|-----------|
| Designed | 0xSplits architecture | [integrations.md](../../hook-market-pkg/integrations.md) |
| TODO | SplitMain integration | Factory for split contracts |
| TODO | Per-license split creation | Automated split deployment |
| TODO | Fee distribution flow | afterSwap -> Warehouse -> Split |
| TODO | Revenue share cap enforcement | Max 30% developer share |

## Discovery System

| Status | Feature | Notes |
|--------|---------|-------|
| TODO | Hook metadata schema | Name, description, category, capabilities |
| TODO | Category taxonomy | Swap, liquidity, oracle, fee hooks |
| TODO | Search and filter API | By price, attestation, developer |
| TODO | Usage statistics tracking | Deployment count, TVL, revenue |
| TODO | Developer reputation system | History, attestation rate |

## Pricing Engine

| Status | Feature | Notes |
|--------|---------|-------|
| TODO | Fixed price validation | Minimum price requirements |
| TODO | Revenue share calculation | Basis points enforcement |
| TODO | Hybrid model logic | Upfront + ongoing split |
| TODO | Multi-hook cap enforcement | Total pool share limits |

## Future Mechanisms (Post-v1)

| Status | Feature | Notes |
|--------|---------|-------|
| Future | Intent-based trading | Solver architecture for hook matching |
| Future | Capability descriptors | Standardized hook capabilities |
| Future | Subscription model | Recurring license payments |
| Future | Secondary market | License NFT transfers |
