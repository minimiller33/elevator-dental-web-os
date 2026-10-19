import type { ComponentType, ReactNode, MouseEventHandler } from "react";
declare const TextUnderline: ComponentType<{ className?: string; children: ReactNode; href: string; underlineColor?: string; underlineHeight?: "thin" | "medium" | "thick"; duration?: "fast" | "normal" | "slow"; onClick?: MouseEventHandler<HTMLAnchorElement> }>;
export default TextUnderline;
