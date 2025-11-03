import { ArrowRight } from 'lucide-react';
import Section from '../common/Section';
import Container from '../common/Container';
import Heading from '../common/Heading';
import Button from '../common/Button';
import Logo from '../common/Logo';
import GreekKeyPattern from '../common/GreekKeyPattern';
import type { Page } from '../../types';

interface HeroSectionProps {
  onNavigate: (page: Page) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const scrollToUserTypes = () => {
    const element = document.getElementById('user-type-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Set focus for keyboard users
      const firstButton = element.querySelector('button');
      if (firstButton) {
        firstButton.focus();
      }
    }
  };

  return (
    <Section variant="speed-lines" spacing="xl" className="relative overflow-hidden">
      {/* Decorative Greek Key Pattern - Top */}
      <div className="absolute top-0 left-0 right-0 h-8 text-[var(--color-primary)] opacity-30 pointer-events-none">
        <GreekKeyPattern variant="horizontal" className="w-full h-full" />
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-20 right-10 angular-clip opacity-10 hidden lg:block pointer-events-none"
        style={{
          width: '300px',
          height: '300px',
          background: 'var(--color-primary)',
          transform: 'rotate(45deg)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 left-10 opacity-10 hidden lg:block pointer-events-none"
        style={{
          width: '0',
          height: '0',
          borderLeft: '150px solid transparent',
          borderRight: '150px solid transparent',
          borderBottom: '260px solid var(--color-accent)',
          transform: 'rotate(-15deg)',
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <div className="transition-transform duration-300 hover:scale-105">
              <Logo size="xl" showText={false} />
            </div>
          </div>

          {/* Headline */}
          <Heading level={1} className="mb-6">
            A Marketplace for{' '}
            <span className="text-[var(--color-primary)]">Uniswap V4 Hooks</span>
          </Heading>

          {/* Subheadline */}
          <Heading
            level={2}
            className="mb-6 text-[var(--color-accent)]"
            style={{
              fontSize: 'var(--font-size-h4)',
              fontWeight: 'var(--font-weight-semi-bold)',
              lineHeight: 'var(--line-height-normal)',
            }}
          >
            Empowering pools with agency over hook selection
          </Heading>

          {/* Description */}
          <p
            className="mb-12 font-body max-w-2xl mx-auto text-[var(--color-gray-light)]"
            style={{
              fontSize: 'var(--font-size-body-lg)',
              lineHeight: 'var(--line-height-loose)',
            }}
          >
            Hook Bazaar enables a contestable market where hook developers compete for pool
            integration, protocol designers select optimal hooks, and pools gain autonomy in their
            operations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={scrollToUserTypes}
              variant="primary"
              size="medium"
              icon={<ArrowRight size={20} />}
              aria-label="Get started with Hook Bazaar"
            >
              Get Started
            </Button>

            <Button
              onClick={() => onNavigate('about')}
              variant="ghost"
              size="medium"
              aria-label="Learn more about Hook Bazaar"
            >
              Learn More
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
