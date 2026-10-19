"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./multi-step-form.css";

export default function MultiStepFormFrame({ step, stage, title, children, totalSteps = 5 }: { step: number; stage: string; title: string; children: ReactNode; totalSteps?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const previous = useRef(step);
  const height = useRef(0);
  useGSAP(() => {
    if (!panel.current || !viewport.current) return;
    const changed = previous.current !== step;
    const direction = step >= previous.current ? 1 : -1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetHeight = panel.current.offsetHeight;
    gsap.to(".mstf_progress_fill", { scaleX: step / totalSteps, duration: reduced ? 0 : 0.35, ease: "power3.inOut" });
    if (changed) {
      gsap.fromTo(viewport.current, { height: height.current || targetHeight }, { height: targetHeight, duration: reduced ? 0 : 0.35, ease: "power3.inOut", onComplete: () => { gsap.set(viewport.current, { height: "auto" }); } });
      if (!reduced) {
        gsap.fromTo(panel.current, { x: direction * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
        gsap.from(".mstf_counter_face", { yPercent: direction * 110, duration: 0.32, ease: "power3.inOut" });
      }
      panel.current.querySelector<HTMLElement>(".qual-title")?.focus();
    }
    height.current = targetHeight;
    previous.current = step;
  }, { scope: root, dependencies: [step, totalSteps], revertOnUpdate: true });
  return <div className="mstf_card" ref={root} data-anm-multi-step-form="">
    <div className="mstf_header"><span className="mstf_counter" aria-label={`Paso ${step} de ${totalSteps}`}><span className="mstf_counter_roller"><span className="mstf_counter_face" key={step}>{String(step).padStart(2, "0")}</span></span><span>/ {String(totalSteps).padStart(2, "0")}</span></span><span className="mstf_stage_name">{stage}</span></div>
    <div className="mstf_progress" role="progressbar" aria-label="Progreso del formulario" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step}><span className="mstf_progress_fill" /></div>
    <div className="mstf_viewport" ref={viewport}><div className="mstf_step" ref={panel} key={step}><h3 className="qual-title mstf_step_title" tabIndex={-1}>{title}</h3>{children}</div></div>
  </div>;
}
