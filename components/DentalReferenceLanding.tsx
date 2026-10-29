import JigglyButton from "@/components/annnimate/JigglyButton";
import Image from "next/image";
import { ArrowUpRight, Search, Wrench, ListChecks, Plus } from "lucide-react";
import MorphingTooltip from "@/components/annnimate/MorphingTooltip";
import DockFooter from "@/components/annnimate/DockFooter";
import EchoHeadline from "@/components/annnimate/EchoHeadline";
import SimpleMenu from "@/components/annnimate/SimpleMenu";
import { LeadForm } from "@/components/LeadForm";
import { DentalQuestionsSection } from "@/components/DentalArcSections";
import { ElevatorStoryWidget } from "@/components/ElevatorStoryWidget";
import "@/app/dental-reference.css";
import "@/app/landing-clarity.css";
import "@/app/contact-spotlight.css";
import "@/app/landing-cro-v2.css";
import "@/app/landing-video.css";
import { brandVideo } from "@/lib/brand-video";

const platforms = [
  { name: "Google", logo: "/logos/platforms/google.svg" }, { name: "ChatGPT", logo: "/logos/platforms/chatgpt.svg" },
  { name: "Gemini", logo: "/logos/platforms/gemini.svg" }, { name: "Claude", logo: "/logos/platforms/claude.svg" },
  { name: "Bing", logo: "/logos/platforms/bing.svg" }, { name: "Perplexity", logo: "/logos/platforms/perplexity.svg" },
];
const scope = [
  ["Objetivo", "Construir y publicar la base de tu presencia digital.", "Elevator mantiene la web y trabaja mejoras de forma continua, sin que la clínica coordine cada ajuste."],
  ["Páginas y contenido", "Hasta 7 páginas para una marca, ubicación e idioma; arquitectura de servicios y textos revisados contigo.", "Elevator revisa y mejora estructura y contenido según las prioridades que detecta. La clínica valida la información clínica sensible cuando corresponde."],
  ["SEO y datos estructurados", "Configuración técnica inicial e información del negocio coherente.", "Revisión y ajustes según los hallazgos de cada ciclo."],
  ["Analítica y demanda local", "Configuración de medición al publicar.", "Monitoreo de demanda local y revisión de señales orgánicas."],
  ["Hosting y mantenimiento", "Dental Web construye la base; Membership se ocupa de su operación.", "Hosting y mantenimiento técnico durante la membresía activa."],
  ["Solicitudes de la clínica", "Alcance inicial definido antes de comenzar.", "3 créditos mensuales para solicitudes; revisamos el alcance de cada una antes de realizarla."],
  ["Para quién encaja", "Clínicas que necesitan una web nueva o reorganizar la actual.", "Clínicas que quieren delegar el mantenimiento y sostener mejoras."],
];

export function ClinicPreview({ compact = false }: { compact?: boolean }) {
  return <div className={`er-clinic-preview ${compact ? "er-clinic-preview--compact" : ""}`} role="img" aria-label="Vista ilustrativa de una web dental">
    <div className="er-clinic-preview__nav"><strong>Tu clínica dental</strong><div><span>Tratamientos</span><span>Equipo</span><span>Ubicación</span></div><span className="er-clinic-preview__nav-cta">Contacto</span></div>
    <div className="er-clinic-preview__body"><div><span className="er-clinic-preview__eyebrow">Odontología · Tu ciudad</span><h3>Tu salud dental,<br />en buenas manos.</h3><p>Conoce nuestros tratamientos y da el primer paso con información clara.</p><span className="er-clinic-preview__cta">Conoce tus opciones <ArrowUpRight size={12} /></span></div><Image src="/visual/dental-calm.webp" alt="Consulta dental luminosa" width={500} height={450} unoptimized /></div>
    <div className="er-clinic-preview__foot"><span>Tratamientos</span><span>Equipo profesional</span><span>Cómo llegar</span></div>
  </div>;
}

