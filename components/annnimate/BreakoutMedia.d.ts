import type { ForwardRefExoticComponent, RefAttributes } from "react";
export type BreakoutMediaHandle = { refresh(): void; expand(): void; contract(): void };
export type BreakoutMediaProps = {
  id?: string; className?: string; title?: string; direction?: "grow" | "shrink";
  expandOnScroll?: boolean;
  growDistance?: number; holdDistance?: number; ease?: string;
  titleLines?: readonly string[]; text?: string;
  metaItems?: readonly { label: string; value: string }[];
  posterSrc?: string; posterSrcSet?: string; videoSrc?: string;
  alt?: string; playLabel?: string; runtime?: string;
};
declare const BreakoutMedia: ForwardRefExoticComponent<BreakoutMediaProps & RefAttributes<BreakoutMediaHandle>>;
export default BreakoutMedia;
