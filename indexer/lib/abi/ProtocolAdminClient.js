"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = exports.functions = exports.events = void 0;
const p = __importStar(require("@subsquid/evm-codec"));
const evm_abi_1 = require("@subsquid/evm-abi");
exports.events = {
    Initialized: (0, evm_abi_1.event)("0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2", "Initialized(uint64)", { "version": p.uint64 }),
    ProtocolCreated: (0, evm_abi_1.event)("0x7d7be2210e89bf2b0b05e032a03e508fd69d76ca336d02a6f60068a4839ffee4", "ProtocolCreated(address,uint256,address)", { "protocolCaller": (0, evm_abi_1.indexed)(p.address), "tokenId": (0, evm_abi_1.indexed)(p.uint256), "protocolAdminManager": (0, evm_abi_1.indexed)(p.address) }),
};
exports.functions = {
    adminPanel: (0, evm_abi_1.viewFun)("0x83ab4233", "adminPanel()", {}, p.address),
    create_pool: (0, evm_abi_1.fun)("0xb2477214", "create_pool(bytes)", { "_encoded_pool_key": p.bytes }, p.bytes32),
    create_protocol: (0, evm_abi_1.fun)("0xf4deb3f9", "create_protocol(string)", { "_name": p.string }, p.uint256),
    initialize: (0, evm_abi_1.fun)("0x8129fc1c", "initialize()", {}),
    initialize_admin_panel: (0, evm_abi_1.fun)("0x91adaf44", "initialize_admin_panel(address,address,string)", { "_protocol_admin_registry": p.address, "_protocol_factory": p.address, "_baseURI": p.string }),
    nextTokenId: (0, evm_abi_1.viewFun)("0x75794a3c", "nextTokenId()", {}, p.uint256),
    supportsInterface: (0, evm_abi_1.viewFun)("0x01ffc9a7", "supportsInterface(bytes4)", { "interfaceID": p.bytes4 }, p.bool),
};
class Contract extends evm_abi_1.ContractBase {
    adminPanel() {
        return this.eth_call(exports.functions.adminPanel, {});
    }
    nextTokenId() {
        return this.eth_call(exports.functions.nextTokenId, {});
    }
    supportsInterface(interfaceID) {
        return this.eth_call(exports.functions.supportsInterface, { interfaceID });
    }
}
exports.Contract = Contract;
//# sourceMappingURL=ProtocolAdminClient.js.map