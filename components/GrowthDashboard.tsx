import { Chart, Search, Shield, Spark } from "./Icons";
import type { CSSProperties } from "react";

const bars = [24, 31, 29, 42, 47, 54, 61, 68, 76, 84];

export function GrowthDashboard() {
  return (
    <div className="dashboard-shell" data-loop aria-label="Vista demostrativa del dashboard de crecimiento">
      <div className="dashboard-orbit dashboard-orbit--one" />
      <div className="dashboard-orbit dashboard-orbit--two" />
      <div className="dashboard-panel">
        <div className="dashboard-topbar">
          <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
          <div className="system-status"><span /> Sistema activo</div>
          <div className="demo-label">VISTA DEMO</div>
        </div>

        <div className="score-grid">
          <div>
            <p className="metric-label">Operación de crecimiento</p>
            <div className="score-value score-value--status"><strong>ACTIVA</strong></div>
            <div className="metric-change"><Chart /> Monitoreo continuo</div>
          </div>
          <div className="score-ring" aria-hidden="true">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" pathLength="100" />
              <circle className="score-ring__progress" cx="40" cy="40" r="32" pathLength="100" />
            </svg>
            <Spark />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__heading">
            <div><span>Señales de visibilidad</span><strong>En seguimiento</strong></div>
            <span className="period-pill">Ciclo mensual</span>
          </div>
          <div className="bar-chart" aria-label="Tendencia ilustrativa de visibilidad">
            {bars.map((height, index) => (
              <span key={index} style={{ "--bar-height": `${height}%`, "--bar-delay": `${index * 70}ms` } as CSSProperties} />
            ))}
          </div>
          <div className="chart-axis"><span>Jun</span><span>Jul</span><span>Ago</span></div>
        </div>

        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon"><Search /></span>
            <div><strong>Demanda monitoreada</strong><span>Búsquedas e intención local</span></div>
            <time>Continuo</time>
          </div>
          <div className="activity-item activity-item--success">
            <span className="activity-icon"><Spark /></span>
            <div><strong>Oportunidades priorizadas</strong><span>Según impacto y riesgo</span></div>
            <time>Ciclo</time>
          </div>
          <div className="activity-item">
            <span className="activity-icon"><Shield /></span>
            <div><strong>SEO protegido</strong><span>Aprobación antes de cambios sensibles</span></div>
            <time>Activo</time>
          </div>
        </div>

        <div className="dashboard-cycle" aria-label="Ciclo operativo: escuchar, detectar, priorizar y mejorar">
          <div><span>01</span><strong>ESCUCHA</strong></div>
          <i aria-hidden="true" />
          <div><span>02</span><strong>DETECTA</strong></div>
          <i aria-hidden="true" />
          <div><span>03</span><strong>PRIORIZA</strong></div>
          <i aria-hidden="true" />
          <div><span>04</span><strong>MEJORA</strong></div>
        </div>
      </div>

      <div className="dashboard-scroll-loop" aria-hidden="true">
        <span><i /> Mira lo que hace mientras tú atiendes pacientes</span>
        <b>↓</b>
      </div>
    </div>
  );
}
