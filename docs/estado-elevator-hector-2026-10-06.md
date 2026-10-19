# Elevator Dental Web — Estado y traspaso para Héctor y su agente

**Corte:** 6 de octubre de 2026, 22:13, Costa Rica (UTC−6).  
**Proyecto:** Elevator Dental OS / Elevator Dental Web.  
**Workspace:** `/Users/cashkade/Documents/PROGRAMACION/elevator OS`.  
**Objetivo:** registrar lo implementado y verificado, las limitaciones reales y el trabajo pendiente para continuar sin perder contexto.

Este documento distingue **implementado**, **verificado**, **pendiente** y **propuesto**. Las propuestas de ejecución no son decisiones comerciales aprobadas. La presencia de una página o un borrador no significa que exista una automatización operativa.

## 1. Situación actual

El formulario comercial de Elevator está en producción: captura contactos al inicio, permite completar la calificación y envía los estados a GHL mediante un webhook. Incluye atribución de marketing y una nota legible con las respuestas y los datos de navegación disponibles.

Se hizo una prueba real desde el navegador de producción hasta GHL. El contacto llegó, se actualizó a `qualified` y recibió notas automáticas con 27 puntos, prioridad alta y los datos de campaña. No se reservó una cita ni se enviaron mensajes durante esa prueba.

La implementación todavía no constituye el embudo completo: faltan el workflow posterior a la reserva, los recordatorios y seguimientos, los videos, el onboarding conectado y la operación editorial. Además, GHL todavía no aplica los tags del webhook ni tiene todos los datos mapeados a campos individuales.

### Estado resumido

| Frente | Estado comprobado | Pendiente principal |
|---|---|---|
| Formulario comercial | Implementado y probado en producción | Ampliar pruebas de escenarios y cerrar detalles de CRM |
| Reglas de calificación | Actualizadas en código | Revisar reglas preexistentes de mercados y revisión manual |
| Captura de no calificados | Implementada y cubierta por pruebas del worker | Prueba real específica y aplicación efectiva del tag en GHL |
| Atribución marketing | Implementada y verificada parcialmente en prueba real | Mapeo de campos y pruebas con click IDs/cookies reales |
| GHL: crear/actualizar contacto | Verificado | Evitar estados obsoletos y validar idempotencia de eventos |
| GHL: notas de calificación | Verificado | Definir qué información también debe ser campo consultable |
| GHL: tags | En payload; vacíos en contacto de prueba | Configurar acciones/condiciones y comprobarlas |
| Agenda | Calendario visible para calificados | Reservar una cita de prueba controlada y verificar eventos |
| Video post agendamiento | Pendiente indicado por el usuario | Guion, producción, publicación e integración |
| Workflow post agendamiento | Pendiente indicado por el usuario | Disparadores, confirmación, recordatorios y seguimientos |
| Onboarding completo | Hay interfaz y borradores | Backend, persistencia, CRM, materiales y operación |
| Blog IA y Google | Pendiente indicado por el usuario | Estrategia, implementación, artículos y medición |
| Video VSL | Pendiente indicado por el usuario | Guion comercial, grabación, edición e integración |
| Primera tanda de contenidos | Pendiente indicado por el usuario | Calendario, piezas, CTA, recursos y publicación |

## 2. Lo hecho hoy: formulario y calificación

### 2.1 Reglas solicitadas y comportamiento implementado

