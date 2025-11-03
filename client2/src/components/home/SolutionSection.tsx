import { CheckCircle, Layers, Target, TrendingUp } from 'lucide-react';

export default function SolutionSection() {
  const solutions = [
    {
      icon: Layers,
      title: 'Contestable Market',
      description: 'Hook developers compete through auctions and staking, creating a dynamic marketplace where quality and performance drive selection.',
    },
    {
      icon: Target,
      title: 'Pool Agency',
      description: 'Pools gain autonomy to select and switch hooks based on performance, cost, and specific requirements, enabling optimal matching.',
    },
    {
      icon: TrendingUp,
      title: 'Revenue Sharing',
      description: 'Hook developers earn revenue based on TVL and performance, creating aligned incentives for quality and innovation.',
    },
    {
      icon: CheckCircle,
      title: 'Quality-Driven Matching',
      description: 'Audits, security scores, and performance metrics enable informed decisions, ensuring pools integrate the best hooks.',
    },
  ];

  return (
    <section
      className="speed-lines"
      style={{
        paddingTop: 'var(--space-4xl)',
        paddingBottom: 'var(--space-4xl)',
        background: 'var(--color-white)',
      }}
    >
      <div className="container-custom">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <h2
            className="mb-6 font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            A <span style={{ color: 'var(--color-primary)' }}>Contestable Market</span> for Hooks
          </h2>
          <p
            className="font-body"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body-lg)',
              lineHeight: 'var(--line-height-loose)',
            }}
          >
            Hook Bazaar enables efficient market clearing through competition, giving pools the
            agency to choose and switch hooks while rewarding developers for quality and
            performance.
          </p>
        </div>

        {/* Solution Cards - Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* First Row - 7-5 split */}
          <div
            className="md:col-span-7 angular-clip p-8 transition-all duration-300 hover:-translate-y-2 hover:rotate-[-0.5deg]"
            style={{
              background: 'var(--color-secondary)',
              border: '2px solid var(--color-primary)',
              boxShadow: '0 0 0 transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-level-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 transparent';
            }}
          >
            <div
              className="angular-clip flex h-16 w-16 items-center justify-center mb-6"
              style={{
                background: 'var(--color-primary)',
              }}
            >
              {(() => {
                const Icon = solutions[0].icon;
                return <Icon size={32} style={{ color: 'var(--color-secondary)' }} />;
              })()}
            </div>
            <h3
              className="mb-4 font-heading"
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-h4)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {solutions[0].title}
            </h3>
            <p
              className="font-body"
              style={{
                color: 'var(--color-marble-light)',
                fontSize: 'var(--font-size-body-lg)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {solutions[0].description}
            </p>
          </div>

          <div
            className="md:col-span-5 angular-clip p-8 transition-all duration-300 hover:-translate-y-2 hover:rotate-[0.5deg]"
            style={{
              background: 'var(--color-primary)',
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
            <div
              className="angular-clip flex h-16 w-16 items-center justify-center mb-6"
              style={{
                background: 'var(--color-secondary)',
              }}
            >
              {(() => {
                const Icon = solutions[1].icon;
                return <Icon size={32} style={{ color: 'var(--color-primary)' }} />;
              })()}
            </div>
            <h3
              className="mb-4 font-heading"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-h4)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {solutions[1].title}
            </h3>
            <p
              className="font-body"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {solutions[1].description}
            </p>
          </div>

          {/* Second Row - 5-7 split */}
          <div
            className="md:col-span-5 angular-clip p-8 transition-all duration-300 hover:-translate-y-2 hover:rotate-[-0.5deg]"
            style={{
              background: 'var(--color-accent)',
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
            <div
              className="angular-clip flex h-16 w-16 items-center justify-center mb-6"
              style={{
                background: 'var(--color-white)',
              }}
            >
              {(() => {
                const Icon = solutions[2].icon;
                return <Icon size={32} style={{ color: 'var(--color-accent)' }} />;
              })()}
            </div>
            <h3
              className="mb-4 font-heading"
              style={{
                color: 'var(--color-white)',
                fontSize: 'var(--font-size-h4)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {solutions[2].title}
            </h3>
            <p
              className="font-body"
              style={{
                color: 'var(--color-white)',
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {solutions[2].description}
            </p>
          </div>

          <div
            className="md:col-span-7 angular-clip p-8 transition-all duration-300 hover:-translate-y-2 hover:rotate-[0.5deg]"
            style={{
              background: 'var(--color-white)',
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
            <div
              className="angular-clip flex h-16 w-16 items-center justify-center mb-6"
              style={{
                background: 'var(--color-primary)',
              }}
            >
              {(() => {
                const Icon = solutions[3].icon;
                return <Icon size={32} style={{ color: 'var(--color-secondary)' }} />;
              })()}
            </div>
            <h3
              className="mb-4 font-heading"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-h4)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {solutions[3].title}
            </h3>
            <p
              className="font-body"
              style={{
                color: 'var(--color-black)',
                fontSize: 'var(--font-size-body-lg)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {solutions[3].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
