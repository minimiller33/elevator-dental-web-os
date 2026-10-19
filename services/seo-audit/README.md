# Diagnóstico SEO dental en Hostinger

Servicio Docker para recibir solicitudes desde el Worker de elevatordental.com, ejecutar Lighthouse en móvil y revisar el HTML de una sola página indicada por la clínica, y enviar el informe mediante Resend. El formulario está en `/diagnostico-seo`; el informe se abre en `/informe-seo#token=…`.

## Alcance de la primera versión

El VPS analiza una URL por clínica. Lighthouse ejecuta una visita emulada en móvil y reporta puntuaciones de Rendimiento, SEO básico, Accesibilidad y Buenas prácticas, además de LCP, CLS, TBT, FCP y hasta tres oportunidades. También se revisan siete señales HTML: HTTPS, título, descripción, H1, ausencia de directiva noindex, atributos alt y viewport móvil. Las puntuaciones no representan posiciones en Google, tráfico ni salud global del sitio. Los resultados de rendimiento son estimaciones de laboratorio y pueden variar. País o ciudad contextualizan el informe; basta completar uno.

No utiliza DataForSEO, OpenSEO ni modelos de IA de pago. El costo adicional puede ser $0 si el VPS y dominio ya están pagados, hay capacidad disponible y el correo y Cloudflare permanecen dentro de sus planes actuales. Resend Free incluye 3,000 emails mensuales y 100 diarios; sus cuotas se comparten con todos los envíos de la cuenta. Mantener el plan gratuito y desactivar cualquier opción de sobreconsumo facturable. El límite inicial de 50 diagnósticos diarios deja margen para otros envíos, pero no controla el consumo de otras aplicaciones.

