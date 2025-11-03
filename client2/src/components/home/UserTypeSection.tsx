import { ArrowRight, Code2, Layers, Plug } from 'lucide-react';
import Section from '../common/Section';
import Container from '../common/Container';
import Heading from '../common/Heading';
import Badge from '../common/Badge';
import IconBox from '../common/IconBox';
import type { Page } from '../../types';

interface UserTypeSectionProps {
  onNavigate: (page: Page) => void;
}

interface UserType {
  icon: typeof Code2;
  title: string;
  description: string;
  page: Page;
  variant: 'primary' | 'secondary' | 'accent';
  badge?: 'beta';
  ariaLabel: string;
}

const userTypes: UserType[] = [
  {
    icon: Code2,
    title: 'I am a hook developer',
    description:
      'Deploy hooks and compete for pool integration. Track revenue, manage staking, and participate in auctions.',
    page: 'hook-developer',
    variant: 'primary',
    ariaLabel: 'Go to Hook Developer Dashboard',
  },
  {
    icon: Layers,
    title: 'I am a protocol designer',
    description:
      'Create protocols and select hooks for pools. Define requirements, manage pools, and track revenue.',
    page: 'protocol-designer',
    variant: 'secondary',
    ariaLabel: 'Go to Protocol Designer Dashboard',
  },
  {
    icon: Plug,
    title: 'I am an integrator',
    description:
      'Integrate Hook Bazaar into your application. Access APIs, SDKs, and technical documentation.',
    page: 'integrator',
    variant: 'accent',
    badge: 'beta',
    ariaLabel: 'Go to Integrator Portal (Beta)',
  },
];

export default function UserTypeSection({ onNavigate }: UserTypeSectionProps) {
  return (
    <Section id="user-type-section" variant="speed-lines" spacing="xl">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <Heading level={2} className="mb-6">
            Get <span className="text-[var(--color-primary)]">Started</span>
          </Heading>
          <p
            className="font-body max-w-2xl mx-auto text-[var(--color-black)]"
            style={{
              fontSize: 'var(--font-size-body-lg)',
              lineHeight: 'var(--line-height-loose)',
            }}
          >
            Choose your role to access tailored tools and features designed for your needs in the
            Hook Bazaar ecosystem.
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {userTypes.map((type, index) => {
            const bgColor =
              type.variant === 'primary'
                ? 'var(--color-primary)'
                : type.variant === 'secondary'
                ? 'var(--color-secondary)'
                : 'var(--color-accent)';

            const textColor =
              type.variant === 'primary' ? 'var(--color-secondary)' : 'var(--color-white)';

            const iconVariant = type.variant === 'primary' ? 'secondary' : 'primary';

            return (
              <button
                key={index}
                onClick={() => onNavigate(type.page)}
                className="angular-clip p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:rotate-[-0.5deg] group relative border-2 border-[var(--color-secondary)] focus:outline-none focus:ring-3 focus:ring-[var(--color-primary)]"
                style={{ background: bgColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-level-3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 transparent';
                }}
                aria-label={type.ariaLabel}
              >
                {/* BETA Badge */}
                {type.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="beta">{type.badge.toUpperCase()}</Badge>
                  </div>
                )}

                {/* Icon */}
                <IconBox
                  icon={<type.icon size={40} aria-hidden="true" />}
                  size="xl"
                  variant={iconVariant}
                  className="mb-6"
                />

                {/* Title */}
                <h3
                  className="mb-4 font-heading"
                  style={{
                    color: textColor,
                    fontSize: 'var(--font-size-h5)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {type.title}
                </h3>

                {/* Description */}
                <p
                  className="mb-6 font-body"
                  style={{
                    color: textColor,
                    fontSize: 'var(--font-size-body)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  {type.description}
                </p>

                {/* Arrow Icon */}
                <div
                  className="flex items-center gap-2 font-heading"
                  style={{
                    color: textColor,
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-2"
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
