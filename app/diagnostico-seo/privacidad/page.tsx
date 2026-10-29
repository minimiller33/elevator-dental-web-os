import type { Metadata } from "next";
import Link from "next/link";
import styles from "../diagnosis.module.css";

export const metadata: Metadata = { title: "Uso de datos del diagnóstico SEO", robots: { index: false, follow: false } };
export default function DiagnosisPrivacy() {
  return <main className={styles.page}><article className={styles.report}>
    <Link href="/diagnostico-seo">← Volver al diagnóstico</Link>
    <h1>Cómo usamos tus datos.</h1>
    <p>Elevator utiliza tu nombre, email, clínica, país, ciudad y dirección web para preparar y enviarte el diagnóstico que solicitas.</p>
    <h2>Servicios que participan</h2>
    <p>El servicio de análisis se ejecuta en nuestro VPS de Hostinger. Abrimos la página pública que nos indicas en un navegador aislado para revisar su carga en celular y sus ajustes básicos. Resend recibe tu email y el contenido del informe para enviártelo. Cloudflare Turnstile verifica las solicitudes para limitar el abuso. En nuestro CRM GoHighLevel guardamos tus datos de contacto, clínica, ubicación, página analizada, enlace al informe y preferencias de contacto para gestionar la solicitud.</p>
    <h2>Conservación y acceso</h2>
    <p>Las solicitudes y los informes se eliminan del servicio de análisis después de 30 días. Los enlaces de acceso también expiran. Cualquier persona con el enlace podrá abrir el informe; no lo compartas si quieres mantenerlo privado. Los proveedores de correo y CRM pueden conservar sus propios registros según su configuración.</p>
    <h2>Mensajes adicionales</h2>
    <p>La casilla de consejos y novedades es opcional. Solicitar el diagnóstico no te suscribe automáticamente a comunicaciones comerciales.</p>
    <h2>Consultas sobre tus datos</h2>
    <p>Puedes contactar a Elevator mediante <a href="mailto:support@elevatordental.com">support@elevatordental.com</a> para solicitar acceso o eliminación de tus datos, o retirar tu consentimiento para futuras comunicaciones.</p>
  </article></main>;
}
