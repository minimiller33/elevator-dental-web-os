import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Spark } from "@/components/Icons";
import styles from "./status.module.css";

export const metadata: Metadata = {
  title: "Tu Elevator Web está en proceso",
  description: "Consulta las etapas de preparación de tu Elevator Web.",
  robots: { index: false, follow: false },
};

const stages = [
  { title: "Brief de tu clínica", detail: "Reunimos la información y los materiales iniciales." },
  { title: "Estructura y contenido", detail: "Organizamos servicios, ubicación y próximos pasos para tus pacientes." },
  { title: "Diseño y construcción", detail: "Preparamos la primera versión de tu Elevator Web." },
  { title: "Tu revisión", detail: "Revisas la propuesta y compartes los ajustes acordados." },
  { title: "Lista para publicar", detail: "Confirmamos los últimos detalles antes de salir en línea." },
];

export default function WebsiteStatusPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}><Spark /> PLANTILLA DE SEGUIMIENTO · TU ELEVATOR WEB</p>
        <h1>Tu próxima etapa digital<br /><span>está tomando forma.</span></h1>
        <p className={styles.lede}>Aquí encontrarás las etapas de preparación de tu web y las novedades importantes del proyecto.</p>
      </section>

      <section className={styles.content} aria-label="Estado del proyecto">
        <div className={styles.statusCard}>
          <div className={styles.cardHead}>
            <div><span className={styles.cardEyebrow}>ESTADO DEL PROYECTO</span><h2>Preparación inicial</h2></div>
            <span className={styles.statusPill}><i /> EN CURSO</span>
          </div>
          <p className={styles.statusDescription}>Este espacio se actualizará a medida que avancemos por cada etapa de tu Elevator Web.</p>
          <div className={styles.progressMeta}><span>ETAPA 01 <i>/ 05</i></span><span>INICIO DEL PROYECTO</span></div>
          <div className={styles.progressTrack}><i /></div>
          <ol className={styles.timeline}>
            {stages.map((stage, index) => (
              <li className={index === 0 ? styles.currentStage : ""} key={stage.title}>
                <span className={styles.stageMark}>{index === 0 ? <Check /> : String(index + 1).padStart(2, "0")}</span>
                <span className={styles.stageCopy}><strong>{stage.title}</strong><small>{stage.detail}</small></span>
                <span className={styles.stageStatus}>{index === 0 ? "ACTUAL" : "PENDIENTE"}</span>
              </li>
            ))}
          </ol>
          <div className={styles.updateBox}><span className={styles.updateIcon}>✳</span><div><small>ÚLTIMA NOVEDAD</small><p>Las actualizaciones del proyecto aparecerán aquí cuando el equipo registre un nuevo avance.</p></div></div>
        </div>

        <aside className={styles.sideNote}>
          <span className={styles.sideNumber}>01</span>
          <h2>¿Tienes algo que sumar?</h2>
          <p>Si encuentras un dato, una foto o una referencia que quieras compartir con el equipo, tenlo a mano para la siguiente revisión.</p>
          <div className={styles.nextNote}><span>→</span><p><strong>Los accesos se solicitan de forma segura.</strong> No compartas contraseñas en formularios ni por este enlace.</p></div>
          <Link className={styles.homeLink} href="/">Volver a Elevator Dental OS <ArrowUpRight /></Link>
        </aside>
      </section>

      <footer className={styles.footer}><span>Elevator Dental OS · Tu clínica, lista para avanzar.</span><span>Las etapas pueden ajustarse según el proyecto.</span></footer>
    </main>
  );
}
