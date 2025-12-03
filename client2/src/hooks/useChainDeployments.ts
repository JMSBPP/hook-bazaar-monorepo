import { useState, useEffect } from 'react';
import type { ChainDeployment } from '../lib/deployments/types';
import { updateContractAddresses, protocolAdminClientAddresses } from '../config/contracts';
import { loadDeploymentsFromBroadcast } from '../lib/deployments/loader';

// Create deployments from configured addresses in contracts.ts
const createDeploymentsFromConfig = (): ChainDeployment[] => {
  const deployments: ChainDeployment[] = [];
  
  const chainNames: Record<number, string> = {
    1301: 'Unichain Sepolia',
    31337: 'Anvil Localhost',
    11155111: 'Sepolia',
    84532: 'Base Sepolia',
    421614: 'Arbitrum Sepolia',
    80001: 'Mumbai',
  };
  
  const getNetworkType = (chainId: number): 'testnet' | 'localhost' | 'mainnet' => {
    if (chainId === 31337 || chainId === 1337) return 'localhost';
    if (chainId === 1) return 'mainnet';
    return 'testnet';
  };

  // Iterate through all configured addresses
  for (const [chainIdStr, address] of Object.entries(protocolAdminClientAddresses)) {
    const chainId = parseInt(chainIdStr);
    if (address && address !== '') {
      deployments.push({
        chainId,
        chainName: chainNames[chainId] || `Chain ${chainId}`,
        networkType: getNetworkType(chainId),
        protocolAdminClientAddress: address,
      });
    }
  }

  return deployments;
};

export function useChainDeployments() {
  const [deployments, setDeployments] = useState<ChainDeployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Update contract addresses when deployments change
    updateContractAddresses(deployments);
  }, [deployments]);

  const loadDeployments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to load from broadcast files first
      let loadedDeployments = await loadDeploymentsFromBroadcast();
      
      // If no deployments found from broadcast, use config
      if (loadedDeployments.length === 0) {
        loadedDeployments = createDeploymentsFromConfig();
      }
      
      setDeployments(loadedDeployments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load deployments'));
      // Fallback to config on error
      setDeployments(createDeploymentsFromConfig());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeployments();
  }, []);

  return {
    deployments,
    isLoading,
    error,
    refetch: loadDeployments,
  };
}
