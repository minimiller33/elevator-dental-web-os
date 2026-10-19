import type { Metadata } from "next";
import Link from "next/link";
import { Calculator } from "./Calculator";
import styles from "./calculator.module.css";

export const metadata: Metadata = {
  title: "Calculadora de escenarios de crecimiento",
  description: "Explora un escenario editable de nuevas oportunidades digitales para tu clínica.",
  robots: { index: false, follow: false },
};

export default function ScaleCalculatorPage() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}><p className={styles.eyebrow}>UN EJERCICIO PARA TU CLÍNICA</p><h1>¿Cuánto más podría<br /><span>crecer tu clínica?</span></h1><p>Prueba distintos escenarios con los números de tu clínica. Cambia cuántas consultas recibes y mira qué podría pasar. Es solo un ejercicio, no una promesa de resultados.</p></section>
      <Calculator />
      <footer className={styles.footer}><span>Elevator Dental OS</span><span>Escenario ilustrativo · No es una promesa ni un pronóstico.</span><Link href="/">Volver al sitio</Link></footer>
    </main>
  );
}
