import { Github, Twitter, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './common/Logo';
import Link from './common/Link';
import Container from './common/Container';
import GreekKeyPattern from './common/GreekKeyPattern';
import type { Page } from '../types';

interface FooterProps {
  onNavigate?: (page: Page) => void;
}

interface NavigationLink {
  name: string;
  page: Page | 'app' | 'docs';
  ariaLabel: string;
}

interface LegalLink {
  name: string;
  href: string;
  ariaLabel: string;
}

interface SocialLink {
  icon: typeof Twitter;
  name: string;
  href: string;
  ariaLabel: string;
}

const navigationLinks: NavigationLink[] = [
  { name: 'Home', page: 'home', ariaLabel: 'Go to home page' },
  { name: 'About', page: 'about', ariaLabel: 'Learn about Hook Bazaar' },
  { name: 'Tech Docs', page: 'docs', ariaLabel: 'View technical documentation' },
  { name: 'Contact', page: 'contact', ariaLabel: 'Contact us' },
  { name: 'App', page: 'app', ariaLabel: 'Go to application' },
];

const legalLinks: LegalLink[] = [
  { name: 'Terms of Service', href: '#terms', ariaLabel: 'View terms of service' },
  { name: 'Privacy Policy', href: '#privacy', ariaLabel: 'View privacy policy' },
];

const socialLinks: SocialLink[] = [
  {
    icon: Twitter,
    name: 'Twitter',
    href: 'https://twitter.com/hookbazaar',
    ariaLabel: 'Follow us on Twitter',
  },
  {
    icon: Github,
    name: 'GitHub',
    href: 'https://github.com/hookbazaar',
    ariaLabel: 'View our GitHub repository',
  },
  {
    icon: Mail,
    name: 'Email',
    href: 'mailto:contact@hookbazaar.com',
    ariaLabel: 'Send us an email',
  },
];

export default function Footer({ onNavigate }: FooterProps) {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (page === 'app') {
      const element = document.getElementById('user-type-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (page === 'docs') {
      window.open('https://docs.hookbazaar.com', '_blank', 'noopener,noreferrer');
    } else {
      // Map page names to routes
      const routeMap: Record<string, string> = {
        'home': '/',
        'about': '/about',
        'contact': '/contact',
        'hook-developer': '/hook-developer',
        'protocol-designer': '/ProtocolDashboard',
        'integrator': '/integrator',
      };
      const route = routeMap[page] || `/${page}`;
      navigate(route);
      if (onNavigate) {
      onNavigate(page as Page);
      }
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-24 relative bg-[var(--color-secondary)]"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Greek Key Pattern Border - Top */}
      <div className="absolute top-0 left-0 right-0 h-8 text-[var(--color-primary)] opacity-50 pointer-events-none">
        <GreekKeyPattern variant="horizontal" className="w-full h-full" />
      </div>

      <Container as="div">
        <div className="pt-24 pb-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div>
            <div className="mb-6">
              <Logo size="md" showText={true} className="[&_span]:text-[var(--color-primary)]" />
            </div>
            <p
              className="font-body text-[var(--color-marble-light)]"
              style={{
                fontSize: 'var(--font-size-body-sm)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              A marketplace for Uniswap V4 hooks. Empowering pools with agency over hook selection.
            </p>
          </div>

          {/* Navigation Section */}
          <nav aria-label="Footer navigation">
            <h2
              className="font-heading mb-4 text-[var(--color-primary)]"
              style={{
                fontSize: 'var(--font-size-h6)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Navigation
            </h2>
            <ul className="flex flex-col gap-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigate(link.page)}
                    className="font-body text-left transition-colors duration-200 text-[var(--color-marble-light)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded px-2 py-1"
                    style={{ fontSize: 'var(--font-size-body-sm)' }}
                    aria-label={link.ariaLabel}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal & Social Section */}
          <div>
            <h2
              className="font-heading mb-4 text-[var(--color-primary)]"
              style={{
                fontSize: 'var(--font-size-h6)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Legal
            </h2>
            <ul className="flex flex-col gap-3 mb-6">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-body text-[var(--color-marble-light)] hover:text-[var(--color-primary)]"
                    style={{ fontSize: 'var(--font-size-body-sm)' }}
                    aria-label={link.ariaLabel}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="flex gap-4" role="list" aria-label="Social media links">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  external
                  className="angular-clip flex h-10 w-10 items-center justify-center transition-all duration-200 hover:-translate-y-1 bg-[var(--color-primary)] text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  aria-label={social.ariaLabel}
                  role="listitem"
                >
                  <social.icon size={20} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t-2 border-[var(--color-primary)]">
          <p
            className="font-body text-center text-[var(--color-marble-light)]"
            style={{ fontSize: 'var(--font-size-body-sm)' }}
          >
            © {currentYear} Hook Bazaar. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
