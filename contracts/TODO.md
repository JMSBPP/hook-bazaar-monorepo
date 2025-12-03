


- Create Protocol FLow

- The protocol designed cresates protocol respresented as tokens of some multi-token stantdards

- Each protocol can have multiple pools attached to it.

- The only conditions are:
  - An address specified by the protocol designer as treasury is the recipient of part of the recipients list of the protocol fees on the pool.
  - The protocol designer specifies the pool parameters except for the hooks on poolKey, which must be attached to a masterHook (diamond) interface.

- The protocol desginer specifies the name of the protocol, and additional metadat is auto-created

- Once the token is created the ERC1155Receiver is a created ProtocolAdmin at run-time

- PRs should target branch: feat/create-protocol

```json
{
  "name": "",
  "Tokens":[
    {
      "This object exposes the tokens used by the protocol
       used, incorporated, etc"
    }
  ],
  "Pools": [
    {
      "This tracks the pools created or from  where the protocol receives revenue from it also provides analytics on protocol"
    }
  ],

  "Hooks":[
    {
      "This is a mapping of hooks used per pool, it alsso  needs to have the cost paid for hook and the funcationality the hooks is giving to the pool"
    }
  ]

}
```

## Exclussions
- The system does not provide interface for token creation, It only provides createPool interface.

Then it needs to specify the pair of tokens and an address for the trassuryManagement . Then a fully upgreadable treassuryManagement interface is deployed and it's functions can be upgraded or written by the address provided


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

