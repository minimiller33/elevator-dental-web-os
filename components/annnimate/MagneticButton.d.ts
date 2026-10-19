import type { ComponentType, ReactNode, MouseEvent } from "react";
declare const MagneticButton: ComponentType<{ className?: string; children: ReactNode; href: string; strength?: number; textStrength?: number; textMagnet?: boolean; duration?: number; ease?: string; releaseEase?: string; releaseDuration?: number; onClick?: (event: MouseEvent<HTMLAnchorElement>) => void }>;
export default MagneticButton;
