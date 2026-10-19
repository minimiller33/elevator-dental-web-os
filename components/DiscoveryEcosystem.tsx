import { BrandMark } from "./BrandMark";

const platforms = [
  { slug: "google", mark: "G", name: "Google", type: "Búsqueda" },
  { slug: "bing", mark: "b", name: "Bing", type: "Búsqueda" },
  { slug: "brave", mark: "B", name: "Brave", type: "Búsqueda" },
  { slug: "chatgpt", mark: "✣", name: "ChatGPT", type: "Respuesta IA" },
  { slug: "gemini", mark: "✦", name: "Gemini", type: "Respuesta IA" },
  { slug: "claude", mark: "C", name: "Claude", type: "Respuesta IA" },
  { slug: "perplexity", mark: "P", name: "Perplexity", type: "Búsqueda IA" },
  { slug: "bots", mark: "AI", name: "AI Bots", type: "Rastreadores" },
] as const;

export function DiscoveryEcosystem() {
  return (
    <figure className="discovery-figure discovery-credibility" data-reveal="scale">
      <div
        className="discovery-network discovery-credibility__panel"
        aria-labelledby="discovery-credibility-title"
        aria-describedby="discovery-ecosystem-disclaimer"
      >
        <header className="discovery-network__header discovery-credibility__header">
          <span><i aria-hidden="true" /> 01 · NUEVO MAPA DE BÚSQUEDA</span>
          <small>8 SUPERFICIES DE DESCUBRIMIENTO</small>
        </header>

        <div className="ecosystem-core discovery-source">
          <div className="ecosystem-core__bar discovery-source__bar" aria-hidden="true">
            <span><i /><i /><i /></span>
            <small>FUENTE PÚBLICA</small>
          </div>
          <div className="ecosystem-core__body discovery-source__body">
            <BrandMark compact />
            <span>ELEVATOR WEB</span>
            <strong id="discovery-credibility-title">
              Una presencia clara para cada forma de buscar
            </strong>
            <p>
              La información de tu clínica, organizada para que buscadores y
              asistentes de IA puedan rastrearla, entenderla y contrastarla.
            </p>
            <div className="ecosystem-status discovery-source__signals" aria-label="Señales estructurales">
              <span>Rastreable</span>
              <span>Entendible</span>
              <span>Verificable</span>
            </div>
          </div>
        </div>

        <ul
          className="network-nodes discovery-platforms"
          data-sequence
          aria-label="Plataformas que forman parte del nuevo mapa de búsqueda"
        >
          {platforms.map((platform) => (
            <li
              className={`network-node network-node--${platform.slug} discovery-platform discovery-platform--${platform.slug}`}
              key={platform.name}
            >
              <span className="network-node__mark discovery-platform__mark" aria-hidden="true">
                {platform.mark}
              </span>
              <span className="network-node__copy discovery-platform__copy">
                <strong>{platform.name}</strong>
                <small>{platform.type}</small>
              </span>
              <i aria-hidden="true" />
            </li>
          ))}
        </ul>

        <p className="discovery-credibility__note">
          Una fuente clara para búsquedas tradicionales y respuestas asistidas por IA.
        </p>
      </div>
      <figcaption id="discovery-ecosystem-disclaimer">
        Representación ilustrativa. Las marcas se mencionan únicamente como referencias
        del ecosistema; no implica afiliación, integración oficial ni garantía de aparición.
        Cada plataforma decide qué contenido rastrea, indexa, cita, recomienda o muestra.
      </figcaption>
    </figure>
  );
}
