import { ArrowLeft, DollarSign, Layers, Plus, TrendingUp } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

interface ProtocolDesignerDashboardProps {
  onNavigate: (page: string) => void;
}

export default function ProtocolDesignerDashboard({ onNavigate }: ProtocolDesignerDashboardProps) {
  const stats = [
    { icon: Layers, label: 'Total Protocols', value: '2', color: 'primary' },
    { icon: TrendingUp, label: 'Total Pools', value: '8', color: 'secondary' },
    { icon: DollarSign, label: 'Total Revenue', value: '$45,230', color: 'accent' },
  ];

  const protocols = [
    {
      name: 'DeFi Protocol Alpha',
      pools: 5,
      revenue: '$28,450',
      status: 'active',
    },
    {
      name: 'Liquidity Hub Beta',
      pools: 3,
      revenue: '$16,780',
      status: 'active',
    },
  ];

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
            onClick={() => onNavigate('home')}
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

            <button
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
            {protocols.map((protocol, index) => (
              <div
                key={index}
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

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
