# hook-pkg/development: Roadmap

| Status | Feature | Source Reference |
|--------|---------|------------------|
| Implemented | HaaSMod base storage pattern | [HaaSMod.sol:40](../../../contracts/src/hook-pkg/HaaSMod.sol) |
| Implemented | onlyPoolManager modifier | [HaaSMod.sol:62](../../../contracts/src/hook-pkg/HaaSMod.sol) |
| Implemented | onlyDeveloper modifier | [HaaSMod.sol:68](../../../contracts/src/hook-pkg/HaaSMod.sol) |
| Implemented | onlyAuthorized modifier | [HaaSMod.sol:74](../../../contracts/src/hook-pkg/HaaSMod.sol) |
| Implemented | HaaSFacet IHooks callbacks | [HaaSFacet.sol:60-154](../../../contracts/src/hook-pkg/HaaSFacet.sol) |
| Implemented | setAuthorization admin | [HaaSFacet.sol:160](../../../contracts/src/hook-pkg/HaaSFacet.sol) |
| Implemented | ERC165 supportsInterface | [HaaSFacet.sol:43](../../../contracts/src/hook-pkg/HaaSFacet.sol) |
| TODO | HookStateLens interface | State exposure for AVS sampling |
| TODO | Diamond facet integration tests | Multi-facet hook composition |
| TODO | Hook upgrade patterns | Safe facet replacement |
| TODO | Gas optimization benchmarks | Callback overhead measurement |
