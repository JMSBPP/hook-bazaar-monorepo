export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        focus:z-50 focus:px-4 focus:py-2
        bg-[var(--color-primary)] text-[var(--color-secondary)]
        font-heading uppercase tracking-wider
        angular-clip-button
        focus:outline-none focus:ring-3 focus:ring-[var(--color-primary)]
      "
    >
      Skip to main content
    </a>
  );
}
