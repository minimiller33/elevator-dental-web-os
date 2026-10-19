import { DentalLanding } from "@/components/DentalLanding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Diseño web y SEO para dentistas | Elevator Dental" },
  description: "Webs para clínicas dentales con SEO, información clara para buscadores e IA y mejoras continuas. Revisa tu página con el diagnóstico gratuito de Elevator Dental.",
  alternates: { canonical: "https://elevatordental.com/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://elevatordental.com/#organization",
      name: "Elevator Dental",
      url: "https://elevatordental.com/",
    },
    {
      "@type": "Service",
      "@id": "https://elevatordental.com/#service",
      name: "Elevator Dental Web",
      serviceType: "Diseño web, SEO y preparación de contenido para buscadores e IA en clínicas dentales",
      provider: { "@id": "https://elevatordental.com/#organization" },
      areaServed: ["México", "Colombia", "Costa Rica", "Estados Unidos"].map(name => ({ "@type": "Country", name })),
      description: "Construcción y operación de webs dentales con SEO técnico, datos estructurados, contenido de tratamientos revisado con la clínica y rutas de contacto claras.",
      url: "https://elevatordental.com/#sistema",
    },
  ],
};

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <DentalLanding />
  </>;
}
