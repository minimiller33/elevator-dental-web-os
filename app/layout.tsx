import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import "./experience.css";
import "./search-experience.css";

export const metadata: Metadata = {
  title: {
    default: "Elevator Web — La web dental que evoluciona",
    template: "%s | Elevator Dental OS",
  },
  description:
    "Elevator Web es la web dental operada que monitorea oportunidades locales, protege el SEO y mejora mes a mes sin que tu equipo tenga que operar tecnología.",
  keywords: [
    "web para clínicas dentales",
    "SEO dental",
    "infraestructura web dental",
    "Elevator Web",
    "Elevator Dental OS",
    "página web dental",
  ],
  openGraph: {
    title: "Tus pacientes ya están buscando. Que tu clínica esté lista para ser la respuesta.",
    description:
      "La web dental operada que monitorea continuamente y mejora mes a mes, powered by Elevator Dental OS.",
    type: "website",
    locale: "es_ES",
    siteName: "Elevator Dental OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevator Web",
    description: "La web que le da ventaja a tu clínica dental en la era de la IA.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05070B",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
