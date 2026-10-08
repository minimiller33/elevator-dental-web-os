# DrDiente Roma Norte — arquitectura web, conversión, SEO local y GEO

> Documento de referencia para un agente que construya la web de BE SMILE. Auditado el 8 de octubre de 2026. La fuente de datos de BE SMILE sigue siendo `be-smile-brief-web.md`; este documento explica una referencia de arquitectura y sus límites. No autoriza copiar datos clínicos, precios, credenciales, reseñas, imágenes ni identidad de DrDiente.

## 1. Identidad, fuentes y alcance real

**Referencia principal:** https://clinicadrdiente-romanorte.com/.

**Repositorio principal localizado en Documentos:** `/Users/cashkade/Documents/PROGRAMACION/DR DIENTE ROMA`. Último commit observado: `517191b`, 2026-10-08. Tiene cambios locales previos, entre ellos equipo, configuración de despliegue e IndexNow. El análisis lee ese estado sin modificarlo.

**Antecedente compartido:** `/Users/cashkade/Documents/PROGRAMACION/DR DIENTE`, publicado en https://www.clinicadrdiente.com/. Allí todavía conviven Polanco y Roma Norte. Su landing `/dentista-roma-norte` y sus métricas históricas ayudan a entender la evolución; no son el mismo sitio que el dominio independiente de Roma.

Se revisaron router, catálogo publicado, plantillas, portada de Roma, componentes visuales, contacto, agenda, precios, ofertas, turismo, blog, reputación, datos de sucursal, prerender, generación de sitemap, robots, canonical, idioma, JSON-LD, archivos para IA, atribución, endpoint de leads, conversiones y automatización de despliegue. Se rastrearon **las 54 URLs del sitemap de Roma y las 72 landings de campaña**, además de rutas auxiliares. Se contrastó el antecedente mediante sus **276 URLs de sitemap** y un informe histórico de Search Console guardado en el repositorio.

La revisión del HTML de todas las URLs comprueba metadatos, encabezados, enlaces declarados y JSON-LD. No equivale a probar cada combinación interactiva, cada archivo multimedia ni cada procedimiento clínico. No se enviaron formularios, mensajes ni conversiones reales durante esta auditoría. No se modificaron las webs.

### Niveles de evidencia

- **Publicado:** respuesta HTTP/HTML actual, contrastada con el navegador cuando se indica.
- **Implementado:** existe en el código local; puede diferir de producción.
- **Histórico:** informe o prueba anterior con fecha y alcance propios.
- **Interpretación:** explicación de por qué un patrón puede ayudar; no demuestra causalidad ni aumento de ventas.
- **Pendiente:** requiere acceso a métricas, validación de la clínica o pruebas adicionales.

**Conclusión:** es una referencia fuerte por su combinación de intención local, presentación premium, material audiovisual, catálogo de servicios, precios, contenido educativo y captura de contactos. La conversión rentable de Roma y su presencia en respuestas de IA no están demostradas por este análisis. Además, hay inconsistencias que BE SMILE debe evitar.

## 2. Arquitectura completa del sitio independiente

### 2.1 Stack y publicación

| Capa | Implementación observada | Función |
|---|---|---|
| UI | React 19, React Router 7 | Componentes y navegación entre rutas |
| Build | Vite 6 | Compilación y separación de recursos |
| Estilos | Tailwind 3.4.17 + CSS propio | Tokens, composición y adaptación responsive |
| Movimiento | GSAP 3.15, `@gsap/react`, ScrollTrigger | Revelados, botones, acordeones, carruseles |
| Efecto visual | Three.js 0.186 | Rastro de cursor en bloque de confianza |
| Iconos | Lucide React | Señales de teléfono, mapa, agenda, tecnología |
| HTML rastreable | Prerender con Puppeteer | HTML por URL generado antes de publicar |
| Hosting/API | Vercel | Archivos estáticos y endpoints serverless |
| Analítica | dataLayer/GTM, Meta, OpenAI Ads, Vercel Analytics | Instrumentación y atribución; activación real depende de configuración |
| CRM | `/api/lead` → receptor Roma en Elevator/GHL | Captura y entrega del contacto |
| CI/CD | GitHub Actions | Pruebas, build y despliegue a proyecto independiente |

**No es Next.js ni SSR por petición.** Es React/Vite con HTML prerenderizado y posterior ejecución del cliente. Crear HTML útil en el build ayuda a que el contenido esencial exista antes de que un visitante o crawler ejecute JavaScript.

### 2.2 Catálogos y cantidad de rutas

El router y el catálogo efectivo importan más que los archivos heredados que todavía existen:

- `src/App.jsx`: monta `RomaHome`, un alias del componente `DentistaRomaNorte`, en `/`.
- `src/data/staticRoutes.js`: **41 rutas estáticas**.
- `src/data/publishedPosts.js`: **13 artículos publicados**, 7 en español y 6 en inglés. Importa lotes generados y añade la guía de visita.
- `src/data/posts.js` y lotes históricos: conservan contenido heredado para revisión; su mera presencia no implica publicación en Roma.
- `src/data/campaignLandings.js`: catálogo compartido del que Roma selecciona **72 landings** mediante `sucursal === 'Roma Norte'`.
- Total esperado del prerender local: **127 rutas = raíz + 41 estáticas + 13 artículos + 72 landings**.
- Sitemap público: **54 URLs = raíz + 40 estáticas indexables + 13 artículos**. `/agenda-roma` se excluye; las campañas también.
- `/simulador-sonrisa`: prototipo accesible por rewrite; fuera del sitemap y del prerender.
- `/terminos`: alias declarado en React, sin página estática equivalente en el catálogo. No asumir que un alias de router existe al entrar por HTTP directo.

### 2.3 Familias de páginas y propósito

| Familia | Rutas/ejemplos | Intención |
|---|---|---|
| Principal local | `/`, `/dentista-roma-norte` | Ubicación + propuesta + confianza + solicitud de cita |
| Tratamientos ES/bilingües | 14 páginas, desde `/diseno-de-sonrisa` hasta `/muelas-del-juicio` | Entender un servicio y pasar a valoración |
| Precios y ofertas | `/precios`, `/ofertas` | Comparar coste, inclusiones y promociones |
| Institucional | `/nosotros`, `/about`, `/tecnologia`, `/antes-despues` | Equipo, instalaciones, proceso y resultados |
| Contacto y agenda | `/contacto`, `/contact`, `/agendar-cita`, `/agenda-roma` | Captura del contacto y continuación por WhatsApp |
| Turismo | `/turismo-dental` y 7 páginas de servicios en inglés | Paciente internacional, tiempos, logística y consulta |
| Blog | `/blog-drdiente` + 13 artículos | Consultas informativas y decisiones previas al tratamiento |
| Reputación | `/reviews` + 3 páginas por tratamiento | Experiencias organizadas por servicio |
| Legal | `/aviso-de-privacidad`, `/privacy`, `/terminos-y-condiciones` | Información legal y del tratamiento de datos |
| Campañas | 72 URLs `/lp/…` | Correspondencia anuncio → tratamiento → agenda Roma |
| Auxiliar | `/llms.txt`, `/llms-full.txt` | Referencia textual y navegación para herramientas |

El mapa completo de URLs publicadas se incluye al final. La estructura efectiva no incluye `/dentista-polanco` aunque el archivo JSX heredado aún exista.

## 3. La portada de Roma, bloque por bloque

Fuente principal: `src/pages/DentistaRomaNorte.jsx`; montaje en `src/App.jsx`. Esta misma página se monta tanto en `/` como en `/dentista-roma-norte`.

### 3.1 Cabecera

Logo, navegación principal, tratamientos desplegables, turismo dental, precios, ofertas, nosotros, blog, selector de idioma y CTA de agenda. En el dominio Roma desaparece el selector principal de sucursales. La cabecera sirve a quien ya sabe qué necesita, sin exigir recorrer toda la portada.

El idioma inicial es **inglés por decisión explícita del código**, con preferencia ES/EN persistida en `localStorage`. No depende de una detección automática del país. La mayoría del HTML del sitemap también sale en inglés. Para BE SMILE, el idioma inicial debe seguir su público y brief, no copiar este ajuste por inercia.

### 3.2 Acceso rápido a tratamientos bajo la cabecera

