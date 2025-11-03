import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      children,
      fullWidth = false,
      icon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      angular-clip-button font-heading uppercase tracking-wider 
      transition-all duration-200
      disabled:opacity-60 disabled:cursor-not-allowed
      focus:outline-none focus:ring-3 focus:ring-primary
      inline-flex items-center justify-center gap-2
    `;

    const variantStyles = {
      primary: `
        bg-[var(--color-primary)] text-[var(--color-bg-darkest)] 
        border-2 border-[var(--color-primary)]
        hover:bg-[var(--color-primary-dark)] hover:-translate-y-1 hover:rotate-[-1deg]
        hover:shadow-[var(--shadow-level-2)]
        active:translate-y-0
      `,
      secondary: `
        bg-[var(--color-bg-dark)] text-[var(--color-primary)]
        border-2 border-[var(--color-primary)]
        hover:bg-[var(--color-secondary)] hover:-translate-y-1 hover:rotate-[-1deg]
        hover:shadow-[var(--shadow-level-2)]
        active:translate-y-0
      `,
      accent: `
        bg-[var(--color-accent)] text-white
        border-2 border-[var(--color-accent)]
        hover:bg-[var(--color-accent-dark)] hover:-translate-y-1 hover:rotate-[-1deg]
        hover:shadow-[var(--shadow-level-2)]
        active:translate-y-0
      `,
      ghost: `
        bg-transparent text-[var(--color-gray-light)]
        border-2 border-[var(--color-primary)]
        hover:bg-[var(--color-primary)] hover:text-[var(--color-bg-darkest)] hover:-translate-y-1 hover:rotate-[-1deg]
        hover:shadow-[var(--shadow-level-2)]
        active:translate-y-0
      `,
    };

    const sizeStyles = {
      small: 'px-6 py-3 text-[12px]',
      medium: 'px-8 py-4 text-[14px]',
      large: 'px-10 py-5 text-[16px]',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${widthStyles}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
