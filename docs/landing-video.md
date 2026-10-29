# Video de la landing

## Estado actual: YouTube

El original Full HD del paquete se publicó, por petición expresa del usuario, en el canal `UCOtnDQtJioPqa5pB3UTkbvA` (@ElevatorDental) el 28 de octubre de 2026. Video público: https://www.youtube.com/watch?v=loMO6NblSKw. Título: «Web y SEO para clínicas dentales | Así funciona Elevator». Procesamiento HD terminado, incorporación permitida, idioma español de México y categoría Educación. Portada original cargada después de que el usuario completó la verificación telefónica requerida por YouTube. No se contrataron promociones ni se respondieron comentarios.

La landing conserva la posición, proporción y esquinas del bloque. Usa un iframe de `youtube-nocookie.com`, carga diferida nativa, reproducción inline, referrer policy explícita y un enlace alternativo al video. El iframe y su URL están en el HTML inicial; no dependen de pulsar un botón para insertarse. `lib/brand-video.ts` centraliza título, descripción, enlaces y metadatos. Se añade VideoObject al JSON-LD existente, sin afirmar que su presencia garantice indexación o posiciones. El MP4 conserva su URL como copia del mismo contenido y no se descarga por el reproductor de la landing.

`docs/youtube-elevator/` conserva el avatar y banner publicados y los textos usados en el canal/video. Los logos oficiales no se redibujan ni deforman. El banner de 2560 × 1440 mantiene el contenido dentro de los 1546 × 423 px centrales; se usan Waldenburg, Inter, Geist Mono y la identidad Web. Se mantienen el nombre, identificador y correo de contacto existentes. El usuario autorizó expresamente la publicación; el borrador del manual no se usa para imponer aprobaciones adicionales.

## Incorporación inicial mediante archivo directo

Video y portada proporcionados por el usuario el 28 de octubre de 2026, desde el paquete `web/`.

- `elevator-v41-portada.jpg`: portada original, sin modificar.
- `elevator-v41.mp4`: copia web completa de `vsl_v41_web.mp4`, 1920 × 1080, 170,467 segundos, H.264/AAC, 22.151.612 bytes. Codificación H.264 en dos pasadas a 900 kb/s, máximo 1100 kb/s, audio AAC 128 kb/s y `faststart`. Sin recortes, cambios de velocidad ni contenido añadido. El original permanece en la carpeta entregada por el usuario.

La primera versión se mostró después del bloque «Que te encuentren. Mientras tú atiendes.» y antes de la historia animada existente, con controles nativos, reproducción inline en móvil y `preload="none"`. Se sustituyó por YouTube al publicarse el video en el canal.

Verificación de la primera versión: build y TypeScript aprobados; decodificación completa de audio/video sin errores; vista de 390 px sin desbordamiento y reproducción H.264 confirmada en navegador. Publicada en el Worker `elevator-dental-web`, versión `4739bf24-991a-4280-99a2-cfb1822c105f`.

## Verificación de la integración de YouTube

Build y TypeScript aprobados. El HTML generado contiene el iframe con la URL pública, política de referente explícita y carga diferida; el JSON-LD conserva Organization/Service y añade VideoObject con título, portada estable, duración y fecha de publicación confirmada en Studio. El reproductor real inicia y avanza el video; la miniatura pública coincide visualmente con la portada entregada. A 390 px no hay desbordamiento: reproductor de 348 × 195,75 px. El HTML de producción coincide exactamente con el generado, el oEmbed público de YouTube responde 200 y la portada conserva su URL accesible. No se promete indexación ni posicionamiento. Worker publicado: `46812c2b-797d-4ffd-8f53-5d91b2de8683`.
