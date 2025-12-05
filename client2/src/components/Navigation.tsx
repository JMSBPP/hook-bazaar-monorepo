import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Logo from './common/Logo';
import type { Page } from '../types';

interface NavigationProps {
  onNavigate?: (page: Page) => void;
}

interface NavLink {
  name: string;
  page: Page | 'app' | 'docs';
  ariaLabel?: string;
}

const navLinks: NavLink[] = [
  { name: 'Home', page: 'home', ariaLabel: 'Go to home page' },
  { name: 'About', page: 'about', ariaLabel: 'Learn about Hook Bazaar' },
  { name: 'Tech Docs', page: 'docs', ariaLabel: 'View technical documentation' },
  { name: 'Contact', page: 'contact', ariaLabel: 'Contact us' },
  { name: 'App', page: 'app', ariaLabel: 'Go to application' },
];

export default function Navigation({ onNavigate }: NavigationProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (page: string) => {
    if (page === 'app') {
      const element = document.getElementById('user-type-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.focus();
      }
    } else if (page === 'docs') {
      // External link - could open in new tab
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
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-[var(--color-bg-dark)] angular-clip border-b-2 border-[var(--color-primary)]"
      aria-label="Main navigation"
      style={{ boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)' }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <button
            onClick={() => handleNavigate('home')}
            className="transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded px-2 py-1"
            aria-label="Hook Bazaar - Go to home page"
          >
            <Logo size="md" showText={true} />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigate(link.page)}
                className="font-heading transition-all duration-200 hover:scale-105 text-[var(--color-gray-light)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded px-2 py-1"
                style={{
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
                aria-label={link.ariaLabel}
              >
                {link.name}
              </button>
            ))}
            <ConnectButton 
              chainStatus="icon"
              showBalance={false}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden pb-4 angular-clip border-t-2 border-[var(--color-primary)] mt-4 pt-4"
          >
            <div className="flex flex-col gap-4" role="menu">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigate(link.page)}
                  className="font-heading text-left py-2 text-[var(--color-gray-light)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded px-2"
                  style={{
                    fontSize: 'var(--font-size-body)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                  role="menuitem"
                  aria-label={link.ariaLabel}
                >
                  {link.name}
                </button>
              ))}
              <div className="w-full">
                <ConnectButton 
                  chainStatus="icon"
                  showBalance={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