`TreatmentQuickLinks.jsx`: carrusel horizontal de chips para implantes, diseño, carillas, alineadores, All-on-4, All-on-6, bichectomía, muelas y Airflow. Aparece en home y turismo. Tiene desplazamiento táctil, flechas, foco visible, controles de al menos 44 px y evento `treatment_quick_link_click`.

**Razón de diseño:** una decisión sencilla por necesidad clínica lleva inmediatamente a una página concreta. El catálogo no queda enterrado debajo de los bloques de marca.

**Detalle a corregir:** All-on-6 apunta a `/protesis-hibrida-all-on-4`; hay una página All-on-6 en inglés, pero el chip no llega a ella. Airflow comparte limpieza dental; carillas comparte diseño. Estas agrupaciones necesitan títulos y contenido que expliquen la relación.

### 3.3 Hero local

- Fondo de video `hero-roma.mp4`, autoplay, muted, loop y playsInline.
- Gradientes oscuros que protegen la lectura; imagen poster como alternativa inicial.
- Eyebrow de Roma Norte/CDMX y breadcrumb.
- H1 visible por defecto: “Dentist in Roma Norte.”; equivalente español “Dentista en Roma Norte.”.
- Dirección Monterrey 147 dentro de la propuesta.
- Beneficios compactos: lunes a sábado, tomografía en valoración, Straumann, CEREC.
- CTA principal de consulta, secundario hacia tratamientos.
- Reputación local mostrada: 4.9 y 58 reseñas de Roma.

**Qué aporta:** identifica servicio, lugar y siguiente acción antes del scroll. Las marcas tecnológicas son pruebas de infraestructura, no garantías de resultado clínico.

**Qué vigilar:** el video local pesa aproximadamente 3.9 MiB y sigue configurado para reproducirse en móvil en esta portada. El `Hero.jsx` genérico tiene otra lógica de poster móvil, pero **no es el hero montado en `/` de Roma**. No confundir un componente heredado con una optimización activa.

### 3.4 Tecnología y flujo digital

`ScrollVideoSection.jsx`: franja/carrusel visual de escaneo iTero, laboratorio digital, CAD/CAM CEREC y cirugía guiada. Relaciona la propuesta premium con equipos y procesos reconocibles. En Roma se ajustan mensajes para hablar de atención local en vez de depender exclusivamente de cifras de otra sede.

Para reutilizar: cada tecnología debe explicar el beneficio observable para el paciente y estar confirmada para la clínica. Evitar una pared de logos sin contexto.

### 3.5 Instalaciones y diferenciadores

`WhyDrDiente.jsx`: título editorial, fotos de espacios y contexto de la clínica boutique. El bloque ayuda al paciente a imaginar la visita. Los retratos e instalaciones tienen más valor de confianza que imágenes dentales genéricas.

En BE SMILE: utilizar fotografías propias y mostrar una sola sede. Confirmar qué imágenes representan su consultorio y qué servicios se realizan realmente allí.

### 3.6 Testimonios en video

`VideoTestimonials.jsx`: pacientes, ubicación, tratamiento, poster y reproducción bajo interacción. El catálogo tiene perfiles nacionales e internacionales; no todas las entradas necesariamente aparecen en cada vista porque el componente selecciona destacados.

**Aporte probable:** prueba social con rostro y relato, útil para quienes sienten miedo o evalúan viajar. **Límite:** el catálogo procede de la marca; la auditoría no demuestra que cada testimonio corresponda a atención en Roma. Identificar la sede y autorización de uso antes de atribuirlo.

### 3.7 Presentación del fundador

`TourismFounderVideo.jsx`, reutilizado dentro de la portada: rostro del Dr. Carlos Ariza, video de 1:22 min en inglés, formación publicada, enlaces a trayectoria y agenda. Humaniza el tratamiento antes de presentar todo el catálogo.

Este es el bloque activo; el `DoctorSection.jsx` genérico y el `Home.jsx` heredado no determinan por sí solos la composición de la portada actual. El equipo completo aparece en páginas institucionales; su archivo tiene cambios locales previos que no se deben asumir publicados sin contraste.

### 3.8 Catálogo de tratamientos

`TreatmentsSection.jsx`: tarjetas de servicios con visual, título, resumen y destino. La portada muestra una selección comercial, mientras las rutas específicas y precios contienen más servicios.

La distribución permite tres entradas: seleccionar arriba en chips, explorar tarjetas, o consultar precios. Para BE SMILE se debe construir el catálogo desde los tratamientos respondidos, incluyendo **todos sus precios confirmados** y las condiciones por pieza, arcada, sesión o tratamiento.

### 3.9 Cobertura local

Lista 13 zonas: Roma Norte, Roma Sur, Condesa, Hipódromo, Hipódromo Condesa, Doctores, Narvarte Poniente, Narvarte Oriente, Del Valle Norte, Del Valle Centro, Cuauhtémoc, Juárez y Centro Histórico.

Ayuda a explicar accesibilidad y procedencia de pacientes. Mencionar colonias no crea sedes adicionales ni garantiza ranking allí. Distancias, referencias a parques y tiempos de caminata necesitan validación cartográfica. No reproducir declaraciones como “el más cercano” sin una base verificable.

### 3.10 Ubicación y contacto local

Tarjeta con dirección, teléfono, horario, foto de la clínica, consulta, llamada y mapa embebido. Datos publicados de Roma:

| Dato | Valor de referencia |
|---|---|
| Dirección | Monterrey 147, Roma Norte, Cuauhtémoc, 06700 CDMX |
| Teléfono | +52 56 1016 7727 |
| Atención | Lunes a sábado, 09:00–18:00; domingo cerrado |
| Mapa declarado | https://maps.app.goo.gl/kka66Rmz9xLpSwrK8 |
| Reseñas de referencia | 58, promedio 4.9; comprobación local fechada 2026-09-04 |

**Fallo comprobado en el código y HTML publicado:** “Cómo llegar/Get directions” se construye con `<Link href="…">`, cuando React Router espera `to`. El HTML obtenido no contiene un enlace al mapa en esa tarjeta; tras ejecutar JavaScript, el destino observado es `/`. Usar un `<a href>` externo. El iframe contiene un identificador de lugar que parece provisional: debe sustituirse/verificarse con un embed real; esta auditoría no certifica que el pin coincida con el consultorio.

### 3.11 Testimonios escritos y reseñas

`Testimonials.jsx`: relatos con foto, nombre, servicio y procedencia; enlace a `/reviews` y mecanismo de dejar reseña. Siguen apareciendo opciones Polanco/Roma dentro de una web independiente de Roma.

Una recomendación de marca y una reseña de una sede son evidencias distintas. No mezclar un promedio de marca de 700 reseñas con las 58 reseñas de Roma como si fueran la misma población. Las páginas de reseñas por especialidad conservan datos estructurados con dirección y teléfono de Polanco.

### 3.12 FAQ local

Cinco preguntas: ubicación, coste de valoración, urgencias, apertura y colonias atendidas. Se muestran en acordeón y se duplican en datos para `FAQPage`.

El FAQ responde objeciones concretas y facilita la lectura. El contenido del JSON-LD sigue en español aunque el HTML inicial visible está en inglés. La información esencial debe coincidir entre idiomas y capas.

