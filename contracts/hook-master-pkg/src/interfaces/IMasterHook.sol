// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IMasterHook{
    error MasterHookUninitiialized();
    function initialize(address _poolManager,address) external;
    function setProtocolFeeConfig(bytes calldata _encoded_pool_key,bytes calldata _protocol_fee_config) external;
}