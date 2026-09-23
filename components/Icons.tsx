type IconProps = { className?: string };

export function ArrowUpRight({ className = "" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M7 5h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ className = "" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <path d="m4 10.5 3.7 3.7L16 5.9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function XMark({ className = "" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function Spark({ className = "" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <path d="M10 1.8c.45 4.86 3.07 7.48 7.92 7.92-4.85.45-7.47 3.07-7.92 7.93-.45-4.86-3.07-7.48-7.92-7.93C6.93 9.28 9.55 6.66 10 1.8Z" fill="currentColor" />
    </svg>
  );
}

export function Shield({ className = "" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <path d="M10 2.3 16 4.5v4.9c0 3.8-2.45 6.75-6 8.3-3.55-1.55-6-4.5-6-8.3V4.5L10 2.3Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="m7 9.8 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Search({ className = "" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <circle cx="8.7" cy="8.7" r="5.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m12.7 12.7 3.8 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Chart({ className = "" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <path d="M3 16.5h14M4.5 13l3.2-3 2.4 1.8L15.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 5h3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
