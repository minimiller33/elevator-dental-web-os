"use client";

import JigglyButton from "@/components/annnimate/JigglyButton";

// Feature Dialog pattern adapted with the native dialog's focus and Escape handling.
import { useEffect, useId, useRef } from "react";
import { Expand, X } from "lucide-react";
import gsap from "gsap";
import styles from "./DiagnosisExampleDialog.module.css";

export function DiagnosisExampleDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const previousOverflow = useRef<string | null>(null);
  const headingId = useId();
  const scopeId = useId();
  function restoreScroll() {
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  }
  useEffect(() => {
    const node = dialog.current;
    return () => {
      if (node) gsap.killTweensOf(node);
      if (previousOverflow.current !== null) document.body.style.overflow = previousOverflow.current;
    };
  }, []);
  function open() {
    const node = dialog.current;
    if (!node || node.open) return;
    closing.current = false;
    node.showModal();
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(node, { opacity: 0, y: 22, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: .3, ease: "power3.out", clearProps: "opacity,transform", overwrite: true });
    }
  }
  function close() {
    const node = dialog.current;
    if (!node?.open || closing.current) return;
    closing.current = true;
    const finish = () => {
      node.close();
      gsap.set(node, { clearProps: "opacity,transform" });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.killTweensOf(node);
      finish();
    } else gsap.to(node, { opacity: 0, y: 12, duration: .18, ease: "power2.in", overwrite: true, onComplete: finish });
  }
  return <>
    <JigglyButton ref={trigger} className={styles.trigger} type="button" onClick={open} aria-haspopup="dialog"><Expand size={15} aria-hidden="true" />Ampliar un ejemplo del informe</JigglyButton>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={headingId} aria-describedby={scopeId}
      onCancel={event => { event.preventDefault(); close(); }}
      onClose={() => { closing.current = false; restoreScroll(); trigger.current?.focus({ preventScroll: true }); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
      }}>
      <header className={styles.header}><span>ELEVATOR DENTAL · VISTA DEL INFORME</span><JigglyButton type="button" aria-label="Cerrar ejemplo del informe" onClick={close} autoFocus><X size={20} aria-hidden="true" /></JigglyButton></header>
      <div className={styles.content}>
        <p className={styles.eyebrow}>UN HALLAZGO, EXPLICADO PASO A PASO</p>
        <h2 id={headingId}>Así leerás tu diagnóstico.</h2>
        <p id={scopeId}>Ejemplo ilustrativo. Tu informe se prepara con la página que envíes; estos no son resultados de una clínica real.</p>
        <section className={styles.finding} aria-label="Ejemplo de hallazgo">
          <span className={styles.status}>No detectado</span>
          <h3>Enlace de teléfono o email</h3>
          <dl><div><dt>Evidencia</dt><dd>No se identificaron enlaces de teléfono o email en el contenido de la página recibida.</dd></div><div><dt>Siguiente paso</dt><dd>Ofrece un teléfono o email público con un enlace fácil de usar.</dd></div><div><dt>Cómo interpretarlo</dt><dd>Puede existir un formulario u otra vía de contacto. Conviene revisarlo antes de decidir qué cambiar.</dd></div></dl>
        </section>
        <h3>Tres estados para entender cada observación</h3>
        <ul className={styles.legend}><li><strong>Detectado</strong><span>Encontramos la señal. Su presencia no verifica que todos sus datos sean correctos.</span></li><li><strong>No detectado</strong><span>No la identificamos con esta comprobación; puede existir en otro formato.</span></li><li><strong>Requiere revisión</strong><span>Necesita una comprobación humana antes de sacar una conclusión.</span></li></ul>
        <p className={styles.note}>El informe también incluye la carga móvil, los controles básicos y hasta tres prioridades. Revisa una sola página y no mide posiciones ni recomendaciones de una IA.</p>
        <JigglyButton className={styles.action} href="/diagnostico-seo">Solicitar mi diagnóstico gratis ↗</JigglyButton>
      </div>
    </dialog>
  </>;
}
