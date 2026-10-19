# Responsabilidades de Zac — Elevator Dental OS

Estado al 25 de septiembre de 2026. Trabajo local de preparación; todavía no hay integraciones activas ni despliegue.

## Asignaciones según el mensaje de Héctor

### Zac
- Landing de espera y updates mientras se construye la web.
- Email de bienvenida.
- Lead magnet: quiz/calculadora «¿cuántas veces podrías escalar con Elevator Web?».
- Automatizaciones de Manychat para los contenidos.

### Compartido: Héctor + Zac
- Formulario de creación de Elevator Web. Zac avanza la interfaz; Héctor revisa el proceso y valida las preguntas.

### Héctor
- Proceso general de onboarding.
- Video de siguientes pasos.
- Plan de contenido de un mes, junto con el agente.
- Automatización de ese mes de contenido.
- Agente Grok de investigación outbound.

### Responsable por confirmar
- Template de Elevator Web (el mensaje no asigna dueño).
- CRM, webhooks y automatizaciones.
- Agente de blogs en VPS.
- Agente de atención al cliente.

## Avance local de Zac

- [x] **Formulario compartido:** primera interfaz local en `/onboarding`. Permite descargar un JSON; aún no persiste ni envía la información.
- [x] **Landing de espera:** `/web-en-proceso`, con etapas y espacio para novedades. Es una plantilla estática; aún no recibe actualizaciones del equipo ni tiene acceso privado por cliente.
- [x] **Email de bienvenida:** borrador en `docs/email-bienvenida.md`. Incluye enlace de seguimiento y campos por completar; aún no está conectado a un proveedor de correo. El video se añadirá cuando Héctor lo entregue.
- [x] **Lead magnet:** calculadora local en `/calculadora-escala`. Hace una simulación con datos y supuestos visibles; no guarda ni envía datos y no garantiza resultados.
- [x] **Manychat:** mapa de flujo y checklist en `docs/manychat-flujos.md`. No está conectado a una cuenta ni activo.

## Para cerrar lo asignado a Zac

1. Revisar juntos el formulario compartido y recibir la validación de Héctor sobre preguntas y proceso.
2. Héctor confirma las etapas oficiales y proporciona el video; luego se alinea el texto de la landing y del email.
3. Héctor valida las hipótesis y el copy del quiz/calculadora antes de presentarlo como recurso oficial.
4. Para activar Manychat se necesita acceso a la cuenta/canal, calendario de contenido aprobado por Héctor, URLs definitivas del recurso y formulario, y los textos/palabras clave aprobados.
5. Cuando se acuerde dónde almacenar leads, se integra el formulario/landing/email con ese destino. Por ahora no hay CRM definido ni acceso confirmado.

## Fuera del alcance confirmado de Zac

El plan mensual y su automatización, el proceso general de onboarding, el video y el agente Grok corresponden a Héctor. Template, CRM/webhooks, agente de blogs y agente de atención necesitan que el equipo confirme propietario y alcance antes de contarlos como tareas de Zac.

El trabajo permanece en local y en la copia privada de revisión `royebae/elevator-dental-web-onboarding`, rama `zac/onboarding-form`. No se ha desplegado en Vercel ni se ha modificado el repositorio Elevator original.
