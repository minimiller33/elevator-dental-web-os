import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import InternalPageShell from '@/components/InternalPageShell';
import JigglyButton from '@/components/annnimate/JigglyButton';
import { services } from '@/lib/services';
import { serviceGuides } from '@/lib/service-guides';
import './services.css';

export const dynamicParams = false;
export function generateStaticParams() { return services.map(({ slug }) => ({ servicio: slug })); }
const find = (slug: string) => services.find(item => item.slug === slug);
type Props = { params: Promise<{ servicio: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = find((await params).servicio);
  if (!service) return {};
  const url = `https://elevatordental.com/servicios/${service.slug}`;
  return { title: { absolute: `${service.title} | Elevator Dental` }, description: service.description, alternates: { canonical: url }, openGraph: { title: service.title, description: service.description, url, type: 'website', siteName: 'Elevator Dental', locale: 'es_MX' } };
}
export default async function ServicePage({ params }: Props) {
  const service = find((await params).servicio);
  if (!service) notFound();
  const guide = serviceGuides[service.slug];
  const others = services.filter(item => item.slug !== service.slug);
  const json = { '@context': 'https://schema.org', '@type': 'Service', name: service.title, description: service.description, url: `https://elevatordental.com/servicios/${service.slug}`, provider: { '@type': 'Organization', name: 'Elevator Dental', url: 'https://elevatordental.com/' }, areaServed: ['México', 'Colombia', 'Costa Rica', 'Estados Unidos'].map(name => ({ '@type': 'Country', name })) };
  return <InternalPageShell><main className="svc">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, '\\u003c') }} />
    <div className="svc__wrap"><nav className="svc__crumb" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span aria-hidden="true"> / </span><Link href="/#servicios">Servicios</Link><span aria-hidden="true"> / </span><span>{service.label}</span></nav>
      <header className="svc__hero"><div><p className="svc__eyebrow">ELEVATOR DENTAL WEB</p><h1>{service.title}</h1><p className="svc__lead">{service.intro}</p><div className="svc__actions"><JigglyButton className="svc__button" href="/#contacto">Solicitar conversación</JigglyButton><Link className="svc__secondary" href="/diagnostico-seo">Diagnóstico gratis ↗</Link></div></div><div className="svc__art" aria-hidden="true"><span>Elevator Dental Web</span><div className="svc__art-line">Tu clínica,<br /><em>en perspectiva.</em></div><div className="svc__art-foot">Una base digital que sigue contigo <span>↗</span></div></div></header>
      <section className="svc__details" aria-labelledby="details-title"><div className="svc__section-head"><p className="svc__eyebrow">CÓMO TE AYUDAMOS</p><h2 id="details-title">Una web que acompaña<br />a tu clínica.</h2></div><div className="svc__rows">{service.sections.map((section, index) => <article key={section.title}><span className="svc__number">0{index + 1}</span><div><h3>{section.title}</h3><p>{section.text}</p></div></article>)}</div></section>
      {guide && <section className="svc__guide" aria-labelledby="guide-title"><div className="svc__guide-intro"><p className="svc__eyebrow">UNA GUÍA PARA TU CLÍNICA</p><h2 id="guide-title">{guide.title}</h2><p>{guide.intro}</p></div><div className="svc__guide-points">{guide.points.map((point, i) => <article key={point.title}><span>0{i + 1}</span><h3>{point.title}</h3><p>{point.text}</p></article>)}</div></section>}
      <section className="svc__faq"><p className="svc__eyebrow">UNA PREGUNTA FRECUENTE</p><h2>{service.question}</h2><p>{service.answer}</p><Link href="/#inversion">Conoce el alcance y las condiciones ↗</Link></section>
      {guide && <section className="svc__questions" aria-labelledby="questions-title"><div><p className="svc__eyebrow">MÁS CLARIDAD</p><h2 id="questions-title">Preguntas frecuentes.</h2></div><div>{guide.faqs.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>}
      <section className="svc__related" aria-labelledby="related-title"><h2 id="related-title">Explora nuestros servicios.</h2><div>{others.map(item => <Link href={`/servicios/${item.slug}`} key={item.slug}><span>{item.label}</span><span aria-hidden="true">↗</span></Link>)}</div></section>
      <section className="svc__cta"><h2>Hablemos de tu clínica.</h2><p>Cuéntanos qué necesitas y revisemos juntos el siguiente paso.</p><JigglyButton className="svc__button" href="/#contacto">Solicitar conversación</JigglyButton></section>
    </div>
  </main></InternalPageShell>;
}
