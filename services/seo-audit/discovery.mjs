// Observable signals in the downloaded HTML, not a prediction of AI citations.
export const discoveryVersion = 1;
export const discoveryLimitation = 'Estas señales proceden del contenido HTML recibido, sin comprobar toda la web ni ejecutar sus botones. Detectar un dato no verifica su exactitud, credenciales o disponibilidad de citas, ni demuestra presencia o recomendaciones en una IA.';
export const discoveryStatusLabels = { detected: 'Detectado', not_detected: 'No detectado', requires_review: 'Requiere revisión' };

const clean = value => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 240);
const normalize = value => String(value || '').replace(/\s+/g, ' ').trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function inspectDiscovery($, resolvedUrl) {
  const nodes = [];
  let malformed = 0;
  $('script[type="application/ld+json" i]').each((_i, element) => {
    try {
      const queue = [JSON.parse($(element).text())];
      for (let i = 0; i < queue.length && i < 2000; i++) {
        const node = queue[i];
        if (!node || typeof node !== 'object') continue;
        if (Array.isArray(node)) queue.push(...node.slice(0, 100));
        else {
          if (node['@type']) nodes.push(node);
          queue.push(...Object.values(node).filter(value => value && typeof value === 'object').slice(0, 100));
        }
      }
    } catch { malformed++; }
  });
  const types = node => (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).filter(value => typeof value === 'string').map(value => value.replace(/^https?:\/\/schema.org\//, ''));
  const business = nodes.filter(node => types(node).some(type => ['Dentist', 'MedicalClinic', 'LocalBusiness', 'Organization'].includes(type)));
  const body = $('body').clone();
  body.find('script, style, noscript, template, [hidden], [aria-hidden="true"], [style*="display:none"], [style*="display: none"]').remove();
  const text = normalize(body.text());
  const findings = [];
  function add(key, label, status, evidence, action, priority = false) {
    findings.push({ key, label, status, evidence: clean(evidence), action, priority });
  }
  add('structured_data', 'Datos estructurados legibles', malformed ? 'requires_review' : nodes.length ? 'detected' : 'not_detected',
    malformed ? `${malformed} bloques no se pudieron leer como JSON. Otros bloques legibles: ${nodes.length}.` : nodes.length ? `Tipos encontrados: ${[...new Set(nodes.flatMap(types))].slice(0, 8).join(', ')}. La sintaxis legible no equivale a validar el marcado.` : 'No encontramos bloques JSON-LD con tipos identificables.',
    'Revisa los datos estructurados y haz que describan la información real de la página.', true);
  const identity = business.find(node => typeof node.name === 'string' && normalize(node.name).length >= 3 && text.includes(normalize(node.name)));
  add('identity', 'Nombre del negocio en contenido y datos', identity ? 'detected' : business.length ? 'requires_review' : 'not_detected',
    identity ? `Nombre coincidente: ${identity.name}. No se ha verificado la identidad del negocio.` : business.length ? 'Hay datos de negocio, pero no pudimos relacionar su nombre con el texto recibido.' : 'No encontramos datos de negocio con los que contrastar el nombre de la clínica.',
    'Usa el mismo nombre público de la clínica en el contenido y en sus datos estructurados.', true);
  const address = body.find('address, [itemprop="address"]').first().text();
  const structuredAddress = business.map(node => node.address).find(value => value && typeof value === 'object' && typeof value.streetAddress === 'string');
  add('location', 'Información de ubicación', clean(address) ? 'detected' : 'requires_review',
    clean(address) ? `Dirección marcada en la página: ${address}` : structuredAddress ? `Dirección en datos: ${structuredAddress.streetAddress}. Hay que contrastarla con el contenido y la sede real.` : 'No identificamos una dirección marcada. Puede estar escrita en otro formato; requiere revisión manual.',
    'Revisa que dirección, sede y horarios estén claros y coincidan con la ficha pública de la clínica.', true);
  const contact = body.find('a[href]').toArray().find(element => /^(tel:|mailto:)/i.test($(element).attr('href') || ''));
  add('contact', 'Enlace de teléfono o email', contact ? 'detected' : 'not_detected', contact ? `Enlace encontrado: ${$(contact).attr('href')}` : 'No encontramos enlaces de teléfono o email en el contenido recibido.',
    'Ofrece un teléfono o email público con un enlace fácil de usar.', true);
  const booking = body.find('a[href]').toArray().find(element => {
    const href = $(element).attr('href') || '';
    if (!href.trim() || href === '#') return false;
    if (!/agend|reserv|pedir.*cita|solicitar.*cita|whatsapp/i.test($(element).text()) && !/wa\.me|api\.whatsapp\.com|\/widget\/booking\//i.test(href)) return false;
    try { const url = new URL(href, resolvedUrl); return ['http:', 'https:'].includes(url.protocol) && (!href.startsWith('#') || !!body.find('[id]').toArray().find(target => $(target).attr('id') === href.slice(1))); } catch { return false; }
  });
  add('booking', 'Ruta para solicitar una cita', booking ? 'detected' : 'requires_review', booking ? `Enlace: ${$(booking).text() || 'Contacto por WhatsApp'}. No probamos la reserva ni consultamos disponibilidad.` : 'No identificamos un enlace de cita. El contacto puede usar un formulario, botón o agenda que requiere revisión manual.',
    'Comprueba que el paciente pueda solicitar una cita y que el enlace o formulario funcione.', true);
  const question = body.find('h2, h3, summary, dt').toArray().find(element => {
    const title = clean($(element).text());
    const answer = $(element).is('summary') ? $(element).parent().text().slice($(element).text().length) : $(element).next('p, div, dd').text();
    return /[¿?]/.test(title) && clean(answer).length >= 30;
  });
  add('questions', 'Preguntas con una explicación cercana', question ? 'detected' : 'not_detected', question ? `Pregunta encontrada: ${$(question).text()}. La respuesta necesita revisión de contenido.` : 'No encontramos encabezados de pregunta con una explicación cercana en este HTML.',
    'Responde dudas reales sobre el tratamiento, sus alternativas y la consulta inicial, con revisión clínica.', true);
  const professional = nodes.find(node => types(node).includes('Person'));
  const author = body.find('[rel="author"], [itemprop="author"]').first().text();
  add('professional', 'Profesionales y responsabilidad del contenido', 'requires_review', professional?.name || clean(author) ? `Referencia encontrada: ${clean(professional?.name || author)}. No verifica formación, credenciales ni revisión clínica.` : 'No identificamos autoría marcada. Los nombres y credenciales pueden aparecer en otros formatos.',
    'Identifica al profesional responsable y verifica sus credenciales y la revisión de los textos clínicos.');
  const sources = body.find('a[href]').toArray().filter(element => {
    try { const url = new URL($(element).attr('href'), resolvedUrl); return ['http:', 'https:'].includes(url.protocol) && url.hostname !== new URL(resolvedUrl).hostname; } catch { return false; }
  });
  add('sources', 'Fuentes y referencias externas', 'requires_review', sources.length ? `${sources.length} enlaces externos encontrados. No se ha comprobado si son fuentes clínicas, reseñas o redes sociales.` : 'No encontramos enlaces externos en el contenido recibido. Su necesidad depende del tema.',
    'Cuando corresponda, respalda afirmaciones clínicas con fuentes pertinentes y evidencia propia verificable.');
  const video = body.find('video, iframe[src*="youtube.com"], iframe[src*="youtube-nocookie.com"], iframe[src*="vimeo.com"]').length;
  const transcript = body.find('h2, h3, summary').toArray().some(element => /transcrip/i.test($(element).text()));
  add('media', 'Video y transcripción', video ? 'requires_review' : 'not_detected', video ? `${video} elementos de video. ${transcript ? 'Hay un encabezado de transcripción; revisa que corresponda al video.' : 'No identificamos un encabezado de transcripción.'}` : 'No identificamos videos incrustados. El video es opcional y no es necesario para superar los controles básicos.',
    'Si publicas un video explicativo, acompáñalo de una transcripción fiel y del profesional responsable.');
  return { version: discoveryVersion, findings, limitation: discoveryLimitation };
}
