import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { supportedChains } from '../config/chains';
import type { ReactNode } from 'react';

// Create a query client for React Query
const queryClient = new QueryClient();

// Get WalletConnect Project ID from environment or use a development placeholder
// For production, you MUST set VITE_WALLETCONNECT_PROJECT_ID in your .env file
// Get a real project ID from: https://cloud.walletconnect.com/
// Using a valid format placeholder (32 hex characters)
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000';

// Configure RainbowKit with error handling
let config;
try {
  config = getDefaultConfig({
    appName: 'Hook Bazaar',
    projectId: projectId,
    chains: supportedChains,
    ssr: false,
  });
} catch (error) {
  console.error('Error configuring RainbowKit:', error);
  // Re-throw to prevent silent failures
  throw error;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

