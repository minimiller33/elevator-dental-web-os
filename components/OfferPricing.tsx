import { BrandMark } from "./BrandMark";
import { ArrowUpRight, Check } from "./Icons";

const activationIncludes = [
  "Onboarding guiado: entregas la información una sola vez",
  "Web mobile-first de hasta 7 páginas",
  "Copy de conversión y arquitectura de servicios",
  "SEO técnico, datos estructurados y preparación para búsquedas con IA",
  "Analítica, dominio, control de calidad y publicación",
];

const membershipIncludes = [
  "Hosting, mantenimiento y monitoreo técnico",
  "Monitoreo y priorización de oportunidades locales",
  "Ciclo mensual de mejoras proactivas",
  "Aprobación previa de cambios sensibles para SEO",
  "Dashboard sencillo y 3 créditos mensuales",
];

export function OfferPricing() {
  return (
    <section className="offer-section offer-system" id="incluye">
      <div className="container">
        <div className="center-heading offer-system__heading" data-reveal>
          <span className="kicker kicker--blue">05 · DOS PISOS. UN SISTEMA.</span>
          <h2>
            No necesitas otra web estática.
            <br />
            Enciendes un activo que sigue vivo.
          </h2>
          <p>
            Construimos la presencia digital de tu clínica y la mantenemos activa con seguimiento, prioridades y mejoras continuas.
          </p>
        </div>

        <div className="offer-system__journey">
          <article className="offer-old-way" data-reveal>
            <header className="offer-old-way__head">
              <span>EL MÉTODO FRAGMENTADO</span>
              <i aria-hidden="true">ANTES</i>
            </header>

            <div className="offer-old-way__copy">
              <h3>Más publicaciones y campañas. La misma dependencia.</h3>
              <p>
                Si todo depende de anuncios, redes o referidos, cada mes empieza de cero. Tu web puede ser un canal orgánico que acumula mejoras con el tiempo.
              </p>
            </div>

            <div className="offer-old-way__pieces">
              {activationIncludes.slice(1, 5).map((item, index) => (
                <div className="offer-old-way__piece" key={item}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="offer-system__switch" aria-hidden="true">
            <span>CAMBIA EL SISTEMA</span>
            <i>
              <ArrowUpRight />
            </i>
          </div>

          <article className="offer-building" data-reveal data-loop>
            <div className="offer-building__roof">
              <BrandMark compact />
              <span>
                <i aria-hidden="true" /> SISTEMA ENCENDIDO
              </span>
            </div>

            <div className="offer-building__shaft" aria-hidden="true">
              <i />
              <span />
              <span />
              <span />
            </div>

            <section className="offer-floor offer-floor--asset">
              <header className="offer-floor__head">
                <div>
                  <span>PISO 02 · EL ACTIVO</span>
                  <h3>Elevator Web</h3>
                </div>
                <div className="offer-floor__price"><strong>Alcance inicial</strong><span>Lo definimos en llamada</span></div>
              </header>

              <p className="offer-floor__result">
                Una web dental estratégica, mobile-first y preparada para explicar tus tratamientos y fortalecer tu visibilidad orgánica.
              </p>

              <ul className="offer-floor__includes">
                {activationIncludes.map((item) => (
                  <li key={item}>
                    <Check /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="offer-floor offer-floor--engine">
              <header className="offer-floor__head">
                <div>
                  <span>PISO 01 · EL MOTOR</span>
                  <h3>Elevator Dental Membership</h3>
                </div>
                <div className="offer-floor__price"><strong>Operación continua</strong><span>Conversamos el plan en llamada</span></div>
              </header>

              <p className="offer-floor__result">
                Operación mensual para monitorear oportunidades y mejorar tu presencia en buscadores y respuestas de IA.
              </p>

              <ul className="offer-floor__includes">
                {membershipIncludes.map((item) => (
                  <li key={item}>
                    <Check /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="offer-building__live">
              <span className="offer-building__pulse" aria-hidden="true">
                <i />
              </span>
              <div>
                <span>LO QUE RECIBES</span>
                <strong>Una Elevator Web viva.</strong>
              </div>
              <p>Publicada → medida → priorizada → mejorada → repetida</p>
            </div>
          </article>
        </div>

        <div className="offer-decision" data-reveal>
          <div className="offer-decision__price"><span>ALCANCE E INVERSIÓN</span><strong>Lo conversamos en llamada</strong><p>Revisaremos las necesidades de tu clínica y el plan adecuado para empezar.</p></div>

          <a className="button button--primary" href="#contacto">
            Quiero mi web dental viva <ArrowUpRight />
          </a>
        </div>

        <div className="offer-boundary" data-reveal>
          <strong>Modelo simple y escalable:</strong>
          <p>
            Incluye una marca, una ubicación y un idioma. Elevator Web opera
            bajo licencia mientras la Membership está activa. No incluye código
            transferible, desarrollo a medida, cambios ilimitados, campañas,
            medios, redes sociales, CRM ni garantías de posiciones, pacientes o
            recomendaciones de IA.
          </p>
        </div>
      </div>
    </section>
  );
}
