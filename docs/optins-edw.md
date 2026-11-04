# Opt-ins de Elevator Dental Web

Catálogo: https://elevatordental.com/recursos

| Palabra clave | Página |
| --- | --- |
| WEB | https://elevatordental.com/guia-5-segundos |
| MAPA | https://elevatordental.com/guia-google-maps |
| CHAT | https://elevatordental.com/mensajes-whatsapp |
| AMIGO | https://elevatordental.com/sistema-recomendaciones |
| CAJA | https://elevatordental.com/hoja-caja |
| IA | https://elevatordental.com/guia-ia |
| FOTO | https://elevatordental.com/banco-de-fotos |

Para ManyChat, agregar `?utm_source=instagram&utm_medium=manychat&utm_campaign=PALABRA` a cada página. Esta entrega no configura ni activa ManyChat.

## Captura y entrega

Nombre, email, perfil y aceptación de privacidad obligatorios. WhatsApp opcional; diez dígitos sin código se normalizan con +52. Los recursos se entregan únicamente en la confirmación del opt-in. No se envían guías, avisos ni campañas por email, SMS o WhatsApp.

IA entrega PDF y prompt de texto. CAJA entrega la pantalla para hacer una copia en el Drive del solicitante. Los PDF se sirven desde /recursos/ en la web. El enlace de CAJA corresponde a la hoja compartida directamente por el usuario, con /copy. El usuario autorizó su acceso de lector por enlace; no se modificó su contenido.

## Elevator GHL

Ubicación exclusiva: x0nGR8XQgQcKfNmKAhLj, en app.theelevator.io. Se reutiliza la integración privada existente con permisos de lectura y escritura de contactos, sin ampliar permisos. El formulario comercial y su workflow permanecen separados.

La API crea o actualiza por email, conserva el teléfono existente cuando se omite y añade etiquetas sin reemplazar las anteriores. Guarda campos propios EDW Opt-in (perfil, último recurso, página, campaña y consentimiento) y una nota por solicitud con todos los datos y un identificador estable. Al repetirse una petición, busca ese identificador antes de añadir la nota.

Después del guardado añade edw-optin-pending, que dispara el workflow dedicado EDW | Opt-ins recursos | Captura. El workflow clasifica el contacto con edw-optin y retira pending. Las etiquetas persistentes edw-optin-web/mapa/chat/amigo/caja/ia/foto las añade directamente el backend antes del disparador, para conservar todos los recursos solicitados aunque los campos de último valor se actualicen. Los datos y las notas se guardan antes de iniciar el workflow.

El disparador por etiqueta evita el webhook entrante marcado como premium en GHL. El workflow no debe contener envíos, oportunidades ni inscripción en campañas. El mapa de claves de campos está en services/seo-audit/optin-fields.json; no contiene credenciales. La clave de API permanece en el VPS.

## Operación y protección contra duplicados

Turnstile verifica lead_magnet en el Worker y solo se aceptan solicitudes del mismo origen. El Worker se comunica con el servicio mediante su token privado. La disponibilidad depende de GHL y su mapa de campos; no requiere Resend.

La cola SQLite optins.sqlite comparte el volumen persistente del servicio SEO, con su tabla separada. Guarda el payload antes de procesar; reintenta errores de sincronización hasta seis veces con espera creciente. El formulario muestra los recursos después del guardado persistente, sin esperar a GHL. Los trabajos interrumpidos se recuperan al reiniciar. Los registros locales se eliminan a los treinta días; los contactos en GHL no se borran con esa limpieza.

Se eliminó el límite global de veinte solicitudes diarias. Quedan controles de abuso: siete recursos nuevos por email en veinticuatro horas, catorce solicitudes nuevas por IP por hora y una solicitud por email/recurso al día. Los reintentos del formulario reutilizan el registro. Las filas históricas de la entrega por correo se conservan; si el contacto vuelve a solicitar ese recurso, se sincroniza con CRM sin reenviar correos.

Un fallo después de que GHL acepte una etiqueta puede repetir la entrada al workflow al reintentar; sus únicas acciones son añadir y quitar etiquetas. Las notas se deduplican mediante el ID de evento. No se exponen claves, direcciones de webhook ni datos personales en los logs.

## Verificación

Pruebas de validación, ausencia de límite global, aislamiento de ubicación, teléfono opcional, conservación de etiquetas, reintentos después de guardar una nota y migración de registros anteriores sin envío de correos. Además, compilación estática de las siete páginas y comprobación de TypeScript.

Para ManyChat, agregar ?utm_source=instagram&utm_medium=manychat&utm_campaign=PALABRA a cada URL. Esta tarea no configura ni activa ManyChat.

Verificación en producción: el registro de prueba WEB quedó completed en el primer intento, con los ocho campos personalizados presentes, nota de solicitud y etiquetas edw-optin-web y edw-optin. La etiqueta pending fue retirada por el workflow. Worker publicado: 0037b99e-1387-428e-abf4-bf7bae919519. Workflow: https://app.theelevator.io/v2/location/x0nGR8XQgQcKfNmKAhLj/automation/workflow/badfbe86-adb3-4e1a-a0d6-39926e5e7ac9
