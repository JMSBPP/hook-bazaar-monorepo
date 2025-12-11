# protocol-pkg: Roadmap

| Status | Feature | Test Reference |
|--------|---------|----------------|
| Implemented | Initialize ProtocolAdminClient | [ProtocolAdminClient.t.sol:40](../../contracts/test/protocol-pkg/ProtocolAdminClient.t.sol) |
| Implemented | Prevent double initialization | [ProtocolAdminClient.t.sol:57](../../contracts/test/protocol-pkg/ProtocolAdminClient.t.sol) |
| Implemented | Create protocol with unique name | [ProtocolAdminClient.t.sol:72](../../contracts/test/protocol-pkg/ProtocolAdminClient.t.sol) |
| Implemented | Prevent duplicate protocol names | [ProtocolAdminClient.t.sol:91](../../contracts/test/protocol-pkg/ProtocolAdminClient.t.sol) |
| Implemented | Protocol creator role assignment | [ProtocolAdminManager.sol:114](../../contracts/src/protocol-pkg/ProtocolAdminManager.sol) |
| Implemented | Pool creator role delegation | [ProtocolAdminManager.sol:134](../../contracts/src/protocol-pkg/ProtocolAdminManager.sol) |
| TODO | Pool creation via ProtocolHookMediator | Requires ProtocolHookMediator integration |
| TODO | getProtocolRevenue() implementation | Returns 0, needs fee accounting |
| TODO | getPoolRevenue() implementation | Returns 0, needs per-pool fee tracking |
| TODO | Multi-pool protocol support testing | Edge cases for protocol with many pools |
| TODO | URI metadata validation | Validate URI format before storage |
