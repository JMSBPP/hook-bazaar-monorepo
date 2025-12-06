import * as p from "@subsquid/evm-codec";
import { event, fun, viewFun, ContractBase, indexed } from "@subsquid/evm-abi";

export const events = {
  Initialized: event(
    "0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2",
    "Initialized(uint64)",
    { "version": p.uint64 }
  ),
  ProtocolCreated: event(
    "0x7d7be2210e89bf2b0b05e032a03e508fd69d76ca336d02a6f60068a4839ffee4",
    "ProtocolCreated(address,uint256,address)",
    {
      "protocolCaller": indexed(p.address),
      "tokenId": indexed(p.uint256),
      "protocolAdminManager": indexed(p.address)
    }
  ),
};

export const functions = {
  adminPanel: viewFun("0x83ab4233", "adminPanel()", {}, p.address),
  create_pool: fun("0xb2477214", "create_pool(bytes)", { "_encoded_pool_key": p.bytes }, p.bytes32),
  create_protocol: fun("0xf4deb3f9", "create_protocol(string)", { "_name": p.string }, p.uint256),
  initialize: fun("0x8129fc1c", "initialize()", {}),
  initialize_admin_panel: fun("0x91adaf44", "initialize_admin_panel(address,address,string)", {
    "_protocol_admin_registry": p.address,
    "_protocol_factory": p.address,
    "_baseURI": p.string
  }),
  nextTokenId: viewFun("0x75794a3c", "nextTokenId()", {}, p.uint256),
  supportsInterface: viewFun("0x01ffc9a7", "supportsInterface(bytes4)", { "interfaceID": p.bytes4 }, p.bool),
};

export class Contract extends ContractBase {
  adminPanel() {
    return this.eth_call(functions.adminPanel, {});
  }
  nextTokenId() {
    return this.eth_call(functions.nextTokenId, {});
  }
  supportsInterface(interfaceID: string | Uint8Array) {
    return this.eth_call(functions.supportsInterface, { interfaceID });
  }
}

