import type { Metadata } from "next";
import { OnboardingForm } from "./OnboardingForm";
import styles from "./onboarding.module.css";

export const metadata: Metadata = {
  title: "Brief de tu Elevator Web",
  description: "Cuéntanos sobre tu clínica para preparar el contenido de tu Elevator Web.",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.intro}>
          <p className={styles.eyebrow}>TU ELEVATOR WEB EMPIEZA AQUÍ</p>
          <h1>Ayúdanos a entender <span>tu clínica.</span></h1>
          <p className={styles.lede}>Con este brief reunimos lo necesario para preparar la presencia digital de tu clínica y empezar con el pie derecho.</p>
          <div className={styles.promise}><span>✳</span><p><strong>No necesitas tenerlo todo resuelto.</strong><br />Si te falta algo, puedes dejarlo pendiente y lo vemos contigo.</p></div>
          <div className={styles.asideFoot}><span>01 — 03</span><i /><span>BRIEF DE CONSTRUCCIÓN</span></div>
        </aside>
        <section className={styles.formColumn} aria-label="Formulario de inicio de Elevator Web">
          <OnboardingForm />
          <p className={styles.localNotice}>Vista local de trabajo · La información todavía no se envía ni se guarda en Elevator.</p>
        </section>
      </div>
    </main>
  );
}
