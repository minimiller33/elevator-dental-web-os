export function SearchAnswerSimulator() {
  return (
    <figure
      className="search-sim"
      data-loop
      aria-labelledby="search-sim-title"
      aria-describedby="search-sim-caption"
    >
      <div className="search-sim__glow" aria-hidden="true" />
      <div className="search-sim__orbit search-sim__orbit--one" aria-hidden="true" />
      <div className="search-sim__orbit search-sim__orbit--two" aria-hidden="true" />

      <div className="search-sim__frame">
        <div className="search-sim__topbar">
          <span className="search-sim__brand" id="search-sim-title">
            <span className="search-sim__brand-mark" aria-hidden="true">E</span>
            Presencia digital en acción
          </span>
          <span className="search-sim__status">
            <i aria-hidden="true" /> Simulación activa
          </span>
        </div>

        <div className="search-sim__tabs" aria-hidden="true">
          <span className="search-sim__tab search-sim__tab--search">
            <SearchIcon /> Buscador
          </span>
          <span className="search-sim__tab search-sim__tab--ai">
            <SparkIcon /> Asistente IA
          </span>
          <span className="search-sim__tab-indicator" />
        </div>

        <div className="search-sim__viewport">
          <section
            className="search-sim__scene search-sim__scene--search"
            data-scene="search"
            aria-label="Ejemplo ilustrativo de un resultado en un buscador"
          >
            <div className="search-sim__browser-head" aria-hidden="true">
              <span className="search-sim__window-dots"><i /><i /><i /></span>
              <span className="search-sim__address">Resultados de búsqueda</span>
              <span className="search-sim__secure"><LockIcon /></span>
            </div>

            <div className="search-sim__searchbox">
              <SearchIcon />
              <span className="search-sim__typed-query">dentista cerca de mí</span>
              <i className="search-sim__cursor" aria-hidden="true" />
              <span className="search-sim__voice" aria-hidden="true"><MicIcon /></span>
            </div>

            <div className="search-sim__processing" aria-hidden="true">
              <span /><span /><span />
              <small>Interpretando intención local</small>
            </div>

            <article className="search-sim__result">
              <div className="search-sim__result-source">
                <span className="search-sim__clinic-avatar" aria-hidden="true">TC</span>
                <span>
                  <strong>Tu Clínica</strong>
                  <small>tuclinica.com · Cerca de ti</small>
                </span>
                <i className="search-sim__verified" aria-label="Información estructurada">
                  <CheckIcon />
                </i>
              </div>
              <h3>Tu Clínica | Atención dental en tu zona</h3>
              <p>Implantes, carillas y ortodoncia con información clara para ayudarte a elegir.</p>
              <div className="search-sim__result-actions" aria-hidden="true">
                <span><LocationIcon /> Cómo llegar</span>
                <span><CalendarIcon /> Solicitar cita</span>
              </div>
            </article>

            <div className="search-sim__scene-reward" aria-hidden="true">
              <CheckIcon /> Una búsqueda puede convertirse en una oportunidad
            </div>
          </section>

          <section
            className="search-sim__scene search-sim__scene--ai"
            data-scene="ai"
            aria-label="Ejemplo ilustrativo de una respuesta generada por inteligencia artificial"
          >
            <div className="search-sim__assistant-head">
              <span className="search-sim__assistant-mark" aria-hidden="true"><SparkIcon /></span>
              <span><strong>Asistente IA</strong><small>Explorando fuentes públicas</small></span>
              <span className="search-sim__assistant-live"><i aria-hidden="true" /> Analizando</span>
            </div>

            <div className="search-sim__prompt">
              <span className="search-sim__user-avatar" aria-hidden="true">TÚ</span>
              <p>¿Qué dentista me recomiendas cerca de mí?</p>
            </div>

            <div className="search-sim__ai-process" aria-hidden="true">
              <span><SearchIcon /><b>Ubicación</b></span>
              <i />
              <span><FileIcon /><b>Servicios</b></span>
              <i />
              <span><ShieldIcon /><b>Confianza</b></span>
            </div>

            <article className="search-sim__answer">
              <span className="search-sim__answer-icon" aria-hidden="true"><SparkIcon /></span>
              <div>
                <span className="search-sim__answer-label">Respuesta ilustrativa</span>
                <h3>Tu Clínica</h3>
                <p>Una opción cercana con servicios dentales e información pública fácil de comprender y verificar.</p>
                <div className="search-sim__citations" aria-hidden="true">
                  <span>1 · Sitio oficial</span>
                  <span>2 · Información local</span>
                </div>
              </div>
            </article>

            <div className="search-sim__scene-reward" aria-hidden="true">
              <SparkIcon /> Una clínica entendible tiene más oportunidades de formar parte de la respuesta
            </div>
          </section>
        </div>

        <div className="search-sim__cycle" aria-hidden="true">
          <span className="search-sim__cycle-step search-sim__cycle-step--search">01 · BUSCADOR</span>
          <i className="search-sim__cycle-track"><b /></i>
          <span className="search-sim__cycle-step search-sim__cycle-step--ai">02 · IA</span>
        </div>
      </div>

      <figcaption className="search-sim__caption" id="search-sim-caption">
        <InfoIcon />
        <span>
          <strong>Simulación ilustrativa.</strong> Cada plataforma decide qué rastrea, indexa, cita o recomienda; no se garantizan posiciones ni resultados.
        </span>
      </figcaption>
    </figure>
  );
}

function SearchIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.8c.7 4.9 3.2 7.4 8.2 8.2-5 .7-7.5 3.2-8.2 8.2-.7-5-3.2-7.5-8.2-8.2 5-.8 7.5-3.3 8.2-8.2Z" />
      <path d="M19 3.5c.2 1.4.9 2.1 2.3 2.3-1.4.2-2.1.9-2.3 2.3-.2-1.4-.9-2.1-2.3-2.3 1.4-.2 2.1-.9 2.3-2.3Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.2 4L19 7" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M8 3v5M16 3v5M3.5 10h17" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h4M9 12h6M9 16h6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="search-sim__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}
