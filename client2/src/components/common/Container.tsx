import { ReactNode, HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  as?: 'div' | 'section' | 'main' | 'header' | 'footer' | 'article' | 'nav';
}

export default function Container({
  children,
  as: Component = 'div',
  className = '',
  ...props
}: ContainerProps) {
  return (
    <Component className={`container-custom ${className}`} {...props}>
      {children}
    </Component>
  );
}
