import type { ReactNode } from "react";
import DockFooter from "@/components/annnimate/DockFooter";
import SimpleMenu from "@/components/annnimate/SimpleMenu";

export default function InternalPageShell({ children }: { children: ReactNode }) {
  return <div className="ed-internal">
    <SimpleMenu internal />
    {children}
    <DockFooter internal />
  </div>;
}
