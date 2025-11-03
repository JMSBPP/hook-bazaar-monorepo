import { ArrowLeft, Github, Mail, MessageSquare, Twitter } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import Section from './common/Section';
import Container from './common/Container';
import Heading from './common/Heading';
import Card from './common/Card';
import IconBox from './common/IconBox';
import Link from './common/Link';
import type { Page } from '../types';

interface ContactPageProps {
  onNavigate: (page: Page) => void;
}

interface SocialLink {
  icon: typeof Twitter;
  name: string;
  description: string;
  href: string;
  handle: string;
  variant: 'primary' | 'secondary' | 'accent';
  ariaLabel: string;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const socialLinks: SocialLink[] = [
    {
      icon: Twitter,
      name: 'Twitter / X',
      description: 'Follow us for updates and announcements',
      href: 'https://twitter.com/hookbazaar',
      handle: '@hookbazaar',
      variant: 'primary',
      ariaLabel: 'Follow us on Twitter',
    },
    {
      icon: MessageSquare,
      name: 'Discord',
      description: 'Join our community and get support',
      href: 'https://discord.gg/hookbazaar',
      handle: 'discord.gg/hookbazaar',
      variant: 'secondary',
      ariaLabel: 'Join our Discord community',
    },
    {
      icon: Github,
      name: 'GitHub',
      description: 'Explore our open-source repositories',
      href: 'https://github.com/hookbazaar',
      handle: 'github.com/hookbazaar',
      variant: 'accent',
      ariaLabel: 'View our GitHub repositories',
    },
    {
      icon: Mail,
      name: 'Email',
      description: 'Send us a message directly',
      href: 'mailto:contact@hookbazaar.com',
      handle: 'contact@hookbazaar.com',
      variant: 'primary',
      ariaLabel: 'Send us an email',
    },
  ];

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
              Connect <span className="text-[var(--color-primary)]">With Us</span>
            </Heading>

            <p
              className="font-body max-w-2xl text-[var(--color-gray-light)]"
              style={{
                fontSize: 'var(--font-size-body-lg)',
                lineHeight: 'var(--line-height-loose)',
              }}
            >
              We'd love to hear from you. Reach out through any of these channels and we'll get
              back to you as soon as possible.
            </p>
          </Container>
        </Section>

        {/* Contact Cards */}
        <Section spacing="xl">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {socialLinks.map((link, index) => {
                const textColor =
                  link.variant === 'primary' ? 'var(--color-secondary)' : 'var(--color-white)';
                const iconBg =
                  link.variant === 'primary' ? 'var(--color-secondary)' : 'var(--color-white)';
                const iconVariant: 'primary' | 'secondary' | 'accent' =
                  link.variant === 'primary' ? 'secondary' : link.variant;

                return (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded"
                    aria-label={link.ariaLabel}
                  >
                    <Card variant={link.variant} hoverable className="p-8 h-full">
                      {/* Icon */}
                      <IconBox
                        icon={<link.icon size={32} aria-hidden="true" />}
                        size="lg"
                        variant={iconVariant}
                        className="mb-6"
                      />

                      {/* Name */}
                      <Heading
                        level={3}
                        className="mb-2"
                        style={{
                          color: textColor,
                          fontSize: 'var(--font-size-h4)',
                          fontWeight: 'var(--font-weight-bold)',
                        }}
                      >
                        {link.name}
                      </Heading>

                      {/* Description */}
                      <p
                        className="mb-4 font-body"
                        style={{
                          color: textColor,
                          fontSize: 'var(--font-size-body)',
                          lineHeight: 'var(--line-height-relaxed)',
                        }}
                      >
                        {link.description}
                      </p>

                      {/* Handle */}
                      <p
                        className="font-mono"
                        style={{
                          color: textColor,
                          fontSize: 'var(--font-size-body-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {link.handle}
                      </p>
                    </Card>
                  </a>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className="mt-16 text-center">
              <Card
                variant="white"
                className="p-8 max-w-2xl mx-auto bg-[var(--color-marble-light)]"
              >
                <Heading
                  level={3}
                  className="mb-4"
                  style={{
                    fontSize: 'var(--font-size-h4)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Need Help?
                </Heading>
                <p
                  className="font-body mb-6 text-[var(--color-gray-light)]"
                  style={{
                    fontSize: 'var(--font-size-body)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  Check out our documentation, join our Discord community, or send us an email.
                  We're here to help you succeed with Hook Bazaar.
                </p>
                <nav className="flex flex-wrap justify-center gap-6" aria-label="Help resources">
                  <Link
                    href="https://docs.hookbazaar.com"
                    variant="underlined"
                    external
                    style={{
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                    aria-label="View documentation"
                  >
                    Documentation
                  </Link>
                  <Link
                    href="#faq"
                    variant="underlined"
                    style={{
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                    aria-label="Frequently asked questions"
                  >
                    FAQ
                  </Link>
                  <Link
                    href="#support"
                    variant="underlined"
                    style={{
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                    aria-label="Support center"
                  >
                    Support Center
                  </Link>
                </nav>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
