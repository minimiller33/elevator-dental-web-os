# Launch QA — Elevator Dental Web

Fecha local: 28 de octubre de 2026. Sitio: https://elevatordental.com.

Cinco subagentes realizaron recorridos independientes en Chrome for Testing 151 real, controlado con Playwright, con perfiles limpios. Se probó el candidato de producción exportado por Next y el código real del Worker. Los transportes a CRM, correo y agenda se sustituyeron por fixtures aislados; se bloquearon escrituras externas. No se enviaron leads reales, correos ni reservas.

El cambio de formulario corto a cuestionario de cinco pasos ya existía en el árbol al iniciar el trabajo y coincidía con la interfaz publicada. Se conservó. Los cinco recorridos iniciales terminaron antes de modificar el producto; después se aplicó una pasada conjunta de correcciones. La repetición de abuso detectó además un error JSON inesperado en inglés: se endureció únicamente el límite compartido de errores y se ejecutó otra comprobación de los cinco perfiles. La prueba móvil rápida observó controles antes de la hidratación; se añadió un estado explícito de preparación antes de habilitarlos y se repitieron de nuevo los cinco perfiles sobre la versión final. La repetición usa las mismas respuestas: los perfiles no se cambiaron para obtener una calificación favorable.

Resultado final: **5 de 5 perfiles completaron una solicitud aceptada**, con confirmación visible y siguiente paso claro. No quedaron problemas observados pendientes en los recorridos finales. [Resumen verificable](verification.json).

## Lista unificada, ordenada por usuarios que la encontraron

Los conteos reflejan encuentros documentados, no una inferencia de que un fallo compartido afectó a todos. La revisión visual del líder confirmó la observación adicional de las casillas del impaciente. Las capturas ilustrativas no siempre prueban por sí solas eventos de red: los pasos y peticiones están en el JSON de cada persona.

| Usuarios | Problema | Prioridad | Corrección |
| --- | --- | --- | --- |
| 5/5 (impatient, skeptic, mobile, literal, breaker) | Final sin explicación ni siguiente paso útil | P1 | Explicación del motivo, revisar respuestas y pedir revisión personal; ingresos privados pasan a revisión. |
| 4/5 (impatient, mobile, literal, breaker) | Confirmación fuera de pantalla tras encoger el formulario | P1 | Foco y desplazamiento explícitos a la confirmación en contacto y diagnóstico. |
| 2/5 (skeptic, breaker) | No se puede consultar el uso de datos antes de enviar | P2 | Aviso factual accesible desde el formulario y el pie; contacto directo para consultas. |
| 2/5 (impatient, literal) | Consentimientos del diagnóstico recortados por casillas gigantes | P1 | Casillas de 18px y texto flexible visible dentro de la tarjeta. |
| 2/5 (skeptic, literal) | Pregunta obligatoria combina expectativas con una afirmación de mejor opción | P2 | Pregunta en español sencillo; opción de pedir explicación sin afirmar resultados. |
| 1/5 (mobile) | Nombre y error de validación quedan detrás del menú | P2 | Primer campo inválido visible con margen respecto al menú fijo. |
| 1/5 (mobile) | Etiqueta Email se superpone al texto mientras se anima | P2 | Espacio reservado para la etiqueta; conserva transición de foco sin superposición. |
| 1/5 (literal) | Nueva pregunta de un paso queda fuera de la vista | P2 | Al terminar la transición animada, enfoca el título del nuevo paso. |
| 1/5 (literal) | Alto valor no explica a qué tratamiento/paciente se refiere | P2 | Ejemplos concretos: implantes, alineadores y diseño de sonrisa; objetivo vinculado a esos tratamientos. |
| 1/5 (literal) | Opciones SEO e IA sin explicación | P3 | Aparecer en Google (SEO) y asistente automático de atención (IA). |
| 1/5 (literal) | Envío muestra únicamente un spinner | P3 | Mensaje visible y anunciado mientras guarda o registra la solicitud. |
| 1/5 (breaker) | Recargar borra el cuestionario y devuelve al paso 1 | P2 | Borrador de pestaña con caducidad, restauración y eliminación al completar. |
| 1/5 (breaker) | Errores de red o servidor aparecen en inglés | P2 | Mensaje en español con reintento y respuestas conservadas; límite de espera; no se copia texto inesperado del servidor. |
| 1/5 (breaker) | Se acepta javascript: como sitio de la clínica | P2 | Normalización de direcciones web y rechazo de protocolos ejecutables en cliente y Worker. |
| 1/5 (breaker) | Nombre 123<>!!! se guarda como contacto | P3 | Validación que admite nombres internacionales y rechaza entradas sin letras o con etiquetas. |
| 1/5 (breaker) | Volver y continuar reenvía lead_started sin cambiar contacto | P2 | Firma del contacto ya guardado evita repetir el evento; nueva solicitud obtiene nuevo ID. |
| 1/5 (skeptic) | Resultado cambia la finalidad a envío de recursos sin elección | P2 | Finalidad coherente: responder a la solicitud por email/WhatsApp; no suscripción implícita. |

| 1/5 (mobile, regresión final) | Controles utilizables antes de activar JavaScript en carga 3G | P1 | Estado de preparación, controles deshabilitados hasta hidratar/restaurar el borrador y alternativa por correo sin JavaScript. |

## Evidencia individual y repetición

