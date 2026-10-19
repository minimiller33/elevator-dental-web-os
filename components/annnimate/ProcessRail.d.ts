import type { ComponentType } from "react";
export type ProcessStep = { num?: string; title: string; text: string; image?: string; alt?: string };
declare const ProcessRail: ComponentType<{ className?: string; steps: ProcessStep[]; sticky?: boolean; scrub?: number; beadSize?: number; stagger?: number; disable?: string }>;
export default ProcessRail;
