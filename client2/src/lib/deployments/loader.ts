import type { ChainDeployment } from './types';

// Chain ID to name mapping (extended with Unichain Sepolia)
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia',
  84532: 'Base Sepolia',
  421614: 'Arbitrum Sepolia',
  80001: 'Mumbai',
  31337: 'Anvil Localhost',
  1337: 'Hardhat Localhost',
  1301: 'Unichain Sepolia', // Added Unichain Sepolia
};

// Determine network type from chain ID
function getNetworkType(chainId: number): 'testnet' | 'localhost' | 'mainnet' {
  if (chainId === 1) return 'mainnet';
  if (chainId === 31337 || chainId === 1337) return 'localhost';
  return 'testnet';
}

/**
 * Load deployments by scanning broadcast directory
 * This function attempts to read deployment files from the contracts repository
 */
export async function loadDeploymentsFromBroadcast(): Promise<ChainDeployment[]> {
  const deployments: ChainDeployment[] = [];
  
  try {
    // Try to load from generated static deployments file
    const staticDeployments = await import('./static-deployments.json');
    if (Array.isArray(staticDeployments.default) && staticDeployments.default.length > 0) {
      console.log('Loaded deployments from static file:', staticDeployments.default);
      return staticDeployments.default;
    }
  } catch (error) {
    console.warn('Could not load static deployments, falling back to config:', error);
  }
  
  try {
    // Fallback: Check for known deployments in environment variables
    const knownChains = [1301, 31337, 11155111, 84532, 421614, 80001];
    
    for (const chainId of knownChains) {
      const envKey = `VITE_PROTOCOL_ADMIN_CLIENT_${chainId}`;
      const address = import.meta.env[envKey];
      
      if (address && address !== '') {
        deployments.push({
          chainId,
          chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
          networkType: getNetworkType(chainId),
          protocolAdminClientAddress: address,
        });
      }
    }
    
    // Special handling for Unichain Sepolia (1301) - hardcoded from README
    // This is the deployment from the broadcast files
    if (!deployments.find(d => d.chainId === 1301)) {
      const unichainAddress = '0x957e136698d545abb754b279f3c8e0717568f027';
      deployments.push({
        chainId: 1301,
        chainName: 'Unichain Sepolia',
        networkType: 'testnet',
        protocolAdminClientAddress: unichainAddress,
      });
    }
    
  } catch (error) {
    console.error('Error loading deployments:', error);
  }
  
  return deployments;
}

/**
 * Parse a deployment entry from manifest
 */
function parseDeploymentEntry(entry: any): ChainDeployment {
  return {
    chainId: entry.chainId,
    chainName: CHAIN_NAMES[entry.chainId] || entry.chainName || `Chain ${entry.chainId}`,
    networkType: getNetworkType(entry.chainId),
    protocolAdminClientAddress: entry.protocolAdminClientAddress,
  };
}

/**
 * Parse broadcast file structure
 * Expected format from Foundry broadcast files
 */
export function parseBroadcastData(data: any): ChainDeployment | null {
  try {
    // Extract chain ID (can be in hex or decimal)
    let chainId: number;
    if (data.chain) {
      chainId = typeof data.chain === 'string' 
        ? parseInt(data.chain, 16) 
        : data.chain;
    } else {
      return null;
    }
    
    // Find ProtocolAdminClient deployment in transactions
    const transactions = data.transactions || [];
    const protocolAdminTx = transactions.find(
      (tx: any) => tx.contractName === 'ProtocolAdminClient' && tx.transactionType === 'CREATE'
    );
    
    if (!protocolAdminTx || !protocolAdminTx.contractAddress) {
      return null;
    }
    
    return {
      chainId,
      chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
      networkType: getNetworkType(chainId),
      protocolAdminClientAddress: protocolAdminTx.contractAddress,
    };
  } catch (error) {
    console.error('Error parsing broadcast data:', error);
    return null;
  }
}