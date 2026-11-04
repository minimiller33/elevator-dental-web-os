# Recorrido con Elevator

Sección pública `/#como-trabajamos`, después de la explicación de Dental Web y Membership. Integra el componente OrbProcess y el CSS aportados por el propietario, con cinco etapas en español:

1. Te escuchamos: tratamientos, ubicación, pacientes, alcance e inversión.
2. Creamos tu web: estructura, materiales e información clínica revisada.
3. La preparamos: buscadores, asistentes, experiencia móvil, contacto y medición.
4. Publicamos: revisión final, publicación y métricas disponibles.
5. Seguimos contigo: hosting, mantenimiento y mejoras con Membership.

La redacción está en `lib/elevator-process.ts`. No se asignan fechas de entrega ni se prometen posiciones, recomendaciones de IA o pacientes. Las condiciones existentes del servicio permanecen en la sección de alcance.

## Integración

- `components/annnimate/OrbProcess.jsx`: se conservan el shader, el anillo, los cambios al desplazarse, los contadores y las ondas al pulsar el orbe.
- `OrbProcess.d.ts`: contrato tipado, compatible con el patrón JSX existente del proyecto.
- `orb-process.css`: estilos acotados al componente, tipografías actuales de Elevator, separación del menú y distribución para móviles pequeños. Se evita solicitar una fuente Switzer que no venía entre los archivos entregados.
- `DentalReferenceLanding.tsx`: incorpora la sección sin cambiar rutas, navegación, formularios ni el video.

El componente pausa únicamente su propio ticker cuando queda fuera de pantalla o la pestaña está oculta; no pausa la línea de tiempo global de GSAP. Movimiento reducido mantiene los pasos sin transiciones ni desplazamiento suavizado. La alternativa CSS permanece disponible si WebGL no puede utilizarse. Los controles y el paso actual tienen etiquetas en español.

## Verificación del 31/10/2026

Build de Next.js y TypeScript aprobado; las 15 pruebas existentes pasaron. Chrome real comprobó los cinco pasos en 1440×900, 375×812 y 320×568, además de movimiento reducido y WebGL desactivado. Se verificaron navegación por clic y teclado, visibilidad del texto, ausencia de desbordamiento, orbe visible y respuesta animada al pulsarlo. No se enviaron formularios, contactos, correos ni conversiones reales.

Publicación: Worker `elevator-dental-web`, versión `4a7a1045-3aca-42a4-a064-cd16075c6370`. La comparación del HTML publicado anterior con el nuevo confirmó que las 2.278 palabras visibles fuera del recorrido permanecen iguales.
