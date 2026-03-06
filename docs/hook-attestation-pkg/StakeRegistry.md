# StakeRegistry

The `StakeRegistry` contract is a very useful component that works well with the other reference contracts (\`RegistryCoordinator\` and \`IndexRegistry\`) component. It manages the stakes of operators for up to 256 quorums, ensuring that all operations related to staking, updating, and querying stakes are efficiently handled. This contract is integral for maintaining the security and integrity of AVS by managing operators' stakes.

### Core Functionalities

**Registering Stake**

The `StakeRegistry` allows the registration of operators' stakes for specified quorums. This functionality ensures operators meet the required stake amounts to participate in AVSs. It’s important to note that if the developer is using the `RegistryCoordinator`, the registration and deregistration calls would be coming from there instead of being directly called.

```solidity
/**
 * @notice Registers the `operator` with `operatorId` for the specified `quorumNumbers`.
 * @param operator The address of the operator to register.
 * @param operatorId The id of the operator to register.
 * @param quorumNumbers The quorum numbers the operator is registering for, where each byte is an 8 bit integer quorumNumber.
 * @return The operator's current stake for each quorum, and the total stake for each quorum
 */
function registerOperator(
    address operator,
    bytes32 operatorId,
    bytes calldata quorumNumbers
) public virtual onlyRegistryCoordinator returns (uint96[] memory, uint96[] memory);
```

**Deregistering Stake**

Operators can be deregistered from quorums, removing their stakes and updating the total stake of the quorums accordingly. Similar to registration, this is typically managed via the `RegistryCoordinator`.

```solidity
/**
 * @notice Deregisters the operator with `operatorId` for the specified `quorumNumbers`.
 * @param operatorId The id of the operator to deregister.
 * @param quorumNumbers The quorum numbers the operator is deregistering from, where each byte is an 8 bit integer quorumNumber.
 */
function deregisterOperator(
    bytes32 operatorId,
    bytes calldata quorumNumbers
) public virtual onlyRegistryCoordinator;
```

**Updating Stake**

Operators' stakes can be updated based on new conditions or requirements. This function checks if operators still meet the minimum stake requirements for their quorums.

```solidity
/**
 * @notice Called by the registry coordinator to update an operator's stake for one or more quorums.
 * @return A bitmap of quorums where the operator no longer meets the minimum stake and should be deregistered.
 */
function updateOperatorStake(
    address operator, 
    bytes32 operatorId, 
    bytes calldata quorumNumbers
) external onlyRegistryCoordinator returns (uint192);
```

#### Quorum Management

The `StakeRegistry` is closely integrated with quorums, which define the security parameters for AVSs. The contract provides functions to initialize quorums, set minimum stakes, and manage strategies associated with quorums.

**Initializing Quorums**

Quorums can be initialized with specific strategies and minimum stake requirements.

```solidity
/**
 * @notice Initialize a new quorum and push its first history update.
 * @param quorumNumber The quorum number.
 * @param minimumStake The minimum stake required for the quorum.
 * @param _strategyParams The strategies and weights for the quorum.
 */
function initializeQuorum(
    uint8 quorumNumber,
    uint96 minimumStake,
    StrategyParams[] memory _strategyParams
) public virtual onlyRegistryCoordinator;
```

**Adding and Removing Strategies**

Strategies and their associated weights can be added or removed from a quorum.

```solidity
/**
 * @notice Adds strategies and weights to the quorum.
 * @param quorumNumber The quorum number.
 * @param _strategyParams The strategies and weights to add.
 */
function addStrategies(
    uint8 quorumNumber, 
    StrategyParams[] memory _strategyParams
) public virtual onlyCoordinatorOwner quorumExists(quorumNumber);

/**
 * @notice Remove strategies and their associated weights from the quorum.
 * @param quorumNumber The quorum number.
 * @param indicesToRemove The indices of the strategies to remove.
 */
function removeStrategies(
    uint8 quorumNumber,
    uint256[] memory indicesToRemove
) public virtual onlyCoordinatorOwner quorumExists(quorumNumber);
```

### Stake History and Queries

The `StakeRegistry` maintains detailed records of stake history, allowing efficient querying of stake data for operators and quorums.

**Querying Stake Information**

Operators' stake information and total stake for quorums can be queried using various view functions.

```solidity
/**
 * @notice Returns the stake amount of an operator for a specific quorum.
 * @param operator The address of the operator.
 * @param quorumNumber The specific quorum.
 * @return The stake amount of the operator.
 */
function weightOfOperatorForQuorum(
    uint8 quorumNumber, 
    address operator
) public virtual view quorumExists(quorumNumber) returns (uint96);
```

**Stake History**

Detailed stake history for operators and quorums is maintained, enabling robust tracking and auditing.

```solidity
/**
 * @notice Returns the entire stake history for an operator and quorum.
 * @param operatorId The id of the operator.
 * @param quorumNumber The specific quorum.
 * @return The stake history array.
 */
function getStakeHistory(
    bytes32 operatorId, 
    uint8 quorumNumber
) external view returns (StakeUpdate[] memory);
```

| Contract                                                                            | Interface                                                                                       |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| <https://github.com/Layr-Labs/eigenlayer-middleware/blob/dev/src/StakeRegistry.sol> | <https://github.com/Layr-Labs/eigenlayer-middleware/blob/dev/src/interfaces/IStakeRegistry.sol> |
