'use strict';
// Drafts are chosen and edited by the clinic; they never supply unverified facts.
const answerSuggestions={
'01.01':[
['Tenemos la marca lista','El nombre que debe aparecer es BE SMILE. Compartimos el logo y los colores oficiales en los archivos o enlaces de este punto. Redes oficiales: [añadir enlaces].'],
['Tenemos logo, sin manual','El nombre que debe aparecer es BE SMILE. Tenemos el logo, pero no un manual de marca. Adjuntamos las versiones disponibles y referencias de los colores que usamos. Redes oficiales: [añadir enlaces].'],
['Necesitamos reunir los archivos','El nombre que debe aparecer es BE SMILE. Estamos reuniendo el logo original, los colores y los enlaces oficiales de redes. Dejamos pendiente la entrega de esos archivos.']],
'01.02':[
['Completar una ficha','Dirección de nuestra única sede: [calle, número, colonia, ciudad, estado y código postal]. Google Maps: [enlace]. Horario de atención: [días y horas]. Teléfono: [número]. WhatsApp: [número con código de país]. Horario de respuesta: [días y horas].'],
['La información está en un documento','Compartimos la ficha de contacto en los archivos o enlaces de este punto. Incluye dirección, Google Maps, horarios, teléfono y WhatsApp de nuestra única sede. Pendiente de confirmar: [indicar datos o escribir ninguno].'],
['Confirmar antes de publicar','Estamos confirmando la dirección, los horarios y los números que se publicarán. Compartimos aquí la información que ya tenemos: [datos confirmados]. Lo restante queda pendiente.']],
'01.03':[
['Atención local en español','Correo público: [correo]. Atendemos principalmente pacientes de [ciudad y zonas cercanas]. Idioma de atención confirmado: español.'],
['Atención en varios idiomas','Correo público: [correo]. Zonas de atención: [ciudades o barrios]. Idiomas confirmados: [idiomas]. Los siguientes dependen de la disponibilidad de un profesional: [idiomas y condiciones].'],
['Datos pendientes de confirmar','Correo público: [confirmar]. Zonas de atención: [confirmar]. Idiomas en los que podemos atender realmente: [confirmar con el equipo].']],
'02.01':[
['Familias y atención general','BE SMILE abrió en [año] con la idea de [motivo real de su creación]. Nuestra historia breve: [resumen]. Atendemos principalmente a familias que buscan [necesidades habituales que realmente atendemos].'],
['Pacientes de tratamientos específicos','BE SMILE abrió en [año]. La clínica nació a partir de [historia real]. Nuestros pacientes principales buscan [tratamientos o necesidades]. Suelen llegar a consulta por [motivos frecuentes].'],
['Contarlo con una nota de voz','Voy a compartir una nota de voz con la historia de BE SMILE, el año de apertura y los pacientes que atendemos. Elevator puede preparar un borrador a partir de ese relato para que lo revisemos.']],
'02.02':[
['Enfoque en trato y acompañamiento','Proponemos destacar, si nuestro equipo lo confirma: 1. Explicaciones claras. 2. Trato cercano. 3. Acompañamiento durante el tratamiento. Respaldo real de cada punto: [ejemplos de cómo lo hacemos]. Tratamientos prioritarios: [lista en orden].'],
['Enfoque en experiencia y recursos','Nuestros tres diferenciadores propuestos son: [experiencia del equipo], [proceso de atención] y [tecnología realmente disponible]. Evidencia de cada uno: [detalle]. Tratamientos prioritarios: [lista en orden].'],
['Ayuda para redactarlos','Preferimos que Elevator proponga la redacción de los diferenciadores a partir de nuestros datos reales. Lo que los pacientes valoran de BE SMILE es: [ejemplos o comentarios]. Tratamientos que queremos destacar: [lista].']],
'02.03':[
['Tenemos cifras verificadas','Apertura de la clínica: [año]. Cifra que queremos mostrar: [cantidad y si son pacientes únicos, consultas o tratamientos]. Período: [fechas]. Fecha de corte: [fecha]. Fuente o forma de cálculo: [registro].'],
['Mostrar solo años de trayectoria','Preferimos mostrar únicamente los años de trayectoria que podemos verificar. Apertura de BE SMILE: [año confirmado]. No queremos publicar cantidades de pacientes sin revisar nuestros registros.'],
['No publicar cifras todavía','Por ahora preferimos no mostrar cifras de experiencia o pacientes. Podemos incluirlas después de verificar los registros, el período y la fecha de corte.']],
'02.04':[
['Valoración con precio fijo','La primera valoración cuesta [importe] MXN. Incluye: [detalle confirmado]. Se cobran aparte: [estudios u otros conceptos]. El importe no se descuenta del tratamiento [confirmar antes de publicar].'],
['Valoración con descuento posterior','La primera valoración cuesta [importe] MXN e incluye [detalle]. Estudios aparte: [detalle]. Se descuenta del tratamiento bajo estas condiciones: [condiciones y plazo confirmados].'],
['Confirmar condiciones de valoración','Antes de publicar, necesitamos confirmar el precio de la valoración, lo que incluye, los estudios que se cobran aparte y si existe un descuento posterior. Información confirmada hasta ahora: [detalle].']],
'03.01':[
['Completar por profesional','Nombre completo: [nombre]. Cargo: [cargo]. Especialidad: [especialidad confirmada]. Tratamientos que realiza en BE SMILE: [lista]. Fotografía: [nombre del archivo o enlace]. Repetiremos esta ficha por cada integrante.'],
['Compartir fichas existentes','Adjuntamos las fichas actuales y fotografías del equipo. Cada archivo está identificado con el nombre del profesional. Falta confirmar o actualizar: [datos pendientes].'],
['Reunir las fichas del equipo','Estamos reuniendo los nombres, cargos, especialidades, tratamientos y fotografías de cada integrante que aparecerá en la web. Material disponible por ahora: [detalle].']],
'03.02':[
['Completar formación y cédula','Profesional: [nombre]. Universidad: [institución]. Título: [título]. Especialidades: [especialidades acreditadas]. Cédulas o registros: [números correspondientes]. Documentos o enlaces oficiales: [adjuntar].'],
['Compartir documentación','Adjuntamos la documentación de formación y registros profesionales, identificada por nombre. Datos autorizados para la web: [lista]. Pendiente de validar: [detalle o ninguno].'],
['Verificar con cada profesional','Necesitamos confirmar con cada profesional su universidad, títulos, especialidades y números de cédula o registro. Hasta verificarlos, no deben publicarse esos datos como definitivos.']],
'03.03':[
['Biografía con cifras respaldadas','Profesional: [nombre]. Inicio de su experiencia: [año]. Hitos principales: [hechos verificables]. Pacientes propios atendidos: [cantidad], durante [período], con corte en [fecha]. Fuente: [registro].'],
['Biografía sin número de pacientes','Preferimos una biografía sin cantidades de pacientes. Profesional: [nombre]. Experiencia desde [año confirmado]. Formación y principales hitos de su trayectoria: [detalle].'],
['Redactar a partir de un relato','Compartiremos un texto o audio de cada profesional sobre su trayectoria. Elevator puede convertirlo en una biografía para nuestra revisión. Las cifras quedan pendientes hasta verificar los registros.']],
'03.04':[
['Foto y video disponibles','Tenemos una fotografía actual del equipo y un video del fundador. Compartimos los archivos o enlaces aquí. Personas que aparecen y sus cargos: [lista]. El video comunica: [resumen].'],
['Solo fotografía del equipo','Tenemos una fotografía actual del equipo y la compartimos aquí. Personas que aparecen y cargos: [lista]. No contamos actualmente con un video de presentación del fundador.'],
['Fotografía pendiente','Estamos coordinando una fotografía actual del equipo. Material disponible: [detalle]. Sobre el video del fundador: [indicar si ya existe o si no tenemos uno].']],
'04.01':[
['Completar el catálogo','Tratamientos actuales y variantes: [lista completa]. Profesional que realiza cada uno: [relación]. Prioridad para atraer pacientes: [orden]. Mayor enfoque y rentabilidad para la clínica: [servicios confirmados].'],
['Usar nuestro catálogo existente','Compartimos el catálogo completo en un archivo o enlace. Incluye servicios, variantes y profesionales. Queremos priorizar: [lista en orden]. Mayor enfoque y rentabilidad: [detalle]. Servicios desactualizados que deben excluirse: [lista o ninguno].'],
['Revisar el catálogo con el equipo','Necesitamos revisar el catálogo para incluir todos los tratamientos y variantes que ofrecemos actualmente. Lista confirmada por ahora: [servicios]. Profesionales y prioridades pendientes: [detalle].']],
'04.02':[
['Completar por tratamiento','Tratamiento: [nombre]. Problema que atiende: [detalle]. Paciente para el que está indicado: [perfil]. Beneficios respaldados: [lista]. Expectativas y límites: [detalle]. La opción se define mediante valoración en estos casos: [casos]. Pendiente de validación clínica.'],
['Partir de material clínico existente','Compartimos las explicaciones actuales de nuestros tratamientos para adaptarlas a un lenguaje claro. Beneficios y límites que el equipo confirma: [detalle por tratamiento]. La redacción final requiere revisión clínica.'],
['Preparar un borrador con el profesional','Preferimos que Elevator prepare las explicaciones a partir de lo que compartiremos en texto o audio por tratamiento. El profesional debe validar indicaciones, beneficios, expectativas y límites antes de publicarlas.']],
'04.03':[
['Completar las etapas','Tratamiento: [nombre]. Etapas: [pasos]. Citas aproximadas: [rango validado]. Duración y recuperación: [rangos]. Cuidados: [indicaciones del profesional]. Materiales: [detalle]. Factores que cambian los tiempos: [factores]. Para implantes, detallar cicatrización, destape y corona.'],
['Compartir protocolos actuales','Adjuntamos los protocolos o explicaciones que usamos con los pacientes. Deben revisarse para incluir etapas, citas, rangos de tiempo, cuidados y materiales de cada tratamiento. En implantes, aclararemos cada fase y las opciones de corona.'],
['Confirmar tiempos con el profesional','Necesitamos que el profesional confirme los tiempos, citas, cuidados y materiales por tratamiento. No queremos publicar duraciones únicas ni instrucciones clínicas sin su revisión. Datos confirmados por ahora: [detalle].']],
'04.04':[
['Compartir el tarifario completo','Adjuntamos el tarifario vigente de todos los tratamientos y variantes. Cada fila debe indicar precio en MXN, unidad de cobro, inclusiones, extras y sus precios, vigencia y forma autorizada de publicación. Pendiente de completar: [columnas o escribir ninguno].'],
['Completar una tabla de precios','Tratamiento y variante | Precio o rango MXN | Unidad | Qué incluye | Extras y precio | Vigente desde | Publicar fijo, desde o según valoración.\n[Completar una fila por cada servicio disponible; no omitir variantes].\nFactores que modifican costos: [detalle por tratamiento].'],
['Reunir y revisar los precios','Estamos reuniendo los precios de todos los servicios y variantes, incluidos componentes que se cobran aparte. Antes de publicarlos, confirmaremos vigencia, inclusiones y forma de mostrar cada precio. Tarifas disponibles por ahora: [adjuntar o detallar].']],
'04.05':[
['Completar las dudas reales','Tratamiento: [nombre]. Duda real 1: [pregunta]. Respuesta aprobada: [respuesta]. Duda real 2: [pregunta]. Respuesta aprobada: [respuesta]. Duda real 3: [pregunta]. Respuesta aprobada: [respuesta]. Repetir por tratamiento, sin identificar a pacientes.'],
['Revisar dolor, tiempos y cuidados','Para cada tratamiento revisaremos si las dudas reales más frecuentes son sobre molestias, duración y cuidados. Preguntas que recibimos realmente: [tres por tratamiento]. Respuestas del profesional: [completar]. No publicar hasta su validación.'],
['Reunirlas con recepción y clínica','Vamos a reunir las preguntas que recepción y el equipo clínico reciben con mayor frecuencia. Entregaremos tres dudas reales y sus respuestas aprobadas por cada tratamiento, con ejemplos anónimos cuando ayuden.']],
'04.06':[
['Completar pagos y dos paquetes','Métodos de pago confirmados: [lista]. Financiamiento, proveedor y condiciones: [detalle o indicar que no ofrecemos]. Paquete 1: [nombre, tratamiento, beneficio, precio MXN, inclusiones, vigencia y condiciones]. Paquete 2: [mismos datos]. Restricciones: [detalle].'],
['Compartir promociones existentes','Adjuntamos al menos dos paquetes de promociones vigentes y los métodos de pago. Debemos confirmar precios regulares y promocionales, inclusiones, restricciones, vigencia y condiciones de financiamiento antes de publicarlos.'],
['Preparar los paquetes con la clínica','Aún debemos definir o confirmar dos paquetes promocionales. Tratamientos que queremos considerar: [lista]. Métodos de pago actuales: [lista]. Precios, beneficios, inclusiones y condiciones quedan pendientes de aprobación de la clínica.']],
'05.01':[
['Completar el inventario','Equipos y tecnologías disponibles dentro de BE SMILE: [nombre, marca y modelo de cada uno]. Software utilizado en diagnóstico, planificación o tratamiento: [nombre y uso]. Datos pendientes: [detalle o ninguno].'],
['Identificar con fotos y documentos','Compartimos fotos de los equipos y sus etiquetas o fichas para identificar nombre, marca y modelo. Software relevante: [lista]. Necesitamos confirmar estos modelos: [detalle].'],
['Inventario por revisar','Necesitamos revisar los equipos y tecnologías que realmente tenemos en la clínica. Inventario confirmado por ahora: [lista]. No presentar equipos de proveedores externos como propios.']],
'05.02':[
['Completar equipo y beneficio','Equipo o tecnología: [nombre]. Se usa para: [tratamientos]. Beneficio concreto y respaldado para el paciente: [detalle]. Disponibilidad: [propio de BE SMILE o proveedor externo]. Validación del profesional: [pendiente o confirmada].'],
['Distinguir recursos internos y externos','Recursos propios: [lista y tratamientos]. Recursos de laboratorio o proveedor externo: [lista y tratamientos]. Beneficios que el profesional confirma para cada recurso: [detalle].'],
['Ayuda para explicar los beneficios','Compartiremos cómo utilizamos cada equipo para que Elevator proponga una explicación sencilla. El profesional validará los beneficios y aclarará qué servicios se hacen fuera de la clínica. Información disponible: [detalle].']],
'05.03':[
['Marcas y fotografías disponibles','Marcas de implantes: [lista]. Alineadores: [lista]. Materiales principales: [lista]. Compartimos fotos originales identificadas por equipo o material. Material de fabricantes autorizado: [detalle y respaldo del permiso, si aplica].'],
['Fotos reales pendientes','Marcas confirmadas de implantes, alineadores y materiales: [lista]. Todavía debemos tomar o reunir fotografías reales. Material que ya podemos compartir con derecho de uso: [detalle].'],
['Confirmar marcas y permisos','Necesitamos confirmar las marcas utilizadas y qué imágenes podemos publicar. No deben utilizarse fotografías de fabricantes sin autorización de uso. Información confirmada hasta ahora: [detalle].']],
'06.01':[
['Fotos listas para compartir','Compartimos entre 6 y 10 fotos originales de fachada, recepción, consultorios e instalaciones, identificadas por espacio. Incluimos tomas horizontales para adaptar la web a móvil. Material que falta: [detalle o ninguno].'],
['Tenemos algunas fotos','Compartimos las fotografías originales disponibles. Espacios cubiertos: [lista]. Aún faltan: [lista]. Reuniremos las tomas restantes para completar entre 6 y 10 imágenes.'],
['Necesitamos tomar las fotografías','Todavía necesitamos tomar fotos actuales de la clínica. Prepararemos entre 6 y 10 imágenes de fachada, recepción, consultorios e instalaciones, preferentemente horizontales y en buena resolución.']],
'06.02':[
['Imágenes y videos existentes','Compartimos una imagen por tratamiento y los videos explicativos que ya existen. Cada archivo está identificado con el servicio. Derechos de uso confirmados: [detalle]. Material pendiente: [detalle o ninguno].'],
['Imágenes sin videos','Compartimos las imágenes disponibles por tratamiento. Actualmente no tenemos videos explicativos para esos servicios. Derechos de uso de las imágenes: [confirmar]. Imágenes que faltan: [lista].'],
['Organizar el material existente','Necesitamos reunir y organizar las imágenes por tratamiento y comprobar qué videos explicativos ya existen. Material disponible por ahora: [detalle]. Confirmación del derecho de uso: [pendiente o detalle].']],
'06.03':[
['Casos listos y autorizados','Compartimos [cantidad] casos reales por tratamiento, con antes y después del mismo caso, procedimiento y breve explicación. Adjuntamos la autorización firmada correspondiente a cada caso. Servicios cubiertos: [lista].'],
['Casos disponibles parcialmente','Tenemos casos de estos tratamientos: [lista y cantidad por tratamiento]. Compartimos los que tienen autorización firmada. Falta reunir material o autorizaciones de: [detalle]. Buscaremos al menos 3 casos por tratamiento, idealmente 6.'],
['Casos aún por reunir','Necesitamos seleccionar y organizar los casos reales por tratamiento. Prepararemos antes y después, explicación y autorización firmada por caso. No deben publicarse imágenes de pacientes sin esa autorización.']],
'06.04':[
['Google y testimonios propios','Enlace original de reseñas de Google: [enlace]. Compartimos de 3 a 5 testimonios propios con su fuente. Nombre o identificación autorizada de cada uno: [detalle]. Videos disponibles: [enlaces o indicar que no hay].'],
['Solo reseñas de Google por ahora','Enlace original de reseñas de Google: [enlace]. Por ahora no contamos con testimonios propios o videos listos para entregar. Debemos revisar qué contenido e identificación se pueden utilizar antes de publicarlo.'],
['Testimonios pendientes de reunir','Estamos reuniendo el enlace de Google y los testimonios que queremos mostrar. Solo entregaremos testimonios reales, con fuente y autorización para la identificación o imagen que se publique. Material disponible: [detalle].']],
'06.05':[
['Autorizaciones firmadas disponibles','Adjuntamos las autorizaciones firmadas y los derechos de uso correspondientes al material entregado. Cada documento está vinculado a su foto, caso o testimonio. Material autorizado: [lista]. Restricciones de uso: [detalle o ninguna].'],
['Solo parte del material autorizado','Tenemos autorización firmada para: [lista]. Falta autorización o confirmar derechos de uso de: [lista]. Solo el material con autorización correspondiente puede considerarse para publicación.'],
['Autorizaciones pendientes','Todavía debemos reunir las autorizaciones firmadas o confirmar los derechos de uso. El material de pacientes queda pendiente y no debe publicarse mientras falte su autorización para uso público.']],
'07.01':[
['Confirmamos por WhatsApp','Las solicitudes deben llegar al WhatsApp [número con código de país]. Las recibe [persona o cargo]. Actualmente confirmamos las citas mediante [proceso]. Datos necesarios del paciente: [lista]. Correo alternativo, si aplica: [correo].'],
['Confirmamos por correo o teléfono','Las solicitudes deben llegar a [correo o teléfono]. Las recibe [persona o cargo]. Agendamos y confirmamos mediante [proceso actual]. Datos necesarios del paciente: [lista]. WhatsApp de contacto, si aplica: [número].'],
['Usamos una agenda existente','Actualmente usamos [nombre de la agenda o forma de registro]. Las solicitudes llegan a [WhatsApp o correo] y las recibe [persona o cargo]. Para confirmar pedimos [datos] y seguimos estos pasos: [proceso].']],
'07.02':[
['Documentos vigentes disponibles','Adjuntamos el aviso de privacidad y las condiciones vigentes de citas, cancelaciones y pagos, aprobados por la clínica. Razón social: [nombre legal]. Domicilio: [dirección]. Responsable y correo de privacidad: [datos]. Fecha o versión: [detalle].'],
['Documentos por actualizar','Tenemos documentos de privacidad y condiciones, pero necesitan revisión o actualización. Adjuntamos las versiones disponibles. Datos legales confirmados: [razón social, domicilio y responsable/correo de privacidad]. Cambios pendientes: [detalle].'],
['Documentos pendientes de preparar','Todavía debemos reunir los datos legales y los documentos aprobados de privacidad, citas, cancelaciones y pagos. Datos confirmados por ahora: [detalle]. Avisos y condiciones quedan pendientes de revisión antes de publicarse.']],
'07.03':[
['Documento disponible','Compartimos copia del permiso o aviso de publicidad aplicable a nuestra actividad. Tipo de documento: [indicar]. Folio: [número]. Estado y fecha: [detalle]. Responsable que confirmó su aplicación: [nombre o cargo].'],
['Trámite en proceso','El documento de publicidad está en trámite o revisión. Persona que lo gestiona: [nombre o cargo]. Estado actual: [detalle]. Folio, si existe: [número]. Compartiremos copia cuando esté disponible.'],
['Necesitamos confirmar qué corresponde','Necesitamos confirmar qué permiso o aviso aplica a nuestra actividad y si la clínica cuenta con él. Persona que revisará o gestionará el trámite: [nombre o cargo]. Consultaremos las rutas oficiales indicadas en el PDF.']]
};
