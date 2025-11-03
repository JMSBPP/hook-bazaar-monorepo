import { ReactNode } from 'react';

export type IconBoxSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconBoxVariant = 'primary' | 'secondary' | 'accent' | 'white';

interface IconBoxProps {
  icon: ReactNode;
  size?: IconBoxSize;
  variant?: IconBoxVariant;
  className?: string;
}

export default function IconBox({
  icon,
  size = 'md',
  variant = 'primary',
  className = '',
}: IconBoxProps) {
  const sizeStyles = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const variantStyles = {
    primary: 'bg-[var(--color-primary)]',
    secondary: 'bg-[var(--color-secondary)]',
    accent: 'bg-[var(--color-accent)]',
    white: 'bg-white',
  };

  const iconColorStyles = {
    primary: 'text-[var(--color-secondary)]',
    secondary: 'text-[var(--color-primary)]',
    accent: 'text-white',
    white: 'text-[var(--color-secondary)]',
  };

  return (
    <div
      className={`
        angular-clip
        flex items-center justify-center
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      aria-hidden="true"
    >
      <span className={iconColorStyles[variant]}>{icon}</span>
    </div>
  );
}
