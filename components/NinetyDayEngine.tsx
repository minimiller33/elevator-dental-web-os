import { BrandMark } from "@/components/BrandMark";
import { ArrowUpRight, Chart, Search, Shield, Spark } from "@/components/Icons";

const phases = [
  {
    days: "DÍAS 1–30",
    title: "La web empieza a escuchar",
    text: "Medimos la base, ordenamos las señales técnicas y detectamos oportunidades reales de tu zona.",
    result: "CLARIDAD",
    Icon: Search,
  },
  {
    days: "DÍAS 31–60",
    title: "Las señales activan mejoras",
    text: "Elevator prioriza y ejecuta el primer ciclo. Tu clínica solo aprueba lo sensible para SEO.",
    result: "RELEVANCIA",
    Icon: Spark,
  },
  {
    days: "DÍAS 61–90",
    title: "El efecto se acumula",
    text: "Publicamos, comparamos y usamos lo aprendido para abrir nuevas rutas de descubrimiento.",
    result: "COBERTURA",
    Icon: Chart,
  },
];

export function NinetyDayEngine() {
  return (
    <section className="activation-section activation-section--alive" id="activacion">
      <div className="activation-orb activation-orb--one" aria-hidden="true" />
      <div className="activation-orb activation-orb--two" aria-hidden="true" />

      <div className="container">
        <header className="activation-heading" data-reveal>
          <span className="kicker kicker--blue">04 · OPERACIÓN CONTINUA · ELEVATOR WEB ENCENDIDA</span>
          <h2 id="growth-engine-title">Cada mes. <span>Una nueva oportunidad para mejorar.</span></h2>
          <p>
            En lugar de publicar y esperar, observamos cómo responden los buscadores y usamos esas señales para decidir qué mejorar en tu presencia digital.
          </p>
        </header>

        <figure className="growth-engine" data-reveal data-loop aria-labelledby="growth-engine-title">
          <div className="growth-engine__grid" aria-hidden="true" />

          <div className="growth-engine__status">
            <span><i aria-hidden="true" /> OPERACIÓN CONTINUA</span>
            <strong>Tu web sigue trabajando</strong>
            <small>SEÑAL → DECISIÓN → MEJORA</small>
          </div>

          <div className="growth-engine__loop">
            <svg className="growth-engine__rails" viewBox="0 0 1000 320" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="engine-flow-in" x1="0" y1="0" x2="1" y2="0">
                  <stop stopColor="#18bafb" stopOpacity=".08" />
                  <stop offset="1" stopColor="#18bafb" stopOpacity=".9" />
                </linearGradient>
                <linearGradient id="engine-flow-out" x1="0" y1="0" x2="1" y2="0">
                  <stop stopColor="#42e8a1" stopOpacity=".9" />
                  <stop offset="1" stopColor="#42e8a1" stopOpacity=".08" />
                </linearGradient>
              </defs>
              <path className="engine-rail engine-rail--in" d="M66 160C190 160 274 160 405 160" />
              <path className="engine-rail engine-rail--out" d="M595 160C726 160 810 160 934 160" />
              <path className="engine-rail engine-rail--return" d="M900 210C840 294 658 299 500 299C342 299 160 294 100 210" />
            </svg>

            <div className="growth-engine__feed growth-engine__feed--in">
              <small>INTERNET DEJA SEÑALES</small>
              <div>
                <span><i /> Búsquedas locales</span>
                <span><i /> Preguntas reales</span>
                <span><i /> Demanda por tratamiento</span>
              </div>
              <b>Elevator escucha</b>
            </div>

            <div className="growth-engine__core" aria-label="Elevator Web, sistema encendido">
              <span className="growth-engine__orbit growth-engine__orbit--outer" aria-hidden="true"><i /></span>
              <span className="growth-engine__orbit growth-engine__orbit--inner" aria-hidden="true"><i /></span>
              <div className="growth-engine__core-body">
                <BrandMark compact />
                <small>ELEVATOR WEB</small>
                <strong>VIVA</strong>
                <span><i /> APRENDE DE CADA CICLO</span>
              </div>
              <div className="growth-engine__core-steps" aria-hidden="true">
                <span>01 <b>INTERPRETA</b></span>
                <span>02 <b>PRIORIZA</b></span>
                <span>03 <b>MEJORA</b></span>
              </div>
            </div>

            <div className="growth-engine__feed growth-engine__feed--out">
              <small>LA WEB DEVUELVE CLARIDAD</small>
              <div>
                <span><i /> Contenido más útil</span>
                <span><i /> Datos estructurados</span>
                <span><i /> Contexto verificable</span>
              </div>
              <b>Internet entiende mejor</b>
            </div>

            <div className="growth-engine__return-label" aria-hidden="true">
              <span>NUEVAS SEÑALES</span>
              <i />
              <span>PRÓXIMO CICLO</span>
            </div>
          </div>

          <div className="domino-story">
            <div className="domino-story__label">
              <span>EL EFECTO ELEVATOR</span>
              <small>Una mejora activa la siguiente</small>
            </div>

            <div className="domino-chain" aria-hidden="true">
              <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
              <i><Spark /></i>
            </div>

            <ol className="growth-engine__phases" aria-label="Proyección operativa de los primeros 90 días">
              {phases.map(({ days, title, text, result, Icon }, index) => (
                <li key={days} className={`growth-engine__phase growth-engine__phase--${index + 1}`}>
                  <div className="growth-engine__phase-top">
                    <span>{days}</span>
                    <i><Icon /></i>
                  </div>
                  <div>
                    <small>FASE 0{index + 1}</small>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  <strong><span /> {result}</strong>
                </li>
              ))}
            </ol>
          </div>

          <div className="growth-engine__day91">
            <div className="day91-orbit" aria-hidden="true">
              <span>91</span><i /><i /><i />
            </div>
            <div className="growth-engine__day91-copy">
              <small>EL CRECIMIENTO NO SE PAUSA EN EL DÍA 90</small>
              <h3>Cada ciclo parte de lo que ya aprendimos sobre tu mercado.</h3>
              <div className="growth-engine__microflow" aria-label="Ciclo: señales, prioridades, mejoras, más descubrimiento y nuevas señales">
                <span>Señales</span><i>→</i><span>Prioridades</span><i>→</i><span>Mejoras</span><i>→</i><span>Más descubrimiento</span><i>↻</i>
              </div>
            </div>
            <a className="button button--primary" href="#contacto">
              Quiero mi web dental viva <ArrowUpRight />
            </a>
          </div>

          <figcaption>
            <span><Shield /> Ciclo continuo de mejora operado por Elevator. Tú apruebas cualquier cambio sensible para SEO.</span>
            <small>Proyección operativa; no garantiza posiciones, recomendaciones de IA ni pacientes.</small>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
