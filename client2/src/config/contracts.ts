import type { ChainDeployment } from '../lib/deployments/types';

// Contract addresses per chain
// These should be populated from deployment files or environment variables
// For localhost testing: Deploy ProtocolAdminClient to Anvil and add the address here

// Check for environment variable first, then use hardcoded fallback for testing
const LOCALHOST_ADDRESS = 
  import.meta.env.VITE_PROTOCOL_ADMIN_CLIENT_LOCALHOST || 
  import.meta.env.VITE_LOCALHOST_CONTRACT_ADDRESS ||
  '';

export const protocolAdminClientAddresses: Record<number, string> = {
  // Unichain Sepolia (from README)
  1301: '0x957e136698d545abb754b279f3c8e0717568f027',
  
  // Add localhost if address is provided (via env var or manually)
  ...(LOCALHOST_ADDRESS ? { 31337: LOCALHOST_ADDRESS } : {}),
  
  // Add your deployed contract addresses here
  // Example for localhost (uncomment and replace with your actual deployment):
  // 31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Anvil Localhost
  
  // Testnet examples (uncomment and add addresses when deployed):
  // 11155111: '0x...', // Sepolia
  // 84532: '0x...', // Base Sepolia
  // 421614: '0x...', // Arbitrum Sepolia
  // 80001: '0x...', // Mumbai
};

/**
 * Get ProtocolAdminClient address for a given chain ID
 */
export function getProtocolAdminClientAddress(chainId: number): string | undefined {
  return protocolAdminClientAddresses[chainId];
}

/**
 * Update contract addresses from deployment data
 */
export function updateContractAddresses(deployments: ChainDeployment[]): void {
  for (const deployment of deployments) {
    protocolAdminClientAddresses[deployment.chainId] = deployment.protocolAdminClientAddress;
  }
}