| Pregunta | Regla vigente | Puntos / efecto |
|---|---|---|
| Situación profesional | Dueño/socio, dentista independiente, asociado/empleado y marketing/administración califican en esta pregunta | +2 |
| Situación: `Otro` | Existe adicionalmente en código; provoca rechazo temprano | `not_qualified` |
| Especialidad | Selección múltiple: sonrisa, implantes, rehabilitación, ortodoncia/alineadores, general y otro | Todas válidas; +3 una sola vez por tener especialidad, no por cada selección |
| Años ejerciendo | No excluye | No agrega puntos |
| Sillones/consultorios | 1, 2, 3–5 y 6+ válidos | +1 por respuesta |
| Moneda | No excluye | No agrega puntos |
| Tratamiento de alto valor | Solo los rangos 1500–4000 USD y más de 4000 USD califican | +2; los dos rangos inferiores rechazan |
| Facturación mensual | Solo 10.000–25.000, 25.000–60.000 y más de 60.000 USD califican | +2; rangos inferiores y «Prefiero no decir» rechazan |
| Pacientes deseados | 1–3, 4–10 y más de 10 válidos | +1 |
| Origen de pacientes | Todas las opciones válidas; selección múltiple | Sin exclusión ni puntos adicionales |
| Marketing probado | Todas las opciones válidas; selección múltiple | Sin exclusión ni puntos adicionales |
| Frustración | Respuesta libre no excluye | Se conserva en `frustration` |
| Tiene web | Sí y no válidos | Sin exclusión ni puntos adicionales |
| Revisar alcance e inversión en una llamada | Pregunta eliminada del formulario | Ya no condiciona ni suma |
| Laboratorio interno | Sí suma; no/planeándolo no suman ni rechazan | Sí: +1 |
| Tecnología | CAD/CAM, escáner, tomógrafo e impresora suman por cada selección | +1 por tecnología, máximo +4; ninguna: 0 |
| Decide inversión | Solo yo / con un socio / no | +2 / +1 / 0 |
| Inicio | Menos de 30 días | +10 y prioridad `high` |
| Inicio | 1–3 meses | +3 y prioridad `normal` |
| Inicio | Solo explorando | `not_qualified`, 0 puntos, prioridad `none` |
| Entiende tiempos orgánicos | Sí y no válidos | No rechaza ni agrega puntos |

**La calificación no depende de superar un umbral de puntos.** Las reglas excluyentes y de revisión manual determinan el estado. Los puntos y la prioridad sirven para ordenar el seguimiento. Un rechazo se devuelve actualmente con 0 puntos; no conserva la suma parcial.

Base típica de un perfil válido: 11 puntos. Laboratorio, tecnología, decisión y plazo agregan hasta 17; máximo actual: 28. La prueba real obtuvo 27 porque seleccionó tres tecnologías.

### 2.2 Reglas preexistentes que deben conocerse

- La ubicación comercial declarada se compara con los mercados soportados: Colombia, México y Estados Unidos. Si no coincide, pasa a `manual_review`; no es un rechazo automático.
- Si quien responde no decide y quien decide no asistirá, pasa a `manual_review`.
- Estas reglas permanecieron en el código; no deben confundirse con los campos que el usuario indicó que aceptan todas las respuestas.
- La prioridad alta también puede acompañar a un caso de revisión manual que quiera empezar en menos de 30 días. No elimina la revisión manual ni habilita por sí sola la agenda.
- La ubicación declarada de la clínica y la geolocalización de conexión son datos distintos. No usar el país de IP para sustituir el mercado comercial.
- Los límites de tratamiento y facturación se basan en opciones categóricas del formulario. No afirmar que existe conversión cambiaria dinámica sin comprobarla.

### 2.3 Texto de expectativa orgánica

Se reformuló el mensaje para explicar que una Elevator Dental Web atrae tráfico orgánico de posibles pacientes, necesita tiempo para consolidarse y aprender a captar tráfico calificado, y no ofrece resultados inmediatos. Ambas respuestas son aceptadas. La intención comercial es crecer sin depender de anuncios; no debe transformarse en una garantía de tráfico, ventas o aparición en respuestas de IA.

## 3. Captura y envío al CRM

Flujo actual:

1. Se capturan nombre, email y WhatsApp al inicio.
2. Se envía `event_type: lead_started`, con estado `started`.
3. Al finalizar se envía `event_type: lead_completed`, con estado final y respuestas.
4. El worker normaliza los datos y envía el webhook a GHL.
5. La interfaz muestra el resultado después de que el envío responde correctamente.
6. Solo un resultado `qualified` recibe el enlace de agenda.

Estados admitidos:

| Estado | Significado | Agenda |
|---|---|---|
| `started` | Contacto capturado, formulario pendiente | No |
| `qualified` | Cumple reglas comerciales | Sí |
| `manual_review` | Requiere revisión del equipo | No automática |
| `not_qualified` | No cumple una regla excluyente | No |

**Requisito expreso:** no perder leads no calificados. Deben enviarse igualmente a GHL y distinguirse con la condición y el tag «No califica».

Implementación del webhook para rechazados: `lead_status: not_qualified`, `is_qualified: false`, `qualification_tag: No califica` y `tags` incluye `No califica`. Para todos los estados se envían también `web-form` y `elevator-dental-web`.

**Límite importante:** `is_qualified: false` también aparece en `started` y `manual_review`. La condición de rechazo en GHL debe usar `lead_status == not_qualified` o el tag específico; no usar solo el booleano para decidir que alguien no califica.

