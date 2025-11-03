import { ArrowLeft, BookOpen, Target } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import Section from './common/Section';
import Container from './common/Container';
import Heading from './common/Heading';
import Card from './common/Card';
import Button from './common/Button';
import IconBox from './common/IconBox';
import type { Page } from '../types';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <>
      <Navigation onNavigate={onNavigate} />

      <main id="main-content" tabIndex={-1}>
        {/* Hero Section */}
        <Section variant="marble" spacing="xl">
          <Container>
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 mb-8 font-heading transition-colors duration-200 text-[var(--color-gray-light)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded px-2 py-1"
              style={{
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-medium)',
              }}
              aria-label="Go back to home page"
            >
              <ArrowLeft size={20} aria-hidden="true" />
              Back to Home
            </button>

            <Heading level={1} className="mb-6">
              About <span className="text-[var(--color-primary)]">Hook Bazaar</span>
            </Heading>
          </Container>
        </Section>

        {/* About Content */}
        <Section spacing="xl">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Mission Card */}
              <Card variant="secondary" className="p-8 border-[var(--color-primary)]">
                <IconBox
                  icon={<Target size={32} aria-hidden="true" />}
                  size="lg"
                  variant="primary"
                  className="mb-6"
                />

                <Heading
                  level={2}
                  className="mb-4 text-[var(--color-primary)]"
                  style={{
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Our Mission
                </Heading>

                <p
                  className="font-body mb-4 text-[var(--color-marble-light)]"
                  style={{
                    fontSize: 'var(--font-size-body-lg)',
                    lineHeight: 'var(--line-height-loose)',
                  }}
                >
                  Our mission is to enable efficient market clearing for Uniswap V4 hooks through a
                  contestable marketplace that empowers pools with agency over hook selection.
                </p>

                <p
                  className="font-body text-[var(--color-marble-light)]"
                  style={{
                    fontSize: 'var(--font-size-body)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  We believe that pools should have the autonomy to choose and switch between hooks
                  based on performance, quality, and cost, while hook developers should be rewarded
                  for innovation and excellence.
                </p>
              </Card>

              {/* Vision Card */}
              <Card variant="white" className="p-8">
                <IconBox
                  icon={<BookOpen size={32} aria-hidden="true" />}
                  size="lg"
                  variant="accent"
                  className="mb-6"
                />

                <Heading
                  level={2}
                  className="mb-4"
                  style={{
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Our Vision
                </Heading>

                <p
                  className="font-body mb-4 text-[var(--color-gray-light)]"
                  style={{
                    fontSize: 'var(--font-size-body-lg)',
                    lineHeight: 'var(--line-height-loose)',
                  }}
                >
                  We envision a future where the DeFi ecosystem benefits from competitive,
                  quality-driven hook development that serves the best interests of all
                  participants.
                </p>

                <p
                  className="font-body text-[var(--color-gray-light)]"
                  style={{
                    fontSize: 'var(--font-size-body)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  By creating a marketplace that aligns incentives between hook developers,
                  protocol designers, and pools, we aim to accelerate innovation and improve
                  outcomes across the entire Uniswap V4 ecosystem.
                </p>
              </Card>
            </div>

            {/* Tech Docs Section */}
            <div className="mt-16">
              <Card variant="primary" className="p-12 text-center border-[var(--color-secondary)]">
                <Heading
                  level={2}
                  className="mb-4 text-[var(--color-bg-darkest)]"
                  style={{
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Technical Documentation
                </Heading>

                <p
                  className="font-body mb-8 max-w-2xl mx-auto text-[var(--color-bg-darkest)]"
                  style={{
                    fontSize: 'var(--font-size-body-lg)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  Explore our comprehensive technical documentation to learn more about the
                  platform architecture, smart contracts, and integration guides.
                </p>

                <a
                  href="https://docs.hookbazaar.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="secondary" size="medium" aria-label="Access technical documentation (opens in new window)">
                    Access Documentation
                  </Button>
                </a>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
