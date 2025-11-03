import { ReactNode } from 'react';

export type BadgeVariant = 'active' | 'pending' | 'inactive' | 'beta';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'active', className = '' }: BadgeProps) {
  const baseStyles = `
    angular-clip px-3 py-1 font-heading uppercase tracking-wider
    inline-block text-[12px]
  `;

  const variantStyles = {
    active: 'bg-[var(--color-primary)] text-[var(--color-secondary)]',
    pending: 'bg-[var(--color-accent)] text-white',
    inactive: 'bg-[var(--color-marble-dark)] text-[var(--color-secondary)]',
    beta: 'bg-[var(--color-accent)] text-white',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`} role="status">
      {children}
    </span>
  );
}
