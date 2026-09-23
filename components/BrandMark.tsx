type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className = "" }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${compact ? "brand-mark--compact" : ""} ${className}`.trim()}>
      <svg
        aria-hidden="true"
        className="brand-mark__icon"
        viewBox="0 0 52 52"
        fill="none"
      >
        <defs>
          <linearGradient id="elevator-gradient" x1="8" y1="4" x2="45" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1858FB" />
            <stop offset="1" stopColor="#18BAFB" />
          </linearGradient>
        </defs>
        <path
          d="M5 7h11.8l9.35 17.08L35.5 7H47L32.18 34.65 26.15 45 20.2 34.65 5 7Z"
          fill="url(#elevator-gradient)"
        />
        <path
          d="M17.3 7h11.15l7.16 13.1-5.64 10.42L17.3 7Z"
          fill="#071229"
          fillOpacity=".72"
        />
      </svg>
      {compact ? null : (
        <span className="brand-mark__lockup">
          <span className="brand-mark__name">ELEVATOR</span>
          <span className="brand-mark__product">DENTAL OS</span>
        </span>
      )}
    </span>
  );
}
