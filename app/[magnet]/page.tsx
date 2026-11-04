import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { leadMagnets } from "@/lib/lead-magnets";
import { OptinForm } from "@/components/optins/OptinForm";
import styles from "@/components/optins/optin.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return leadMagnets.map(m => ({ magnet: m.slug.slice(1) })); }
type Props = { params: Promise<{ magnet: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { magnet } = await params;
  const m = leadMagnets.find(item => item.slug === `/${magnet}`);
  if (!m) return {};
  return { title: `${m.name} · Recurso gratis`, description: m.sub, alternates: { canonical: `https://elevatordental.com${m.slug}` }, openGraph: { title: m.h, description: m.sub, images: [`https://elevatordental.com${m.image}`] } };
}
export default async function MagnetPage({ params }: Props) {
  const { magnet } = await params;
  const m = leadMagnets.find(item => item.slug === `/${magnet}`);
  if (!m) notFound();
  return <main className={styles.page}>
    <div className={styles.hero}>
      <section className={styles.intro}><p className={styles.eyebrow}>{m.eyebrow}</p><h1>{m.h}</h1><p className={styles.sub}>{m.sub}</p><figure className={styles.cover}><img src={m.image} alt={`Vista del recurso ${m.name}`} width="1600" height="1200" fetchPriority="high" /><figcaption>{m.format}</figcaption></figure></section>
      <section id="formulario" className={styles.formPanel} aria-label="Solicitar recurso gratuito"><OptinForm magnet={m} /></section>
    </div>
    <section className={styles.details}><div><h2>¿Es para ti?</h2><ul>{m.para.map(item => <li key={item}>{item}</li>)}</ul></div><div><h2>Lo que podrás hacer</h2><ul className={styles.benefits}>{m.ayuda.map(item => <li key={item}><Check size={19} aria-hidden="true" /><span>{item}</span></li>)}</ul></div></section>
    <section className={styles.steps}><h2>De aquí a tu clínica.</h2><ol><li><span>01</span><p>Escribe tu nombre, correo y elige si tienes consultorio o clínica.</p></li><li><span>02</span><p>Completa el formulario y abre el recurso al momento desde esta página.</p></li><li><span>03</span><p>{m.kw === "CAJA" ? 'Toca «Hacer una copia» y la hoja queda en tu Drive.' : 'Ábrelo en tu celular o computadora y empieza por lo que más necesitas.'}</p></li></ol><a className={styles.textLink} href="#formulario">{m.cta} <ArrowUpRight size={18} /></a></section>
    <footer className={styles.footer}><span>Elevator Dental Web</span><Link href="/privacidad">Privacidad y uso de datos</Link></footer>
  </main>;
}
