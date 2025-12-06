import logo from '../../assets/d9960bdb814135603341883999ea9dc547d831b8.png';

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
  xl: 'h-32 w-32',
};

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logo}
        alt="Hook Bazaar Logo - Marketplace for Uniswap V4 Hooks"
        className={`${sizeMap[size]} object-contain`}
      />
      {showText && (
        <span
          className="font-heading text-xl text-[var(--color-primary)]"
          style={{ fontWeight: 700 }}
        >
          Hook Bazaar
        </span>
      )}
    </div>
  );
}
