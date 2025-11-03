import { ReactNode, HTMLAttributes } from 'react';

export type CardVariant = 'primary' | 'secondary' | 'accent' | 'white';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  children: ReactNode;
}

export default function Card({
  variant = 'white',
  hoverable = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = `
    angular-clip p-6
    transition-all duration-300
  `;

  const variantStyles = {
    primary: 'bg-[var(--color-primary)] border-2 border-[var(--color-primary)] text-[var(--color-bg-darkest)]',
    secondary: 'bg-[var(--color-bg-dark)] border-2 border-[var(--color-primary)] text-[var(--color-white)]',
    accent: 'bg-[var(--color-accent)] border-2 border-[var(--color-accent)] text-[var(--color-white)]',
    white: 'bg-[var(--color-bg-elevated)] border-2 border-[var(--color-secondary)] text-[var(--color-white)]',
  };

  const hoverStyles = hoverable
    ? `
      hover:-translate-y-2 hover:rotate-[-0.5deg]
      hover:shadow-[var(--shadow-level-2)]
      hover:border-[var(--color-primary)]
      cursor-pointer
    `
    : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${hoverStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
