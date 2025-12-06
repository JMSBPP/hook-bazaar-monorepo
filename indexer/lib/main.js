"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_store_1 = require("@subsquid/typeorm-store");
const processor_1 = require("./processor");
const generated_1 = require("./model/generated");
const ProtocolAdminClient_1 = require("./abi/ProtocolAdminClient");
const PROTOCOL_ADMIN_CLIENT_ADDRESS = '0xf362a0919545d503c4db3c9a2e74082f545f9f29';
processor_1.processor.run(new typeorm_store_1.TypeormDatabase({ supportHotBlocks: true }), async (ctx) => {
    const protocols = [];
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address === PROTOCOL_ADMIN_CLIENT_ADDRESS) {
                try {
                    const { protocolCaller, tokenId, protocolAdminManager } = ProtocolAdminClient_1.events.ProtocolCreated.decode(log);
                    const tx = log.transaction || log.getTransaction();
                    const txHash = tx?.hash || log.id.split('-')[0];
                    protocols.push(new generated_1.Protocol({
                        id: `${tokenId}-${txHash}`,
                        tokenId: tokenId,
                        protocolCaller: protocolCaller.toLowerCase(),
                        protocolAdminManager: protocolAdminManager.toLowerCase(),
                        block: block.header.height,
                        txHash: txHash,
                        timestamp: BigInt(block.header.timestamp),
                    }));
                }
                catch (error) {
                    // Skip logs that don't match ProtocolCreated event
                    ctx.log.debug(`Skipping log ${log.id}: ${error}`);
                }
            }
        }
    }
    const startBlock = ctx.blocks.at(0)?.header.height;
    const endBlock = ctx.blocks.at(-1)?.header.height;
    ctx.log.info(`Indexed ${protocols.length} ProtocolCreated events from block ${startBlock} to ${endBlock}`);
    // upsert batches of entities with batch-optimized ctx.store.insert()/upsert()
    await ctx.store.insert(protocols);
});
//# sourceMappingURL=main.js.map