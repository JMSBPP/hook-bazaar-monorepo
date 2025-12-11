# RegistryCoordinator

The `RegistryCoordinator` coordinates among a few registries:

* `StakeRegistry`
* `IndexRegistry`
* `BLSApkRegistry`

Since the operations of an AVS revolve around quorums as they define the security of an AVS, the `RegistryCoordinator` becomes the primary entry point for handling quorum updates. This means pushing these updates to all the registries it's tracking.

**Given that the `RegistryCoordinator` is the entry point, it's the contract that keeps track of which quorums exist and have been initialized. It is also the primary entry point for operators as they register for and deregister from an AVS' quorums.**

The below code blocks are from the `RegistyCoordinator` contract.

#### Quorum Creation

```solidity
/**
 * Config for initial quorums (see `createQuorum`):
 * @param _operatorSetParams max operator count and operator churn parameters
 * @param _minimumStakes minimum stake weight to allow an operator to register
 * @param _strategyParams which Strategies/multipliers a quorum considers when calculating stake weight
 */
function initialize(
    ...
    OperatorSetParam[] memory _operatorSetParams,
    uint96[] memory _minimumStakes,
    IStakeRegistry.StrategyParams[][] memory _strategyParams
) external initializer {
    ...
    // Create quorums
    for (uint256 i = 0; i < _operatorSetParams.length; i++) {
        _createQuorum(_operatorSetParams[i], _minimumStakes[i], _strategyParams[i]);
    }
}

/**
 * @notice Creates a quorum and initializes it in each registry contract
 * @param operatorSetParams configures the quorum's max operator count and churn parameters
 * @param minimumStake sets the minimum stake required for an operator to register or remain
 * registered
 * @param strategyParams a list of strategies and multipliers used by the StakeRegistry to
 * calculate an operator's stake weight for the quorum
 */
function _createQuorum(
    OperatorSetParam memory operatorSetParams,
    uint96 minimumStake,
    IStakeRegistry.StrategyParams[] memory strategyParams
) {...}
```

#### Operator Registration into Quorums

```solidity
 /**
  * @notice Registers msg.sender as an operator for one or more quorums. If any quorum exceeds its maximum
  * operator capacity after the operator is registered, this method will fail.
  * @param quorumNumbers is an ordered byte array containing the quorum numbers being registered for
  * @param socket is the socket of the operator (typically an IP address)
  * @param params contains the G1 & G2 public keys of the operator, and a signature proving their ownership
  * @param operatorSignature is the signature of the operator used by the AVS to register the operator in the delegation manager
  * @dev `params` is ignored if the caller has previously registered a public key
  * @dev `operatorSignature` is ignored if the operator's status is already REGISTERED
  */
 function registerOperator(
     bytes calldata quorumNumbers,
     string calldata socket,
     IBLSApkRegistry.PubkeyRegistrationParams calldata params,
     SignatureWithSaltAndExpiry memory operatorSignature
 ) external onlyWhenNotPaused(PAUSED_REGISTER_OPERATOR) {
     /**
      * If the operator has NEVER registered a pubkey before, use `params` to register
      * their pubkey in blsApkRegistry
      *
      * If the operator HAS registered a pubkey, `params` is ignored and the pubkey hash
      * (operatorId) is fetched instead
      */
     bytes32 operatorId = _getOrCreateOperatorId(msg.sender, params);

     // Register the operator in each of the registry contracts and update the operator's
     // quorum bitmap and registration status
     uint32[] memory numOperatorsPerQuorum = _registerOperator({
         operator: msg.sender, 
         operatorId: operatorId,
         quorumNumbers: quorumNumbers, 
         socket: socket,
         operatorSignature: operatorSignature
     }).numOperatorsPerQuorum;
  ...
  }
```

| Contract                                                                                  | Interface                                                                                             |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| <https://github.com/Layr-Labs/eigenlayer-middleware/blob/dev/src/RegistryCoordinator.sol> | <https://github.com/Layr-Labs/eigenlayer-middleware/blob/dev/src/interfaces/IRegistryCoordinator.sol> |