export function CarePreview() {
  return <div className="er-care-preview">
    <div className="er-care-preview__head"><span>Elevator Membership</span><span>Tu web, en operación</span></div>
    <div className="er-care-preview__title">Cada mejora se suma.<br /><span>Elevator se encarga.</span></div>
    <div className="er-care-preview__items" role="img" aria-label="Ilustración de una web clara a la que se suman contenido útil y mejoras posteriores">{[{ icon: ListChecks, label: "Web clara", detail: "La base de tu clínica" }, { icon: Search, label: "Contenido útil", detail: "Lo que las personas buscan" }, { icon: Wrench, label: "Siguiente mejora", detail: "Elevator sigue trabajando" }].map(({ icon: Icon, label, detail }, index) => <div key={label}><span><Icon size={15} /></span><div><strong>{label}</strong><small>{detail}</small></div>{index < 2 && <Plus size={14} aria-hidden="true" />}</div>)}</div>
    <div className="er-care-preview__foot"><span>Hosting y mantenimiento</span><span>3 créditos / mes</span></div>
  </div>;
}

function IllustrativeSearchResult() {
  return <div className="er-search-example"><div className="er-search-example__copy"><span className="er-label">Una forma de imaginarlo</span><h3>Así podría verse tu web en una búsqueda.</h3><p>Elevator organiza tratamientos, equipo y contacto en páginas fáciles de recorrer y preparadas para buscadores.</p></div><figure className="er-search-example__figure"><figcaption>Vista ilustrativa · Resultado de ejemplo</figcaption><div className="er-search-example__surface"><div className="er-search-example__query"><Search size={16} aria-hidden="true" /><span>dentista en mi ciudad</span></div><div className="er-search-example__result"><span className="er-search-example__place">Vista previa</span><div><small>tuclinica.example · Página de tratamientos</small><strong>Tu clínica dental | Tratamientos y equipo</strong><p>Conoce los tratamientos, al equipo y cómo contactar con la clínica.</p></div></div></div></figure></div>;
}

function ConceptualProgress() {
  return <section className="er-progress" id="continuidad" aria-labelledby="er-progress-title">
    <header className="er-progress__heading"><p className="er-label">Después de publicar</p><h3 id="er-progress-title">Una web que se sigue trabajando.</h3></header>
    <figure className="er-progress__panel">
      <figcaption><span>Esquema ilustrativo · Sin datos de resultados</span></figcaption>
      <div className="er-progress__chart" role="img" aria-label="Esquema conceptual: antes de Elevator hay una web de partida; en un punto de inicio ilustrativo se construye Dental Web y después Membership mantiene la web y trabaja mejoras sucesivas. La línea simboliza continuidad del trabajo, sin escala de resultados.">
        <div className="er-progress__phase er-progress__phase--before">Sin Elevator<br /><small>Web de partida</small></div>
        <div className="er-progress__phase er-progress__phase--after">Con Elevator<br /><small>Trabajo continuo</small></div>
        <svg viewBox="0 0 1000 250" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs><linearGradient id="er-progress-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0071e3" stopOpacity=".24" /><stop offset="100%" stopColor="#0071e3" stopOpacity="0" /></linearGradient></defs>
          <path className="er-progress__baseline" d="M 28 190 C 100 188, 125 199, 180 192 S 265 190, 350 190" />
          <path className="er-progress__area" d="M 350 190 C 410 190, 435 166, 495 169 S 585 158, 645 145 S 705 152, 760 126 S 850 135, 972 101 L 972 250 L 350 250 Z" />
          <path className="er-progress__line" d="M 350 190 C 410 190, 435 166, 495 169 S 585 158, 645 145 S 705 152, 760 126 S 850 135, 972 101" />
          <circle cx="350" cy="190" r="8" fill="#0071e3" stroke="#fff" strokeWidth="5" />
        </svg>
        <div className="er-progress__marker"><span>Inicio con Elevator</span></div>
      </div>
      <p className="er-progress__caveat">La línea ilustra trabajo sucesivo en la web. No representa fechas, visitas, pacientes ni resultados medidos.</p>
    </figure>
  </section>;
}

