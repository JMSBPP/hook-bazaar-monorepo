- Create Protocol FLow

```
get started
|
I am a protocol designer
|
create protocol
|

User calls createProtocol() → mints tokenId
   ↓
```
The ERC1155 facet is the ProtocolRegistry component

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




------Pool Creation

- For pool creation the user needs to specify the entry point for
protocol fee, its receipiant and possibly its model

Once this is specified in the UI, it is passed to the "PoolBuilder," which is an operator created when a protocol is deployed. The PoolBuilder acts as the intermediary between the UI and the PoolManager for pool initialization. This is necessary because it handles the requirements for protocol fee management.



- For each protocol ERC-5169 enables executable scripts attached to tokens. For protocols, this enables:

> From now the one of our interest is ...

```
- Pool connection rules
// ...
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


