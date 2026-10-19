"use client";

import JigglyButton from "@/components/annnimate/JigglyButton";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, ArrowRight, Check, FileText, Search, Settings2, ShieldCheck, MapPin, Users, MessageCircle } from "lucide-react";
import { ElevatorMascot } from "@/components/ElevatorMascot";

const categories = [
  { label: "Tratamientos", title: "Tratamientos claros", description: "Qué haces, para quién puede ser adecuado y cómo resolver las primeras dudas.", icon: FileText },
  { label: "Equipo", title: "Profesionales identificados", description: "Presenta a quienes atienden, con formación e información aprobada por tu clínica.", icon: Users },
  { label: "Ubicación", title: "Una identidad coherente", description: "Tu sede, tu ciudad y los datos de contacto conectados en una misma web.", icon: MapPin },
  { label: "Contacto", title: "Un siguiente paso sencillo", description: "Una ruta clara para contactar con el equipo o solicitar una cita.", icon: MessageCircle },
];
const steps = [
  { title: "Revisamos tu punto de partida", description: "Conocemos tus tratamientos, ubicación, web actual y objetivos. Priorizamos lo que necesita tu clínica antes de definir el alcance.", detail: "Tu clínica, antes que la tecnología.", image: "blue-silk.webp" },
  { title: "Construimos con información aprobada", description: "Organizamos páginas, contenido y rutas de contacto. Tú validas servicios, profesionales y afirmaciones clínicas; Elevator prepara la estructura técnica.", detail: "Información revisada contigo.", image: "warm-light.webp" },
  { title: "Publicamos y medimos", description: "Configuramos la analítica y revisamos señales orgánicas. En la membresía, priorizamos cambios por impacto esperado, evidencia disponible y esfuerzo.", detail: "El siguiente ciclo parte de lo aprendido.", image: "silver-cloud.webp" },
];

export function DentalReferenceShowcase() {
  const [category, setCategory] = useState(0);
  return <Tabs.Root defaultValue="web" className="er-showcase" activationMode="automatic">
    <Tabs.List className="er-showcase__tabs" aria-label="Explora Elevator"><Tabs.Trigger value="web"><FileText size={13} />Elevator Web</Tabs.Trigger><Tabs.Trigger value="care"><Settings2 size={13} />Membership</Tabs.Trigger><Tabs.Trigger value="diagnosis"><Search size={13} />Diagnóstico</Tabs.Trigger></Tabs.List>
    <Tabs.Content value="web" className="er-showcase__panel">
      <div className="er-showcase__categories" aria-label="Contenido de la web dental">{categories.map(({ label }, index) => <JigglyButton type="button" key={label} aria-pressed={category === index} onClick={() => setCategory(index)}>{label}</JigglyButton>)}</div>
      <figure className="er-orbs"><div className="er-orbs__row" aria-hidden="true"><div className="er-orb er-orb--clinic" /><div className="er-orb er-orb--main"><ElevatorMascot /></div><div className="er-orb er-orb--blue"><Search size={42} strokeWidth={1} /></div></div><figcaption aria-live="polite"><strong>{categories[category].title}</strong><span>{categories[category].description}</span></figcaption></figure>
      <div className="er-showcase__tiles">{categories.map(({ label, title, icon: Icon }, index) => <JigglyButton type="button" key={label} aria-pressed={category === index} onClick={() => setCategory(index)}><Icon size={18} strokeWidth={1.2} /><span><strong>{label}</strong><small>{title}</small></span>{category === index && <Check size={14} />}</JigglyButton>)}</div>
      <div className="er-showcase__bottom"><div><JigglyButton type="button" aria-label="Ver contenido anterior" data-morph-tooltip="Ver contenido anterior" onClick={() => setCategory((category + 3) % 4)}><ArrowLeft size={15} /></JigglyButton><JigglyButton type="button" aria-label="Ver siguiente contenido" data-morph-tooltip="Ver siguiente contenido" onClick={() => setCategory((category + 1) % 4)}><ArrowRight size={15} /></JigglyButton></div><JigglyButton className="er-button er-button--primary er-button--small" href="#sistema">Conocer el sistema</JigglyButton></div>
    </Tabs.Content>
    <Tabs.Content value="care" className="er-showcase__panel er-showcase__service"><div><span className="er-label">Elevator Membership</span><h2>Publicar es<br />solo el principio.</h2><p>Mantenimiento y ciclos de mejora para que la web de tu clínica siga trabajando.</p><JigglyButton href="#membership" className="er-button er-button--primary">Conocer la membresía</JigglyButton></div><div className="er-showcase__care"><span>Revisar <ArrowRight size={14} />Priorizar <ArrowRight size={14} />Mejorar</span><ul><li><Check size={16} />Hosting y mantenimiento técnico</li><li><Check size={16} />Monitoreo de demanda local</li><li><Check size={16} />3 créditos mensuales de solicitudes</li></ul></div></Tabs.Content>
    <Tabs.Content value="diagnosis" className="er-showcase__panel er-showcase__service"><div><span className="er-label">Diagnóstico gratuito</span><h2>Entiende tu web.<br />Decide por dónde empezar.</h2><p>Revisamos una página y te enviamos evidencia y hasta tres prioridades por email.</p><JigglyButton href="/diagnostico-seo" className="er-button er-button--primary">Solicitar diagnóstico</JigglyButton></div><div className="er-showcase__report"><ShieldCheck size={28} strokeWidth={1.2} /><h3>Una revisión con contexto.</h3><ul><li><span>01</span>Velocidad y experiencia en celular</li><li><span>02</span>Información básica de la página</li><li><span>03</span>Claridad para buscadores e IA</li></ul><small>Gratis. Sin tarjeta ni cuenta.</small></div></Tabs.Content>
  </Tabs.Root>;
}

export function DentalMethodCarousel() {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  return <div className="er-method-carousel" role="region" aria-label="Pasos del método Elevator" aria-roledescription="carrusel"><JigglyButton className="er-method-carousel__prev" type="button" aria-label="Paso anterior" data-morph-tooltip="Paso anterior" onClick={() => setIndex((index + 2) % 3)}><ArrowLeft size={16} /></JigglyButton><div className="er-method-carousel__slide" aria-live="polite" aria-atomic="true"><div className="er-method-carousel__visual" style={{ backgroundImage: `url('/visual/eleven/${step.image}')` }}><span>{String(index + 1).padStart(2, "0")}</span></div><div><span className="er-label">Paso {index + 1} de 3</span><h3>{step.title}</h3><p>{step.description}</p><small>{step.detail}</small></div></div><JigglyButton className="er-method-carousel__next" type="button" aria-label="Paso siguiente" data-morph-tooltip="Paso siguiente" onClick={() => setIndex((index + 1) % 3)}><ArrowRight size={16} /></JigglyButton><div className="er-method-carousel__pagination" aria-label="Seleccionar paso">{steps.map(({ title }, stepIndex) => <button type="button" key={title} aria-label={`Paso ${stepIndex + 1}: ${title}`} aria-pressed={stepIndex === index} onClick={() => setIndex(stepIndex)} />)}</div></div>;
}
