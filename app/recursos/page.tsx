import type { Metadata } from "next";
import Link from "next/link";
import { leadMagnets } from "@/lib/lead-magnets";
import styles from "@/components/optins/optin.module.css";
export const metadata: Metadata = { title: "Recursos gratis para tu clínica dental", description: "Guías, mensajes y una hoja de caja gratis para organizar y mejorar la presencia digital de tu clínica dental.", alternates: { canonical: "https://elevatordental.com/recursos" } };
export default function Resources() {
  return <main className={styles.page}><section className={styles.library}><p className={styles.eyebrow}>Para llevar a tu clínica</p><h1>Un recurso. Un siguiente paso.</h1><p>Herramientas gratuitas para ordenar tu clínica, mejorar tu presencia digital y dar seguimiento a tus pacientes.</p><div className={styles.resourceGrid}>{leadMagnets.map(m => <Link href={m.slug} key={m.kw}><img src={m.image} alt={m.name} width="1600" height="1200" loading="lazy" /><small>{m.format}</small><h2>{m.name} ↗</h2><p>{m.sub}</p></Link>)}</div></section><footer className={styles.footer}><span>Elevator Dental Web</span><Link href="/privacidad">Privacidad y uso de datos</Link></footer></main>;
}
