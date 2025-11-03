import { ArrowLeft, Book, Code, Download, FileCode, Zap } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

interface IntegratorPortalProps {
  onNavigate: (page: string) => void;
}

export default function IntegratorPortal({ onNavigate }: IntegratorPortalProps) {
  const resources = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Quick start guide to integrate Hook Bazaar into your application.',
      link: '#',
      color: 'primary',
    },
    {
      icon: FileCode,
      title: 'API Reference',
      description: 'Complete API documentation with endpoints and examples.',
      link: '#',
      color: 'secondary',
    },
    {
      icon: Download,
      title: 'SDK Downloads',
      description: 'Download SDKs for various languages and frameworks.',
      link: '#',
      color: 'accent',
    },
    {
      icon: Code,
      title: 'Code Examples',
      description: 'Integration examples and best practices for implementation.',
      link: '#',
      color: 'primary',
    },
    {
      icon: Zap,
      title: 'Testing Tools',
      description: 'Test your integration with our sandbox and verification tools.',
      link: '#',
      color: 'secondary',
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

          <div className="flex items-start gap-4 mb-4">
            <h1
              className="font-heading"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-h2)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Integrator <span style={{ color: 'var(--color-primary)' }}>Portal</span>
            </h1>
            <span
              className="angular-clip px-4 py-2 font-heading"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-white)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-bold)',
                textTransform: 'uppercase',
              }}
            >
              BETA
            </span>
          </div>
          <p
            className="font-body max-w-2xl"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body-lg)',
              lineHeight: 'var(--line-height-loose)',
            }}
          >
            Integrate Hook Bazaar into your application with our comprehensive APIs, SDKs, and
            technical documentation. Build powerful DeFi experiences with our marketplace.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-4xl)' }}>
        <div className="container-custom">
          <h2
            className="mb-8 font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Integration Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                className="angular-clip p-6 transition-all duration-300 hover:-translate-y-2 hover:rotate-[-0.5deg] group"
                style={{
                  background: 'var(--color-white)',
                  border: '2px solid var(--color-secondary)',
                  boxShadow: '0 0 0 transparent',
                  textDecoration: 'none',
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
                <div
                  className="angular-clip flex h-14 w-14 items-center justify-center mb-4"
                  style={{
                    background:
                      resource.color === 'primary'
                        ? 'var(--color-primary)'
                        : resource.color === 'secondary'
                        ? 'var(--color-secondary)'
                        : 'var(--color-accent)',
                  }}
                >
                  <resource.icon
                    size={28}
                    style={{
                      color:
                        resource.color === 'primary'
                          ? 'var(--color-secondary)'
                          : 'var(--color-white)',
                    }}
                  />
                </div>

                <h3
                  className="mb-3 font-heading"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-h5)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {resource.title}
                </h3>

                <p
                  className="font-body"
                  style={{
                    color: 'var(--color-black)',
                    fontSize: 'var(--font-size-body-sm)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  {resource.description}
                </p>
              </a>
            ))}
          </div>

          {/* Quick Start Section */}
          <div
            className="angular-clip p-8"
            style={{
              background: 'var(--color-secondary)',
              border: '2px solid var(--color-primary)',
            }}
          >
            <h2
              className="mb-4 font-heading"
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Quick Start Guide
            </h2>

            <p
              className="font-body mb-6"
              style={{
                color: 'var(--color-marble-light)',
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              Follow these steps to integrate Hook Bazaar into your application:
            </p>

            <ol className="space-y-4 mb-8">
              {[
                'Install the Hook Bazaar SDK via npm or yarn',
                'Initialize the client with your API credentials',
                'Implement hook discovery and selection interfaces',
                'Test your integration in our sandbox environment',
                'Deploy to production and monitor performance',
              ].map((step, index) => (
                <li
                  key={index}
                  className="flex gap-4"
                  style={{
                    color: 'var(--color-marble-light)',
                    fontSize: 'var(--font-size-body)',
                  }}
                >
                  <span
                    className="angular-clip flex h-8 w-8 flex-shrink-0 items-center justify-center font-heading"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-body-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="font-body pt-1">{step}</span>
                </li>
              ))}
            </ol>

            <button
              className="angular-clip-button px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200 hover:-translate-y-1 hover:rotate-[-1deg]"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-secondary)',
                border: '2px solid var(--color-primary)',
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
              View Full Documentation
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
