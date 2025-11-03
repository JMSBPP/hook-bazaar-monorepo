interface GreekKeyPatternProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

export default function GreekKeyPattern({
  className = '',
  variant = 'horizontal',
}: GreekKeyPatternProps) {
  if (variant === 'vertical') {
    return (
      <svg
        className={className}
        viewBox="0 0 40 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M5 0 L5 20 L15 20 L15 10 L25 10 L25 30 L15 30 L15 20 L5 20 L5 40 L15 40 L15 30 L25 30 L25 50 L15 50 L15 40 L5 40 L5 60 L15 60 L15 50 L25 50 L25 70 L15 70 L15 60 L5 60 L5 80 L15 80 L15 70 L25 70 L25 90 L15 90 L15 80 L5 80 L5 100 L15 100 L15 90 L25 90 L25 110 L15 110 L15 100 L5 100 L5 120 L15 120 L15 110 L25 110 L25 130 L15 130 L15 120 L5 120 L5 140 L15 140 L15 130 L25 130 L25 150 L15 150 L15 140 L5 140 L5 160 L15 160 L15 150 L25 150 L25 170 L15 170 L15 160 L5 160 L5 180 L15 180 L15 170 L25 170 L25 190 L15 190 L15 180 L5 180 L5 200"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 5 L20 5 L20 15 L10 15 L10 25 L30 25 L30 15 L20 15 L20 5 L40 5 L40 15 L30 15 L30 25 L50 25 L50 15 L40 15 L40 5 L60 5 L60 15 L50 15 L50 25 L70 25 L70 15 L60 15 L60 5 L80 5 L80 15 L70 15 L70 25 L90 25 L90 15 L80 15 L80 5 L100 5 L100 15 L90 15 L90 25 L110 25 L110 15 L100 15 L100 5 L120 5 L120 15 L110 15 L110 25 L130 25 L130 15 L120 15 L120 5 L140 5 L140 15 L130 15 L130 25 L150 25 L150 15 L140 15 L140 5 L160 5 L160 15 L150 15 L150 25 L170 25 L170 15 L160 15 L160 5 L180 5 L180 15 L170 15 L170 25 L190 25 L190 15 L180 15 L180 5 L200 5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
