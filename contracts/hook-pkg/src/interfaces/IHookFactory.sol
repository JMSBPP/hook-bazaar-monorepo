// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

interface IHookFactory {
    error HookFactoryHookNotFound(uint256 hookId);
    error HookFactoryCloneAlreadyExists(uint256 protocolId, bytes32 poolId, uint256 hookId);
    error HookFactoryUnauthorized();
    error HookFactoryInvalidInitialization();
    error HookFactoryCloneNotInitialized(address clone);
    error HookFactoryInvalidClone(address clone);

    event HookCloneDeployed(
        address indexed clone,
        uint256 indexed hookId,
        uint256 indexed protocolId,
        bytes32 poolId,
        address owner
    );

    event HookCloneInitialized(address indexed clone, bytes initData);

    struct CloneInfo {
        uint256 hookId;
        uint256 protocolId;
        bytes32 poolId;
        address owner;
        bool initialized;
    }

    function deployHookClone(
        uint256 hookId,
        uint256 protocolId,
        bytes32 poolId,
        bytes calldata initData
    ) external returns (address clone);

    function initializeHookClone(
        address clone,
        address owner,
        bytes calldata params
    ) external;

    function getHookClone(
        uint256 protocolId,
        bytes32 poolId,
        uint256 hookId
    ) external view returns (address);

    function getCloneInfo(address clone) external view returns (CloneInfo memory);

    function getAllClones() external view returns (address[] memory);
}