type Guide = { title: string; intro: string; points: { title: string; text: string }[]; faqs: { question: string; answer: string }[] };
export const serviceGuides: Record<string, Guide> = {
  'diseno-web-para-dentistas': {
    title: '¿Qué debe tener una web dental?',
    intro: 'Antes de pedir una cita, una persona suele querer entender si tu clínica atiende su necesidad y cómo ponerse en contacto. Una web clara reúne esa información sin obligarla a buscarla en varios lugares.',
    points: [
      { title: 'Tratamientos fáciles de encontrar', text: 'Cada clínica tiene servicios y prioridades diferentes. Organizamos las páginas para explicar los tratamientos relevantes, responder dudas iniciales y mostrar el siguiente paso. La selección de páginas se acuerda dentro del alcance del proyecto.' },
      { title: 'Equipo, ubicación y confianza', text: 'Presentar al equipo, la ubicación y los datos de contacto ayuda a que el visitante sepa con quién hablar y dónde acudir. Trabajamos con los materiales reales de la clínica y tú validas la información clínica.' },
      { title: 'Contacto cómodo desde el celular', text: 'Una web debe permitir consultar tratamientos y llegar a los medios de contacto desde una pantalla pequeña. Revisamos las rutas de contacto acordadas para que sean visibles y fáciles de usar.' },
      { title: 'Lista para seguir creciendo', text: 'Preparamos la estructura inicial para buscadores y configuramos medición al publicar. Con Membership, la web puede seguir recibiendo mantenimiento y mejoras dentro del alcance contratado.' }
    ],
    faqs: [
      { question: '¿Puedo actualizar tratamientos o datos después de publicar?', answer: 'Puedes solicitar cambios mediante los créditos de Membership. Revisamos el alcance de cada solicitud antes de realizarla y la clínica valida la información clínica cuando corresponde.' },
      { question: '¿La web funciona en celulares?', answer: 'La estructura se prepara para consultarse en celular y computadora. El objetivo es que las personas encuentren la información y los medios de contacto sin dificultad en ambos formatos.' },
      { question: '¿Puedo usar una herramienta de citas que ya tengo?', answer: 'Podemos revisar tus medios de contacto y las herramientas que ya utilizas durante la definición del proyecto. La viabilidad y el alcance de cualquier integración se acuerdan antes de implementarla.' }
    ]
  },
  'seo-para-dentistas': {
    title: '¿Cómo trabajamos la visibilidad orgánica?',
    intro: 'El SEO dental conecta lo que tu clínica ofrece con las preguntas que una persona hace en buscadores. No consiste solo en repetir palabras: requiere información útil, una estructura comprensible y seguimiento.',
    points: [
      { title: 'Entender la intención de búsqueda', text: 'Una persona puede buscar una clínica cerca, informarse sobre un tratamiento o buscar una marca que ya conoce. Esas necesidades son diferentes y ayudan a decidir qué información debe responder cada página.' },
      { title: 'Ordenar servicios y contenidos', text: 'Priorizamos la estructura de tratamientos, ubicación y contacto para que cada tema tenga un lugar claro. El contenido debe ayudar a las personas a comprender la clínica; el equipo valida las afirmaciones clínicas.' },
      { title: 'Dar contexto a los buscadores', text: 'La configuración técnica y los datos estructurados aportan información sobre el contenido de la web. Google decide cómo interpretar y mostrar las páginas; el marcado no garantiza posiciones ni apariencias especiales.' },
      { title: 'Medir y mejorar', text: 'Cuando las fuentes están conectadas y hay datos suficientes, revisamos señales como impresiones, clics y consultas disponibles. Los cambios se priorizan por ciclo y los datos pueden tener retrasos o límites de privacidad.' }
    ],
    faqs: [
      { question: '¿En qué se diferencia el SEO de la publicidad pagada?', answer: 'El SEO trabaja la presencia orgánica del sitio en buscadores. Los anuncios dependen de campañas pagadas; la gestión de campañas publicitarias no forma parte de este servicio.' },
      { question: '¿El SEO también sirve si la clínica ya tiene una web?', answer: 'Una web existente puede ser un punto de partida. Revisamos su situación y tus objetivos para definir si conviene reorganizarla o construir una nueva, junto con el alcance del proyecto.' },
      { question: '¿Apareceré en ChatGPT u otros asistentes?', answer: 'Una web clara y accesible ayuda a presentar información comprensible, pero cada asistente decide qué fuentes utiliza y qué respuesta muestra. No garantizamos menciones ni recomendaciones.' }
    ]
  },
  'seo-local-para-dentistas': {
    title: 'De la búsqueda local al contacto',
    intro: 'Alguien que busca atención cerca necesita reconocer el tratamiento, la ubicación y una forma de comunicarse. Tu web y los datos públicos de tu clínica deben contar la misma historia.',
    points: [
      { title: 'Una ubicación reconocible', text: 'La dirección, los medios de contacto y la información de la sede deben ser claros y mantenerse actualizados. Una página de ubicación puede ayudar al visitante a confirmar si la clínica le resulta conveniente.' },
      { title: 'Servicios relevantes para la sede', text: 'Conviene explicar los tratamientos que realmente se ofrecen en esa ubicación y responder dudas útiles. No se trata de repetir nombres de ciudades, sino de publicar información real que ayude a elegir.' },
      { title: 'Web y Perfil de Empresa', text: 'El Perfil de Empresa de Google y la web son superficies distintas. Es importante mantener sus datos completos y coherentes; la conexión de fuentes y el trabajo sobre el perfil se revisan según cada proyecto.' },
      { title: 'Qué influye en los resultados locales', text: 'Google explica que la relevancia, la distancia y la prominencia influyen en los resultados locales. Algunos factores dependen de Google y del contexto de cada búsqueda, por lo que no se puede prometer una posición.' }
    ],
    faqs: [
      { question: '¿Necesito una página por cada ciudad?', answer: 'No basta con copiar la misma página y cambiar el nombre de la ciudad. Una página adicional debe tener información real y útil para esa ubicación; el alcance se evalúa para cada proyecto.' },
      { question: '¿Las reseñas importan?', answer: 'Las reseñas ayudan a las personas a conocer experiencias de otros pacientes. Google también considera información sobre el negocio en sus resultados locales; la clínica debe gestionarlas conforme a sus políticas y a las reglas de la plataforma.' },
      { question: '¿Puedo trabajar varias sucursales?', answer: 'Sí podemos revisar tus necesidades, pero el alcance inicial común contempla una ubicación. Las sedes y páginas adicionales se definen y acuerdan por separado.' }
    ]
  },
  'mantenimiento-web-dental': {
    title: '¿Qué significa cuidar una web dental?',
    intro: 'La información de una clínica cambia: tratamientos, integrantes del equipo, horarios y prioridades. Una web necesita operación y revisiones para acompañar esos cambios.',
    points: [
      { title: 'Operación de la web', text: 'Durante la membresía activa, Elevator se ocupa del hosting y el mantenimiento técnico dentro del alcance acordado. Esto permite que la clínica tenga un responsable al que acudir para su web.' },
      { title: 'Información que sigue vigente', text: 'Si cambia un dato o necesitas solicitar un ajuste, puedes plantearlo con tus créditos mensuales. Revisamos el alcance antes de realizarlo; tu equipo participa validando la información clínica.' },
      { title: 'Señales para priorizar mejoras', text: 'Cuando hay datos disponibles, revisamos cómo se está encontrando y utilizando la web. Las señales ayudan a decidir qué revisar después; no convierten por sí solas una visita en una cita confirmada.' },
      { title: 'Expectativas claras', text: 'La construcción inicial y la membresía son etapas complementarias. Antes de comenzar acordamos la inversión, condiciones, alcance, tiempos y tratamiento de solicitudes adicionales.' }
    ],
    faqs: [
      { question: '¿Qué ocurre si necesito un cambio grande?', answer: 'Cuéntanos qué necesitas. Revisamos el alcance y te explicamos si corresponde a una solicitud cubierta por créditos o si requiere un acuerdo adicional antes de realizarlo.' },
      { question: '¿Los créditos incluyen campañas o redes sociales?', answer: 'No. Las campañas de anuncios, las redes sociales y la gestión de un CRM quedan fuera del servicio descrito. Las solicitudes se revisan dentro del alcance acordado.' },
      { question: '¿Tengo que aprobar los cambios clínicos?', answer: 'Sí. La clínica revisa y valida la información y las afirmaciones clínicas antes de su publicación; Elevator se encarga de los ajustes acordados de la web.' }
    ]
  }
};
