import { Check, XMark } from "@/components/Icons";

const frozenTimeline = ["Publicar", "Esperar", "Solicitar", "Volver a pagar"];

const liveTimeline = [
  "Publicar",
  "Escuchar",
  "Detectar",
  "Mejorar",
  "Repetir",
];

function FrozenElevator() {
  return (
    <svg
      className="live-comparison__elevator live-comparison__elevator--frozen"
      viewBox="0 0 360 420"
      role="img"
      aria-labelledby="frozen-elevator-title frozen-elevator-desc"
    >
      <title id="frozen-elevator-title">Web convencional detenida</title>
      <desc id="frozen-elevator-desc">
        Un ascensor queda detenido después de publicar; cada nuevo cambio
        requiere esperar, solicitarlo y volver a pagar.
      </desc>

      <g className="live-comparison__shaft">
        <path d="M100 28V384M260 28V384" />
        <path d="M70 92H290M70 178H290M70 264H290M70 350H290" />
      </g>
      <g className="live-comparison__floor-labels">
        <text x="52" y="97" textAnchor="end">Pagar</text>
        <text x="52" y="183" textAnchor="end">Solicitar</text>
        <text x="52" y="269" textAnchor="end">Esperar</text>
        <text x="52" y="355" textAnchor="end">Publicar</text>
      </g>

      <g className="live-comparison__inactive-levels" aria-hidden="true">
        <circle cx="180" cy="92" r="5" />
        <circle cx="180" cy="178" r="5" />
        <circle cx="180" cy="264" r="5" />
      </g>

      <g className="live-comparison__cabin live-comparison__cabin--stuck">
        <rect x="122" y="292" width="116" height="58" rx="12" />
        <path d="M180 306V336M165 321H195" />
        <text x="180" y="374" textAnchor="middle">SIN OPERACIÓN</text>
      </g>

      <g className="live-comparison__pause-mark" aria-hidden="true">
        <circle cx="283" cy="325" r="25" />
        <path d="M276 314V336M290 314V336" />
      </g>
    </svg>
  );
}

function LivingElevator() {
  return (
    <svg
      className="live-comparison__elevator live-comparison__elevator--living"
      viewBox="0 0 360 420"
      role="img"
      aria-labelledby="living-elevator-title living-elevator-desc"
    >
      <title id="living-elevator-title">Elevator Web en operación continua</title>
      <desc id="living-elevator-desc">
        Un ascensor activo escucha, detecta, mejora y repite el ciclo para
        representar una web que continúa evolucionando.
      </desc>

      <defs>
        <linearGradient id="living-shaft-gradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1858FB" />
          <stop offset="1" stopColor="#18BAFB" />
        </linearGradient>
        <filter id="living-elevator-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="live-comparison__shaft live-comparison__shaft--active">
        <path d="M100 28V384M260 28V384" />
        <path d="M70 92H290M70 178H290M70 264H290M70 350H290" />
      </g>
      <path
        className="live-comparison__energy-line"
        d="M180 350V92"
        pathLength="1"
        stroke="url(#living-shaft-gradient)"
      />

      <g className="live-comparison__floor-labels live-comparison__floor-labels--active">
        <text x="52" y="97" textAnchor="end">Repetir</text>
        <text x="52" y="183" textAnchor="end">Mejorar</text>
        <text x="52" y="269" textAnchor="end">Escuchar</text>
        <text x="52" y="355" textAnchor="end">Publicar</text>
      </g>

      <g className="live-comparison__active-levels" filter="url(#living-elevator-glow)">
        <circle cx="180" cy="350" r="6" />
        <circle cx="180" cy="264" r="6" />
        <circle cx="180" cy="178" r="6" />
        <circle cx="180" cy="92" r="6" />
      </g>

      <g className="live-comparison__cabin live-comparison__cabin--moving">
        <rect x="122" y="206" width="116" height="58" rx="12" />
        <path d="M180 251V220M166 234L180 220L194 234" />
        <text x="180" y="291" textAnchor="middle">SISTEMA ACTIVO</text>
      </g>

      <g className="live-comparison__orbit" aria-hidden="true">
        <circle cx="180" cy="92" r="27" />
        <circle cx="180" cy="92" r="42" />
      </g>
    </svg>
  );
}

export function LiveComparison() {
  return (
    <section
      className="live-comparison"
      id="ventaja"
      aria-labelledby="live-comparison-title"
    >
      <div className="container">
        <header className="live-comparison__heading" data-reveal>
          <span className="kicker kicker--blue">03 · US VS THEM · DOS DESTINOS</span>
          <h2 id="live-comparison-title">
            Ambas pueden verse bien.
            <br />
            <span>Solo una sigue trabajando.</span>
          </h2>
          <p>
            La diferencia empieza justo después de publicar.
          </p>
        </header>

        <div className="live-comparison__grid" role="list">
          <article
            className="live-comparison__card live-comparison__card--frozen"
            data-reveal
            role="listitem"
          >
            <header className="live-comparison__card-heading">
              <div>
                <span className="live-comparison__status live-comparison__status--off">
                  <i aria-hidden="true" /> Sistema detenido
                </span>
                <h3>Web convencional</h3>
              </div>
              <strong aria-label="Sin operación continua">Pausa</strong>
            </header>

            <figure className="live-comparison__visual">
              <FrozenElevator />
              <figcaption>
                Cada cambio vuelve a depender de tiempo, mensajes y presupuesto.
              </figcaption>
            </figure>

            <ol className="live-comparison__timeline">
              {frozenTimeline.map((step) => (
                <li key={step}>
                  <span aria-hidden="true"><XMark /></span>
                  <div>
                    <strong>{step}</strong>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article
            className="live-comparison__card live-comparison__card--living"
            data-reveal
            data-loop
            role="listitem"
          >
            <div className="live-comparison__glow" aria-hidden="true" />
            <header className="live-comparison__card-heading">
              <div>
                <span className="live-comparison__status live-comparison__status--on">
                  <i aria-hidden="true" /> Sistema activo
                </span>
                <h3>Elevator Web</h3>
              </div>
              <strong aria-label="Operación continua">Viva</strong>
            </header>

            <figure className="live-comparison__visual">
              <LivingElevator />
              <figcaption>
                Aprende del mercado y convierte cada mejora en el inicio del
                siguiente ciclo.
              </figcaption>
            </figure>

            <ol className="live-comparison__timeline live-comparison__timeline--active">
              {liveTimeline.map((step) => (
                <li key={step}>
                  <span aria-hidden="true"><Check /></span>
                  <div>
                    <strong>{step}</strong>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <div className="live-comparison__bridge" data-reveal>
          <span>Para una web convencional, publicar es el final.</span>
          <i aria-hidden="true"><ArrowBridge /></i>
          <strong>Para una Elevator Web, es el inicio.</strong>
        </div>
      </div>
    </section>
  );
}

function ArrowBridge() {
  return (
    <svg viewBox="0 0 72 24" aria-hidden="true">
      <path d="M2 12H68M58 3l10 9-10 9" />
    </svg>
  );
}
