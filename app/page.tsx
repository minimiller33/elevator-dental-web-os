import { DentalLanding } from "@/components/DentalLanding";
import type { Metadata } from "next";
import { brandVideo } from "@/lib/brand-video";

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
      sameAs: ["https://www.youtube.com/@ElevatorDental"],
    },
    {
      "@type": "VideoObject",
      "@id": "https://elevatordental.com/#presentacion-elevator",
      name: brandVideo.title,
      description: brandVideo.description,
      thumbnailUrl: [brandVideo.thumbnailUrl],
      uploadDate: brandVideo.uploadDate,
      duration: brandVideo.duration,
      embedUrl: brandVideo.embedUrl,
      contentUrl: brandVideo.contentUrl,
      inLanguage: "es-MX",
      publisher: { "@id": "https://elevatordental.com/#organization" },
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
