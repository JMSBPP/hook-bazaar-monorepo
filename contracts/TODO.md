- uhi7 branch integration ci/cd
	- This needs to be tested against current code base and other branche


Create a temp branch on upstream to test this CI workflow works agains current uhi7 state and test against other branches MAKE sure to output a sepearet dir ci-testing/ the findgindgs and next steps




- ProtocolAdminRegistry:
  - INITIALIZATION
    - MUST be initialized once
    - MUST set the caller as upgradeAdmin
    - MUST set the implementation as ProtocolAdminManager



- create protocol
  - The creator is set by a protocolAdminManager which MUST be the caller of createProtocol initially

  - The protocolAdminManager MUST implement IERC1155Receiver

  - Once, the creator is set it MUST have permission to add governance 

  - The tokenURI is set concatenating with the /loggedIn?=protocolDashboard/protocolId?=tokenURI


  - Since protocolAdmin 1----->* tokenId 1----> 1 protocolAdminManager


- ProtocolAdminManager returns  to the client the initialization of the protocol and then the client asks the 
panel to unclock functionality to caller


  Then ProtocolAdminManager can only MANAGE (CUD) pools associated with (protocolAdmin, tokenId)
    - The initial only caller of protocolAdminManager is the protocolAdmin, but we can provide access control to other accounts or governance mechanisms
  - What are the advantages of doing in this way instead of directly on the AdminClient

  - Let's explore the adminClient case :
    protocolAdmin ---> client.createPool 
                          --> isValidCreator 
                            --> attach masterHook
                            --> attach treassury

- ProtocolAdminClient.fork.t.sol
  - createPool flow with masterHook and protocolHookMaster
  - Ensure the only entry point to initialize a pool with HookMatter attached to it is through the client

- Study possible EigenLayer integration
  - BondedHooks reference
  - EigenLayerDocumentation

- Connect Figma MCP and frontend system prompt and tooling to Claude
- Make github system prompt 
- Make indexer system prompt 


- Revenue MultiAsset Vault (Eahc Vault is a dedicated pool revenue vault)
- Revennue PoolVault

- Connect to HookDB, both at contract level queris and frontend

- Create staking mechaincs both for ProtocolDevelopers and HookDevelopers

- hooks querys (smart contracts)
- view details, set protocol website
- protocol treassury (smart contract, frontned)
- pool treassury (smart contract, frontend)
- eigenLayer integration
	- reverse ing BondedHooks
	- own intgration checking


The gitmodules must reference the Compose dendendcies at the already specidfied commit and the nested Compose dependecies muts comply with this =

Openeppeling version in 0.5.1.

This must be consistent and protected for all new code integrations