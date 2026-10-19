import { discoveryStatusLabels } from './discovery.mjs';

export const reportScope = 'Revisamos la página que compartiste: cómo carga en un celular, sus ajustes básicos para buscadores y las señales de identidad, contacto y contenido que podemos identificar en su HTML público.';
export const reportLimitation = 'Este diagnóstico revisa una sola página. No mide tu posición en Google, las visitas a tu web ni tu presencia en Google Maps o en asistentes de IA. Los tiempos de carga son una estimación y pueden variar entre visitas.';

const labels = {
  https: 'Conexión segura para tus visitantes', title: 'Título que identifica la página',
  description: 'Descripción para los buscadores', h1: 'Un título principal en el contenido',
  noindex: 'Sin una instrucción que bloquee su aparición en buscadores',
  alt: 'Imágenes con su descripción configurada', viewport: 'Ancho adaptado a la pantalla del celular',
};
const actions = {
  https: 'Activa una conexión segura para proteger a las personas que visitan tu web.',
  title: 'Añade un título que identifique tu clínica y su ubicación.',
  description: 'Escribe una descripción breve que explique tus servicios y por qué elegir tu clínica.',
  h1: 'Deja un único título principal que explique claramente de qué trata la página.',
  noindex: 'Pide a tu equipo web que revise la instrucción que impide mostrar esta página en buscadores.',
  alt: 'Añade descripciones a las imágenes informativas y marca las decorativas como tales, para ayudar a quienes usan lectores de pantalla.',
  viewport: 'Ajusta la página para que se adapte al ancho de la pantalla del celular.',
};

function opportunityAdvice(item) {
  const title = item.title.toLowerCase();
  if (/javascript/.test(title)) return 'Reduce el código que la página descarga pero no necesita, para que aparezca antes y responda más rápido.';
  if (/css/.test(title)) return 'Elimina los estilos que la página no utiliza, para reducir la descarga y acelerar la carga.';
  if (/image|imagen/.test(title)) return 'Ajusta el tamaño y comprime las imágenes para que la página cargue más rápido en el celular.';
  if (/font/.test(title)) return 'Simplifica la carga de las tipografías para que el texto aparezca antes.';
  if (/render.block|blocking/.test(title)) return 'Carga primero el contenido que necesita ver el visitante y deja los archivos secundarios para después.';
  if (/cache/.test(title)) return 'Permite que el navegador reutilice los archivos que ya descargó para acelerar las siguientes visitas.';
  if (/server|response/.test(title)) return 'Revisa el tiempo de respuesta del servidor para que la página empiece a cargar antes.';
  return 'Revisa con tu equipo web los archivos que retrasan la carga y reduce los que no son necesarios.';
}

export function presentReport(report) {
  const opportunities = [...new Set((report.lighthouse?.opportunities || []).map(opportunityAdvice))];
  const checks = (report.checks || []).map(check => ({ ...check, label: labels[check.key] || 'Configuración de la página' }));
  const technical = (report.issues || report.priorities || []).map(issue => ({ key: issue.key, action: actions[issue.key] || 'Revisa este punto de la página con tu equipo web.' }));
  const performance = report.lighthouse?.performance;
  const slow = typeof performance === 'number' && performance < 90;
  const speedPriorities = slow ? (opportunities.length ? opportunities : ['Prioriza la velocidad de carga en celular: revisa las imágenes y los archivos que se descargan al abrir la página.']).map((action, index) => ({ key: `speed-${index}`, action })) : [];
  const discovery = report.discovery ? { ...report.discovery, findings: report.discovery.findings.map(finding => ({ ...finding, statusLabel: discoveryStatusLabels[finding.status] || 'Requiere revisión' })) } : null;
  const discoveryPriorities = (discovery?.findings || []).filter(finding => finding.priority && finding.status !== 'detected').map(({ key, action }) => ({ key: `discovery-${key}`, action }));
  const summary = slow
    ? 'La velocidad en celular puede mejorar. Una carga más rápida ayuda a que las personas vean tus servicios y puedan contactarte con menos espera.'
    : technical.length
      ? 'Encontramos algunos puntos básicos que conviene revisar para que tu página sea más clara y fácil de usar.'
      : discoveryPriorities.length
        ? 'Los controles básicos están bien. Hay señales de identidad, contacto o contenido que conviene completar o revisar con tu equipo.'
      : 'Las comprobaciones básicas revisadas están bien. Puedes seguir mejorando el contenido de tus tratamientos y la información local de tu clínica.';
  // Reserve a place for content clarity when technical and speed issues coexist.
  const priorities = [...technical.slice(0, 1), ...speedPriorities.slice(0, 1), ...discoveryPriorities.slice(0, 1), ...technical.slice(1), ...speedPriorities.slice(1), ...discoveryPriorities.slice(1)].slice(0, 3);
  return { checks, opportunities, priorities, discovery, summary, scope: discovery ? reportScope : 'Revisamos la carga en celular y los ajustes básicos para buscadores. Este informe anterior no incluye la nueva revisión de claridad para buscadores e IA.', limitation: reportLimitation };
}
