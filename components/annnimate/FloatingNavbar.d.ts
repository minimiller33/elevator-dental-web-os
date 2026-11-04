import type { ForwardRefExoticComponent, RefAttributes, RefObject } from "react";
export interface FloatingNavbarHandle {
  dock(): void;
  undock(): void;
  refresh(): void;
  demo(): unknown;
}
declare const FloatingNavbar: ForwardRefExoticComponent<{
  className?: string;
  threshold?: number;
  duration?: number;
  ease?: string;
  mode?: "toggle" | "scrub";
  offset?: number;
  mark?: string;
  wordmark?: string;
  logoHref?: string;
  logoSrc?: string;
  links?: { label: string; href: string; children?: { label: string; href: string }[] }[];
  ctaLabel?: string;
  ctaHref?: string;
  hideStartRef?: RefObject<HTMLElement | null> | null;
  hideStart?: HTMLElement | null;
} & RefAttributes<FloatingNavbarHandle>>;
export default FloatingNavbar;
