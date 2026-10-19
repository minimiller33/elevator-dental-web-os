import { Inter } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import { LeadAttributionTracker } from "@/components/LeadAttributionTracker";
import { GeistSans } from "geist/font/sans";
import "@/components/arc/foundation.css";
import "./globals.css";
import "./dental-landing.css";
import "./internal-pages.css";

const waldenburg = localFont({ src: "../public/fonts/waldenburg-light.woff2", weight: "300", display: "swap", variable: "--font-waldenburg" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
const geistMono = localFont({ src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2", variable: "--font-geist-mono", display: "swap", preload: false });

export const metadata: Metadata = {
  title: {
    default: "Elevator Dental Web — Visibilidad orgánica para odontología",
    template: "%s | Elevator Dental OS",
  },
  description:
    "Webs para clínicas dentales con SEO local y preparación para IA. Elevator Dental mejora tu presencia digital con mantenimiento y optimización continua.",
  keywords: [
    "web para clínicas dentales",
    "SEO dental",
    "infraestructura web dental",
    "Elevator Web",
    "Elevator Dental OS",
    "página web dental",
  ],
  openGraph: {
    title: "Elevator Dental Web — Una web que sigue trabajando por tu clínica",
    description:
      "Visibilidad orgánica para clínicas y profesionales de la odontología, con una web que se opera y mejora continuamente.",
    type: "website",
    locale: "es_ES",
    siteName: "Elevator Dental OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevator Dental Web",
    description: "Una web dental viva para atraer tráfico orgánico mejor calificado y reducir la dependencia de anuncios y contenido constante.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdfcfc",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${geistMono.variable} ${inter.variable} ${waldenburg.variable}`}>
      <body><Suspense fallback={null}><LeadAttributionTracker /></Suspense>{children}</body>
    </html>
  );
}
