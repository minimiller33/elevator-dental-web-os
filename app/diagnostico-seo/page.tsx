import type { Metadata } from "next";
import { DiagnosisForm } from "./DiagnosisForm";

export const metadata: Metadata = {
  title: { absolute: "Diagnóstico SEO dental y claridad para IA gratis | Elevator Dental" },
  description: "Revisa la carga móvil, el SEO básico y las señales de claridad para buscadores e IA de una página de tu clínica. Evidencia y prioridades por email.",
  alternates: { canonical: "https://elevatordental.com/diagnostico-seo" },
};

export default function DiagnosisPage() { return <DiagnosisForm />; }
