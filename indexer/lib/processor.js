"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processor = void 0;
const util_internal_1 = require("@subsquid/util-internal");
const evm_processor_1 = require("@subsquid/evm-processor");
const ProtocolAdminClient_1 = require("./abi/ProtocolAdminClient");
const PROTOCOL_ADMIN_CLIENT_ADDRESS = '0xf362a0919545d503c4db3c9a2e74082f545f9f29';
exports.processor = new evm_processor_1.EvmBatchProcessor()
    // For uni-testnet (chain 10143), we use RPC-only mode since there may not be a public archive
    // Chain RPC endpoint is required for indexing
    .setRpcEndpoint({
    // Set the URL via .env for local runs or via secrets when deploying to Subsquid Cloud
    // https://docs.subsquid.io/deploy-squid/env-variables/
    url: (0, util_internal_1.assertNotNull)(process.env.RPC_UNI_TESTNET_HTTP, 'No RPC endpoint supplied'),
    // More RPC connection options at https://docs.subsquid.io/evm-indexing/configuration/initialization/#set-data-source
    rateLimit: 10
})
    .setFinalityConfirmation(10) // Lower confirmation for testnet
    .setFields({
    log: {
        topics: true,
        data: true,
        address: true,
    },
    block: {
        timestamp: true,
    },
})
    .setBlockRange({
    from: 0, // Start from genesis or deployment block
})
    .addLog({
    address: [PROTOCOL_ADMIN_CLIENT_ADDRESS],
    topic0: [ProtocolAdminClient_1.events.ProtocolCreated.topic],
});
//# sourceMappingURL=processor.js.map