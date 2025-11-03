import { BarChart3, Code, Gavel, Package, Search, Settings, TrendingUp } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: 'Hook Marketplace & Discovery',
      description: 'Browse available hooks by category, view specifications and audits, and compare competing hooks for the same functionality.',
    },
    {
      icon: Settings,
      title: 'Protocol Creation & Management',
      description: 'Register protocols, define hook requirements by category, and manage multiple pools under a single protocol.',
    },
    {
      icon: Package,
      title: 'Pool Creation & Hook Selection',
      description: 'Create pools with token pairs and fee tiers, select hooks from marketplace, and configure pool parameters.',
    },
    {
      icon: Code,
      title: 'Hook Developer Dashboard',
      description: 'Deploy hooks with specifications, register for specific categories, and compete in auctions to serve pools.',
    },
    {
      icon: Gavel,
      title: 'Auction & Competition',
      description: 'Hooks bid to serve pools through staking, pools evaluate competing hooks, and dynamic selection enables switching.',
    },
    {
      icon: TrendingUp,
      title: 'Revenue Tracking & Analytics',
      description: 'Protocol-level revenue aggregation, pool-level contributions, and hook developer earnings with performance metrics.',
    },
    {
      icon: BarChart3,
      title: 'Integration Tools',
      description: 'Technical documentation, smart contract interfaces, testing tools, and hook adapter patterns for seamless integration.',
    },
  ];

  return (
    <section
      className="diagonal-bg"
      style={{
        paddingTop: 'var(--space-4xl)',
        paddingBottom: 'var(--space-4xl)',
        background: 'var(--color-marble-light)',
      }}
    >
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="mb-6 font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            Platform <span style={{ color: 'var(--color-primary)' }}>Features</span>
          </h2>
          <p
            className="font-body max-w-2xl mx-auto"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body-lg)',
              lineHeight: 'var(--line-height-loose)',
            }}
          >
            A comprehensive suite of tools for hook developers, protocol designers, and integrators
            to participate in the contestable hook marketplace.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="angular-clip p-6 transition-all duration-300 hover:-translate-y-2 hover:rotate-[-0.5deg]"
              style={{
                background: 'var(--color-white)',
                border: index % 2 === 0 ? '2px solid var(--color-secondary)' : '2px solid var(--color-primary)',
                boxShadow: '0 0 0 transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-level-2)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 transparent';
                e.currentTarget.style.borderColor = index % 2 === 0 ? 'var(--color-secondary)' : 'var(--color-primary)';
              }}
            >
              {/* Icon */}
              <div
                className="angular-clip flex h-12 w-12 items-center justify-center mb-4"
                style={{
                  background: index % 3 === 0 ? 'var(--color-primary)' : index % 3 === 1 ? 'var(--color-secondary)' : 'var(--color-accent)',
                }}
              >
                <feature.icon
                  size={24}
                  style={{
                    color: index % 3 === 0 ? 'var(--color-secondary)' : 'var(--color-white)',
                  }}
                />
              </div>

              {/* Title */}
              <h3
                className="mb-3 font-heading"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-h6)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="font-body"
                style={{
                  color: 'var(--color-black)',
                  fontSize: 'var(--font-size-body-sm)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
