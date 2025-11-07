- Create Protocol FLow

```
get started
|
I am a protocol designer
|
create protocol
|

{
  id: string;              // Unique protocol identifier (ERC-1155 tokenId)
  // feeRecipient: REMOVED - pools define their own
  name: string;            // Protocol name
  pools: number;           // Number of pools (starts at 0)
  revenue: string;         // Aggregated revenue from all pools
  status: 'active' | 'pending' | 'inactive';
}
```
The ERC1155 facet is the ProtocolFactory component

- Each tokenId is a protocol instance

```
// Example tokenId allocation
tokenId = 1 → Protocol "DeFi Protocol Alpha"
tokenId = 2 → Protocol "Liquidity Hub Beta"
tokenId = 3 → Protocol "Yield Farm Gamma"
// etc.
```

Balance = 1: Protocol exists
Balance = 0: Protocol doesn't exist or was burned

- For each protocol ERC-5169 enables executable scripts attached to tokens. For protocols, this enables:
```
- Transformation function F logic
- Pool connection rules
- Aggregation methods
```


Pool Structure

```

{
  id: string; // NOTE: This matches PoolId bytes32 on PoolManager
  protocolId: string;      // Links pool to protocol (tokenId)
  feeRevenueReceiver: string;  // Pool-specific fee recipient
  tokenPair: string;
  feeTier: string;
  // ... other pool data
}

```


