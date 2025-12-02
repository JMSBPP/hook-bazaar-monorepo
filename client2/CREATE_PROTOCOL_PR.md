## Craete Protocol Flow (Partially Completed)

- Once a transaction fails or it is canceled it needs to close the create protocol pop up but not affect subsequente create protocol creations.

If a create_protocol transaction succeeds, then what follows is

- After success confetti is shown in the whole screen
- The dashboar MUST only be shown to the logged in address with the PROTOCOLS this address has created


- A @ProtocolDesginerDashboard ProtocolDetailsFromat is instantiated with the 

- This seems to be done on an indexer, meaioning hearing the event 
ProtocolCreated and from the data fill the ProtocolDetailsFormat

The add website on prtocol detials is a permissioned (only protocol creator) call to setTokenURI only allowed to the protocol creator OR the protocol_admin_manager

The creater pool on protocolDetails is a permissioned (only protocol creator) call to create_pool only allowed to the protocol creator OR the protocol_admin_manager

- The fee recipient remains empty until pool creation. On pool creation allowed callers can specify a fee recipant address compliant with a Vault, trasurey interface. Thjis function also emits an event




- Socials are stored in a centralized database using the protocol token ID and protocol caller as keys.
```
{
    socials {
        "admin": "address", 
        "protocol_id": "uint256",
        "X": "hyperlink",
        "farcaster": "handle",  \\ "@..."
        "zora": "handle", \\ "@..."
    }
}
```




projetc ID, alchemy API key, PRIVATE_Kye must be secret




The roles are a call to edit a governance contract on the Protocol