| Persona | Antes | Después | Versión final |
| --- | --- | --- | --- |
| impatient | [Informe y capturas](before/impatient/report.json) | [Repetición y capturas](after/impatient/report.json) | [Verificación final](final/impatient/report.json) |
| skeptic | [Informe y capturas](before/skeptic/report.json) | [Repetición y capturas](after/skeptic/report.json) | [Verificación final](final/skeptic/report.json) |
| mobile | [Informe y capturas](before/mobile/report.json) | [Repetición y capturas](after/mobile/report.json) | [Verificación final](final/mobile/report.json) |
| literal | [Informe y capturas](before/literal/report.json) | [Repetición y capturas](after/literal/report.json) | [Verificación final](final/literal/report.json) |
| breaker | [Informe y capturas](before/breaker/report.json) | [Repetición y capturas](after/breaker/report.json) | [Verificación final](final/breaker/report.json) |

El primer éxito se define como una solicitud aceptada con confirmación visible y un siguiente paso entendible. Una calificación comercial desfavorable es válida; debe explicar qué ocurre y ofrecer una vía clara de revisión. No equivale a una cita reservada ni a un correo efectivamente entregado.

## Verificación técnica

- `node --test tests/*.test.mjs`: 15 pruebas pasaron, incluidos nombres internacionales, URLs inválidas rechazadas antes de CRM, estados/calificación, atribución, teléfonos, Turnstile y errores recuperables.
- `npx tsc --noEmit`: pasó.
- ESLint sobre los archivos de implementación modificados: pasó.
- `npm run build`: pasó; exporta también `/privacidad`.
- `git diff --check`: pasó.
- Se conservaron marca, video, tipografías, transiciones GSAP, botones y respeto por movimiento reducido. La etiqueta del campo conserva animación de foco con espacio para escribir.

## Alcance y límites

El móvil se ejecuta a 375×812, 400 kbps de subida/bajada, 2 segundos de latencia y CPU 4×. La caché está fría. El servidor QA no comprime las respuestas, así que sus tiempos no predicen la velocidad de Cloudflare en producción. No se presenta una mejora de rendimiento que no se implementó. La emulación no muestra el teclado físico de iOS/Android.

Las llamadas bloqueadas de telemetría de YouTube son artefactos de aislamiento. La primera ruta de diagnóstico falló por un resolvedor del servidor QA; se corrigió antes del recorrido de recuperación y no se cuenta como fallo del producto. Los arranques lentos del navegador y las esperas de herramientas tampoco se cuentan como latencia del sitio.

Las respuestas `200` de contacto y `202` del servicio de diagnóstico prueban el flujo con transportes de prueba. La entrega real de correo, los workflows del CRM y la reserva de una cita siguen fuera de esta prueba. El aviso de datos documenta el funcionamiento observado y ofrece un contacto; no inventa precios, permanencias ni condiciones de contratación.

## Reproducir sin enviar comunicaciones reales

El controlador final conserva los mismos valores de calificación comercial de cada perfil, en un contexto limpio. Comprueba un error 500 inesperado en una pestaña auxiliar y después recorre la solicitud completa en la pestaña principal. El usuario móvil mantiene su limitación de red y CPU. La revisión visual y las exploraciones libres de la segunda ronda permanecen en los informes `after/`; el controlador final es una regresión automatizada que las complementa.

Necesitas Playwright y un Chrome/Chromium instalado. Con las dependencias del proyecto disponibles:

```sh
npm run build
./node_modules/esbuild/bin/esbuild worker/index.ts --bundle --platform=node --format=esm --target=node24 --outfile=/tmp/elevator-launch-qa-worker.mjs
node scripts/launch-qa/server.mjs
```

En otra terminal, ejecuta cada perfil con `node scripts/launch-qa/final-rerun.mjs impatient`, sustituyendo el nombre por `skeptic`, `mobile`, `literal` o `breaker`. Puedes fijar `QA_PLAYWRIGHT_MODULE` a la ruta del módulo Playwright y `QA_CHROMIUM_EXECUTABLE` al ejecutable del navegador. `QA_OUTPUT_DIR` controla dónde guardar los resultados; por defecto usa `/tmp/elevator-launch-qa-results`. El arnés rechaza destinos que no sean locales y bloquea escrituras externas.

La comprobación móvil temprana observó `document.readyState=interactive` y ausencia de controladores React en el formulario. Una ejecución no produjo POST y mostró datos vacíos; otra observó geometría antes de que terminara el desplazamiento. No se atribuye con certeza la pérdida a una navegación GET. El estado de preparación impide usar controles antes de estar activos; el controlador espera las condiciones reales de la interfaz y la posición asentada del primer campo inválido. El perfil breaker también comprueba el formulario con JavaScript desactivado.

El último ajuste limitó la selección de campos inválidos a inputs, selects y textareas: el nuevo contenedor fieldset también coincide con `:invalid`, y por eso se revisó explícitamente la validación móvil antes de cerrar. Los cinco perfiles repitieron el controlador sobre ese mismo artefacto final.

## Publicación

Publicado en https://elevatordental.com con Cloudflare Worker `elevator-dental-web`, versión `f3182f81-261c-4148-99d1-8c9d6ee01b17`. La comprobación de producción es solo de lectura: [informe y capturas](live/report.json); no registra solicitudes de negocio.
