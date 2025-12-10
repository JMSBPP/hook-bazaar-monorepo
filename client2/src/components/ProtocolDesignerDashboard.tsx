import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, DollarSign, Layers, Plus, Search, TrendingUp } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import CreateProtocolDialog from './protocol/CreateProtocolDialog';
import ProtocolDetailsDialog from './protocol/ProtocolDetailsDialog';
import { useWallet } from '../hooks/useWallet';
import type { Protocol } from '../types';

interface ProtocolDetailsFormData {
  website: string;
  roles: string;
  twitter?: string;
  discord?: string;
  github?: string;
}

interface ProtocolDesignerDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function ProtocolDesignerDashboard({ onNavigate }: ProtocolDesignerDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = useWallet();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  // Store all protocols (including user-created ones)
  const [protocols, setProtocols] = useState<Protocol[]>([]);

  // Filter protocols by connected wallet address
  const userProtocols = protocols.filter(
    (protocol) => protocol.creator?.toLowerCase() === address?.toLowerCase()
  );

  // Calculate stats from user's protocols
  const totalPools = userProtocols.reduce((sum, p) => sum + (p.pools || 0), 0);
  const totalRevenue = userProtocols.reduce((sum, p) => {
    const revenue = parseFloat(p.revenue?.replace(/[$,]/g, '') || '0');
    return sum + revenue;
  }, 0);

  const stats = [
    { icon: Layers, label: 'Total Protocols', value: String(userProtocols.length), color: 'primary' },
    { icon: TrendingUp, label: 'Total Pools', value: String(totalPools), color: 'secondary' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'accent' },
  ];

  const handleCreateProtocolSuccess = (
    protocolId: bigint,
    chainId: number,
    protocolName: string,
    feeRecipient?: string
  ) => {
    // Check if protocol already exists to prevent duplicates
    const exists = protocols.some((p) => p.protocolId === protocolId.toString());
    if (exists) {
      console.log('Protocol already exists, skipping duplicate creation');
      return;
    }

    // Create a new protocol entry with the name and fee recipient from the transaction
    const newProtocol: Protocol = {
      id: `protocol-${protocolId.toString()}`,
      name: protocolName || `Protocol ${protocolId.toString()}`,
      feeRecipient: feeRecipient || address || '0x0000000000000000000000000000000000000000',
      pools: 0,
      revenue: '$0',
      status: 'active',
      chainId,
      creator: address, // The caller/deployer
      protocolId: protocolId.toString(),
    };
    setProtocols([...protocols, newProtocol]);
    setCreateDialogOpen(false);

    // Automatically open ProtocolDetailsDialog after success
    // Small delay to allow confetti to show first
    setTimeout(() => {
      setSelectedProtocol(newProtocol);
      setDetailsDialogOpen(true);
    }, 3500); // Open after dialog closes (3s) + small buffer
  };

  // Handle protocol creation from CreateProtocolPage route
  useEffect(() => {
    const state = location.state as { 
      newProtocol?: { 
        protocolId: string; 
        chainId: number; 
        protocolName?: string; 
        feeRecipient?: string;
      } 
    } | null;
    if (state?.newProtocol) {
      const { protocolId, chainId, protocolName, feeRecipient } = state.newProtocol;
      // Check if protocol already exists
      const exists = protocols.some((p) => p.protocolId === protocolId);
      if (!exists) {
        const newProtocol: Protocol = {
          id: `protocol-${protocolId}`,
          name: protocolName || `Protocol ${protocolId}`,
          feeRecipient: feeRecipient || address || '0x0000000000000000000000000000000000000000',
          pools: 0,
          revenue: '$0',
          status: 'active',
          chainId,
          creator: address, // The deployer
          protocolId,
        };
        setProtocols([...protocols, newProtocol]);
        
        // Automatically open ProtocolDetailsDialog after protocol is created
        // Delay to allow confetti and navigation to complete
        setTimeout(() => {
          setSelectedProtocol(newProtocol);
          setDetailsDialogOpen(true);
        }, 4000);
      }
      // Clear location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, address, protocols, navigate, location.pathname]);

  const handleViewDetails = (protocol: Protocol) => {
    // Navigate to the Protocol Admin page with the protocol data
    if (protocol.protocolId) {
      navigate(`/ProtocolDashboard/protocol/${protocol.protocolId}/admin`, {
        state: { protocol },
      });
    } else {
      // Fallback to dialog for protocols without protocolId
      setSelectedProtocol(protocol);
      setDetailsDialogOpen(true);
    }
  };

  const handleSaveProtocolDetails = (
    protocol: Protocol,
    data: ProtocolDetailsFormData
  ) => {
    setProtocols(
      protocols.map((p) => (p.id === protocol.id ? protocol : p))
    );
  };

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={onNavigate} />

      {/* Hero Section */}
      <section
        className="speed-lines"
        style={{
          paddingTop: 'var(--space-2xl)',
          paddingBottom: 'var(--space-2xl)',
          background: 'var(--color-marble-light)',
        }}
      >
        <div className="container-custom">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-8 font-heading transition-colors duration-200"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-medium)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-secondary)';
            }}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1
                className="mb-2 font-heading"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-h2)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                Protocol Designer <span style={{ color: 'var(--color-primary)' }}>Dashboard</span>
              </h1>
              <p
                className="font-body"
                style={{
                  color: 'var(--color-black)',
                  fontSize: 'var(--font-size-body)',
                }}
              >
                Create protocols, manage pools, and select hooks for optimal performance
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/ProtocolDashboard/hook-market')}
                className="angular-clip-button px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200 hover:-translate-y-1 hover:rotate-[-1deg] flex items-center gap-2"
                style={{
                  background: 'var(--color-white)',
                  color: 'var(--color-secondary)',
                  border: '2px solid var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  boxShadow: '0 0 0 transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-level-2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 transparent';
                }}
              >
                <Search size={20} />
                Browse Hooks
              </button>
              <button
                onClick={() => {
                  if (!address) {
                    alert('Please connect your wallet first');
                    return;
                  }
                  setCreateDialogOpen(true);
                }}
                className="angular-clip-button px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200 hover:-translate-y-1 hover:rotate-[-1deg] flex items-center gap-2"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-secondary)',
                  border: '2px solid var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  boxShadow: '0 0 0 transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-level-2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 transparent';
                }}
              >
                <Plus size={20} />
                Create Protocol
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="angular-clip p-6"
                style={{
                  background: 'var(--color-white)',
                  border: '2px solid var(--color-secondary)',
                }}
              >
                <div
                  className="angular-clip flex h-12 w-12 items-center justify-center mb-4"
                  style={{
                    background:
                      stat.color === 'primary'
                        ? 'var(--color-primary)'
                        : stat.color === 'secondary'
                        ? 'var(--color-secondary)'
                        : 'var(--color-accent)',
                  }}
                >
                  <stat.icon
                    size={24}
                    style={{
                      color:
                        stat.color === 'primary' ? 'var(--color-secondary)' : 'var(--color-white)',
                    }}
                  />
                </div>
                <div
                  className="mb-1 font-heading"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="font-heading"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocols List */}
      <section style={{ paddingBottom: 'var(--space-4xl)' }}>
        <div className="container-custom">
          <h2
            className="mb-8 font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Your Protocols
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userProtocols.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p
                  className="mb-4 font-heading"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-h4)',
                  }}
                >
                  No protocols created yet
                </p>
                <p
                  className="mb-6 font-body"
                  style={{
                    color: 'var(--color-black)',
                    fontSize: 'var(--font-size-body)',
                  }}
                >
                  {!address
                    ? 'Connect your wallet to view your protocols'
                    : 'Click "Create Protocol" to get started'}
                </p>
              </div>
            )}
            {userProtocols.map((protocol, index) => (
              <div
                key={protocol.id}
                className="angular-clip p-6 transition-all duration-300 hover:-translate-y-1 hover:rotate-[-0.5deg]"
                style={{
                  background:
                    index % 2 === 0 ? 'var(--color-secondary)' : 'var(--color-primary)',
                  border: '2px solid var(--color-secondary)',
                  boxShadow: '0 0 0 transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-level-2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 transparent';
                }}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className="font-heading"
                      style={{
                        color:
                          index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                        fontSize: 'var(--font-size-h4)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      {protocol.name}
                    </h3>
                    <span
                      className="angular-clip px-3 py-1 font-heading"
                      style={{
                        background:
                          index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)',
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-caption)',
                        fontWeight: 'var(--font-weight-bold)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {protocol.status}
                    </span>
                  </div>
                  {protocol.chainId && (
                    <p
                      className="text-xs"
                      style={{
                        color: index % 2 === 0 ? 'var(--color-marble-light)' : 'var(--color-accent)',
                      }}
                    >
                      Chain ID: {protocol.chainId}
                      {protocol.protocolId && ` • Protocol ID: ${protocol.protocolId}`}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div
                      className="font-heading mb-1"
                      style={{
                        color:
                          index % 2 === 0 ? 'var(--color-marble-light)' : 'var(--color-accent)',
                        fontSize: 'var(--font-size-caption)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Pools
                    </div>
                    <div
                      className="font-heading"
                      style={{
                        color: index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                        fontSize: 'var(--font-size-h4)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      {protocol.pools}
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-heading mb-1"
                      style={{
                        color:
                          index % 2 === 0 ? 'var(--color-marble-light)' : 'var(--color-accent)',
                        fontSize: 'var(--font-size-caption)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Revenue
                    </div>
                    <div
                      className="font-heading"
                      style={{
                        color: index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                        fontSize: 'var(--font-size-h4)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      {protocol.revenue}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDetails(protocol)}
                    className="angular-clip-button flex-1 px-4 py-2 font-heading uppercase tracking-wider transition-all duration-200"
                    style={{
                      background: index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-white)',
                      color: 'var(--color-secondary)',
                      border: '2px solid var(--color-secondary)',
                      fontSize: 'var(--font-size-caption)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="angular-clip-button flex-1 px-4 py-2 font-heading uppercase tracking-wider transition-all duration-200"
                    style={{
                      background: 'transparent',
                      color:
                        index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                      border:
                        index % 2 === 0
                          ? '2px solid var(--color-primary)'
                          : '2px solid var(--color-secondary)',
                      fontSize: 'var(--font-size-caption)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    Create Pool
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer onNavigate={(page) => navigate(`/${page}`)} />

      {/* Create Protocol Dialog */}
      <CreateProtocolDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateProtocolSuccess}
      />

      {/* Protocol Details Dialog */}
      {selectedProtocol && (
        <ProtocolDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          protocol={selectedProtocol}
          onSave={handleSaveProtocolDetails}
        />
      )}
    </div>
  );
}
