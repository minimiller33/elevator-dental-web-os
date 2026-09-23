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

const valueStack = [
  { label: "Desarrollo + diseño mobile-first", value: 2200 },
  { label: "Arquitectura SEO", value: 2000 },
  { label: "Preparación para búsquedas con IA", value: 2000 },
  { label: "Copy + analítica y tracking", value: 1500 },
] as const;

const activationPrice = 1497;
const membershipPrice = 697;
const separateValue = valueStack.reduce((total, item) => total + item.value, 0);
const estimatedSavings = separateValue - activationPrice;
const savingsPercentage = Math.round((estimatedSavings / separateValue) * 100);
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function OfferPricing() {
  return (
    <section className="offer-section offer-system" id="incluye">
      <div className="container">
        <div className="center-heading offer-system__heading" data-reveal>
          <span className="kicker kicker--blue">05 · DOS PISOS. UN SISTEMA.</span>
          <h2>
            No compras otra web.
            <br />
            Enciendes un activo que sigue vivo.
          </h2>
          <p>
            La activación construye tu Elevator Web. La Membership mantiene
            encendido el sistema que la protege, mide y mejora.
          </p>
        </div>

        <div className="offer-system__journey">
          <article className="offer-old-way" data-reveal>
            <header className="offer-old-way__head">
              <span>EL MÉTODO FRAGMENTADO</span>
              <i aria-hidden="true">ANTES</i>
            </header>

            <div className="offer-old-way__copy">
              <h3>Cuatro proveedores. Cuatro entregas. Ningún motor.</h3>
              <p>
                Coordinas cada especialidad por separado y, al final, recibes
                una web que deja de avanzar cuando se publica.
              </p>
            </div>

            <div
              className="offer-old-way__pieces"
              aria-label="Valor estimado de los servicios contratados por separado"
            >
              {valueStack.map((item, index) => (
                <div className="offer-old-way__piece" key={item.label}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <p>{item.label}</p>
                  <del>{usd.format(item.value)}</del>
                </div>
              ))}
            </div>

            <footer className="offer-old-way__total">
              <span>VALOR ESTIMADO POR SEPARADO</span>
              <del>{usd.format(separateValue)}</del>
            </footer>
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
                <div className="offer-floor__price">
                  <strong>{usd.format(activationPrice)}</strong>
                  <span>USD · una sola vez</span>
                </div>
              </header>

              <p className="offer-floor__result">
                Una web dental completa, mobile-first y preparada para empezar
                a crecer desde que se publica.
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
                <div className="offer-floor__price">
                  <strong>{usd.format(membershipPrice)}</strong>
                  <span>USD/mes · al publicarse</span>
                </div>
              </header>

              <p className="offer-floor__result">
                La operación mensual que mantiene tu activo saludable, medible
                y evolucionando.
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
          <div className="offer-decision__price">
            <span>ACTIVA TU ELEVATOR WEB</span>
            <strong>
              {usd.format(activationPrice)} <small>USD</small>
            </strong>
            <p>
              + {usd.format(membershipPrice)} USD/mes cuando entra en operación
            </p>
          </div>

          <div className="offer-decision__saving">
            <span>AHORRO INICIAL ESTIMADO</span>
            <strong>{usd.format(estimatedSavings)}</strong>
            <p>aprox. {savingsPercentage}% frente al valor por separado</p>
          </div>

          <a className="button button--primary" href="#contacto">
            Quiero mi Elevator Web <ArrowUpRight />
          </a>
        </div>

        <p className="offer-system__value-note">
          El ahorro compara únicamente la activación estimada; no incluye la
          Membership. Estos valores no representan un precio anterior de
          Elevator y pueden variar según proveedor.
        </p>

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
