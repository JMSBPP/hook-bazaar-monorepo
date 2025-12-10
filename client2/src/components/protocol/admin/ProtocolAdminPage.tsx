import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, Layers, DollarSign, Users, Link2, Plus } from 'lucide-react';
import CreatePoolForm from './CreatePoolForm';
import SetRevenueForm from './SetRevenueForm';
import ManagerSection from './ManagerSection';
import type { Protocol } from '../../../types';
import {
  URIType,
  URI_TYPE_LABELS,
  type ProtocolAdminState,
} from '../../../types/protocolAdmin';

// Mock data for development
const mockProtocolState: ProtocolAdminState = {
  protocolId: 1n,
  protocolName: 'My DeFi Protocol',
  isCreator: true,
  isPoolCreator: true,
  pools: [
    '0x0000000000000000000000000000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000000000000000000000000000002',
  ],
  uris: {
    [URIType.WEBSITE]: 'https://myprotocol.io',
    [URIType.X]: '@myprotocol',
  },
};

type ActiveSection = 'overview' | 'create-pool' | 'protocol-revenue' | 'pool-revenue' | 'manager';

const ProtocolAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { protocolId } = useParams<{ protocolId: string }>();
  const location = useLocation();

  // Get protocol from location state or create mock
  const protocol = (location.state as { protocol?: Protocol })?.protocol || {
    id: `protocol-${protocolId}`,
    name: mockProtocolState.protocolName,
    feeRecipient: '0x0000000000000000000000000000000000000000',
    pools: mockProtocolState.pools.length,
    revenue: '$0',
    status: 'active' as const,
    protocolId: protocolId,
  };

  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [adminState] = useState<ProtocolAdminState>({
    ...mockProtocolState,
    protocolId: protocolId ? BigInt(protocolId) : null,
    protocolName: protocol.name,
  });

  const handleBack = () => {
    navigate('/ProtocolDashboard');
  };

  const handleCreatePoolSuccess = (poolId: string, initialTick: number) => {
    console.log('Pool created:', { poolId, initialTick });
    setActiveSection('overview');
  };

  const handleSetRevenueSuccess = () => {
    console.log('Revenue set successfully');
    setActiveSection('overview');
  };

  const sections = [
    {
      id: 'create-pool' as const,
      label: 'Create Pool',
      icon: Plus,
      description: 'Deploy a new Uniswap v4 pool for your protocol',
      color: 'var(--color-primary)',
    },
    {
      id: 'protocol-revenue' as const,
      label: 'Set Protocol Revenue',
      icon: DollarSign,
      description: 'Configure protocol-wide revenue settings',
      color: 'var(--color-accent)',
    },
    {
      id: 'pool-revenue' as const,
      label: 'Set Pool Revenue',
      icon: Layers,
      description: 'Configure revenue for specific pools',
      color: 'var(--color-secondary)',
    },
    {
      id: 'manager' as const,
      label: 'Protocol Manager',
      icon: Settings,
      description: 'Manage roles, URIs, and view pools',
      color: 'var(--color-secondary)',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-marble-light)' }}>
      {/* Header */}
      <header style={{ background: 'var(--color-white)', borderBottom: '2px solid var(--color-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-secondary)' }}
                aria-label="Back to Protocol Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold font-heading" style={{ color: 'var(--color-secondary)' }}>
                  Protocol <span style={{ color: 'var(--color-primary)' }}>Admin</span>
                </h1>
                <p className="text-sm font-body" style={{ color: 'var(--color-black)' }}>
                  {protocol.name} (ID: {protocolId})
                </p>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-3">
              {adminState.isCreator && (
                <span
                  className="angular-clip flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium font-heading"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-secondary)' }}
                >
                  <Users className="w-4 h-4" />
                  Creator
                </span>
              )}
              {adminState.isPoolCreator && (
                <span
                  className="angular-clip flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium font-heading"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-white)' }}
                >
                  <Layers className="w-4 h-4" />
                  Pool Creator
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'overview' ? (
          <>
            {/* Protocol Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div
                className="angular-clip p-6"
                style={{ background: 'var(--color-white)', border: '2px solid var(--color-secondary)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="angular-clip p-2"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    <Layers className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
                  </div>
                  <span className="text-sm font-medium font-heading" style={{ color: 'var(--color-accent)' }}>Active Pools</span>
                </div>
                <p className="text-3xl font-bold font-heading" style={{ color: 'var(--color-secondary)' }}>{adminState.pools.length}</p>
              </div>

              <div
                className="angular-clip p-6"
                style={{ background: 'var(--color-secondary)', border: '2px solid var(--color-secondary)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="angular-clip p-2"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    <DollarSign className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
                  </div>
                  <span className="text-sm font-medium font-heading" style={{ color: 'var(--color-marble-light)' }}>Total Revenue</span>
                </div>
                <p className="text-3xl font-bold font-heading" style={{ color: 'var(--color-primary)' }}>{protocol.revenue}</p>
              </div>

              <div
                className="angular-clip p-6"
                style={{ background: 'var(--color-white)', border: '2px solid var(--color-secondary)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="angular-clip p-2"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    <Link2 className="w-5 h-5" style={{ color: 'var(--color-white)' }} />
                  </div>
                  <span className="text-sm font-medium font-heading" style={{ color: 'var(--color-accent)' }}>URIs Set</span>
                </div>
                <p className="text-3xl font-bold font-heading" style={{ color: 'var(--color-secondary)' }}>
                  {Object.keys(adminState.uris).length}/{Object.keys(URI_TYPE_LABELS).length}
                </p>
              </div>
            </div>

            {/* Admin Client Actions */}
            <div className="mb-8">
              <h2
                className="text-lg font-semibold font-heading mb-4"
                style={{ color: 'var(--color-secondary)' }}
              >
                Protocol Admin Client Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className="angular-clip p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:rotate-[-0.5deg]"
                    style={{
                      background: index % 2 === 0 ? 'var(--color-white)' : 'var(--color-secondary)',
                      border: '2px solid var(--color-secondary)',
                    }}
                  >
                    <div
                      className="angular-clip w-12 h-12 flex items-center justify-center mb-4"
                      style={{ background: section.color }}
                    >
                      <section.icon
                        className="w-6 h-6"
                        style={{ color: index % 2 === 0 ? 'var(--color-secondary)' : 'var(--color-white)' }}
                      />
                    </div>
                    <h3
                      className="font-semibold font-heading mb-1"
                      style={{ color: index % 2 === 0 ? 'var(--color-secondary)' : 'var(--color-primary)' }}
                    >
                      {section.label}
                    </h3>
                    <p
                      className="text-sm font-body"
                      style={{ color: index % 2 === 0 ? 'var(--color-black)' : 'var(--color-marble-light)' }}
                    >
                      {section.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Pools Overview */}
            {adminState.pools.length > 0 && (
              <div
                className="angular-clip p-6"
                style={{ background: 'var(--color-white)', border: '2px solid var(--color-secondary)' }}
              >
                <h2
                  className="text-lg font-semibold font-heading mb-4"
                  style={{ color: 'var(--color-secondary)' }}
                >
                  Active Pools
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className="text-left text-sm"
                        style={{ borderBottom: '2px solid var(--color-secondary)' }}
                      >
                        <th className="pb-3 font-medium font-heading" style={{ color: 'var(--color-accent)' }}>Pool ID</th>
                        <th className="pb-3 font-medium font-heading" style={{ color: 'var(--color-accent)' }}>Status</th>
                        <th className="pb-3 font-medium font-heading" style={{ color: 'var(--color-accent)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminState.pools.map((poolId) => (
                        <tr key={poolId} style={{ borderBottom: '1px solid var(--color-marble-light)' }}>
                          <td className="py-3 font-mono text-sm" style={{ color: 'var(--color-secondary)' }}>
                            {poolId.slice(0, 10)}...{poolId.slice(-8)}
                          </td>
                          <td className="py-3">
                            <span
                              className="angular-clip px-2 py-1 text-xs font-medium font-heading"
                              style={{ background: 'var(--color-primary)', color: 'var(--color-secondary)' }}
                            >
                              Active
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => setActiveSection('pool-revenue')}
                              className="text-sm font-medium font-heading"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              Set Revenue
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : activeSection === 'create-pool' ? (
          <CreatePoolForm
            protocolId={adminState.protocolId}
            onSuccess={handleCreatePoolSuccess}
            onCancel={() => setActiveSection('overview')}
          />
        ) : activeSection === 'protocol-revenue' ? (
          <SetRevenueForm
            protocolId={adminState.protocolId}
            type="protocol"
            onSuccess={handleSetRevenueSuccess}
            onCancel={() => setActiveSection('overview')}
          />
        ) : activeSection === 'pool-revenue' ? (
          <SetRevenueForm
            protocolId={adminState.protocolId}
            type="pool"
            pools={adminState.pools}
            onSuccess={handleSetRevenueSuccess}
            onCancel={() => setActiveSection('overview')}
          />
        ) : activeSection === 'manager' ? (
          <ManagerSection
            protocolId={adminState.protocolId}
            adminState={adminState}
            onBack={() => setActiveSection('overview')}
          />
        ) : null}
      </main>
    </div>
  );
};

export default ProtocolAdminPage;
