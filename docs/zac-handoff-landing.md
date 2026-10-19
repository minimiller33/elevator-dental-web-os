# Entrega de la landing para Zac

Estado: propuesta implementada en `design/landing-zac-review`; sin publicación ni merge a `main`.

## Evidencia de revisión local

- `npm run build`: exportación estática y TypeScript correctos. `node --test tests/*.test.mjs`: 10 pruebas aprobadas. `npm run lint`: 0 errores; 3 advertencias previas de `files-portal/`.
- Chrome con emulación de 320 px, 390 px y 1440 px: el ancho del documento coincide con el viewport y no faltan destinos de enlaces internos. La tabla comparativa desplaza su contenido dentro de su propia región. El formulario permanece desactivado en localhost por defecto; el ensayo explícito mostró su confirmación con cero llamadas `fetch`. Se comprobó la preferencia de movimiento reducido a 390 px.
- Capturas: [inicio móvil 390 px](qa/landing-mobile-390.png), [servicios móvil 390 px](qa/services-mobile-390.png), [inicio escritorio 1440 px](qa/landing-desktop-1440.png) y [servicios escritorio 1440 px](qa/services-desktop-1440.png).

## Qué revisar visualmente

- El H1, la descripción y los espacios móviles tienen una jerarquía más clara. La imagen de la doctora, la paleta azul y la identidad tipográfica se conservan.
- El módulo junto al hero explica el servicio en tres momentos breves, con respuesta visible y avance opcional.
- «Dos servicios. Una misma base digital» distingue la construcción de Dental Web de la operación de Membership. La curva cercana es un esquema de continuidad, **no** una gráfica de resultados.
- Un resultado de búsqueda expresamente ilustrativo y seis logos a color explican dónde puede leerse la información de la clínica; no prometen posiciones ni recomendaciones de IA.
- El diagnóstico remite al flujo existente. El formulario corto de contacto mantiene el contrato del Worker (`POST /api/contact`, `lead_completed`, `manual_review`) y solo muestra éxito con respuesta `{ "ok": true }`. En localhost está desactivado salvo el ensayo `?demo=contacto#contacto`, que nunca envía datos.

## Arquitectura antes de publicar

`next build` genera una exportación estática en `out/`. El Worker de Cloudflare (`worker/index.ts` y `worker/seo.ts`) sirve esos archivos y atiende `/api/contact`, `/api/seo-config`, `/api/seo-diagnosis` y `/api/seo-report` bajo el mismo origen. Servir **solo** `out/` no implementa esas API: la página puede verse, pero los envíos y el diagnóstico no quedan operativos. Validar las rutas del Worker y probarlas antes de abrir tráfico. `npm run deploy` publica el Worker vinculado a `elevatordental.com` y `www.elevatordental.com`; no usarlo como preview.

Nombres de configuración a verificar por canal privado, sin copiar valores al repositorio: `GHL_WEBHOOK_URL` para contacto; `GHL_CALENDAR_URL` si se usa agenda; `SEO_SERVICE_URL`, `SEO_SERVICE_TOKEN`, `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` para diagnóstico. El servicio SEO y el portal tienen configuración independiente. Verificar dominio permitido en Turnstile, origen de las peticiones, webhook y entrega de informe con datos de prueba controlados.

## Decisiones de contenido pendientes

- **Caso de Search Console:** faltan la exportación original de Google Search Console, propiedad, rango exacto, fecha de inicio del trabajo de Elevator y método de comparación. Se retiró la afirmación numérica de la landing y de `llms-full.txt` hasta poder contrastarla. La curva actual no representa visitas, pacientes ni resultados.
- **Membership:** se conservó la condición de tres créditos mensuales que ya figuraba en el repositorio, con alcance de cada solicitud sujeto a revisión. Antes de publicar, confirmar el contrato vigente, qué consume un crédito, acumulación/caducidad, tiempos y exclusiones. Confirmar también las condiciones de licencia, continuidad y alcance. Este copy no se considera aprobado comercialmente hasta esa revisión.
- **VSL y piezas generadas:** pendientes de producción y aprobación. El ejemplo técnico de Higgsfield se conservó en la rama local `vsl/local-sdk-example`; no forma parte de esta entrega web, ni su SDK o CLI se instalaron en el producto.

## Lista de comprobación para Zac

1. Revisar copy, jerarquía visual, móvil y escritorio con Héctor; confirmar condiciones comerciales y legales anteriores.
2. Revisar la arquitectura del Worker de Cloudflare y probar bajo el mismo origen contacto, diagnóstico, Turnstile, informe privado y estados de error. Hacer los envíos de prueba solo en un entorno controlado, sin crear leads reales.
3. Revisar enlaces, navegación, contraste, desbordamiento, teclado y movimiento reducido. Verificar que el formulario nunca anuncie éxito si la API falla.
4. Revisar metadatos, `llms.txt`, `llms-full.txt` y analítica antes de dar la aprobación final.
5. Publicar solo tras la aprobación de Héctor. El PR no autoriza merge ni despliegue a producción.
