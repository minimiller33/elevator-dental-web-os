import type { Metadata } from "next";
import Link from "next/link";
import styles from "../diagnostico-seo/diagnosis.module.css";

export const metadata: Metadata = { title: "Privacidad y uso de datos", robots: { index: false, follow: true } };

export default function ContactPrivacy() {
  return <main className={styles.page}><article className={styles.report}>
    <Link href="/#contacto">← Volver al formulario</Link>
    <h1>Cómo usamos tus datos.</h1>
    <p>Al guardar y continuar en el formulario de Elevator Dental Web, se envían tu nombre, email y WhatsApp al equipo de Elevator, aunque no termines los cinco pasos. Usamos esos datos para responder a tu solicitud por email o WhatsApp.</p>
    <h2>La información de tu clínica</h2>
    <p>Si completas el cuestionario, también recibimos tus respuestas sobre ubicación, tratamientos, objetivos y situación de la clínica. Sirven para revisar si el servicio encaja y preparar la conversación. Puedes elegir «Prefiero no decir» en facturación sin perder la posibilidad de una revisión personal.</p>
    <h2>Servicios y datos de la visita</h2>
    <p>Los formularios se procesan mediante Cloudflare y los datos de contacto y respuestas se guardan en GoHighLevel, nuestro sistema de gestión de solicitudes. También recibimos información de la visita, como la página de origen, referencias de campañas cuando existen, dispositivo, navegador y ubicación aproximada de conexión, para entender de dónde llega la solicitud.</p>
    <h2>Tu borrador en esta pestaña</h2>
    <p>El cuestionario conserva temporalmente tus respuestas en el almacenamiento de esta pestaña para que puedas recuperarlas al recargar o volver. Se eliminan al enviar el formulario, cerrar la pestaña o al volver a abrir el formulario una vez transcurridas 24 horas. Si el navegador bloquea ese almacenamiento, el formulario sigue funcionando sin recuperación del borrador.</p>
    <h2>Mensajes y conservación</h2>
    <p>Este formulario solicita una respuesta del equipo; no incluye una suscripción a consejos o novedades. Los registros enviados al sistema de gestión pueden permanecer según la configuración de ese proveedor. Para consultar los registros de tu solicitud, pedir su eliminación o indicar que no deseas más contacto, escribe a <a href="mailto:support@elevatordental.com">support@elevatordental.com</a>.</p>
    <h2>Diagnóstico gratuito</h2>
    <p>El diagnóstico tiene su propio aviso sobre el análisis de la web, el envío del informe y su plazo de conservación. <Link href="/diagnostico-seo/privacidad">Consultar el uso de datos del diagnóstico</Link>.</p>
    <p>Enviar un formulario no realiza un cobro ni contrata el servicio. La inversión, el alcance y las condiciones se acuerdan antes de comenzar. <Link href="/#inversion">Consultar el alcance del servicio</Link>.</p>
  </article></main>;
}