### Datos anteriores a la activación

No se implementó una migración ni un reenvío retroactivo. Los datos nuevos se envían desde la activación; un lead anterior solo puede recuperarse si existe una fuente persistida o un registro que permita reconstruirlo. No prometer recuperación de datos que nunca se enviaron o guardaron.

La revisión de un contacto anterior mostró que el mismo contacto había pasado por capturas iniciadas, revisión manual y calificación usando el mismo email. No se encontró un evento histórico `not_qualified` en lo revisado. Eso no demuestra que todos los intentos anteriores hayan sido guardados.

## 4. Datos del webhook y atribución

### 4.1 Identidad y formulario

- Identidad: `name`, `full_name`, `first_name`, `last_name`, `firstName`, `lastName`, `email`, `phone`, `whatsapp`.
- Control: `lead_id`, `event_type`, `lead_status`, `is_qualified`, `qualification_tag`, `tags`, `score`, `lead_priority`, `source`, `qualification_summary`.
- Respuestas: `profile`, `specialty`, `city_country`, `currency`, `years_practicing`, `chairs`, `treatment_value`, `patients_goal`, `monthly_revenue`, `patient_sources`, `previous_marketing`, `frustration`, `has_website`, `website`, `in_house_lab`, `technology`, `decision_maker`, `decision_maker_attends`, `timeline`, `organic_expectation`.
- Algunas claves solo existen en el envío completado o según las respuestas. No asumir que un envío `started` contiene el brief completo.

### 4.2 Marketing y navegación

