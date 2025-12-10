import React, { useState } from 'react';
import { ArrowLeft, Users, Link2, Layers, Loader2, Check, ExternalLink } from 'lucide-react';
import {
  URIType,
  URI_TYPE_LABELS,
  type ProtocolAdminState,
} from '../../../types/protocolAdmin';

interface ManagerSectionProps {
  protocolId: bigint | null;
  adminState: ProtocolAdminState;
  onBack: () => void;
}

const ManagerSection: React.FC<ManagerSectionProps> = ({
  protocolId,
  adminState,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'pools' | 'roles' | 'uris'>('pools');
  const [delegateAddress, setDelegateAddress] = useState('');
  const [isDelegating, setIsDelegating] = useState(false);
  const [delegateError, setDelegateError] = useState<string | null>(null);
  const [delegateSuccess, setDelegateSuccess] = useState(false);

  const [uriValues, setUriValues] = useState<Partial<Record<URIType, string>>>(adminState.uris);
  const [savingUri, setSavingUri] = useState<URIType | null>(null);

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleDelegateRole = async () => {
    if (!validateAddress(delegateAddress)) {
      setDelegateError('Invalid Ethereum address');
      return;
    }

    setIsDelegating(true);
    setDelegateError(null);

    try {
      // In production, call delegatePoolCreatorRole(address)
      console.log('Delegating pool creator role to:', delegateAddress);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setDelegateSuccess(true);
      setDelegateAddress('');
      setTimeout(() => setDelegateSuccess(false), 3000);
    } catch (err) {
      setDelegateError('Failed to delegate role');
    } finally {
      setIsDelegating(false);
    }
  };

  const handleSaveUri = async (uriType: URIType) => {
    setSavingUri(uriType);

    try {
      // In production, call setURI(uriType, uriValues[uriType])
      console.log('Saving URI:', { type: uriType, value: uriValues[uriType] });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Failed to save URI:', err);
    } finally {
      setSavingUri(null);
    }
  };

  const tabs = [
    { id: 'pools' as const, label: 'Pools', icon: Layers },
    { id: 'roles' as const, label: 'Role Management', icon: Users },
    { id: 'uris' as const, label: 'Protocol URIs', icon: Link2 },
  ];

  return (
    <div className="angular-clip" style={{ background: 'var(--color-white)', border: '2px solid var(--color-secondary)' }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '2px solid var(--color-secondary)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-secondary)' }}
            aria-label="Back to overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold font-heading" style={{ color: 'var(--color-secondary)' }}>
              Protocol <span style={{ color: 'var(--color-primary)' }}>Manager</span>
            </h2>
            <p className="text-sm font-body" style={{ color: 'var(--color-black)' }}>
              Manage pools, roles, and metadata for Protocol #{protocolId?.toString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid var(--color-secondary)' }}>
        <nav className="flex px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors font-heading"
              style={{
                borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                color: activeTab === tab.id ? 'var(--color-secondary)' : 'var(--color-accent)',
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'pools' && (
          <div>
            <h3 className="text-lg font-medium font-heading mb-4" style={{ color: 'var(--color-secondary)' }}>Active Pools</h3>
            {adminState.pools.length === 0 ? (
              <div className="text-center py-8 angular-clip" style={{ background: 'var(--color-marble-light)', border: '2px solid var(--color-secondary)' }}>
                <Layers className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
                <p className="font-body" style={{ color: 'var(--color-secondary)' }}>No pools created yet</p>
                <p className="text-sm mt-1 font-body" style={{ color: 'var(--color-black)' }}>
                  Create a pool to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm" style={{ borderBottom: '2px solid var(--color-secondary)' }}>
                      <th className="pb-3 font-medium font-heading" style={{ color: 'var(--color-accent)' }}>#</th>
                      <th className="pb-3 font-medium font-heading" style={{ color: 'var(--color-accent)' }}>Pool ID</th>
                      <th className="pb-3 font-medium font-heading" style={{ color: 'var(--color-accent)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminState.pools.map((poolId, index) => (
                      <tr key={poolId} style={{ borderBottom: '1px solid var(--color-marble-light)' }}>
                        <td className="py-3 font-body" style={{ color: 'var(--color-black)' }}>{index + 1}</td>
                        <td className="py-3">
                          <code className="text-sm px-2 py-1 font-mono" style={{ background: 'var(--color-marble-light)', color: 'var(--color-secondary)' }}>
                            {poolId.slice(0, 10)}...{poolId.slice(-8)}
                          </code>
                        </td>
                        <td className="py-3">
                          <span className="angular-clip px-2 py-1 text-xs font-medium font-heading" style={{ background: 'var(--color-primary)', color: 'var(--color-secondary)' }}>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div>
            <h3 className="text-lg font-medium font-heading mb-4" style={{ color: 'var(--color-secondary)' }}>
              Delegate Pool Creator Role
            </h3>
            <p className="text-sm font-body mb-4" style={{ color: 'var(--color-black)' }}>
              Grant pool creation permissions to another address. This allows them to create pools
              for this protocol.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="delegateAddress" className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
                  Address to Delegate
                </label>
                <div className="flex gap-3">
                  <input
                    id="delegateAddress"
                    type="text"
                    value={delegateAddress}
                    onChange={(e) => {
                      setDelegateAddress(e.target.value);
                      setDelegateError(null);
                    }}
                    placeholder="0x..."
                    className="flex-1 px-4 py-3 font-mono text-sm angular-clip"
                    style={{
                      border: '2px solid var(--color-secondary)',
                      color: 'var(--color-secondary)',
                      background: 'var(--color-white)',
                    }}
                  />
                  <button
                    onClick={handleDelegateRole}
                    disabled={isDelegating || !delegateAddress}
                    className="angular-clip-button px-6 py-3 font-medium font-heading uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-secondary)',
                      border: '2px solid var(--color-secondary)',
                    }}
                  >
                    {isDelegating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Delegating...
                      </>
                    ) : delegateSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        Delegated!
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Delegate
                      </>
                    )}
                  </button>
                </div>
                {delegateError && (
                  <p className="mt-2 text-sm" style={{ color: 'var(--color-accent)' }}>{delegateError}</p>
                )}
              </div>

              <div className="angular-clip p-4 text-sm" style={{ background: 'var(--color-marble-light)', border: '2px solid var(--color-accent)', color: 'var(--color-secondary)' }}>
                <strong>Note:</strong> Only the protocol creator can delegate pool creator roles.
                Delegated addresses can create pools but cannot delegate further.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'uris' && (
          <div>
            <h3 className="text-lg font-medium font-heading mb-4" style={{ color: 'var(--color-secondary)' }}>Protocol URIs</h3>
            <p className="text-sm font-body mb-6" style={{ color: 'var(--color-black)' }}>
              Set metadata URIs for your protocol. These are publicly visible and help users
              discover and verify your protocol.
            </p>

            <div className="space-y-6">
              {Object.entries(URI_TYPE_LABELS).map(([typeStr, label]) => {
                const uriType = parseInt(typeStr) as URIType;
                const currentValue = uriValues[uriType] || '';
                const isSaving = savingUri === uriType;

                return (
                  <div key={uriType} className="angular-clip p-4" style={{ border: '2px solid var(--color-secondary)', background: 'var(--color-white)' }}>
                    <label className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
                      {label}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => setUriValues({ ...uriValues, [uriType]: e.target.value })}
                        placeholder={
                          uriType === URIType.WEBSITE ? 'https://myprotocol.io' :
                          uriType === URIType.X ? '@myprotocol' :
                          uriType === URIType.FARCASTER ? 'myprotocol.eth' :
                          'ipfs://...'
                        }
                        className="flex-1 px-4 py-2 text-sm angular-clip"
                        style={{
                          border: '2px solid var(--color-secondary)',
                          color: 'var(--color-secondary)',
                          background: 'var(--color-white)',
                        }}
                      />
                      <button
                        onClick={() => handleSaveUri(uriType)}
                        disabled={isSaving || !currentValue}
                        className="angular-clip-button px-4 py-2 font-medium font-heading transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: 'var(--color-marble-light)',
                          color: 'var(--color-secondary)',
                          border: '2px solid var(--color-secondary)',
                        }}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Save
                      </button>
                      {currentValue && uriType === URIType.WEBSITE && (
                        <a
                          href={currentValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 transition-colors"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerSection;
