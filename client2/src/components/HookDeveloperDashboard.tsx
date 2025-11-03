import { ArrowLeft, Code, DollarSign, Package, Plus, TrendingUp } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

interface HookDeveloperDashboardProps {
  onNavigate: (page: string) => void;
}

export default function HookDeveloperDashboard({ onNavigate }: HookDeveloperDashboardProps) {
  const stats = [
    { icon: Package, label: 'Total Hooks', value: '3', color: 'primary' },
    { icon: DollarSign, label: 'Total Revenue', value: '$12,450', color: 'secondary' },
    { icon: Code, label: 'Active Pools', value: '18', color: 'accent' },
    { icon: TrendingUp, label: 'Pending Bids', value: '2', color: 'primary' },
  ];

  const hooks = [
    {
      name: 'Dynamic Fee Hook',
      category: 'Fee Management',
      status: 'active',
      pools: 12,
      revenue: '$8,240',
    },
    {
      name: 'Liquidity Oracle Hook',
      category: 'Liquidity Management',
      status: 'active',
      pools: 6,
      revenue: '$4,210',
    },
    {
      name: 'Compliance Hook',
      category: 'Compliance',
      status: 'pending',
      pools: 0,
      revenue: '$0',
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
                Hook Developer <span style={{ color: 'var(--color-primary)' }}>Dashboard</span>
              </h1>
              <p
                className="font-body"
                style={{
                  color: 'var(--color-black)',
                  fontSize: 'var(--font-size-body)',
                }}
              >
                Manage your hooks, track performance, and compete for pool integration
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
              Deploy New Hook
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Hooks List */}
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
            Your Hooks
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {hooks.map((hook, index) => (
              <div
                key={index}
                className="angular-clip p-6 transition-all duration-300 hover:-translate-y-1 hover:rotate-[-0.5deg]"
                style={{
                  background: 'var(--color-white)',
                  border: '2px solid var(--color-secondary)',
                  boxShadow: '0 0 0 transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-level-2)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 transparent';
                  e.currentTarget.style.borderColor = 'var(--color-secondary)';
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="font-heading"
                        style={{
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-h5)',
                          fontWeight: 'var(--font-weight-bold)',
                        }}
                      >
                        {hook.name}
                      </h3>
                      <span
                        className="angular-clip px-3 py-1 font-heading"
                        style={{
                          background:
                            hook.status === 'active'
                              ? 'var(--color-primary)'
                              : 'var(--color-accent)',
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-caption)',
                          fontWeight: 'var(--font-weight-bold)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {hook.status}
                      </span>
                    </div>
                    <p
                      className="font-body mb-4"
                      style={{
                        color: 'var(--color-accent)',
                        fontSize: 'var(--font-size-body-sm)',
                      }}
                    >
                      {hook.category}
                    </p>
                    <div className="flex gap-6">
                      <div>
                        <span
                          className="font-heading"
                          style={{
                            color: 'var(--color-black)',
                            fontSize: 'var(--font-size-body-sm)',
                          }}
                        >
                          Pools: <strong>{hook.pools}</strong>
                        </span>
                      </div>
                      <div>
                        <span
                          className="font-heading"
                          style={{
                            color: 'var(--color-black)',
                            fontSize: 'var(--font-size-body-sm)',
                          }}
                        >
                          Revenue: <strong>{hook.revenue}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="angular-clip-button px-4 py-2 font-heading uppercase tracking-wider transition-all duration-200"
                      style={{
                        background: 'transparent',
                        color: 'var(--color-secondary)',
                        border: '2px solid var(--color-secondary)',
                        fontSize: 'var(--font-size-caption)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-secondary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-secondary)';
                      }}
                    >
                      View
                    </button>
                    <button
                      className="angular-clip-button px-4 py-2 font-heading uppercase tracking-wider transition-all duration-200"
                      style={{
                        background: 'var(--color-primary)',
                        color: 'var(--color-secondary)',
                        border: '2px solid var(--color-secondary)',
                        fontSize: 'var(--font-size-caption)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      Manage
                    </button>
                  </div>
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
