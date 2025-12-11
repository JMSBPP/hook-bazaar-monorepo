# ECDSAStakeRegistry

The ECDSAStakeRegistry is a contract that manages operator registration and quorum updates for an AVS using ECDSA signatures. It serves a similar purpose to the RegistryCoordinator and StakeRegistry contracts but with some key differences:

* Signature Scheme: The ECDSAStakeRegistry uses ECDSA signatures for operator registration and verification, while the RegistryCoordinator and StakeRegistry use BLS signatures.
* Quorum Management: Unlike the RegistryCoordinator, which supports multiple quorums, the ECDSAStakeRegistry manages a single quorum. This simplifies the contract and reduces the need for quorum-specific functions.
* Stake Management: The ECDSAStakeRegistry tracks operator stakes and total stake weight using checkpoints, allowing for efficient retrieval of historical stake data. It also defines a threshold stake that must meet the cumulative stake of signed messages.

The core functionalities of the ECDSAStakeRegistry include:

**Operator Registration**:

```solidity
function registerOperatorWithSignature(
    ISignatureUtils.SignatureWithSaltAndExpiry memory _operatorSignature,
    address _signingKey
) external;
```

**Stake and Weight Management**:&#x20;

The ECDSAStakeRegistry uses checkpoints to track operator stakes and total stake weight. It provides functions to retrieve operator weights and total weight at specific block numbers:

```solidity
function _getOperatorWeight(address _signer, uint32 _referenceBlock) internal view returns (uint256);
function _getTotalWeight(uint32 _referenceBlock) internal view returns (uint256);
```

**Threshold Stake Validation**:&#x20;

The contract defines a threshold stake that must meet the cumulative stake of signed messages. It provides a function to validate the threshold stake:

```solidity
function _validateThresholdStake(uint256 _signedWeight, uint32 _referenceBlock) internal view;
```

**Signature Verification**:&#x20;

The ECDSAStakeRegistry implements the IERC1271 interface, allowing it to verify ECDSA signatures using the isValidSignature function:

```solidity
function isValidSignature(bytes32 _hash, bytes memory _signature) public view override returns (bytes4);
```

In summary, the ECDSAStakeRegistry is a simplified version of the RegistryCoordinator and StakeRegistry contracts, tailored for AVS using ECDSA signatures and managing a single quorum. It provides functions for operator registration, stake management, and signature verification, ensuring the security and integrity of the AVS.