**Actualización importante de SEO:** Google dejó de mostrar el resultado enriquecido de FAQ desde el 7 de mayo de 2026. No prometer desplegables FAQ en la búsqueda por añadir `FAQPage`. Las preguntas visibles mantienen su utilidad para el paciente. [Actualizaciones oficiales de Google Search](https://developers.google.com/search/updates).

### 3.13 Confianza y efecto de cursor

Grid de seis argumentos: tomografía, Straumann, CEREC, registro COFEPRIS, formación del doctor y urgencias sábado. `DitherCursorTrail.jsx` añade un rastro dorado en escritorio. Está desactivado en móvil, landscape y tablet, y respeta preferencias de movimiento reducido/puntero compatible.

Este detalle distingue la presentación, pero no debe bloquear contenido ni convertirse en el centro de la experiencia. La formación “UCLA” en el grid no coincide con la formación ULM/Brasil del bloque del fundador. La auditoría no resuelve cuál afirmación está documentada. Un número COFEPRIS publicado tampoco demuestra por sí solo todas las afirmaciones “certificado” que lo rodean.

### 3.14 Cierre, footer y CTA persistente

CTA final, teléfono, recordatorio de valoración y registro publicado. El botón dice “Agendar por WhatsApp/Book via WhatsApp”, pero lleva primero al contacto. Alinear texto y destino; el usuario aún debe completar el formulario antes del handoff.

`Footer.jsx` usa `CompactFooterRoma` para la experiencia habitual: logo, tratamiento, clínica, dirección/horario, privacidad, términos y volver arriba. Los flujos de turismo tienen un cierre orientado a consulta. `DockFooterRoma.jsx` existe en el árbol, pero no asumir que está activo: el footer habitual observado es el compacto.

`AppointmentCta.jsx`: barra fija inferior de agenda, fondo oscuro con blur, safe-area y botón centrado. Si encuentra el formulario actual, desplaza hasta él. `App.jsx` reserva altura inferior para reducir solapamientos.

## 4. Sistema visual y experiencia de uso

### 4.1 Identidad estética

- Carbón `#0C0A08` como fondo principal, capas oscuras alternadas para separar secciones.
- Dorado `#C5A55A`, variaciones claras/oscuras y champagne para títulos, bordes y CTAs.
- Serif editorial **Cormorant Garamond** y sans **DM Sans**; Playfair/Georgia aparecen como alternativas en el sistema.
- Títulos grandes, cortes de línea deliberados y palabra/localidad en cursiva.
- Eyebrows pequeños en mayúsculas con tracking y trazo fino.
- Contenedor máximo de 1,400 px, espacios amplios en escritorio y adaptación por breakpoints.
- Tarjetas redondeadas, borde de baja opacidad, vidrio, gradientes y textura de ruido.
- Botón principal sólido dorado, botón secundario de contorno y enlaces textuales para jerarquizar decisiones.

La captura de escritorio actual confirma esta combinación: cabecera horizontal, chips, video de ciudad, H1 serif local y CTA dorado. Los elementos funcionan como una secuencia editorial de confianza, servicios y acción. No hay evidencia causal de que el dorado o una animación concreta aumenten las citas.

### 4.2 Movimiento

`TextReveal`, IntersectionObserver, GSAP/ScrollTrigger, arrastre de carruseles, transición de acordeones y botón magnético de escritorio. `useRomaMotion` acota animaciones a la página, desmonta listeners y usa `prefers-reduced-motion`.

**Patrón reutilizable:** el movimiento revela jerarquía y confirma interacción. El texto y la agenda deben funcionar aunque no haya WebGL, video o animación. El HTML inicial incluye contenido, pero algunos bloques usan clases de revelado; revisar visibilidad cuando falla JavaScript.

### 4.3 Móvil y accesibilidad

Fortalezas implementadas: CTA inferior, safe-area, chips desplazables, objetivos táctiles de 44 px en accesos rápidos/footer, foco visible, grids responsive, movimiento reducido en componentes específicos y efectos de cursor desactivados en móvil.

Pendientes: contraste de texto blanco con baja opacidad, badges pequeños, teclado/lector de pantalla en todos los carruseles y acordeones, poster ligero en el hero activo, subtítulos/transcripción de videos y solapamiento de CTA con teclado. Un diseño responsive no equivale a conformidad WCAG ni buen Core Web Vitals.

La revisión funcional histórica del 15 de septiembre documenta pruebas en Chromium de 390 y 1,440 px sin overflow en las páginas muestreadas. No es evidencia de Safari/iPhone físico ni de todo el sitio actual. La comprobación visual adicional de esta auditoría se detalla en el anexo de verificación.

## 5. Plantillas que sostienen el resto de la web

### 5.1 Tratamiento orgánico

`src/components/ui/TreatmentPage.jsx` abstrae hero, propuesta, beneficios, información del profesional, proceso cuando se configura, precios cuando se configuran, casos reales, testimonios, preguntas y CTA. Las páginas específicas pasan contenido; no todas muestran todos los bloques opcionales.

`CasesCarousel` usa un carrusel de resultados con profundidad visual, swipe y controles. La galería antes/después también tiene una página dedicada. La portada heredada quitó el bloque general antes/después para llevar evidencia a cada tratamiento, donde es más pertinente.

Para BE SMILE, cada servicio debe explicar:

1. Qué es y qué problema evalúa.
2. Para quién puede ser adecuado y cuándo exige valoración.
3. Cómo se realiza y cuántas etapas/citas se prevén.
4. Profesional responsable y equipo realmente disponible.
5. Precio MXN, unidad, inclusiones, extras y vigencia.
6. Recuperación/cuidado y límites, aprobados por la clínica.
7. Evidencia visual autorizada y preguntas reales.
8. Solicitud de cita con el servicio preseleccionado.

No usar claims absolutos de ausencia de dolor, duración o resultados sin confirmación clínica. Separar componente de contenido facilita actualizar precios y mantener consistencia.

### 5.2 Precios

Página agrupada por odontología general, estética, implantología, ortodoncia, endodoncia, cirugía, periodoncia, láser, pediatría, radiología, prótesis híbrida y ortopedia. Incluye importes “desde”, unidades en algunos productos, consulta y notas.

Ejemplos observados, **solo para describir la referencia**: valoración Roma $1,000; limpieza desde $1,650; Airflow $2,850; Straumann desde $23,000; corona sobre implante desde $18,000; carilla porcelana desde $16,588 por diente; híbrida fija desde $200,000 por arcada. No son precios de BE SMILE ni una recomendación de compra.

**Problema prioritario:** home/FAQ/`ROMA.valuationLabel` indican $2,125 para la valoración, frente a $1,000 en precios. Tomografía también tiene cifras distintas según el contexto. Debe existir una fuente de precios con condiciones, fechas y unidades que alimente web, schema y archivos auxiliares.

### 5.3 Ofertas

Página con promoción destacada y tres secundarias, fotos, descuentos, condiciones y CTA por servicio. Usa `offer_click` e identificadores de campañas en enlaces.

Al 8 de octubre sigue mostrando **ofertas de septiembre válidas hasta el 30 de septiembre**. El contenido y las menciones de precios no se retiran automáticamente. Para BE SMILE: estado activo, inicio/fin, términos, tratamiento relacionado y comportamiento de oferta vencida; evitar mensajes contradictorios entre página, popup, dashboard y anuncios.

### 5.4 Nosotros, tecnología y resultados

Son capas de verificación: trayectoria, profesionales, laboratorio/equipos, instalaciones y ejemplos. No sustituyen la necesidad de credenciales comprobadas ni de consentimiento de pacientes. Los archivos institucionales heredados tienen datos y efectos propios; adaptar solo los que pertenezcan a Roma o a BE SMILE.

### 5.5 Blog

El blog activo de Roma usa catálogo explícito con 13 artículos, metadatos livianos y cuerpos separados en JSON con nombre ligado a hash. `BlogPost.jsx` carga el cuerpo de un artículo, fija título/description, social cards, idioma, `BlogPosting`, fecha y CTA relacionado.

La página debe haber cargado el cuerpo antes del prerender mediante `[data-article-ready="true"]`. No enviar todo el histórico editorial al bundle de cada visitante.

Los contenidos exploran decisión clínica, evaluación, costes y visita local. Las parejas ES/EN deben vincular traducciones reales, no asumir que compartir un slug o un botón de idioma crea una versión indexable distinta. `editorial.js` registra revisiones de navegación en ciertos artículos heredados; no certifica revisión clínica ni firma de especialista para los artículos actuales.

### 5.6 Turismo dental

Páginas en inglés por tratamiento: implantes, All-on-4, All-on-6, estética, veneers, porcelain veneers y smile design. El contenido incluye comparaciones de costes, visitas, planificación, casos, testimonios, videos del fundador y formulario `TourismLeadForm` embebido.

La consulta virtual gratuita es una oferta de ese funnel; no equivale a que la valoración presencial sea gratuita. El formulario normaliza códigos +1/+52/+34, identifica idioma, tratamiento y funnel, y en Roma entrega al receptor Roma. El cierre busca que el paciente complete la consulta dentro de la misma página.

Para BE SMILE este conjunto solo procede si el brief confirma atención internacional, inglés, logística, seguimiento y precios. No añadir turismo automáticamente.

### 5.7 Landings pagadas

72 variaciones Roma en `/lp/`, construidas con `CampaignLanding` y datos de tratamiento. H1/title adaptados al anuncio y agenda fija `/agenda-roma`. Todas respondieron 200 con un H1 y `noindex, nofollow` en el rastreo.

**No son 72 páginas que impulsan directamente el SEO orgánico.** Su función es tráfico pagado y ajuste del mensaje. Los comentarios que hablan de Quality Score cercano a 10 expresan una intención, no un resultado medido. No replicar 72 páginas para BE SMILE sin campañas que las necesiten.

## 6. Conversión y flujo de datos

```text
Entrada: búsqueda / anuncio / recomendación / IA
  → página local, tratamiento, precios, blog o landing
  → CTA con contexto de Roma + servicio + origen
  → contacto / agenda / consulta de turismo
  → validación de campos y envío
  → POST /api/lead
  → receptor GHL/Elevator exclusivo de Roma
  → respuesta: ok + ghlOk + URL WhatsApp
  → confirmación visible y continuación a WhatsApp
  → atención humana y confirmación de fecha/hora
```

### 6.1 Mantener el contexto

`contactContext.js` fija Roma y deduce servicio de ruta/query validada. El backend vuelve a fijar `contact.sucursal = 'Roma Norte'`: la selección del usuario no debe mover el lead a otra sede. La entrega efectiva usa únicamente la variable privada `GHL_WEBHOOK_URL_ROMA`; no la URL heredada de Polanco. Parte de las constantes antiguas sigue en el archivo, pero la función que se ejecuta manda al receptor Roma.

Si la entrega falla, el contacto sigue teniendo fallback a WhatsApp. HTTP 200 puede representar recepción del endpoint aunque `ghlOk` sea false. No mostrar ni contabilizar todos esos casos como contacto guardado en CRM.

### 6.2 Evidencia de la conexión CRM

`docs/crm-roma-conexion.md` documenta una prueba autorizada del 15 de septiembre: contacto ficticio encontrado en CRM, campos de servicio/sucursal/mensaje comprobados y logs del endpoint 200. Es evidencia histórica de entrega del formulario de contacto, no una nueva prueba realizada hoy ni una demostración de todos los formularios y automatizaciones.

No se verificó en esa prueba toda la cadena de agente de nube, mensajes de seguimiento o conversiones publicitarias. Las claves/URLs privadas no se incluyen en este informe.

### 6.3 Eventos: qué significa cada uno

| Señal | Significado verificable | Qué no demuestra |
|---|---|---|
| Click CTA/teléfono/WhatsApp | Intención o apertura de enlace | Conversación, cita, paciente |
| `generate_lead` | Intento de envío de formulario | Recepción del servidor o CRM |
| `lead_accepted` | Respuesta satisfactoria del API | Persistencia confirmada en CRM |
| `lead_crm_delivered` | El receptor CRM devolvió resultado satisfactorio | Calidad comercial, cita o cobro |
| `lead_crm_delivery_failed` | Entrega CRM no confirmada | Que el visitante abandonó WhatsApp |
| `lead_api_error` | Error HTTP/red | Que no exista otro canal de contacto |
| `treatment_quick_link_click` | Elección de acceso rápido | Tratamiento contratado |
| `offer_click` | Interés por oferta | Descuento utilizado |

No usar nombres inventados como `lead_crm_saved` para describir estos eventos: los nombres activos están en `tracking.js`. `measurement.js` limpia campos opcionales del dataLayer para reducir atribuciones heredadas de otro evento.

### 6.4 Atribución y publicidad

UTMs, referrer, página de entrada, first touch, identificadores Google/Meta/TikTok y event_id permiten unir intento y entrega. Los UTMs internos de ofertas deben conservarse como contexto interno sin sustituir el canal inicial.

Hay SDK/píxeles y funciones servidor para conversiones. `server/ad-conversions.js` exige configuración explícita y consentimiento `ad_user_data_consent === 'granted'` para envíos Meta/TikTok. La existencia del código no prueba que haya campañas activas, consentimiento conectado o datos visibles en el dashboard.

El API registra contacto/payload en logs como respaldo. Para BE SMILE se debe definir retención y acceso; no llamar a esos logs una base duradera de pacientes. No exponer datos de salud/contacto en eventos públicos, repositorios o archivos de auditoría.

### 6.5 Reserva vs solicitud

El formulario solicita atención y deriva a coordinación; no consulta inventario de agenda ni confirma un horario reservado. El artículo local sí advierte que fecha/hora necesitan confirmación. Mantener esta distinción en copy y métricas.

## 7. SEO técnico, con resultados comprobados

### 7.1 Prerender

`prerender.mjs` levanta los archivos compilados, abre rutas en Chromium, espera H1/cuerpo de artículo y serializa HTML a `dist/<ruta>/index.html`. `seo-checks.mjs` valida contenido, title, description, canonical, idioma cuando se especifica, JSON-LD y noindex de campañas. Un fallo bloquea publicación.

Existe presupuesto de **400,000 bytes gzip de JS/JSON por artículo**. Este control excluye imágenes/video y no equivale a puntuación Lighthouse, LCP real o resultado CrUX. En Roma el serializado conserva `page.content()`; no asumir que adopta todas las limpiezas posteriores del repositorio compartido.

### 7.2 Resultados del rastreo de Roma

| Comprobación | Resultado del 8 de octubre |
|---|---|
| URLs de sitemap | 54 |
| Respuesta HTTP de sitemap | 54/54 con 200 |
| H1 en sitemap | 54/54 con exactamente uno |
| JSON-LD que se puede parsear | Sin errores sintácticos detectados |
| Robots de páginas sitemap | 54 `index, follow` |
| Cabecera HTTP X-Robots-Tag | No observada en las 54 páginas |
| Idioma HTML de sitemap | 47 `en`, 7 `es` |
| Landings de campaña | 72/72 con 200, un H1 y `noindex, nofollow` |
| Agenda Roma | 200, `noindex, nofollow` |
| URL inexistente controlada | 404 y `noindex, follow` |
| llms corto/ampliado | 200 |
| Enlaces internos declarados en sitemap | Sin paths fuera del conjunto conocido de sitemap, campañas y auxiliares |

La última comprobación compara destinos por path; no valida cada fragmento, formulario, redirect ni recurso enlazado. HTTP 200 no prueba indexación efectiva en Google. JSON válido no demuestra cumplimiento semántico o elegibilidad de rich results.

### 7.3 Sitemap y robots

Sitemap generado desde rutas y catálogo publicado, con dominio configurable y `lastmod` editorial. Raíz añadida por el plugin, campañas excluidas. Robots permite rastreo general y declara el sitemap.

Las fechas estáticas de `lastmod` siguen una referencia fija de septiembre que no cubre necesariamente cambios de octubre. Deben corresponder a cambios sustanciales de cada página. `priority` y `changefreq` no son palancas de ranking.

Documentos antiguos como `README-ROMA.md` y la revisión funcional describen una fase con `X-Robots-Tag: noindex,nofollow`; **ese bloqueo ya no se observó en producción**. No heredar pendientes resueltos de un README como si fueran estado actual.

### 7.4 Canonical y duplicación

- Roma genera canonical en su propio dominio; el transform de Vite reemplaza el host heredado en código compilado.
- `/` y `/dentista-roma-norte` muestran la misma plantilla, título y contenido, pero se autocanonicalizan por separado. Elegir una página local principal y consolidar la otra con redirección o canonical coherente después de revisar enlaces y tráfico.
- `/nosotros` y `/about` publican el mismo canonical `/nosotros`; el contenido inicial observado es inglés en ambas. Esto no constituye una pareja ES/EN separada correctamente.
- `/contacto`/`/contact` y `/aviso-de-privacidad`/`/privacy` duplican títulos; revisar intención y versiones por idioma.
- El dominio Roma no debe asignar entidades de Polanco a páginas de Roma.

Un canonical es una señal de preferencia; no garantiza que Google seleccione ese destino.

### 7.5 Title, description y tarjetas sociales

La portada actual tiene metadatos locales y sociales específicos de Roma. Los artículos fijan title/excerpt/imágenes por artículo. En las 54 páginas se encontraron **24 valores distintos de `og:title`**: varias páginas reutilizan títulos sociales, lo que exige revisar compartidos por tratamiento.

El repositorio compartido conserva un fallo más claro: su landing Roma hereda `og:title`/Twitter de Polanco. Ese fallo no se debe trasladar automáticamente a la portada independiente, que ya publica OG local. La comparación muestra por qué hay que auditar la salida, no únicamente el template `index.html`.

### 7.6 Idiomas e hreflang

**41 páginas de Roma** tienen varias etiquetas hreflang que apuntan todas a la misma URL. El selector cambia texto del cliente y guarda preferencia; no crea direcciones indexables para cada lengua.

Si el objetivo es posicionar versiones ES e inglés, usar rutas diferentes, contenido y metadatos por versión, idioma HTML correspondiente y hreflang recíproco. Si el objetivo es una web principal en un idioma con traducción de interfaz, documentar esa elección y evitar presentar hreflang redundante como arquitectura internacional completa. [Guía oficial de sitios multilingües](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

### 7.7 Datos estructurados

El rastreo de Roma detecta `Dentist`, `PostalAddress`, `OpeningHoursSpecification`, `FAQPage`, `MedicalProcedure`, `BlogPosting`, `Organization`, `ImageObject`, `AggregateRating`, `Offer`, `BreadcrumbList`, `CollectionPage`, `PriceSpecification` y `AggregateOffer`, entre otros.

La portada define Dentist Roma con identidad estable, dirección, teléfono, horario y mapa. Sin embargo:

- `parentOrganization` referencia `/#organizacion`, mientras el schema padre global se retira del HTML de Roma; definir esa organización de manera consistente si se usa la referencia.
- La raíz conserva entidad con URL de `/dentista-roma-norte`; alinearla con la URL principal seleccionada.
- FAQ JSON-LD ES con portada visible EN.
- Ciertas páginas de reviews conservan dirección/teléfono de Polanco.
- Reseñas propias de una clínica no dan por sí mismas estrellas orgánicas mediante `LocalBusiness`/`Organization`. No confundir prueba social visual con rich result elegible. [Política oficial de reseñas propias](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful).
- `MedicalProcedure` describe el contenido; no garantiza un resultado enriquecido específico.

Para BE SMILE, generar JSON-LD desde los mismos datos visibles y verificados que usa la interfaz. No agregar tipos o valoraciones solo por aumentar cantidad de markup.

### 7.8 Rendimiento, recursos y seguridad

Lazy loading de páginas, separación del cuerpo editorial, imágenes lazy en bloques, cache largo de assets y prerender son buenas bases. Google Fonts usa preconnect y carga diferida. El hero activo y varios videos/carruseles pueden seguir dominando consumo de red.

`performance.js` instrumenta navegación inicial y métricas al dataLayer, pero no demuestra Core Web Vitals aprobados. Medir LCP/INP/CLS con datos de campo y pruebas de laboratorio representativas; no usar tiempo de descarga del crawler como LCP.

Cabeceras observadas en configuración: nosniff, Referrer-Policy, SAMEORIGIN y Permissions-Policy. Esta última deshabilita cámara/micrófono; revisar incompatibilidad con el simulador de sonrisa basado en cámara antes de presentarlo como producto listo.

## 8. SEO local y autoridad clínica

### 8.1 Entidad local

`ROMA` en `src/data/sucursales.js` reúne teléfono, dirección, horario, valoración, mapas y referencia de reseñas. Esa fuente común ayuda a reducir desvíos entre footer, contacto y archivos para IA. No todos los textos/precios heredados la usan, como evidencia la contradicción de valoración.

Un agente debe mantener nombre/dirección/teléfono coherentes en web, schema y Perfil de Empresa, e identificar la sede real en fotos/testimonios. Confirmar horario normal, urgencias y cierre dominical en cada página.

### 8.2 Google Business Profile y reseñas

Hay mapa de Roma y enlace específico de dejar reseña mediante Place ID. El sitio aún muestra elección Polanco/Roma en componentes compartidos. Para una web de una sola sede, dirigir al perfil correcto y evitar pedir al paciente decidir entre sedes ajenas.

La reputación 4.9/58 tiene fecha histórica local; no se consultó el panel privado de GBP ni se confirmó el promedio del día. Google explica el posicionamiento local por relevancia, distancia y prominencia/popularidad; la página web ayuda a claridad y relevancia, pero no elimina la distancia física. [Ayuda oficial de posicionamiento local](https://support.google.com/business/answer/7091).

### 8.3 Contenido local útil

Dirección en la propuesta, página de visita, acceso desde zonas cercanas, horarios, tomografía y consulta permiten responder preguntas concretas. No crear una sede por colonia, multiplicar páginas casi idénticas ni inventar tiempos de viaje. La información de estacionamiento/accesibilidad debe confirmarse antes de publicarla.

### 8.4 Confianza y responsabilidad editorial

Para cada credencial: nombre exacto, institución, título, cédula/registro si procede y evidencia aprobada. Para cada artículo clínico: autor y revisor reales, fecha pertinente, fuentes y límites. No convertir una revisión de navegación en revisión médica. Para cada caso: procedencia, contexto y autorización.

La arquitectura puede transmitir confianza; que los claims sean verdaderos exige validación documental. La inconsistencia UCLA vs ULM/Brasil necesita revisión de la clínica.

## 9. GEO/AEO: qué existe y qué significa

Aquí GEO se entiende como visibilidad en respuestas generativas; la cobertura geográfica pertenece a SEO local. AEO se usa para contenidos que responden preguntas. No existe evidencia en esta auditoría de una posición o citación garantizada en ChatGPT, Gemini o Copilot.

### 9.1 Bases efectivas de la referencia

1. HTML publicado con texto de servicios y ubicación sin exigir ejecutar todo React.
2. Información concreta de coste, inclusiones, horario y dirección.
3. Contenidos que cubren preguntas previas a decidir un tratamiento.
4. Entidades y relaciones mediante JSON-LD cuando coinciden con lo visible.
5. Material propio: instalaciones, fundador, testimonios y casos.
6. Enlaces que llevan del contenido informativo al servicio y a la valoración.
7. Idioma de artículos definido y catálogo editorial explícito.

Estas bases son útiles para personas y motores. Su contribución específica a citaciones IA debe medirse; no se puede atribuir a una sola etiqueta.

### 9.2 llms.txt y llms-full.txt

`api/llms.js` rellena templates con dominio, teléfono, horario, valoración, mapa y referencia fechada de reseñas. Devuelve texto o Markdown según Accept y usa `Vary` para distinguir representaciones. Ambos archivos públicos respondieron 200.

La versión Roma aclara que son guías, que no garantizan recomendaciones y que no se deben atribuir datos de otra sede. Es una mejora frente al antecedente que contiene instrucciones del tipo “cuándo citar esta web”. Ninguna instrucción publicada obliga a un buscador o modelo a recomendar la clínica.

**Estado oficial vigente:** Google Search dice que ignora `llms.txt` para visibilidad/rankings y que no se necesita markup especial para sus funciones generativas. Se puede mantener como referencia para otros sistemas, pero no venderlo como ventaja algorítmica demostrada. [Guía oficial de optimización generativa de Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

### 9.3 Acceso de bots

Robots permite rastreo general. Verificar también CDN/WAF y respuestas reales a crawlers; Allow no garantiza acceso ni citación. `OAI-SearchBot` gestiona búsqueda de ChatGPT y `GPTBot` entrenamiento, con decisiones independientes. Abrir uno no obliga a abrir el otro. [Documentación oficial de crawlers OpenAI](https://developers.openai.com/api/docs/bots).

### 9.4 IndexNow

Scripts y workflow notifican URLs nuevas/modificadas a buscadores compatibles. El archivo de validación debe ser público y corresponder al host. Cambios locales de workflow indican revisión pendiente de la automatización: no certificar ejecución de producción sin historial de Actions/Bing.

Notificar URLs no garantiza rastreo ni indexación, y no constituye envío a Google ni a todas las IA. [FAQ oficial de IndexNow](https://www.indexnow.org/faq).

### 9.5 Cómo medir GEO con rigor

- Definir preguntas reales de pacientes por servicio, ubicación y coste.
- Registrar motor, fecha, idioma, ubicación y si la respuesta incluye enlace a una URL concreta.
- Separar mención de marca, citación, click referido y contacto entregado.
- Repetir bajo condiciones comparables: una captura aislada no demuestra presencia estable.
- Seguir referrals reconocibles sin asumir que todos los visitantes de IA transmiten referrer.
- Contrastar en Search Console/Bing/Analytics y CRM; controlar cambios editoriales y promociones.

Google mantiene fundamentos SEO para sus funciones IA y no garantiza servir una página por cumplirlos. [Requisitos oficiales de funciones IA](https://developers.google.com/search/docs/appearance/ai-features).

## 10. Qué rendimiento está respaldado por evidencia histórica

Fuente: `DR DIENTE/outputs/search-console-2026-09-07/informe.md`. Periodo principal 2026-06-08 a 2026-09-05; comparado con 2026-03-10 a 2026-06-07. **Corresponde al sitio compartido, no al dominio independiente Roma.**

| Métrica | Periodo principal | Comparación |
|---|---:|---:|
| Clicks | 4,190 | 1,518; +176% |
| Impresiones | 475,382 | 213,428; +122.7% |
| CTR | 0.881% | 0.711% |
| Posición media | 7.5 | 7.7 |
| Clicks móvil | 3,298 | 78.7% del total |

| URL del sitio compartido | Clicks | Impresiones | Posición media |
|---|---:|---:|---:|
| Blog implante precio CDMX 2026 | 973 | 85,950 | 5.64 |
| Blog corona zirconia precio CDMX 2026 | 361 | 30,509 | 5.49 |
| `/precios` | 257 | 58,555 | 8.04 |
| `/dentista-roma-norte` | 12 | 2,000 | 7.13 |

**Interpretación:** el contenido sobre precios concentra tráfico verificable del sitio compartido y justifica prestar atención a esa intención. La landing Roma aún tenía un volumen pequeño. Estos datos no prueban que el dominio Roma actual sea líder comercial, que un color/animación causara crecimiento, que cada click generara cita o que haya citaciones IA.

No se obtuvo un informe actual de Search Console del dominio independiente ni ingresos/citas atribuibles. La posición media es una agregación histórica, no un ranking fijo de hoy. Consultas anonimizadas no permiten reconstruir todo el reparto marca/no marca. El solapamiento de URLs por una consulta sugiere revisar intención, pero no demuestra canibalización perjudicial sin más análisis.

## 11. Hallazgos que no deben copiarse

| Prioridad | Hallazgo | Evidencia | Corrección para una nueva web |
|---|---|---|---|
| Alta | Valoración $1,000 vs $2,125 | Precios vs home/FAQ/ROMA | Un catálogo de precios aprobado con unidad, condiciones y fecha |
| Alta | Dirección/reputación de Polanco en capas de Roma | Reviews, schema y selector de reseñas | Filtrar por sede o declarar evidencia de marca sin atribuirla localmente |
| Alta | Formación UCLA vs ULM/Brasil | Grid de confianza vs fundador | Publicar solo credenciales confirmadas y consistentes |
| Alta | Link de mapa mal construido | `<Link href>` y ausencia de destino mapa en HTML | Anchor externo probado; embed con pin real |
| Alta | Ofertas vencidas de septiembre | `/ofertas`, vigencia 30/09 y menciones de precios | Fechas y estado que gobiernen todas las superficies |
| Media | Dos páginas para la misma home local | `/` y `/dentista-roma-norte`, canonical distinto | Una URL local principal y consolidación coherente |
| Media | Hreflang sin URLs de traducción | 41 páginas apuntan idiomas al mismo destino | Versiones distintas o estrategia de idioma claramente definida |
| Media | FAQ ES con HTML inicial EN | JSON-LD portada | Generar ambas capas desde contenido del mismo idioma |
| Media | CTA WhatsApp que abre formulario | CTA final → contacto | “Solicitar cita” o explicar la continuación |
| Media | All-on-6 conduce a All-on-4 | `TreatmentQuickLinks` | Destino y etiqueta coherentes |
| Media | Hero activo carga video móvil | `DentistaRomaNorte`, archivo ~3.9 MiB | Poster móvil y video según condiciones/medición |
| Media | Entidad padre referenciada sin definición global | `romaSchema` y eliminación del schema base | Grafo de entidades coherente y datos locales |
| Media | Metadatos sociales repetidos | 24 OG titles para 54 URLs | Tarjeta social propia por página comercial relevante |
| Media | Datos heredados/documentos obsoletos | Home genérico, README y revisión previa | Auditar ruta montada y HTML real, registrar fecha de cada fuente |
| Por validar | Pin y proximidad a parques | Embed provisional, tiempos declarados | Verificación cartográfica local |
| Por validar | Rendimiento de campo, citas, ingresos y GEO | Sin paneles actuales de Roma | Medición posterior; no publicar resultados inventados |

Las prioridades expresan impacto potencial sobre información y conversión, no diagnósticos de sanciones SEO ni de resultados clínicos.

## 12. Plano reutilizable para BE SMILE

### 12.1 Regla de fuentes

Leer primero `be-smile-brief-web.md` y los assets entregados en esta misma carpeta. Usar `besmile.mx`, identidad de BE SMILE y **una sola sede**. Si hay un conflicto entre este análisis y el brief, prevalecen los datos confirmados de BE SMILE. Si falta un dato, marcarlo como pendiente; no completarlo con cifras de DrDiente.

### 12.2 Arquitectura recomendada, condicionada al brief

```text
/
/tratamientos
/tratamientos/<servicio-confirmado>
/precios
/nosotros
/tecnologia                  si hay equipo confirmado y contenido propio
/resultados                  con casos autorizados suficientes
/contacto
/agendar-cita                 solicitud o reserva real según integración
/blog
/blog/<articulo-revisado>
/aviso-de-privacidad
/terminos-y-condiciones
/lp/<campana>                 solo cuando haya tráfico pagado concreto
```

Una sola página principal debe poseer la intención “clínica/dentista + ubicación de BE SMILE”. No copiar una sección de sucursales ni inventar landings para barrios sin contenido distinto.

### 12.3 Secuencia de home

1. Logo, menú sencillo y acción de cita.
2. Hero: identidad, ubicación real, diferencial demostrado, foto/video propio y CTA.
3. Accesos rápidos a servicios principales.
4. Clínica/experiencia: instalaciones y lo que el paciente puede esperar.
5. Tratamientos: catálogo confirmado con enlace a detalle/precio.
6. Profesionales: personas que realmente atienden y credenciales aprobadas.
7. Tecnología: equipo y beneficio concreto.
8. Casos/testimonios: evidencia autorizada y atribuida correctamente.
9. Primera consulta: precio MXN, inclusiones y proceso de coordinación.
10. Ubicación única: mapa, dirección, contacto, horario y accesibilidad confirmada.
11. FAQ: dudas de decisión, sin preguntas administrativas dirigidas al cliente.
12. CTA final, footer y acción móvil persistente.

El orden puede ajustarse para priorizar servicios/evidencia del brief. No es necesario insertar todos los efectos de DrDiente para obtener una presentación clara y atractiva.

### 12.4 Modelo de datos que evita inconsistencias

```text
Clinic: nombre, dominio, sede única, dirección, teléfono, WhatsApp, horario, mapa
Treatment: slug, nombre, alcance, profesional, proceso, tecnología, FAQs, estado
Price: tratamiento, importe/desde/valoración, MXN, unidad, inclusiones, extras, vigencia
Professional: nombre, cargo, formación confirmada, registro, retrato autorizado
Case: tratamiento, contexto, imágenes, autorización, sede, descripción aprobada
Review: fuente, sede, enlace, fecha, permiso, texto sin alterar
Offer: servicio, condiciones, inicio, fin, estado, CTA, mensaje aprobado
Article: idioma, intención, autor/revisor reales, fechas, fuentes, relación con servicio
Lead: event_id, formulario, servicio, atribución, consentimiento, resultado de entrega
```

Schema, páginas, precios, FAQ y referencias auxiliares deben alimentarse de los mismos datos. El portal `files.elevatordental.com` aporta respuestas y materiales; no equivale por sí mismo a aprobación clínica de cada frase generada.

### 12.5 SEO/GEO para implementar

- HTML útil por página mediante SSR/SSG/prerender apropiado al proyecto.
- Titles/descriptions/canonical/social cards propios; 404 HTTP real.
- Sitemap con páginas vigentes indexables y fechas verdaderas.
- Datos de sede única consistentes con el Perfil de Empresa.
- Dentist/Organization/Person/BlogPosting y breadcrumbs solo donde describan datos reales.
- Preguntas visibles útiles; sin promesas de rich results FAQ.
- Servicios ligados a precios, profesional, resultados y cita.
- Artículos que resuelvan dudas reales con revisión y evidencia propia; evitar producción masiva repetitiva.
- Idioma español inicial salvo instrucción confirmada distinta; inglés con rutas propias si hay objetivo comercial.
- Fotos auténticas, formatos ligeros, tamaños reservados y captions/transcripciones útiles.
- llms opcional como guía mantenida, sin adjudicarle ranking en Google.
- IndexNow si se necesita para motores compatibles; Search Console/Bing con dominio correcto.
- Referrals, contactos entregados y citas confirmadas como métricas distintas.

### 12.6 Medición y recepción

El contacto debe tener confirmación visual y resultado de entrega verificable. Si se ofrece WhatsApp como alternativa, usar la línea de BE SMILE y no enviar directamente mensajes sin acción del usuario. Una cita solo se considera confirmada cuando la agenda/equipo la confirma.

Para respuestas del portal de materiales, conservar el requisito ya acordado: **autoguardado y sobrescritura al editar**, con estado claro de guardado/error. Ese comportamiento del portal no es una característica comprobada de los formularios de leads de DrDiente.

### 12.7 Criterios de aceptación para el agente

- [ ] Una sola sede; ningún dato de DrDiente en texto, schema, teléfonos, formularios o tracking.
- [ ] Todos los tratamientos confirmados tienen precios/criterio de valoración, unidad e inclusiones en MXN.
- [ ] Sin promesas clínicas o credenciales inventadas.
- [ ] Cada CTA llega al destino que anuncia y conserva el servicio.
- [ ] Mapa real abre en la dirección correcta.
- [ ] Reputación y casos propios, con autorización y fecha/fuente cuando corresponda.
- [ ] Promociones vencidas no se presentan como vigentes.
- [ ] Idioma visible, metadatos y JSON-LD consistentes.
- [ ] Home no duplicada en otra URL local autocanonicalizada.
- [ ] Sitemap, robots, canonical, 404 y HTML inicial comprobados en producción.
- [ ] Móvil legible sin desbordamiento, controles táctiles y foco accesibles.
- [ ] Movimiento reducido y fallback cuando no carga video/WebGL.
- [ ] Contacto validado y prueba controlada de recepción en CRM cuando se autorice.
- [ ] Analítica distingue intención, API, CRM, cita y venta.
- [ ] Entrega técnica incluye pendientes reales; ninguna calificación “ganadora” sin datos.

## 13. Mapa de código para consultar

Todas estas rutas se refieren a `Documents/PROGRAMACION/DR DIENTE ROMA`, salvo donde se indica el antecedente:

| Archivo | Qué revisar |
|---|---|
| `src/App.jsx` | Router real, home Roma, campañas filtradas, canonical, idiomas y CTA |
| `src/config/site.js` | Dominio y sucursal de la instancia |
| `src/data/staticRoutes.js` | Rutas prerender/sitemap y exclusiones |
| `src/data/publishedPosts.js`, `generatedPosts.js` | Catálogo editorial efectivo de Roma |
| `src/data/blogTranslations.js`, `editorial.js` | Versiones por idioma y alcance de revisión |
| `src/data/sucursales.js` | Datos Roma, referencia de reseñas y schema |
| `src/pages/DentistaRomaNorte.jsx` | Composición principal, FAQ, ubicación y confianza |
| `src/components/layout/Header.jsx` | Navegación y adaptación de la instancia |
| `TreatmentQuickLinks.jsx` | Accesos por tratamiento y medición |
| `ScrollVideoSection.jsx`, `WhyDrDiente.jsx` | Tecnología e instalaciones |
| `components/turismo/VideoTestimonials.jsx` | Catálogo audiovisual de pacientes |
| `components/tourism/TourismFounderVideo.jsx` | Video y presentación del fundador |
| `components/ui/TextReveal.jsx`, `Accordion.jsx`, `useRomaMotion.js`, `DitherCursorTrail.jsx` | Movimiento, controles y preferencias |
| `components/ui/TreatmentPage.jsx` | Plantilla de servicio y carrusel de casos |
| `pages/Precios.jsx`, `Ofertas.jsx` | Tarifas, ofertas, vigencia y eventos |
| `pages/Contacto.jsx`, `AgendaRoma.jsx`, `AgendarCita.jsx` | Captura y continuación del paciente |
| `components/tourism/TourismLeadForm.jsx` | Formulario internacional |
| `utils/contactContext.js`, `tracking.js`, `measurement.js`, `performance.js` | Contexto, atribución, entrega y métricas |
| `api/lead.js`, `server/ad-conversions.js` | Receptor CRM y conversiones servidor |
| `pages/Blog.jsx`, `BlogPost.jsx`, `scripts/blog-plugin.mjs` | Índice editorial y cuerpo por artículo |
| `pages/reviews/index.jsx`, `ReviewsImplantes.jsx` y demás reviews | Datos de reputación y schema heredado |
| `layout/Footer.jsx`, `CompactFooterRoma.jsx`, `AppointmentCta.jsx` | Cierre y agenda fija |
| `vite.config.js`, `prerender.mjs`, `scripts/seo-checks.mjs` | Generación de HTML y controles SEO |
| `vercel.json`, `.github/workflows/deploy-roma.yml` | Hosting, cache, headers y despliegue |
| `api/llms.js`, `api/assets/llms*.txt`, `scripts/indexnow*.mjs` | Referencias IA y notificación de URLs |
| `docs/crm-roma-conexion.md` | Evidencia histórica de recepción CRM |
| `docs/revision-funcional-2026-09-15.md` | Pruebas históricas, hallazgos y límites |
| `README-ROMA.md` | Historia de arranque; varias instrucciones ya quedaron obsoletas |
| `DR DIENTE/outputs/search-console-2026-09-07/informe.md` | Rendimiento histórico del sitio compartido |
| `DR DIENTE/ARQUITECTURA-ROMA.md`, `docs/plan-polanco-sin-roma.md` | Propuestas de migración; no confundir con ejecución actual |

Los paths abreviados de componentes conservan el prefijo `src/`. Consultar el router antes de concluir que un archivo existente está activo.

## 14. Fuentes públicas y criterios oficiales

- [Web independiente Roma](https://clinicadrdiente-romanorte.com/), [precios](https://clinicadrdiente-romanorte.com/precios), [ofertas](https://clinicadrdiente-romanorte.com/ofertas), [sitemap](https://clinicadrdiente-romanorte.com/sitemap.xml), [robots](https://clinicadrdiente-romanorte.com/robots.txt).
- [Antecedente compartido](https://www.clinicadrdiente.com/), [landing Roma heredada](https://www.clinicadrdiente.com/dentista-roma-norte), [sitemap compartido](https://www.clinicadrdiente.com/sitemap.xml).
- [Google: optimización para funciones generativas](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- [Google: funciones de IA y requisitos](https://developers.google.com/search/docs/appearance/ai-features).
- [Google: actualizaciones, retirada FAQ y aclaración llms](https://developers.google.com/search/updates).
- [Google: sitios multilingües](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).
- [Google: reseñas propias y rich results](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful).
- [Google Business Profile: ranking local](https://support.google.com/business/answer/7091).
- [OpenAI: crawlers y controles independientes](https://developers.openai.com/api/docs/bots).
- [IndexNow: alcance y ausencia de garantía de indexación](https://www.indexnow.org/faq).

## 15. Inventario exacto de URLs revisadas de Roma

La lista siguiente procede de respuestas públicas y se genera desde el sitemap/catálogo real. Las páginas orgánicas son elegibles por sus directivas, pero su indexación efectiva requiere consultar Search Console. Las landings se excluyen por `noindex`.

### 15.1 Sitemap: 54 URLs

| Ruta | HTTP | Idioma HTML | Canonical distinto de su ruta |
|---|---:|---|---|
| `/` | 200 | en | — |
| `/diseno-de-sonrisa` | 200 | en | — |
| `/implantes-dentales` | 200 | en | — |
| `/protesis-hibrida-all-on-4` | 200 | en | — |
| `/alineadores-invisibles` | 200 | en | — |
| `/blanqueamiento-dental` | 200 | en | — |
| `/limpieza-dental` | 200 | en | — |
| `/coronas-dentales` | 200 | en | — |
| `/bichectomia` | 200 | en | — |
| `/implantes-straumann` | 200 | en | — |
| `/tomografia-dental-3d` | 200 | en | — |
| `/toxina-botulinica` | 200 | en | — |
| `/odontologia-laser` | 200 | en | — |
| `/endodoncia` | 200 | en | — |
| `/muelas-del-juicio` | 200 | en | — |
| `/turismo-dental` | 200 | en | — |
| `/precios` | 200 | en | — |
| `/ofertas` | 200 | en | — |
| `/nosotros` | 200 | en | — |
| `/about` | 200 | en | `/nosotros` |
| `/tecnologia` | 200 | en | — |
| `/antes-despues` | 200 | en | — |
| `/contacto` | 200 | en | — |
| `/contact` | 200 | en | — |
| `/agendar-cita` | 200 | en | — |
| `/blog-drdiente` | 200 | en | — |
| `/dentista-roma-norte` | 200 | en | — |
| `/reviews` | 200 | en | — |
| `/reviews/implantes-dentales` | 200 | en | — |
| `/reviews/diseno-de-sonrisa` | 200 | en | — |
| `/reviews/alineadores` | 200 | en | — |
| `/dental-implants-mexico-city` | 200 | en | — |
| `/cosmetic-dentistry-mexico` | 200 | en | — |
| `/all-on-4-mexico-city` | 200 | en | — |
| `/all-on-6-mexico-city` | 200 | en | — |
| `/veneers-mexico-city` | 200 | en | — |
| `/porcelain-veneers-mexico-city` | 200 | en | — |
| `/smile-design-mexico-city` | 200 | en | — |
| `/aviso-de-privacidad` | 200 | en | — |
| `/privacy` | 200 | en | — |
| `/terminos-y-condiciones` | 200 | en | — |
| `/blog-drdiente/ver-mi-sonrisa-antes-tratamiento-roma-norte` | 200 | es | — |
| `/blog-drdiente/see-your-smile-before-treatment-roma-norte` | 200 | en | — |
| `/blog-drdiente/diseno-sonrisa-roma-norte-como-saber-cual-me-queda-bien` | 200 | es | — |
| `/blog-drdiente/which-smile-design-suits-me-roma-norte` | 200 | en | — |
| `/blog-drdiente/que-incluye-diseno-sonrisa-roma-norte` | 200 | es | — |
| `/blog-drdiente/what-treatments-are-included-smile-design-roma-norte` | 200 | en | — |
| `/blog-drdiente/cuanto-cuesta-diseno-sonrisa-roma-norte` | 200 | es | — |
| `/blog-drdiente/smile-design-cost-roma-norte-cdmx` | 200 | en | — |
| `/blog-drdiente/que-es-diseno-de-sonrisa` | 200 | es | — |
| `/blog-drdiente/what-exactly-is-a-smile-design` | 200 | en | — |
| `/blog-drdiente/preguntas-administrativas-presupuesto-dental-roma-norte` | 200 | es | — |
| `/blog-drdiente/administrative-questions-dental-estimate-roma-norte` | 200 | en | — |
| `/blog-drdiente/visitar-clinica-dental-roma-norte` | 200 | es | — |

### 15.2 Campañas: 72 URLs

Todas: HTTP 200, un H1, JSON-LD parseable, `noindex, nofollow`. El idioma y la atribución del contenido se deben verificar por campaña; que pase estos controles no demuestra eficacia publicitaria.

- `/lp/implantes-dentales-roma`
- `/lp/implante-dental-roma`
- `/lp/implantes-dentales-precio-roma`
- `/lp/implantes-dentales-cdmx-roma`
- `/lp/implantes-dentales-cerca-roma`
- `/lp/clinica-implantes-dentales-roma`
- `/lp/implantes-straumann-roma`
- `/lp/implantes-carga-inmediata-roma`
- `/lp/implante-dental-titanio-roma`
- `/lp/all-on-4-roma`
- `/lp/all-on-4-precio-roma`
- `/lp/all-on-6-roma`
- `/lp/all-on-6-precio-roma`
- `/lp/protesis-hibrida-roma`
- `/lp/protesis-fija-implantes-roma`
- `/lp/dentadura-fija-implantes-roma`
- `/lp/dientes-fijos-un-dia-roma`
- `/lp/implantes-boca-completa-roma`
- `/lp/alineadores-invisibles-roma`
- `/lp/alineadores-precio-roma`
- `/lp/ortodoncia-invisible-roma`
- `/lp/ortodoncia-invisible-precio-roma`
- `/lp/alineadores-dentales-roma`
- `/lp/invisalign-roma`
- `/lp/invisalign-precio-roma`
- `/lp/invisalign-cdmx-roma`
- `/lp/invisalign-vs-brackets-roma`
- `/lp/diseno-de-sonrisa-roma`
- `/lp/diseno-de-sonrisa-precio-roma`
- `/lp/carillas-dentales-roma`
- `/lp/carillas-precio-roma`
- `/lp/carillas-porcelana-roma`
- `/lp/coronas-dentales-roma`
- `/lp/corona-dental-precio-roma`
- `/lp/lentes-de-contacto-dentales-roma`
- `/lp/carillas-sin-desgaste-roma`
- `/lp/carillas-hollywood-roma`
- `/lp/carillas-resina-roma`
- `/lp/carillas-premium-roma`
- `/lp/diseno-de-sonrisa-cdmx-roma`
- `/lp/dentista-roma-norte-roma`
- `/lp/dentista-cerca-de-mi-roma`
- `/lp/clinica-dental-roma-norte-roma`
- `/lp/dentista-colonia-roma-roma`
- `/lp/dentista-condesa-roma`
- `/lp/dentista-cdmx-roma`
- `/lp/dentista-mejor-valorado-roma`
- `/lp/limpieza-dental-roma`
- `/lp/limpieza-dental-precio-roma`
- `/lp/limpieza-ultrasonido-roma`
- `/lp/endodoncia-roma`
- `/lp/endodoncia-precio-roma`
- `/lp/tratamiento-de-conducto-roma`
- `/lp/extraccion-muela-del-juicio-roma`
- `/lp/extraccion-dental-roma`
- `/lp/sacar-muela-precio-roma`
- `/lp/extraccion-terceros-molares-roma`
- `/lp/cordales-roma`
- `/lp/blanqueamiento-dental-roma`
- `/lp/blanqueamiento-dental-precio-roma`
- `/lp/blanqueamiento-zoom-roma`
- `/lp/limpieza-air-flow-roma`
- `/lp/limpieza-air-flow-precio-roma`
- `/lp/urgencias-dentales-roma`
- `/lp/dentista-urgencias-roma`
- `/lp/dentista-fin-de-semana-roma`
- `/lp/dentista-domingo-roma`
- `/lp/dentista-sabado-roma`
- `/lp/dentista-abierto-ahora-roma`
- `/lp/dentista-hoy-roma`
- `/lp/dolor-de-muela-roma`
- `/lp/diente-roto-roma`

### 15.3 Auxiliares y control

- `/agenda-roma`: HTTP 200, `noindex, nofollow`.
- `/llms.txt` y `/llms-full.txt`: HTTP 200.
- Una ruta inventada de auditoría: HTTP 404, `noindex, follow`.
- Una variante de slug de campaña no declarada (`implantes-dentales-roma-norte`) respondió 404; la ruta real publicada es `/lp/implantes-dentales-roma`. El 404 de una ruta inventada no es un fallo de campaña.

## 16. Verificación realizada y límites finales

- Se ejecutó `npm test` en el repositorio independiente Roma: **24 pruebas, 24 aprobadas, 0 fallos**, sobre el estado local observado. Las pruebas que tocan entregas externas usan mocks; no confirman el estado del CRM de producción.
- Se inspeccionó la portada pública con Aside, incluyendo snapshot y captura de escritorio.
- El control de tamaño de viewport no estaba disponible en el REPL de Aside; se completó la verificación responsive con Chromium aislado, sin usar sesiones privadas ni enviar formularios.
- Portada actual recorrida en Chromium a **390 × 844** y **1,440 × 900**: sin errores JavaScript de página registrados ni desbordamiento horizontal; ancho del documento igual al viewport en ambos tamaños.
- La inspección del enlace “Get directions” después de ejecutar JavaScript confirmó `href="/"` en ambos tamaños. Es un fallo funcional, no solo una sospecha al leer JSX.
- La portada montó video en ambas pruebas. No se midió el ahorro de datos, consumo de GPU ni Core Web Vitals de campo.
- El inventario de 54 páginas y 72 campañas se comprobó mediante HTTP/HTML, no mediante navegación interactiva de cada variante.
- No se ejecutó un nuevo build ni despliegue; no se alteraron repositorios DrDiente, DNS, formularios, CRM o campañas.
- No se obtuvo acceso nuevo a GBP, Search Console de Roma, analítica comercial, historial de automatizaciones o ingresos. Los datos históricos se etiquetan por fecha y dominio.

Este documento permite construir una web con una arquitectura comparable y datos propios de BE SMILE. No certifica el “100%” de sistemas privados, cumplimiento clínico o resultados comerciales inaccesibles desde código y HTML público.