export function DentalReferenceLanding() {
  return <main className="edw-site edw-ref" id="inicio">
    <SimpleMenu />
    <section className="er-hero" aria-labelledby="er-title"><div className="er-hero__heading"><h1 id="er-title">Que te encuentren.<br /><span>Mientras tú atiendes.</span></h1></div><p>Construimos y cuidamos webs para <strong>clínicas dentales</strong>. Mostramos tus tratamientos, equipo, ubicación y contacto con claridad, y, con Membership, Elevator se encarga de seguir mejorándola.</p><div className="er-hero__actions"><JigglyButton className="er-button er-button--primary" href="#contacto">Solicitar conversación</JigglyButton><JigglyButton className="er-button er-button--white" href="/diagnostico-seo">Diagnóstico gratis</JigglyButton></div></section>
    <section className="er-vsl" aria-label="Video de presentación de Elevator Dental Web">
      <iframe
        src={`${brandVideo.embedUrl}?playsinline=1&rel=0`}
        title={brandVideo.title}
        width={1920}
        height={1080}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      <a className="er-vsl__link" href={brandVideo.watchUrl} target="_blank" rel="noopener noreferrer">Ver en YouTube <ArrowUpRight size={13} aria-hidden="true" /></a>
    </section>
    <div className="er-showcase-wrap"><ElevatorStoryWidget /></div>

    <section className="er-foundation er-frame" id="sistema" aria-labelledby="er-foundation-title"><div className="er-foundation__heading"><p className="er-label">El sistema Elevator</p><h2 id="er-foundation-title">Dos servicios.<br /><span>Una misma base digital.</span></h2><p>Primero construimos una web que explique bien tu clínica. Después, Elevator se ocupa de mantenerla y trabajar sus siguientes mejoras.</p></div><div className="er-foundation__cards"><article className="er-foundation__card" id="web"><div className="er-foundation__card-copy"><span className="er-foundation__number">01 / Crear</span><h3>Elevator Dental Web</h3><p className="er-foundation__benefit">Una web clara para presentar tu clínica.</p><p className="er-foundation__detail">Organizamos tratamientos, equipo, ubicación y contacto; además, preparamos esa información para que buscadores y asistentes puedan entenderla.</p><a href="#inversion">Ver alcance de Dental Web <ArrowUpRight size={16} /></a></div><div className="er-foundation__preview"><span className="er-foundation__preview-label">Ejemplo visual de Dental Web</span><ClinicPreview compact /></div></article><article className="er-foundation__card" id="membership"><div className="er-foundation__card-copy"><span className="er-foundation__number">02 / Cuidar y mejorar</span><h3>Elevator Membership</h3><p className="er-foundation__benefit">Tu web sigue avanzando sin que coordines cada ajuste.</p><p className="er-foundation__detail">Elevator se ocupa del hosting, el mantenimiento y las mejoras continuas. Tú revisas la información clínica cuando corresponde.</p><a href="#inversion">Ver alcance de Membership <ArrowUpRight size={16} /></a></div><div className="er-foundation__preview er-foundation__preview--care"><span className="er-foundation__preview-label">Ejemplo visual de Membership</span><CarePreview /></div></article></div><ConceptualProgress /></section>

    <section className="er-platforms er-frame" aria-labelledby="er-platforms-title"><header><h2 id="er-platforms-title">Información para pacientes,<br />buscadores y asistentes de IA.</h2><a href="#claridad">Una misma información <ArrowUpRight size={15} /></a></header><IllustrativeSearchResult /><div className="er-platforms__context">Logos de referencia de plataformas externas a Elevator.</div><div className="er-platforms__grid">{platforms.map(({ name, logo }) => <div key={name}><Image src={logo} alt="" width={30} height={30} /><span>{name}</span></div>)}</div></section>

    <section className="er-diagnosis er-frame" id="diagnostico" aria-labelledby="er-diagnosis-title"><div className="er-diagnosis__content"><div><p className="er-label">Diagnóstico gratuito</p><h2 id="er-diagnosis-title">Antes de cambiar tu web,<br />entiende cómo está.</h2></div><div className="er-diagnosis__details"><p>Revisamos la página que elijas y te enviamos por email evidencia de experiencia móvil, estructura y contenido, con hasta tres prioridades claras.</p><p className="er-diagnosis__note">Gratis, sin tarjeta ni cuenta. Es una revisión de una página; no mide posiciones, visitas ni respuestas de asistentes.</p><JigglyButton className="er-button er-button--primary" href="/diagnostico-seo">Solicitar diagnóstico gratis</JigglyButton></div></div></section>

    <EchoHeadline />

    <section className="er-scope er-frame" id="inversion" aria-labelledby="er-scope-title"><div className="er-row-heading"><h2 id="er-scope-title">La base y la operación.<br />Compara el alcance.</h2><JigglyButton className="er-button er-button--primary er-button--small" href="#contacto">Solicitar conversación</JigglyButton></div><p>La web inicial y la membresía se complementan. Definimos contigo la inversión, el alcance y las condiciones antes de comenzar.</p><div className="er-scope__essentials"><span>Construcción inicial + operación mensual</span><span>Licencia ligada a Membership</span><span>3 créditos de solicitudes al mes</span></div><details className="er-detail"><summary>Ver la comparación completa <span>+</span></summary><div className="er-scope__table" role="region" aria-label="Comparación de Elevator Dental Web y Membership" tabIndex={0}><table><caption>Qué corresponde a la construcción inicial y qué incluye la operación mensual</caption><thead><tr><th>Qué necesitas</th><th>Elevator Dental Web<small>Construcción inicial</small></th><th>Elevator Membership<small>Operación mensual</small></th></tr></thead><tbody>{scope.map(([label, web, membership]) => <tr key={label}><th scope="row">{label}</th><td>{web}</td><td>{membership}</td></tr>)}</tbody></table></div></details><div className="er-scope__terms"><p><strong>Alcance común:</strong> una marca, una ubicación y un idioma. La licencia de uso funciona mientras Membership está activa; el código no se transfiere y las solicitudes siguen el alcance acordado.</p><p>Campañas, redes sociales y CRM quedan fuera del servicio. Los tiempos de publicación y el uso de créditos se acuerdan según el proyecto y los materiales disponibles. Elevator prepara la web para buscadores y asistentes; las posiciones, sus respuestas y la llegada de pacientes dependen de factores externos.</p></div></section>
    <div className="er-faq er-frame" id="preguntas"><details className="er-faq-disclosure"><summary>Preguntas antes de dar el siguiente paso <span>+</span></summary><DentalQuestionsSection /></details></div>
    <section className="er-contact er-contact--spotlight er-frame" id="contacto" aria-labelledby="er-contact-title"><div className="er-contact__intro" id="claridad"><p className="er-label">Elevator Dental Web</p><h2 id="er-contact-title">Más control sobre<br />cómo te encuentran.</h2><p className="er-contact__trust">Presentamos a tu equipo, mantenemos coherentes los datos de tu clínica y tú validas las afirmaciones clínicas antes de publicarlas.</p><span>Para clínicas de México, Colombia, Costa Rica y Estados Unidos, con atención en español.</span><div className="er-contact__visual" aria-hidden="true"><ArrowUpRight size={72} strokeWidth={1.15} /></div></div><div className="er-contact__form edw-form"><LeadForm /></div></section>
    <DockFooter />
    <MorphingTooltip />
  </main>;
}
