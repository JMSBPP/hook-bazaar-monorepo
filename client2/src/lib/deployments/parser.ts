import type { ChainDeployment, BroadcastFile } from './types';

// Chain ID to name mapping
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia',
  84532: 'Base Sepolia',
  421614: 'Arbitrum Sepolia',
  80001: 'Mumbai',
  31337: 'Anvil Localhost',
  1337: 'Hardhat Localhost',
};

// Determine network type from chain ID
function getNetworkType(chainId: number): 'testnet' | 'localhost' | 'mainnet' {
  if (chainId === 1) return 'mainnet';
  if (chainId === 31337 || chainId === 1337) return 'localhost';
  return 'testnet';
}

/**
 * Parse a Foundry broadcast deployment file to extract chain and contract information
 */
export function parseBroadcastFile(broadcastData: BroadcastFile): ChainDeployment | null {
  const chainId = broadcastData.chain;
  const chainName = CHAIN_NAMES[chainId] || `Chain ${chainId}`;
  
  // Find ProtocolAdminClient contract deployment
  const protocolAdminTx = broadcastData.transactions?.find(
    (tx) => tx.contractName === 'ProtocolAdminClient'
  );
  
  if (!protocolAdminTx) {
    return null;
  }
  
  return {
    chainId,
    chainName,
    networkType: getNetworkType(chainId),
    protocolAdminClientAddress: protocolAdminTx.contractAddress,
  };
}

/**
 * Parse multiple broadcast files and return all available deployments
 */
export function parseBroadcastFiles(
  broadcastFiles: Record<string, BroadcastFile>
): ChainDeployment[] {
  const deployments: ChainDeployment[] = [];
  
  for (const [filename, data] of Object.entries(broadcastFiles)) {
    const deployment = parseBroadcastFile(data);
    if (deployment) {
      deployments.push(deployment);
    }
  }
  
  return deployments.sort((a, b) => a.chainId - b.chainId);
}

/**
 * Load deployment data from a contracts repository
 * This function expects deployment files to be accessible
 * For now, we'll provide a way to manually configure deployments
 */
export async function loadDeploymentsFromRepo(
  repoPath: string
): Promise<ChainDeployment[]> {
  // In a real implementation, this would fetch from the contracts repo
  // For now, return empty array - deployments will be configured manually
  return [];
}


