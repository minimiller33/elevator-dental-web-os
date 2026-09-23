"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Spark } from "./Icons";

const questions = [
  {
    question: "¿Tu web recibió mejoras estratégicas durante los últimos 90 días?",
    options: [
      { label: "Sí, basadas en datos", value: 0 },
      { label: "Sí, pero sin datos claros", value: 1 },
      { label: "No / no lo sé", value: 2 },
    ],
  },
  {
    question: "¿Sabes qué buscan hoy los pacientes cerca de tu clínica?",
    options: [
      { label: "Sí, lo medimos", value: 0 },
      { label: "Tenemos una idea", value: 1 },
      { label: "No", value: 2 },
    ],
  },
  {
    question: "¿Cada cambio pasa por una revisión SEO antes de publicarse?",
    options: [
      { label: "Siempre", value: 0 },
      { label: "Algunas veces", value: 1 },
      { label: "No / no lo sé", value: 2 },
    ],
  },
] as const;

const results = {
  active: {
    label: "Base activa",
    title: "Tu web tiene movimiento. Ahora necesita un sistema.",
    text: "El siguiente salto es convertir las mejoras aisladas en una operación mensual, protegida y visible.",
  },
  intermittent: {
    label: "Potencial sin capturar",
    title: "Tu web tiene crecimiento intermitente.",
    text: "Hay señales valiosas, pero todavía no existe un ciclo que las convierta en mejoras todos los meses.",
  },
  static: {
    label: "Alto potencial de mejora",
    title: "Tu web parece publicada, pero no operada.",
    text: "La oportunidad no es rediseñarla cada año. Es hacer que detecte, priorice, proteja, mejore y mida cada mes.",
  },
} as const;

export function GrowthScan() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const complete = answers.length === questions.length;
  const total = useMemo(() => answers.reduce((sum, answer) => sum + answer, 0), [answers]);
  const result = total <= 1 ? results.active : total <= 3 ? results.intermittent : results.static;

  function choose(value: number) {
    const nextAnswers = [...answers.slice(0, step), value];
    setAnswers(nextAnswers);
    setStep(Math.min(step + 1, questions.length));
  }

  function goBack() {
    const previousStep = Math.max(0, step - 1);
    setStep(previousStep);
    setAnswers((current) => current.slice(0, previousStep));
  }

  function restart() {
    setAnswers([]);
    setStep(0);
  }

  const progress = complete ? 100 : (step / questions.length) * 100;

  return (
    <section className="scan-section" id="diagnostico" aria-labelledby="scan-title">
      <div className="scan-glow" aria-hidden="true" />
      <div className="container scan-layout">
        <div className="scan-copy" data-reveal>
          <span className="kicker kicker--blue">¿TU WEB SIGUE ESTÁTICA? · 45 SEGUNDOS</span>
          <h2 id="scan-title">Comprueba si tienes una web publicada… <span>o una web operada.</span></h2>
          <p>Responde tres preguntas y descubre qué separa tu web actual de una Elevator Web.</p>
          <div className="scan-promise">
            <Spark />
            <span><strong>Recompensa inmediata</strong> · una lectura clara, sin formulario.</span>
          </div>
        </div>

        <div className="scan-card" data-reveal aria-live="polite">
          <div className="scan-card__top">
            <div>
              <span>{complete ? "DIAGNÓSTICO COMPLETO" : `PREGUNTA ${step + 1} DE ${questions.length}`}</span>
              <strong>{complete ? "Tu lectura inicial" : "Elevator Web Check"}</strong>
            </div>
            <span className="scan-time"><i /> 45 s</span>
          </div>

          <div className="scan-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          {!complete ? (
            <fieldset className="scan-question" key={step}>
              <legend>{questions[step].question}</legend>
              <div className="scan-options">
                {questions[step].options.map((option, index) => (
                  <button type="button" key={option.label} onClick={() => choose(option.value)}>
                    <span>{String.fromCharCode(65 + index)}</span>
                    <strong>{option.label}</strong>
                    <i><ArrowUpRight /></i>
                  </button>
                ))}
              </div>
              {step > 0 && <button className="scan-back" type="button" onClick={goBack}>← Volver</button>}
            </fieldset>
          ) : (
            <div className="scan-result">
              <div className="scan-result__signal" aria-hidden="true">
                <span><Check /></span>
                <i /><i /><i />
              </div>
              <span className="scan-result__label">{result.label}</span>
              <h3>{result.title}</h3>
              <p>{result.text}</p>
              <div className="scan-result__actions">
                <a className="button button--primary" href="#contacto">Quiero mi Elevator Web <ArrowUpRight /></a>
                <a href="#activacion">Ver los primeros 90 días →</a>
              </div>
              <button className="scan-restart" type="button" onClick={restart}>Repetir diagnóstico</button>
            </div>
          )}

          <p className="scan-disclaimer">Resultado orientativo. No garantiza posiciones, recomendaciones de IA ni pacientes.</p>
        </div>
      </div>
    </section>
  );
}