Documentación: [precios de Resend](https://resend.com/pricing), [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email), [idempotencia de Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Configuración del VPS

Requiere Docker Engine con Compose. Chromium y Lighthouse se instalan dentro de la imagen. El contenedor procesa una tarea a la vez, con un máximo de 2 CPU y 2 GB de RAM, para contener el uso de recursos. Un proxy de salida local valida DNS y bloquea redes privadas para cada conexión HTTP/HTTPS del navegador; el navegador no puede omitir el proxy para localhost. Copiar este directorio al VPS y ejecutar desde él:

```sh
cp .env.example .env
chmod 600 .env
openssl rand -hex 32
```

Guardar el valor generado como `SEO_SERVICE_TOKEN` en `.env`, sin compartirlo ni incluirlo en Git. Completar `RESEND_API_KEY` y `RESEND_FROM` con una dirección de un dominio verificado en Resend. `PUBLIC_SITE_URL` es `https://elevatordental.com`.

```sh
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:3100/health
```

El puerto se publica únicamente en localhost. Configurar el reverse proxy existente con HTTPS para un subdominio como `seo-api.elevatordental.com` y apuntarlo a `127.0.0.1:3100`. Crear su registro DNS hacia el VPS. Limitar tamaño de solicitudes a 8 KB y no registrar query strings en el proxy, porque `/reports` recibe un token privado. No publicar el puerto 3100 directamente.

Ejemplo si el VPS utiliza Caddy:

```caddyfile
seo-api.elevatordental.com {
    request_body {
        max_size 8KB
    }
    reverse_proxy 127.0.0.1:3100
}
```

Usar una sola réplica del servicio: el proceso único gestiona la cola SQLite. El volumen `seo-data` conserva las solicitudes, los resultados y el progreso después de reinicios. Respaldar el volumen de acuerdo con la política de datos del negocio.

## Configuración de Cloudflare

Crear un widget Turnstile para `elevatordental.com` y `www.elevatordental.com`. Desde la raíz del repositorio, configurar los cuatro valores con los comandos interactivos siguientes:

```sh
npx wrangler secret put SEO_SERVICE_URL
npx wrangler secret put SEO_SERVICE_TOKEN
npx wrangler secret put TURNSTILE_SITE_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

`SEO_SERVICE_URL` debe ser la URL HTTPS del proxy del VPS. `SEO_SERVICE_TOKEN` debe coincidir con el valor del VPS. El sitio permanece deshabilitado para nuevos diagnósticos hasta que estén presentes los cuatro valores. La clave de Resend solo vive en el VPS.

Después de comprobar el VPS y sus credenciales, publicar la web con `npm run deploy`. No hay endpoints POST de Next.js: la web utiliza exportación estática y las solicitudes las atiende el Worker.

## Límites y reintentos

- Una solicitud por email y dominio en 24 horas; un reenvío devuelve aceptación sin crear otra tarea.
- Hasta tres solicitudes por IP por hora y tres por email por día.
- `DAILY_JOB_LIMIT=50` limita las solicitudes nuevas globalmente en una ventana móvil de 24 horas.
- Caché por URL durante 24 horas; se comparte el análisis técnico, nunca los datos personales del solicitante.
- Hasta tres intentos por tarea. Lighthouse se ejecuta localmente y no consume créditos de proveedor SEO. Si Lighthouse no termina, el correo aún incluye el análisis de HTML. Resend puede rechazar el envío al agotar la cuota gratuita; revisar los fallos y el consumo compartido de la cuenta.
- El resultado se guarda antes del envío. Los reintentos de correo no repiten el análisis. Resend recibe una clave de idempotencia y el mismo cuerpo; no se reintenta el envío más allá de 20 horas desde la solicitud, dentro de su ventana de 24 horas.
- Una respuesta exitosa de Resend indica aceptación del envío, no entrega al buzón. Revisar rebotes y entregas en Resend; no hay webhook de entregabilidad en esta versión.
- Las tareas que agotan los intentos quedan `failed` y generan un registro con ID y tipo de error. No se envía un informe inventado. Deben revisarse operativamente; aún no hay panel ni aviso automático de fallos al solicitante.

## Claridad para buscadores e IA

El informe incluye nueve observaciones del HTML de la misma página: JSON-LD legible, nombre del negocio en datos y contenido, ubicación marcada, enlaces de teléfono/email, ruta de cita, preguntas con explicación cercana, referencias a profesionales, enlaces externos y video/transcripción. Cada observación guarda estado (`detected`, `not_detected`, `requires_review`), evidencia y acción. No genera una puntuación ni consulta respuestas de IA. Credenciales, validez completa del schema, calidad de fuentes, exactitud de direcciones y funcionamiento de la agenda requieren revisión humana. El video y las fuentes son contextuales y no se convierten en requisitos automáticos.

Las comprobaciones buscan señales en el HTML descargado; pueden no reconocer formatos alternativos o contenido generado en el navegador. No se descargan las URLs de las evidencias ni se amplía el rastreo. La presencia de un enlace no prueba que funcione. La revisión no utiliza APIs adicionales de pago.

El email resume las observaciones y enlaza a la evidencia en el informe. El payload CRM incluye `discovery` y `priorities`; la conexión directa las guarda en la nota existente por evento. Conserva las reglas de consentimiento y deduplicación. Los informes anteriores siguen abriendo, indicados como anteriores a esta sección. Una nueva solicitud no reutiliza una entrada de caché sin la versión actual de estas observaciones; los informes y correos ya preparados conservan su contenido para los reintentos.

## GoHighLevel

La conexión directa usa `GHL_API_TOKEN` y `GHL_LOCATION_ID` con una integración privada limitada a `contacts.readonly` y `contacts.write`. Crea o actualiza por email cuando el informe está listo y Resend ha aceptado el envío. Añade etiquetas sin reemplazar las existentes y guarda una nota con clínica, ubicación, página, enlace al informe y consentimiento. Los reintentos consultan el identificador del evento en las notas para evitar duplicarlas. No envía mensajes ni inscribe contactos en workflows. Esta ruta evita el activador premium de webhook entrante.

No se modifica el estado general de contacto/no molestar de un contacto existente. La preferencia de marketing corresponde a cada solicitud y queda registrada en su nota. La ausencia de consentimiento en una solicitud no revoca por sí sola consentimientos históricos de otro origen.

### Alternativa por webhook

Configurar `GHL_SEO_WEBHOOK_URL` con un workflow dedicado al diagnóstico. Se envía un evento `seo_report_ready` después de que Resend acepta el correo; incluye lead, ubicación, conteo de controles, enlace y consentimientos. Deduplicar por `lead_id` en el workflow, porque una respuesta fallida puede causar una repetición del webhook. Un fallo de CRM no repite el correo ya aceptado.

El payload incluye `firstName`/`lastName` y sus equivalentes `first_name`/`last_name`, `name`, `full_name`, `companyName` (clínica), `email`, `website`, `country`, `city`, `report_url`, `consent_at`, `consentVersion` y `marketingConsent`. `event_id` es estable por informe (`seo_report_ready/<lead_id>`). No se inventa un teléfono: el workflow debe poder crear o actualizar por email. La etiqueta `seo-lead-magnet` identifica el origen; `seo-marketing-consent` se envía únicamente si la casilla opcional fue aceptada explícitamente. El webhook no debe arrancar comunicaciones por sí solo.

Solo activar comunicaciones comerciales si `marketingConsent` es `true`. La casilla está desmarcada por defecto. Este servicio no crea campañas ni suscripciones de marketing en Resend.

## Datos y mantenimiento

Los informes y las solicitudes se eliminan lógicamente del servicio después de 30 días y los enlaces expiran. Los registros de Resend, CRM y backups tienen su propia retención. Revisar los textos de privacidad con los datos definitivos del responsable antes del lanzamiento.

```sh
docker compose logs --tail=100 seo-audit
docker compose up -d --build
```

Los logs del servicio no incluyen emails, nombres, tokens ni respuestas completas de proveedores. El diagnóstico acepta únicamente dominios públicos. Valida cada redirección y fija la IP pública verificada al socket para evitar acceso a direcciones internas. Limita cada respuesta a 2 MB, 15 segundos y tres redirecciones. Descarga y analiza HTML, sin ejecutar código de la web de la clínica.

## Validación

```sh
node --test services/seo-audit/*.test.mjs tests/seo-worker.test.mjs
npm run lint
npm run build
```

Desde la raíz del repositorio. Las pruebas usan descargas y correos simulados y no envían emails. Antes del lanzamiento, comprobar un envío real autorizado con las credenciales de producción, la entrega en Resend, persistencia tras reinicio y el informe desde móvil.

## Ampliaciones gratuitas

Search Console puede aportar clics, impresiones y posiciones reales si la clínica autoriza acceso a su propiedad; no puede consultarse solo con una URL pública. OpenSEO depende de DataForSEO y no forma parte de esta versión sin APIs de pago.
