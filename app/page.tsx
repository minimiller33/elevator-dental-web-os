import { BrandMark } from "@/components/BrandMark";
import { CaseStudyProof } from "@/components/CaseStudyProof";
import { SearchAnswerSimulator } from "@/components/SearchAnswerSimulator";
import { LeadForm } from "@/components/LeadForm";
import { LiveComparison } from "@/components/LiveComparison";
import { MobileExperience } from "@/components/MobileExperience";
import { DiscoveryEcosystem } from "@/components/DiscoveryEcosystem";
import { FAQSection } from "@/components/FAQSection";
import { NinetyDayEngine } from "@/components/NinetyDayEngine";
import { OfferPricing } from "@/components/OfferPricing";
import { ArrowUpRight, Check, Spark } from "@/components/Icons";

export default function Home() {
  return (
    <main>
      <MobileExperience />
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand-link" href="#top" aria-label="Elevator Dental OS, inicio">
            <BrandMark />
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            <a href="#ventaja">Cómo funciona</a>
            <a href="#resultados">Caso real</a>
            <a href="#incluye">Precio</a>
          </nav>
          <a className="button button--nav" href="#contacto">
            Quiero mi Elevator Web <ArrowUpRight />
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="hero-lift-line" aria-hidden="true"><span /><i /><i /><i /></div>
        <div className="container hero-layout">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot" /> LA WEB DENTAL PARA LA ERA DE LA BÚSQUEDA Y LA IA</div>
            <h1>Tus pacientes ya están buscando. <span>Que tu clínica esté lista para ser la respuesta.</span></h1>
            <p className="hero-lede">
              Elevator Web es una web dental viva: organiza tu información, observa la demanda local y mejora mes a mes sin que tengas que gestionar tecnología.
            </p>
            <div className="hero-open-loop"><Spark /><span><strong>Una fuente clara. Dos formas de buscar.</strong> Mira cómo tu clínica puede acercarse a ser la respuesta.</span></div>
            <div className="hero-actions">
              <a className="button button--primary" href="#contacto">Quiero mi Elevator Web <ArrowUpRight /></a>
            </div>
          </div>
          <SearchAnswerSimulator />
        </div>
      </section>

      <section className="discovery-rail-section section-light" aria-label="Nuevo mapa de búsqueda">
        <div className="container">
          <DiscoveryEcosystem />
        </div>
      </section>

      <CaseStudyProof />

      <LiveComparison />

      <NinetyDayEngine />

      <OfferPricing />

      <FAQSection />

      <section className="contact-section" id="contacto">
        <div className="contact-glow" aria-hidden="true" />
        <div className="container contact-layout">
          <div className="contact-copy" data-reveal>
            <span className="kicker">07 · SECUENCIA DE ACTIVACIÓN</span>
            <h2>Cuatro datos. <span>Una clínica más cerca de salir de lo estático.</span></h2>
            <p>Cuéntanos quién eres, dónde está tu clínica y cómo contactarte. Confirmaremos si existe encaje antes de activar tu Elevator Web.</p>
            <div className="contact-route" aria-hidden="true">
              <span className="is-active"><i>01</i><b>TÚ</b></span>
              <span><i>02</i><b>CLÍNICA</b></span>
              <span><i>03</i><b>MERCADO</b></span>
              <span><i>04</i><b>CONTACTO</b></span>
            </div>
            <div className="contact-trust"><span><Check /> Sin compromiso</span><span><Check /> Respuesta de encaje</span></div>
          </div>
          <LeadForm />
        </div>
      </section>

      <footer>
        <div className="container footer-main"><BrandMark /><p>La web que le da ventaja a tu clínica<br />en la era de la IA.</p><div><a href="#ventaja">Cómo funciona</a><a href="#resultados">Caso real</a><a href="#incluye">Precio</a></div></div>
        <div className="container footer-bottom"><span>© 2026 Elevator Dental OS</span><span>Elevator Web · Un activo en crecimiento.</span></div>
      </footer>
    </main>
  );
}
