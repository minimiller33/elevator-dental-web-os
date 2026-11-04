import type { ReactNode } from "react";
import DockFooter from "@/components/annnimate/DockFooter";

export default function InternalPageShell({ children }: { children: ReactNode }) {
  return <div className="ed-internal">
    {children}
    <DockFooter internal />
  </div>;
}
