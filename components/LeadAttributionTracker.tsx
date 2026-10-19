"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackLeadVisit } from "@/lib/lead-attribution";

export function LeadAttributionTracker() {
  const pathname = usePathname();
  useEffect(() => { trackLeadVisit(); }, [pathname]);
  return null;
}
