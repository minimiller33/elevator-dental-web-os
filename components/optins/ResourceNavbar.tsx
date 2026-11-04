"use client";
import FloatingNavbar from "@/components/annnimate/FloatingNavbar";
import { usePathname } from "next/navigation";
import { services } from "@/lib/services";
import "./resource-navbar.css";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Recursos", href: "/recursos" },
  { label: "Servicios", href: "/#servicios", children: services.map(service => ({ label: service.label, href: `/servicios/${service.slug}` })) },
  { label: "Contacto", href: "/#contacto" },
];

export function ResourceNavbar() {
  const pathname = usePathname();
  return <>
    <FloatingNavbar key={pathname} className="edw-resource-navbar" wordmark="Elevator Dental Web" mark="E" logoSrc="/brand/elevator-logo.png" logoHref="/" links={links} ctaLabel="Diagnóstico gratis" ctaHref="/diagnostico-seo" />
    <div className="edw-resource-navbar-space" aria-hidden="true" />
  </>;
}
