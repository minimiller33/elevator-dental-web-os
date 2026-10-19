import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
  tone?: "light" | "dark";
  product?: string;
};

// Original Elevator assets from files-portal/public, with no redrawn lettering.
export function BrandMark({ compact = false, className = "", tone = "light", product = "DENTAL OS" }: BrandMarkProps) {
  return <span className={`brand-mark brand-mark--original ${compact ? "brand-mark--compact" : ""} ${className}`.trim()}>
    {compact ? <Image unoptimized className="brand-mark__icon" src="/brand/elevator-symbol.svg" alt="Elevator" width={52} height={36} /> : <span className="brand-mark__lockup">
      <Image unoptimized className="brand-mark__logo" src={tone === "dark" ? "/brand/elevator-logo.png" : "/brand/elevator-logo-white.png"} alt="Elevator" width={180} height={38} />
      <span className="brand-mark__product">{product}</span>
    </span>}
  </span>;
}
