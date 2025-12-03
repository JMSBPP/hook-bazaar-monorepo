import { protocolAdminClientABI } from './abi';
import { getProtocolAdminClientAddress } from '../../config/contracts';
import type { Address } from 'viem';

export { protocolAdminClientABI };

/**
 * Get the ProtocolAdminClient contract address for a chain
 */
export function getContractAddress(chainId: number): Address {
  const address = getProtocolAdminClientAddress(chainId);
  if (!address) {
    throw new Error(`ProtocolAdminClient not deployed on chain ${chainId}`);
  }
  return address as Address;
}


