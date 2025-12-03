import { Network, Check } from 'lucide-react';
import type { ChainDeployment } from '../../lib/deployments/types';

interface ChainSelectorProps {
  deployments: ChainDeployment[];
  selectedChainId?: number;
  onSelectChain: (chainId: number) => void;
  isLoading?: boolean;
}

export default function ChainSelector({
  deployments,
  selectedChainId,
  onSelectChain,
  isLoading,
}: ChainSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading available chains...</div>
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="angular-clip p-6" style={{ 
          background: 'var(--color-marble-light)',
          border: '2px solid var(--color-accent)'
        }}>
          <p className="text-sm font-heading font-medium mb-3" style={{ color: 'var(--color-secondary)' }}>
            No contract deployments configured
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--color-black)' }}>
            To test protocol creation, you need to configure a contract address.
          </p>
          <div className="text-left space-y-2 text-xs" style={{ color: 'var(--color-black)' }}>
            <p className="font-heading font-medium">Quick Setup:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Deploy ProtocolAdminClient to Anvil (chain ID: 31337)</li>
              <li>Add the address to <code className="px-1 py-0.5 angular-clip" style={{ background: 'var(--color-secondary)', color: 'var(--color-white)' }}>src/config/contracts.ts</code></li>
              <li>Or set <code className="px-1 py-0.5 angular-clip" style={{ background: 'var(--color-secondary)', color: 'var(--color-white)' }}>VITE_PROTOCOL_ADMIN_CLIENT_LOCALHOST</code> in .env</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-secondary)' }}>
        Select a chain to create your protocol on:
      </p>
      <div className="grid gap-2">
        {deployments.map((deployment) => {
          const isSelected = selectedChainId === deployment.chainId;
          const isLocalhost = deployment.networkType === 'localhost';

          return (
            <button
              key={deployment.chainId}
              onClick={() => {
                console.log('Chain button clicked:', deployment.chainId, deployment.chainName);
                onSelectChain(deployment.chainId);
              }}
              disabled={isLoading}
              className={`angular-clip p-4 text-left transition-all duration-200 border-2 flex items-center justify-between ${
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-marble-light)]'
                  : 'border-[var(--color-secondary)] hover:border-[var(--color-primary)]'
              }`}
              style={{
                background: isSelected ? 'var(--color-marble-light)' : 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="angular-clip p-2"
                  style={{
                    background: isSelected
                      ? 'var(--color-primary)'
                      : 'var(--color-secondary)',
                  }}
                >
                  <Network
                    size={20}
                    style={{
                      color: isSelected ? 'var(--color-secondary)' : 'var(--color-white)',
                    }}
                  />
                </div>
                <div>
                  <div
                    className="font-heading font-bold"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-body)',
                    }}
                  >
                    {deployment.chainName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs px-2 py-0.5 angular-clip"
                      style={{
                        background:
                          deployment.networkType === 'localhost'
                            ? 'var(--color-accent)'
                            : deployment.networkType === 'testnet'
                            ? 'var(--color-primary)'
                            : 'var(--color-secondary)',
                        color: 'var(--color-white)',
                        fontSize: 'var(--font-size-caption)',
                      }}
                    >
                      {deployment.networkType === 'localhost'
                        ? 'Local'
                        : deployment.networkType === 'testnet'
                        ? 'Testnet'
                        : 'Mainnet'}
                    </span>
                    {isLocalhost && (
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        Anvil
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isSelected && (
                <Check
                  size={20}
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


