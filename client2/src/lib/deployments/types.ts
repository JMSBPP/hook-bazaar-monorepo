export interface ChainDeployment {
  chainId: number;
  chainName: string;
  networkType: 'testnet' | 'localhost' | 'mainnet';
  protocolAdminClientAddress: string;
}

export interface BroadcastFile {
  chain: number;
  transactions: Array<{
    contractName: string;
    contractAddress: string;
    transactionHash: string;
  }>;
}


