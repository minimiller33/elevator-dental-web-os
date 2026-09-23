import type { Metadata } from "next";
import { FitScanExperience } from "./FitScanExperience";

export const metadata: Metadata = {
  title: "Elevator Fit Scan — Vista de arquitectura",
  description: "Vista de arquitectura del diagnóstico de encaje para Elevator Web.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FitScanPage() {
  return <FitScanExperience />;
}
