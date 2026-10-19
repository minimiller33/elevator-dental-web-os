# Elevator Dental Web / OS

Código de la web pública de [Elevator Dental](https://elevatordental.com), sus formularios y herramientas, el servicio de diagnóstico SEO y el portal de materiales.

## Preparar el proyecto

Usar Node.js 24 y npm. Desde la raíz:

```bash
npm ci
npm run dev
```

`next dev` muestra la dirección local. La interfaz utiliza Next.js, React, CSS y animaciones GSAP. Los recursos de marca, imágenes y fuentes se incluyen en `public/`.

## Estructura

- `app/` y `components/`: landing, páginas internas y componentes compartidos.
- `components/annnimate/`: menú, footer, botones y animaciones de formularios/textos.
- `worker/`: API de contacto y puente hacia el servicio de diagnóstico; sirve también la exportación estática.
- `services/seo-audit/`: servicio Docker del diagnóstico, análisis de páginas e informes por email. Ver su [README](services/seo-audit/README.md).
- `files-portal/`: portal de materiales con Cloudflare Workers, D1 y R2. Tiene instalación y pruebas independientes; ver su [README](files-portal/README.md).
- `docs/`: documentación de trabajo y materiales de proyecto. Los documentos con fecha describen el estado en esa fecha.

## Páginas y funcionamiento

- `/`: landing y formulario corto de conversación. En producción, el formulario envía la solicitud al Worker y confirma el envío solo cuando este responde correctamente. En localhost, el envío está desactivado; `?demo=contacto#contacto` permite ensayar la confirmación sin enviar datos.
- `/diagnostico-seo`: solicitud de diagnóstico en dos pasos, con verificación Turnstile. El Worker envía el trabajo al servicio SEO; el informe se entrega por correo.
- `/informe-seo#token=…`: informe privado mediante enlace temporal.
- `/diagnostico-seo/privacidad`: uso de los datos del diagnóstico.
- `/calculadora-escala`: simulación local; no envía ni guarda las respuestas.
- `/onboarding`: brief local con descarga JSON; todavía no envía la información al equipo.
- `/web-en-proceso`: plantilla estática de seguimiento.
- `/fit-scan`: prototipo de diagnóstico; no reserva llamadas ni procesa pagos.

## Verificación

```bash
npm run build
node --test tests/*.test.mjs
```

Pruebas del servicio SEO:

```bash
cd services/seo-audit
npm ci
npm test
```

`npm run lint` ejecuta ESLint sobre el repositorio. El portal tiene sus propias pruebas e instrucciones.

## Vista local con API de Cloudflare

```bash
npm run build
npm start
```

El Worker local usa el puerto 3001; `npm run preview:cloudflare` utiliza 8788. Un servidor estático sencillo solo muestra la interfaz: no proporciona las rutas `/api/*`. La exportación de Next.js tampoco implementa esas rutas por sí sola; las atiende el Worker de Cloudflare. Antes de publicar en otra plataforma, hay que resolver las API bajo el mismo origen y probar los formularios. Ver [entrega para Zac](docs/zac-handoff-landing.md).

## Credenciales e integraciones

Las credenciales no se guardan en GitHub. Para trabajar con las integraciones, el responsable debe dar acceso por los canales privados correspondientes.

El Worker principal utiliza `GHL_WEBHOOK_URL`, `GHL_CALENDAR_URL`, `SEO_SERVICE_URL`, `SEO_SERVICE_TOKEN`, `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`. Los secretos se configuran en Cloudflare mediante `npx wrangler secret put NOMBRE`. El calendario puede definirse en la configuración del Worker.

El servicio SEO dispone de su propio `.env.example` con los nombres necesarios para Resend y CRM. El portal gestiona sus secretos y recursos de Cloudflare por separado. No compartir archivos `.env`, `.dev.vars`, tokens de informes ni archivos de acceso del portal en el repositorio.

## Publicación

```bash
npm run deploy
```

Requiere una sesión de Cloudflare autorizada. El build genera `out/` y Wrangler publica el Worker `elevator-dental-web` con esos archivos. La web publicada no depende de que el servidor local permanezca encendido.

- Web: https://elevatordental.com
- Alias: https://www.elevatordental.com
- URL técnica: https://elevator-dental-web.hi-22f.workers.dev

Los despliegues del servicio Docker y de `files-portal/` son independientes del despliegue de la landing. Los respaldos locales, datos operativos, dependencias y archivos generados se excluyen del repositorio.
