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

- name is specified,
- token is minted associated with owner

- This token represents the protocol. 
Thus it needs to have roles initially defined by the owner


- The protocol's factors of production are its custom pools.
(These are the intermediate nests if one connects them to computable general equilibrium models of firms.)

- The raw factors of production are the underlying tokens used to form the pools; these are the tokens provided to the protocol to create pools and are not designed by the pool itself.


- Once the token is created the ERC1155Receiver is a created ProtocolAdmin at run-time

(THE ONLY ADDRESS THAT CAN WRITE TO THE PROTOCOL ADMIN is the 
address specified by the protocol as the executor.)

(THE ONLY ADDRESS THAT CAN SET THE ROLE OF EXECUTOR FOR THE
PROTOCOL ADMIN IS THE OWNER, WHICH IS THE DEPLOYER, THAT IS, THE PROTOCOL_FACTORY.)

What are the pre-conditions, requirements, and restrictions for someone to create a protocol?


This ProtocolAdmin is a clone (because all PortocolAdmins have the same interface)

The protocolAdmin is a diamond becuase it exposes multiple
use cases for the protocol admins or roles

- It exposes lens, These are the details from the created protocol

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


- The system does not provide interface for token creation, It only provides createPool interface.

Then it needs to specify the pair of tokens and an address for the trassuryManagement . Then a fully upgreadable treassuryManagement interface is deployed and it's functions can be upgraded or written by the address provided

> This covers the revnue side of things



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


