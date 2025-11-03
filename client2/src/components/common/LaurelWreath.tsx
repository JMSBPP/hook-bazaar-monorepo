interface LaurelWreathProps {
  className?: string;
  side?: 'left' | 'right' | 'both';
}

export default function LaurelWreath({ className = '', side = 'both' }: LaurelWreathProps) {
  const leftPath =
    'M20,10 Q15,15 15,25 Q15,35 20,40 Q18,35 18,25 Q18,15 20,10 M22,15 Q20,18 20,25 Q20,32 22,35 M25,20 Q24,22 24,30 Q24,28 25,30';
  const rightPath =
    'M80,10 Q85,15 85,25 Q85,35 80,40 Q82,35 82,25 Q82,15 80,10 M78,15 Q80,18 80,25 Q80,32 78,35 M75,20 Q76,22 76,30 Q76,28 75,30';

  const renderSVG = () => {
    if (side === 'both') {
      return (
        <svg
          className={className}
          viewBox="0 0 100 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Left laurel */}
          <path d={leftPath} stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path
            d="M15,18 L12,20 L15,22 M15,28 L12,30 L15,32"
            stroke="currentColor"
            strokeWidth="1"
            fill="currentColor"
          />

          {/* Right laurel */}
          <path d={rightPath} stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path
            d="M85,18 L88,20 L85,22 M85,28 L88,30 L85,32"
            stroke="currentColor"
            strokeWidth="1"
            fill="currentColor"
          />
        </svg>
      );
    }

    if (side === 'left') {
      return (
        <svg
          className={className}
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d={leftPath} stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path
            d="M15,18 L12,20 L15,22 M15,28 L12,30 L15,32"
            stroke="currentColor"
            strokeWidth="1"
            fill="currentColor"
          />
        </svg>
      );
    }

    return (
      <svg
        className={className}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d={rightPath} stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path
          d="M85,18 L88,20 L85,22 M85,28 L88,30 L85,32"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
        />
      </svg>
    );
  };

  return renderSVG();
}
