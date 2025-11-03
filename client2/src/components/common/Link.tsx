import { AnchorHTMLAttributes, ReactNode } from 'react';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: 'default' | 'underlined';
  external?: boolean;
}

export default function Link({
  children,
  variant = 'default',
  external = false,
  className = '',
  ...props
}: LinkProps) {
  const baseStyles = `
    font-heading transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
  `;

  const variantStyles = {
    default: `
      text-[var(--color-secondary)]
      hover:text-[var(--color-primary)]
    `,
    underlined: `
      text-[var(--color-secondary)]
      underline decoration-[var(--color-primary)] underline-offset-4
      hover:text-[var(--color-primary)]
    `,
  };

  const externalProps = external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {};

  return (
    <a
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...externalProps}
      {...props}
    >
      {children}
      {external && <span className="sr-only"> (opens in new window)</span>}
    </a>
  );
}
