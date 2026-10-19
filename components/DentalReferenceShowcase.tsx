"use client";

import JigglyButton from "@/components/annnimate/JigglyButton";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { ElevatorMascot } from "@/components/ElevatorMascot";

const journey = [
  {
    label: "Qué es",
    title: "Tu clínica, explicada con claridad.",
    description: "Elevator Dental Web reúne tus tratamientos, equipo, ubicación y contacto en una web diseñada para tu clínica. Revisas con nosotros la información clínica antes de publicarla.",
    benefit: "Tus pacientes encuentran lo esencial sin tener que descifrar tu sitio.",
  },
  {
    label: "Cómo te ayuda",
    title: "Información útil donde te buscan.",
    description: "Organizamos el contenido y la base técnica para pacientes, buscadores y asistentes de IA. El trabajo de SEO y GEO continúa con mejoras de contenido basadas en lo que aprendemos.",
    benefit: "Delegas la estructura y la evolución de la web, mientras tú atiendes.",
  },
  {
    label: "Cómo funciona",
    title: "Publicamos. Revisamos. Mejoramos.",
    description: "Después de construir la web, Elevator Membership cubre hosting, mantenimiento y ciclos de mejora. Revisamos señales disponibles, acordamos prioridades y trabajamos los cambios dentro del alcance contratado.",
    benefit: "No tienes que coordinar por separado el cuidado técnico y los siguientes ajustes.",
  },
];
const steps = [
  { title: "Revisamos tu punto de partida", description: "Conocemos tus tratamientos, ubicación, web actual y objetivos. Priorizamos lo que necesita tu clínica antes de definir el alcance.", detail: "Tu clínica, antes que la tecnología.", image: "blue-silk.webp" },
  { title: "Construimos con información aprobada", description: "Organizamos páginas, contenido y rutas de contacto. Tú validas servicios, profesionales y afirmaciones clínicas; Elevator prepara la estructura técnica.", detail: "Información revisada contigo.", image: "warm-light.webp" },
  { title: "Publicamos y medimos", description: "Configuramos la analítica y revisamos señales orgánicas. En la membresía, priorizamos cambios por impacto esperado, evidencia disponible y esfuerzo.", detail: "El siguiente ciclo parte de lo aprendido.", image: "silver-cloud.webp" },
];

export function DentalReferenceShowcase() {
  const [index, setIndex] = useState(0);
  const current = journey[index];
  return <section className="er-journey" aria-labelledby="er-journey-title">
    <div className="er-journey__intro"><p className="er-label">Así trabaja Elevator</p><h2 id="er-journey-title">Una web dental que se entiende.<br /><span>Y sigue mejorando.</span></h2><p>Construimos tu presencia digital y la cuidamos después de publicar. Todo empieza con información clara sobre tu clínica.</p></div>
    <div className="er-journey__body">
      <figure className="er-journey__visual"><div className="er-journey__orbs" aria-hidden="true"><div className="er-orb er-orb--clinic" /><div className="er-orb er-orb--main"><ElevatorMascot /></div><div className="er-orb er-orb--blue"><Search size={38} strokeWidth={1.1} /></div></div><figcaption>Tu clínica <span>→</span> Elevator <span>→</span> Personas que te buscan</figcaption></figure>
      <div className="er-journey__story"><div className="er-journey__nav" role="group" aria-label="Explorar cómo trabaja Elevator">{journey.map((step, stepIndex) => <button key={step.label} type="button" aria-pressed={index === stepIndex} onClick={() => setIndex(stepIndex)}><span>0{stepIndex + 1}</span>{step.label}</button>)}</div><div className="er-journey__answer" aria-live="polite" aria-atomic="true"><span className="er-label">0{index + 1} / 03</span><h3>{current.title}</h3><p>{current.description}</p><div className="er-journey__benefit"><strong>En tu día a día</strong><span>{current.benefit}</span></div></div><div className="er-journey__actions"><button type="button" className="er-journey__back" onClick={() => setIndex(index - 1)} disabled={index === 0}><ArrowLeft size={16} /> Anterior</button><button type="button" className="er-journey__next" onClick={() => setIndex(index + 1)} disabled={index === journey.length - 1}>Siguiente <ArrowRight size={16} /></button></div></div>
    </div>
    <div className="er-journey__foot"><span>¿Ya tienes una web? Empieza por saber cómo está.</span><JigglyButton href="/diagnostico-seo" className="er-button er-button--white er-button--small">Conocer el diagnóstico gratuito <ArrowRight size={15} /></JigglyButton></div>
  </section>;
}

export function DentalMethodCarousel() {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  return <div className="er-method-carousel" role="region" aria-label="Pasos del método Elevator" aria-roledescription="carrusel"><JigglyButton className="er-method-carousel__prev" type="button" aria-label="Paso anterior" data-morph-tooltip="Paso anterior" onClick={() => setIndex((index + 2) % 3)}><ArrowLeft size={16} /></JigglyButton><div className="er-method-carousel__slide" aria-live="polite" aria-atomic="true"><div className="er-method-carousel__visual" style={{ backgroundImage: `url('/visual/eleven/${step.image}')` }}><span>{String(index + 1).padStart(2, "0")}</span></div><div><span className="er-label">Paso {index + 1} de 3</span><h3>{step.title}</h3><p>{step.description}</p><small>{step.detail}</small></div></div><JigglyButton className="er-method-carousel__next" type="button" aria-label="Paso siguiente" data-morph-tooltip="Paso siguiente" onClick={() => setIndex((index + 1) % 3)}><ArrowRight size={16} /></JigglyButton><div className="er-method-carousel__pagination" aria-label="Seleccionar paso">{steps.map(({ title }, stepIndex) => <button type="button" key={title} aria-label={`Paso ${stepIndex + 1}: ${title}`} aria-pressed={stepIndex === index} onClick={() => setIndex(stepIndex)} />)}</div></div>;
}
