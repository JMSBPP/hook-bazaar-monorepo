import { ReactNode, HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: 'default' | 'marble' | 'diagonal' | 'speed-lines';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

export default function Section({
  children,
  variant = 'default',
  spacing = 'xl',
  className = '',
  id,
  ...props
}: SectionProps) {
  const variantStyles = {
    default: 'bg-[var(--color-bg-darkest)]',
    marble: 'bg-[var(--color-bg-dark)] diagonal-bg',
    diagonal: 'bg-[var(--color-bg-darkest)] diagonal-bg',
    'speed-lines': 'bg-[var(--color-bg-darkest)] speed-lines',
  };

  const spacingStyles = {
    sm: 'py-16',
    md: 'py-24',
    lg: 'py-32',
    xl: 'py-[var(--space-4xl)]',
  };

  return (
    <section
      id={id}
      className={`
        ${variantStyles[variant]}
        ${spacingStyles[spacing]}
        ${className}
      `}
      {...props}
    >
      {children}
    </section>
  );
}
