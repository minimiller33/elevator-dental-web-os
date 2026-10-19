import Link from "next/link";
import InternalPageShell from "@/components/InternalPageShell";
export default function NotFound() {
  return <InternalPageShell><main className="ed-not-found"><p>404 · Elevator Dental</p><h1>Este enlace necesita un nuevo rumbo.</h1><p>Vuelve al inicio para encontrar lo que buscas.</p><Link href="/">Volver al inicio ↗</Link></main></InternalPageShell>;
}
