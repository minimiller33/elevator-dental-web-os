import { ArrowUpRight } from "@/components/Icons";

const beforeSignals = [
  "Periodo reportado: 4 meses",
  "Punto de comparación inicial",
];

const afterSignals = [
  "Periodo posterior reportado: 4 meses",
  "Mejoras medidas y acumuladas",
];

export function CaseStudyProof() {
  return (
    <section
      className="case-proof section-light"
      id="resultados"
      aria-labelledby="case-proof-title"
    >
      <div className="container">
        <header className="case-proof__heading" data-reveal>
          <div>
            <span className="kicker">02 · BEFORE &amp; AFTER · CASO REAL</span>
            <h2 id="case-proof-title">
              La clínica ya tenía una web.
              <br />
              <span>Lo que cambió fue lo que ocurrió después.</span>
            </h2>
          </div>
          <p>
            Comparamos dos periodos reportados de cuatro meses en Clínica
            DrDiente: el punto de partida y el periodo posterior con una web
            operada como un activo que acumula mejoras.
          </p>
        </header>

        <article
          className="case-proof__stage"
          data-reveal
          aria-label="Comparación antes y después: de 38 mil a más de 480 mil impresiones orgánicas en dos periodos reportados de cuatro meses"
        >
          <div className="case-proof__story">
            <p className="case-proof__eyebrow">
              <span aria-hidden="true" /> Clínica DrDiente · resultado observado
            </p>

            <div
              className="case-proof__comparison"
              role="group"
              aria-label="Antes y después"
            >
              <section
                className="case-proof__moment case-proof__moment--1 case-proof__snapshot case-proof__snapshot--before"
                aria-labelledby="case-proof-before-title"
              >
                <div className="case-proof__snapshot-heading">
                  <span className="case-proof__snapshot-label">ANTES</span>
                  <small>Web publicada</small>
                </div>
                <strong className="case-proof__snapshot-value">38K</strong>
                <p id="case-proof-before-title">impresiones orgánicas</p>
                <ul className="case-proof__signal-list">
                  {beforeSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </section>

              <div
                className="case-proof__transition"
                aria-label="La web comenzó a operarse con mejoras medidas y acumuladas"
              >
                <span>¿Qué cambió?</span>
                <i aria-hidden="true">
                  <ArrowUpRight />
                </i>
                <strong>La web siguió trabajando después de publicarse</strong>
              </div>

              <section
                className="case-proof__moment case-proof__moment--3 case-proof__snapshot case-proof__snapshot--after"
                aria-labelledby="case-proof-after-title"
              >
                <div className="case-proof__snapshot-heading">
                  <span className="case-proof__snapshot-label">DESPUÉS</span>
                  <small>Web operada</small>
                </div>
                <strong className="case-proof__snapshot-value">480K+</strong>
                <p id="case-proof-after-title">impresiones orgánicas</p>
                <ul className="case-proof__signal-list">
                  {afterSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div
              className="case-proof__reveal"
              aria-label="Aproximadamente 12.6 veces el volumen inicial de impresiones orgánicas"
            >
              <span>Resultado de la comparación</span>
              <strong>
                <i>≈</i>12.6×
              </strong>
              <p>el volumen inicial de impresiones orgánicas</p>
            </div>
          </div>

          <figure className="case-proof__figure">
            <div className="case-proof__chart-shell">
              <div className="case-proof__chart-badges" aria-hidden="true">
                <span>ANTES · 38K</span>
                <span>DESPUÉS · 480K+</span>
              </div>
              <svg
                className="case-proof__chart"
                viewBox="0 0 720 360"
                role="img"
                aria-labelledby="case-proof-chart-title case-proof-chart-desc"
              >
                <title id="case-proof-chart-title">
                  Before and after de visibilidad orgánica
                </title>
                <desc id="case-proof-chart-desc">
                  La línea parte de 38 mil impresiones orgánicas y asciende hasta
                  más de 480 mil al comparar dos periodos reportados de cuatro
                  meses. Esto equivale a aproximadamente 12.6 veces el volumen
                  inicial.
                </desc>
                <defs>
                  <linearGradient
                    id="case-proof-area"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#18BAFB" stopOpacity=".34" />
                    <stop offset="1" stopColor="#1858FB" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id="case-proof-line"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0" stopColor="#1858FB" />
                    <stop offset="1" stopColor="#18BAFB" />
                  </linearGradient>
                  <filter
                    id="case-proof-glow"
                    x="-40%"
                    y="-40%"
                    width="180%"
                    height="180%"
                  >
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g className="case-proof__grid" aria-hidden="true">
                  <path d="M42 70H680M42 140H680M42 210H680M42 280H680" />
                  <path d="M42 44V310M201 44V310M361 44V310M520 44V310M680 44V310" />
                </g>

                <path
                  className="case-proof__area"
                  d="M50 284C112 282 148 270 204 257C258 244 289 245 341 216C395 186 424 171 478 160C536 148 583 100 670 58V310H50Z"
                  fill="url(#case-proof-area)"
                  aria-hidden="true"
                />
                <path
                  className="case-proof__line"
                  d="M50 284C112 282 148 270 204 257C258 244 289 245 341 216C395 186 424 171 478 160C536 148 583 100 670 58"
                  fill="none"
                  stroke="url(#case-proof-line)"
                  strokeLinecap="round"
                  strokeWidth="6"
                  pathLength="1"
                />

                <g className="case-proof__origin">
                  <circle cx="50" cy="284" r="7" fill="#1858FB" />
                  <circle
                    cx="50"
                    cy="284"
                    r="15"
                    fill="none"
                    stroke="#1858FB"
                    strokeOpacity=".2"
                    strokeWidth="7"
                  />
                  <text x="50" y="328" textAnchor="middle">
                    ANTES · 38K
                  </text>
                </g>
                <g
                  className="case-proof__destination"
                  filter="url(#case-proof-glow)"
                >
                  <circle cx="670" cy="58" r="8" fill="#18BAFB" />
                  <circle
                    cx="670"
                    cy="58"
                    r="18"
                    fill="none"
                    stroke="#18BAFB"
                    strokeOpacity=".28"
                    strokeWidth="8"
                  />
                  <text x="650" y="35" textAnchor="end">
                    DESPUÉS · 480K+
                  </text>
                </g>

                <g className="case-proof__signal" aria-hidden="true">
                  <circle cx="341" cy="216" r="5" />
                  <circle cx="478" cy="160" r="5" />
                  <circle cx="583" cy="100" r="5" />
                </g>
              </svg>

              <div className="case-proof__source">
                <span aria-hidden="true" />
                Datos reportados en Google Search Console
              </div>
            </div>
            <figcaption>
              No cambió el hecho de tener una web. Cambió lo que la web hacía
              después de publicarse: medir, mejorar y acumular progreso.
            </figcaption>
          </figure>
        </article>

        <p className="case-proof__disclaimer">
          Las impresiones no equivalen a pacientes. Este es un resultado
          observado, no una garantía. Los periodos comparados fueron reportados
          con una duración de cuatro meses cada uno. El desempeño varía según el
          mercado, la ubicación, la competencia y las condiciones iniciales de
          cada clínica.
        </p>
      </div>
    </section>
  );
}
