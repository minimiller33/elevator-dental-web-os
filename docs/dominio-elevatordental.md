# Dominio de producción — Elevator Dental Web

Configuración realizada el 7 de octubre de 2026.

- Dominio principal: `elevatordental.com`.
- Dominio adicional: `www.elevatordental.com`.
- Registro del dominio: Hostinger; no se transfirió el registro ni se compraron servicios.
- DNS: Cloudflare, zona Free `681545b7c09bd8f3442aa6b343fad9b8`.
- Nameservers: `dean.ns.cloudflare.com`, `rayne.ns.cloudflare.com`.
- Worker: `elevator-dental-web`, cuenta `22f27790057121d9d05044d4ea0c2fe7`.
- Ambos hostnames configurados como custom domains de producción.
- Rutas persistidas en `wrangler.jsonc` para próximos despliegues.
- Despliegue de configuración: `ff13776b-5136-41f6-959f-0ee4e9896186`.
- URL técnica conservada: `https://elevator-dental-web.hi-22f.workers.dev`.

## DNS anterior

Nameservers: `lunar.dns-parking.com`, `solar.dns-parking.com`.

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| A | @ | 2.57.91.91 | 50 |
| CNAME | www | elevatordental.com | 300 |

No se encontraron registros MX/TXT ni subdominios adicionales en el panel del dominio. Se sustituyeron únicamente los registros de parking web importados en Cloudflare por los registros gestionados de los custom domains del Worker. Los dominios .org y .si no se modificaron.

## Verificación

Nameservers nuevos y respuestas A/AAAA de Cloudflare comprobados. La validación HTTPS y API se registra abajo una vez terminada; no confundir DNS publicado con certificado activo. No se crearon contactos nuevos durante esta conexión.

Verificado a las 16:12 CST:

- Raíz y www cargan la página de Elevator en navegador mediante HTTPS.
- TLS válido y HTTP 200 en ambos hostnames, comprobados también con resolución directa a las IP públicas de Cloudflare.
- HTTP redirige 301 a HTTPS; Always Use HTTPS activado. HSTS no activado.
- OPTIONS `/api/contact` responde 204 con `Access-Control-Allow-Origin` correcto para cada hostname. No se envió un lead nuevo: esta comprobación verifica el acceso a la API, no un nuevo recorrido E2E hasta GHL.
- Algunos resolvers locales todavía conservaban NXDOMAIN para www durante la prueba; Google DNS y 1.1.1.1 ya publicaban respuestas válidas. Eso puede causar disponibilidad distinta según caché durante propagación.
- El panel SSL seguía mostrando estados de validación pendientes en la última lectura, aunque HTTPS real ya funcionaba. No se deshabilitó ni se volvió a solicitar el certificado.

Configuración de custom domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