- UTMs: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`.
- Click IDs: `gclid`, `fbclid`, `ttclid`.
- Primer contacto: `first_touch_source`, `first_touch_landing_page`, `first_touch_date`.
- Último contacto: `last_touch_source`, `last_touch_landing_page`, `last_touch_date`.
- Identificadores: `external_id` estable por almacenamiento del visitante; `event_id` nuevo para cada envío.
- Meta: `fbp` y `fbc` cuando están disponibles; se puede derivar `fbc` de un `fbclid` real si no existe cookie.
- Contexto: `lead_lang`, `user_agent`, `landing_page_url`, `conversion_timestamp`, `pages_visited`, `device`, `ab_hero`.
- Enriquecimiento server-side: `client_ip`, `geo_country`, `geo_region`, `geo_city` desde Cloudflare y la petición.

### 4.3 Límites reales

- Primer/último contacto se conserva en almacenamiento local del navegador; páginas visitadas en almacenamiento de sesión.
- La navegación interna conserva la campaña. Una nueva campaña o un referente externo al cargar una nueva visita puede actualizar el último origen.
- Si el navegador bloquea o borra almacenamiento/cookies, parte de la atribución no persistirá. Esto no debe impedir el envío del lead.
- Click IDs, cookies y `ab_hero` pueden estar vacíos legítimamente. No inventar valores para completar campos.
- La geolocalización depende de disponibilidad y precisión de Cloudflare; no representa una dirección verificada de la clínica.
- `headers` del ejemplo de GHL son metadatos agregados por la plataforma receptora. No se fabrica ese bloque como si fueran datos del visitante.
- Capturar un `event_id` no significa haber conectado Meta CAPI, Google conversiones u otra plataforma de medición. Esas integraciones no se verificaron en este trabajo.

### 4.4 Limpieza solicitada y ya desplegada

Se eliminaron del payload comercial de Elevator:

- `sucursal_interes`
- `servicio_interes`
- `otro_servicio`
- `como_nos_conocio`
- `mensaje_lead` como alias redundante; la respuesta sigue en `frustration`.

El cliente deja de capturarlos y el worker los filtra incluso si llegan desde una sesión antigua. Los cuatro campos de interés/origen provenían del ejemplo de una web de clínica para pacientes y no corresponden a esta captación B2B de Elevator.

**No confundir esta limpieza con el onboarding:** el brief de un cliente sí necesita información de su clínica, sedes y servicios para construir su web. Se limpió el webhook comercial; no se eliminó esa información del brief de producción del cliente.

Los registros y notas anteriores en GHL no se reescribieron. El worker aún conserva una etiqueta heredada `commitment` en su diccionario de resumen; el formulario actual ya no envía esa pregunta. Es deuda de limpieza residual, no una pregunta activa.

## 5. GHL: configuración observada y pendientes

**Location:** `x0nGR8XQgQcKfNmKAhLj`.  
**Workflow revisado:** `Lead Form Calls - Elevator web`.  
**Workflow ID:** `83594a81-c628-4dbc-80f1-c7aa78d782cd`.

Flujo observado publicado:

1. Incoming webhook, sin filtros de entrada observados.
2. Crear/actualizar contacto: nombre, apellido, email, teléfono, source y campo `Elevator Lead Status`.
3. Añadir nota «Guardar respuestas de calificación», desde `Qualification Summary`.
4. Fin.

La nota se generó automáticamente durante la prueba. **No se creó manualmente para completar la evidencia.**

### Pendientes de configuración CRM

- [ ] Aplicar tags del webhook mediante acciones reales de GHL.
- [ ] Condicional explícita para `not_qualified` → tag `No califica`.
- [ ] Definir comportamiento de tags cuando el mismo contacto cambia de estado; retirar o conservar tags históricos según política explícita.
- [ ] Mapear score y prioridad a campos utilizables en vistas, filtros y asignación.
- [ ] Mapear UTMs, primer/último origen e identificadores necesarios a campos separados. Hoy se verificaron en notas, no en todos los custom fields.
- [ ] Definir propietario/responsable y orden de atención de leads calientes.
- [ ] Definir tratamiento de `manual_review` y formulario abandonado `started`.
- [ ] Comprobar duplicados, reintentos y orden de eventos para que un envío `started` tardío no pise una calificación final.
- [ ] Revisar la muestra de referencia del trigger: la observada era antigua y todavía contenía la pregunta eliminada. Actualizar con un payload actual si se necesitan nuevas variables de mapeo.
- [ ] Revisar qué registros antiguos pueden recuperarse; no hay backfill implementado.

No se modificó el workflow de GHL durante la inspección/prueba. No afirmar que los tags ya están aplicados: la ficha real del contacto de prueba los mostró vacíos.

## 6. Prueba real en producción

**Contacto ficticio:** `PRUEBA Elevator Web NO CONTACTAR 2157`.  
**Email:** `elevator-qa-20261006-2157@example.com`.  
**Teléfono de prueba:** `+12025550198`.  
**GHL contact ID:** `1CM3DPTW9Nvt5wYc8kcR`.  
**Ficha y notas:** https://app.theelevator.io/v2/location/x0nGR8XQgQcKfNmKAhLj/contacts/detail/1CM3DPTW9Nvt5wYc8kcR?view=notes

Datos elegidos: dueño/socio; implantes y odontología general; Bogotá, Colombia; menos de un año; un sillón; USD; tratamiento 1500–4000; facturación 10.000–25.000; pacientes deseados 1–3; referidos y Google; SEO y web nueva; sin web; laboratorio sí; CAD/CAM, escáner y tomógrafo; decide solo; menos de 30 días; expectativa orgánica «No».

Campaña de prueba: `utm_source=codex-test`, `utm_medium=qa`, `utm_campaign=elevator-webhook-e2e`, `utm_content=form-test`.

### Evidencia observada

- Captura inicial alrededor de 21:59 CST y nota final alrededor de 22:00 CST del 6 de octubre.
- Contacto encontrado por email exacto, estado final `qualified`.
- Nota final con **27 puntos** y **Alta · Lead caliente (menos de 30 días)**.
- Respuestas múltiples preservadas en especialidad, fuentes y tecnología.
- UTMs, primer y último origen, URLs/fechas, IDs de visitante/evento, dispositivo, navegador, IP y geo presentes en la nota.
- Navegación observada `/ → /fit-scan → /`: durante la prueba se visitó FitScan antes de regresar al formulario. No es un recorrido obligatorio del producto.
- País de conexión CR y clínica declarada en Colombia coexistieron correctamente como datos separados.
- «No» en expectativa orgánica no bloqueó la calificación.
- Calendario visible al finalizar. **No hubo reserva de cita.**
- Dos notas automáticas: captura inicial y formulario completado.
- Tags vacíos en el contacto: falta configurar su aplicación en GHL.

Esta prueba verificó un lead **comercial de Elevator**, no un paciente de una clínica. No demuestra recepción de cookies/click IDs reales de plataformas publicitarias ni funcionamiento post reserva.

Mantener este registro identificado como prueba; no incorporarlo a campañas ni seguimientos reales.

## 7. Build, despliegue y verificación técnica

**Producción:** https://elevator-dental-web.hi-22f.workers.dev  
**Hosting:** Cloudflare Workers con assets exportados por Next.js.  
**Última versión desplegada tras limpieza:** `4869b207-f53c-4c85-9900-b4f1f6a3ca68`.

La prueba real del formulario se hizo sobre la versión previa de atribución `b7ca4c97-8619-4430-9b9c-5562018009cb`. Después se desplegó la limpieza de campos de clínica; esa limpieza pasó pruebas automatizadas y build, pero no se repitió otra creación de contacto real después de ella.

Verificaciones ejecutadas:

- Tres pruebas automatizadas de atribución/worker aprobadas.
- Preservación primer/último origen y campaña al navegar internamente.
- Resistencia a almacenamiento bloqueado o malformado.
- Envío de los cuatro estados, tags calculados y agenda solo para `qualified`.
- IP, geolocalización y user agent tomados del servidor, no de valores falsificados del cliente.
- Filtrado de los campos retirados, incluso si el cliente los envía, y conservación de `frustration`.
- ESLint de archivos modificados y build de producción aprobados; el build completó comprobación TypeScript.

Archivos clave:

| Archivo | Función |
|---|---|
| `components/LeadForm.tsx` | Interfaz, validación, scoring y envío comercial |
| `lib/lead-attribution.ts` | Atribución en navegador |
| `components/LeadAttributionTracker.tsx` | Registro de visitas y navegación |
| `app/layout.tsx` | Montaje del tracker |
| `worker/index.ts` | API `/api/contact`, normalización, geo y webhook |
| `tests/lead-attribution.test.mjs` | Pruebas atribución y forwarding |
| `wrangler.jsonc` | Hosting y calendario |
| `app/onboarding/OnboardingForm.tsx` | Brief local de onboarding |
| `app/web-en-proceso/page.tsx` | Plantilla de estado de proyecto |
| `docs/email-bienvenida.md` | Borrador de bienvenida |
| `docs/manychat-flujos.md` | Especificación inicial de contenidos/DM |

`GHL_WEBHOOK_URL` es secreto del worker; no copiar su valor a documentos o repositorio. `GHL_CALENDAR_URL` está configurado. Comandos actuales: `node --test tests/lead-attribution.test.mjs`, `npm run build`, `npm run deploy`.

El checkout contiene numerosos cambios previos y archivos sin seguimiento. No existe aquí evidencia de un commit limpio de todo lo trabajado. Inspeccionar el diff antes de hacer commits; no agrupar indiscriminadamente cambios ajenos. Antes de modificar Next, leer las guías relevantes de `node_modules/next/dist/docs/` conforme a AGENTS.md.

## 8. Pendientes expresos: alcance y criterios de cierre

### 8.1 Video post agendamiento

**Estado:** pendiente. No confundir con VSL ni con video de bienvenida al cliente.

Objetivo: preparar al prospecto que ya reservó, reducir inasistencia y explicar qué sucederá en la llamada.

Entregables: guion, video terminado, subtítulos, portada, hosting/URL, página o bloque posterior a reserva y uso del enlace en confirmación/recordatorios. Contenido sugerido: agenda de la conversación, quién debe asistir, información a preparar, expectativas realistas y cómo reprogramar.

Cierre: reservar una cita de prueba y comprobar que aparece o se entrega el video correcto, que carga en móvil y que los enlaces de agenda/reprogramación funcionan. No está definido aún el responsable final de producción ni una fecha.

### 8.2 Proceso completo de onboarding

**Estado:** parcial en interfaz, pendiente como operación completa.

Existe `/onboarding` con tres etapas: clínica; pacientes; materiales y salida. Incluye identidad del contacto, clínica/ubicaciones, servicios prioritarios, paciente ideal, diferenciador, teléfonos, agenda, horarios, credenciales, carpeta de materiales, dominio, Google Business Profile y autorización.

**Limitación comprobada:** submit solo cambia el estado local; permite descargar JSON. No hay envío al equipo, persistencia server-side ni integración CRM en ese formulario. El propio mensaje de éxito lo reconoce.

Existe `/web-en-proceso`, pero es una plantilla estática: etapa inicial fija y sin estado individual de un cliente. No es un portal privado de seguimiento operativo.

Existe un borrador de email de bienvenida; no se verificó un servicio de envío activo. Su URL privada de seguimiento y correo de soporte siguen siendo variables por resolver. La referencia a video de siguientes pasos en ese borrador está asignada a Héctor; confirmar si será una pieza distinta del video post reserva.

Trabajo requerido:

- [ ] Definir el evento que inicia onboarding: cierre comercial, pago, contrato u otro aprobado.
- [ ] Conectar brief a backend con persistencia y manejo de errores/reintentos.
- [ ] Vincular contacto, cliente y proyecto sin mezclar paciente con prospecto B2B.
- [ ] Recoger materiales/accesos mediante invitaciones y carpetas; no contraseñas en formulario.
- [ ] Asignar responsable y checklist de datos faltantes.
- [ ] Confirmar recepción y enviar bienvenida cuando el proyecto realmente arranque.
- [ ] Crear seguimiento por proyecto con acceso adecuado y estados reales.
- [ ] Definir revisión, aprobación, publicación, entrega y soporte.
- [ ] Probar recorrido completo con cliente ficticio y recepción por el equipo.

Cierre: la información no depende de descargar manualmente un JSON; el equipo recibe el brief, puede recuperarlo y operar el proyecto de principio a fin.

### 8.3 Workflow post agendamiento con recordatorios y seguimientos

**Estado:** pendiente. El webhook del formulario no sustituye un evento de reserva.

Diseño recomendado por validar:

| Evento/condición | Acción esperada |
|---|---|
| Reserva creada en calendario correcto | Confirmación con fecha, hora, zona horaria, enlace y video |
| Antes de cita | Recordatorios en momentos/canales aprobados |
| Cita reprogramada | Cancelar esperas anteriores y programar según nueva hora |
| Cita cancelada | Detener recordatorios y ofrecer siguiente paso aprobado |
| Cita realizada | Registrar resultado y siguiente acción comercial |
| No-show | Seguimiento/reagenda según cadencia aprobada |
| Cliente ganado | Salir de seguimiento comercial e iniciar onboarding |
| No califica / revisión manual | Ruta propia; no mensajes que afirmen aprobación |

Pendientes: canales (email/WhatsApp/SMS), remitentes, textos, horarios, cadencias, responsable humano, pipeline, cancelación de esperas, exclusión de contactos de prueba y condiciones de salida. No se aprobaron números de recordatorios ni intervalos concretos.

Cierre: prueba real controlada de reserva, reprogramación, cancelación, asistencia y no-show; verificar que no quedan mensajes pendientes incorrectos ni envíos duplicados. La prioridad alta en una nota no equivale a una asignación operativa ya configurada.

### 8.4 Blog de posicionamiento en IA y Google

**Estado:** pendiente solicitado; en esta sesión no se auditó un blog editorial operativo.

Trabajo requerido: definir audiencia B2B, temas/pilares, intención de búsqueda, arquitectura de URLs, plantilla de artículo, autoría/fuentes, enlaces internos y CTA hacia el formulario comercial. Incorporar sitemap/canonical/metadatos/datos estructurados pertinentes y comprobar indexación. Publicar contenido útil y sustentado, sin prometer inclusión automática en respuestas de IA.

Medición propuesta: páginas indexadas, búsquedas y clics, conversiones por artículo, calidad del lead y atribución. Antes de implementar herramientas, verificar accesos y configuración actual.

Cierre: blog público navegable, primera tanda de artículos revisados y publicados, enlaces internos y medición comprobados. Cantidad de artículos, calendario y keywords todavía no acordados.

### 8.5 Video VSL

**Estado:** pendiente solicitado.

Objetivo: explicar la propuesta y conducir al formulario/agenda según calificación. Es distinto del video que se ve después de reservar.

Entregables: investigación y estructura, guion, oferta/CTA coherentes con la landing, pruebas/casos autorizados, grabación, edición, subtítulos, portada, hosting e integración responsive. Definir medición de reproducción y conversión sin confundir vistas con leads.

Cierre: video final publicado, reproducción verificada, CTA funcional y sin afirmaciones no sustentadas. Duración, formato, responsable y fecha pendientes.

### 8.6 Primera tanda de contenidos

**Estado:** pendiente solicitado; falta confirmar inventario de piezas ya producidas.

Trabajo requerido: calendario de Héctor, temas, formatos/canales, hooks, guiones, diseños/edición, captions, CTA, recursos y palabras clave, aprobación y publicación. Usar UTMs consistentes para enlazar resultados con leads en GHL.

Existe `docs/manychat-flujos.md`, una especificación, no flujos activos verificados. Ese documento todavía dice que CRM y URLs estaban pendientes; hoy ya existe GHL y una URL pública comercial. Reconciliar esa documentación al configurar, sin asumir que Manychat ya está conectado. El borrador atribuye a Zac la configuración de Manychat y a Héctor las piezas/calendario.

Cierre: tanda definida y aprobada, piezas terminadas/publicadas, CTA y recursos funcionales y trazabilidad comprobada hasta GHL. Volumen y fechas por definir.

## 9. Orden recomendado para continuar

1. **Cerrar integridad de CRM:** tags, campos, rutas de estados y prueba real de no calificado. Evita operar con datos que llegaron pero no se pueden filtrar.
2. **Cerrar reserva y post reserva:** evento de calendario, confirmación, video, recordatorios y seguimientos. Probar cita completa; hoy solo se vio el calendario.
3. **Conectar onboarding:** recepción/persistencia, bienvenida y seguimiento real de proyecto.
4. **Producir VSL y primera tanda:** coordinar oferta, CTA y assets con los flujos ya operativos.
5. **Construir el sistema editorial del blog:** arquitectura y publicación con medición.

La producción creativa puede avanzar mientras se cierran integraciones, pero publicar un CTA requiere que su destino esté conectado y probado. Este orden es una recomendación, no una nueva prioridad aprobada por el usuario.

## 10. Matriz mínima de pruebas restantes

- [ ] Lead no calificado por tratamiento bajo: llega a GHL, status correcto, tag aplicado, sin agenda.
- [ ] Lead no calificado por ingresos bajos o privados: mismo resultado.
- [ ] Lead explorando: rechazo y captura conservada.
- [ ] Perfil `Otro`: captura inicial y rechazo temprano registrados.
- [ ] Revisión manual por mercado y por decisor ausente: ruta humana, sin falsa aprobación.
- [ ] Lead válido 1–3 meses: +3 por plazo y prioridad normal.
- [ ] Lead caliente sin laboratorio/tecnología: prioridad alta sin requerir esos extras.
- [ ] Tecnologías: ninguna suma cero; múltiples suman una vez por opción.
- [ ] Expectativa orgánica sí/no: ambas aceptadas.
- [ ] Mismo email con nuevo envío: actualización, tags vigentes y notas consistentes.
- [ ] Browser con datos antiguos: no reintroduce campos retirados.
- [ ] Campaña nueva e interna: primer/último origen y páginas correctos.
- [ ] Reserva/reagenda/cancelación/no-show: automaciones reales y salidas correctas.
- [ ] Brief onboarding: recepción persistida, confirmación y seguimiento de proyecto.

## 11. Preguntas y decisiones que faltan

- ¿Los mercados actuales y la revisión manual deben permanecer como están?
- ¿Quién atiende leads calientes y con qué expectativa interna de respuesta?
- ¿Qué campos de GHL deben ser individuales y cuáles basta conservar en nota?
- ¿Cómo se actualizan tags si un contacto cambia de estado?
- ¿Qué canal/cadencia se aprueba para recordatorios y seguimiento?
- ¿Qué evento comercial habilita onboarding y quién recibe materiales?
- ¿Quién produce cada video y cuándo se entregan?
- ¿Cuántas piezas/artículos integran la primera tanda y en qué canales?
- ¿Qué datos anteriores existen realmente para recuperar y desde qué fuente?

## 12. Cómo mantener este documento

Actualizar este mismo archivo cuando haya avances. Para cada cierre registrar fecha, responsable confirmado, entorno/URL, evidencia de prueba y pendiente residual. No marcar como terminado un flujo por tener solo copy, una pantalla o un campo en el JSON.

### Registro de actualización

| Fecha | Cambio | Evidencia / límite |
|---|---|---|
| 2026-10-06 | Reglas de calificación y especialidad múltiple | Código de LeadForm actualizado |
| 2026-10-06 | Captura de todos los estados y atribución | Pruebas worker/atribución y despliegue |
| 2026-10-06 | Prueba de lead real de QA | Contacto GHL con 27 puntos/prioridad alta; tags vacíos |
| 2026-10-06 | Limpieza de campos heredados de clínica | Tests aprobados y versión `4869b207-f53c-4c85-9900-b4f1f6a3ca68` |
| 2026-10-06 | Traspaso de hechos y pendientes | Este documento; sin activar nuevos workflows ni mensajes |
