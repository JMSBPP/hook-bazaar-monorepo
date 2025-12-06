import { assertNotNull } from "@subsquid/util-internal";
import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { events } from "./abi/ProtocolAdminClient";

const PROTOCOL_ADMIN_CLIENT_ADDRESS = '0xf362a0919545d503c4db3c9a2e74082f545f9f29';

export const processor = new EvmBatchProcessor()
  // For uni-testnet (chain 10143), we use RPC-only mode since there may not be a public archive
  // Chain RPC endpoint is required for indexing
  .setRpcEndpoint({
    // Set the URL via .env for local runs or via secrets when deploying to Subsquid Cloud
    // https://docs.subsquid.io/deploy-squid/env-variables/
    url: assertNotNull(process.env.RPC_UNI_TESTNET_HTTP, 'No RPC endpoint supplied'),
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
    topic0: [events.ProtocolCreated.topic],
  });

