# Quorums

We care about strategies for an AVS because they are the interface we use to handle assets (and hence security) in an AVS. So operators are delegated some assets and with these funds they **register** with AVSs to secure the operations of these AVSs.

But how does this **registration with stake** actually happen at the AVS level?

Answer: **Quorums**.

A quorum is a grouping and configuration of specific kinds of stake that an AVS considers when interacting with operators.

When operators register for an AVS, they select one or more quorums within the AVS to register for.&#x20;

This looks something like

```solidity
function registerOperator(
    bytes calldata quorumNumbers,
    string calldata socket,
    IBLSApkRegistry.PubkeyRegistrationParams calldata params,
    SignatureWithSaltAndExpiry memory operatorSignature
) 
```

Ignore the 2nd and 3rd parameter for now. The first parameter specifies which quorums defined by the AVS the operator wants to register with, and the fourth parameter is the signature of the operator used by the AVS to register the operator with the `DelegationManager`.

Note: the way that quorums are handled throughout the AVS contracts are via byte arrays and bitmaps.

### Quorum Definition

When we say "a quorum is a grouping and configuration of specific kinds of stake" concretely we mean that each quorum is defined as a list of `StrategyParams`

```solidity
 /**
  * @notice In weighing a particular strategy, the amount of underlying asset for that strategy is
  * multiplied by its multiplier, then divided by WEIGHTING_DIVISOR
  */
 struct StrategyParams {
     IStrategy strategy;
     uint96 multiplier;
 }
```

So you can imagine if EigenLayer knows about 3 strategies by having strategies A, B, C in its `StrategyManager`, an AVS can define its quorum as using the first 2 strategies with its own preference for how the AVS values each strategy by indicating the multiplier.

So you can end up with a quorum that has 2 strategies: `[{strategy: A, multiplier: 2}, {strategy: C, multiplier: 5}]`

The purpose of having a quorum is that an AVS can customize the makeup of its security offering by choosing which kinds of stake/security it would like to utilize.

*There now exists a relationship between operators, their stake, and how AVSs define the security they want via quorums. As a result, we've created a few registry contracts that help in handling the accounting involved in this relationship. These are the `StakeRegistry` and the `IndexRegistry`.  We will cover these in more depth later in this section.*

*Since we have a few registries that help our service manage state (both operator and stake state) we need a way to consistently interact with these registries and that's the role of the `RegistryCoordinator`.*
