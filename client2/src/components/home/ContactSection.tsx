import { Github, Mail, MessageSquare, Twitter } from 'lucide-react';
import Section from '../common/Section';
import Container from '../common/Container';
import Heading from '../common/Heading';
import Card from '../common/Card';
import IconBox from '../common/IconBox';
import Link from '../common/Link';

interface SocialLink {
  icon: typeof Twitter;
  name: string;
  href: string;
  handle: string;
  ariaLabel: string;
}

const socialLinks: SocialLink[] = [
  {
    icon: Twitter,
    name: 'Twitter',
    href: 'https://twitter.com/hookbazaar',
    handle: '@hookbazaar',
    ariaLabel: 'Follow us on Twitter',
  },
  {
    icon: MessageSquare,
    name: 'Discord',
    href: 'https://discord.gg/hookbazaar',
    handle: 'Join our community',
    ariaLabel: 'Join our Discord community',
  },
  {
    icon: Github,
    name: 'GitHub',
    href: 'https://github.com/hookbazaar',
    handle: 'github.com/hookbazaar',
    ariaLabel: 'View our GitHub repository',
  },
  {
    icon: Mail,
    name: 'Email',
    href: 'mailto:contact@hookbazaar.com',
    handle: 'contact@hookbazaar.com',
    ariaLabel: 'Send us an email',
  },
];

const communityLinks = [
  { name: 'Documentation', href: 'https://docs.hookbazaar.com', ariaLabel: 'View documentation' },
  { name: 'Support', href: '#support', ariaLabel: 'Get support' },
  { name: 'Community Forum', href: '#forum', ariaLabel: 'Join community forum' },
];

export default function ContactSection() {
  return (
    <Section variant="speed-lines" spacing="xl">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <Heading level={2} className="mb-6">
            Connect <span className="text-[var(--color-primary)]">With Us</span>
          </Heading>
          <p
            className="font-body max-w-2xl mx-auto text-[var(--color-black)]"
            style={{
              fontSize: 'var(--font-size-body-lg)',
              lineHeight: 'var(--line-height-loose)',
            }}
          >
            Join our community, follow our development, and get support from the Hook Bazaar team.
          </p>
        </div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {socialLinks.map((link, index) => (
            <Card
              key={index}
              variant="white"
              hoverable
              className="text-center border-[var(--color-secondary)]"
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded"
                aria-label={link.ariaLabel}
              >
                {/* Icon */}
                <IconBox
                  icon={<link.icon size={24} aria-hidden="true" />}
                  size="md"
                  variant="secondary"
                  className="mb-4 mx-auto"
                />

                {/* Name */}
                <div
                  className="mb-2 font-heading text-[var(--color-secondary)]"
                  style={{
                    fontSize: 'var(--font-size-h6)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {link.name}
                </div>

                {/* Handle */}
                <div
                  className="font-body text-[var(--color-accent)]"
                  style={{
                    fontSize: 'var(--font-size-body-sm)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  {link.handle}
                </div>
              </a>
            </Card>
          ))}
        </div>

        {/* Additional Community Links */}
        <nav className="mt-16 text-center" aria-label="Community resources">
          <div className="flex flex-wrap justify-center gap-6">
            {communityLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                variant="underlined"
                external={link.href.startsWith('http')}
                style={{
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
                aria-label={link.ariaLabel}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      </Container>
    </Section>
  );
}
