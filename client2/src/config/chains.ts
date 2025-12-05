import { sepolia, baseSepolia, arbitrumSepolia, polygonMumbai, localhost } from 'viem/chains';
import type { Chain } from 'viem';

// Unichain Sepolia configuration
export const unichainSepolia: Chain = {
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.unichain.org'],
    },
    public: {
      http: ['https://sepolia.unichain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Unichain Sepolia Explorer',
      url: 'https://unichain-sepolia.blockscout.com',
    },
  },
  testnet: true,
};

// Configure supported chains
export const supportedChains: Chain[] = [
  unichainSepolia,
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  polygonMumbai,
  {
    ...localhost,
    id: 31337, // Anvil default chain ID
    name: 'Anvil Localhost',
  },
];

// Chain ID to Chain mapping for quick lookup
export const chainMap = new Map<number, Chain>(
  supportedChains.map((chain) => [chain.id, chain])
);

export function getChainById(chainId: number): Chain | undefined {
  return chainMap.get(chainId);
}


