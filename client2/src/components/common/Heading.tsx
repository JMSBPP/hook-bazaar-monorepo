import { ReactNode, createElement } from 'react';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Heading({ level, children, className = '', id }: HeadingProps) {
  const baseStyles = 'font-heading text-[var(--color-secondary)]';

  return createElement(
    `h${level}`,
    {
      className: `${baseStyles} ${className}`,
      id,
    },
    children
  );
}
