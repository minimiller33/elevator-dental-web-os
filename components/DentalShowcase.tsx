"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowUpRight, Check, FileText, Search, Settings2 } from "lucide-react";
import { ElevatorMascot } from "@/components/ElevatorMascot";
import { DentalVisualStory, DentalCareVisual } from "@/components/DentalVisualStory";

const panels = [
  { id: "web", label: "Elevator Web", icon: FileText },
  { id: "membership", label: "Membership", icon: Settings2 },
  { id: "diagnosis", label: "Diagnóstico", icon: Search },
];

export function DentalShowcase() {
  return <Tabs.Root className="edw-showcase" defaultValue="web" activationMode="automatic">
    <Tabs.List className="edw-showcase__tabs" aria-label="Explora los servicios de Elevator">
      {panels.map(({ id, label, icon: Icon }) => <Tabs.Trigger key={id} value={id} className="edw-showcase__tab"><Icon size={15} aria-hidden="true" /><span>{label}</span></Tabs.Trigger>)}
    </Tabs.List>
    <Tabs.Content value="web" className="edw-showcase__panel">
      <div className="edw-showcase__orbs" aria-label="Tu clínica, Elevator y quienes buscan atención dental">
        <div className="edw-showcase__orb-item"><div className="edw-showcase__sphere edw-showcase__sphere--clinic" /><span>Tu clínica</span></div>
        <div className="edw-showcase__orb-item edw-showcase__orb-item--main"><div className="edw-showcase__sphere edw-showcase__sphere--elevator"><ElevatorMascot /></div><span>Elevator Dental Web</span></div>
        <div className="edw-showcase__orb-item"><div className="edw-showcase__sphere edw-showcase__sphere--search"><Search size={48} strokeWidth={1} aria-hidden="true" /></div><span>Quienes te buscan</span></div>
      </div>
      <div className="edw-showcase__features"><div><strong>Tratamientos claros</strong><span>Qué haces y cómo puedes ayudar.</span></div><div><strong>Presencia orgánica</strong><span>Información para buscadores e IA.</span></div><div><strong>Contacto sencillo</strong><span>El siguiente paso, siempre a mano.</span></div></div>
      <div className="edw-showcase__bottom"><span>Tu clínica, conectada con su próxima oportunidad.</span><a href="#sistema">Conocer el sistema <ArrowUpRight size={15} /></a></div>
      <details className="edw-showcase__details"><summary>Ver el recorrido de la información al contacto <span aria-hidden="true">+</span></summary><DentalVisualStory /></details>
    </Tabs.Content>
    <Tabs.Content value="membership" className="edw-showcase__panel edw-showcase__membership">
      <div className="edw-showcase__service-copy"><span>Elevator Membership</span><h2>Publicar es<br />solo el principio.</h2><p>Mantenimiento y ciclos de mejora para que la web de tu clínica siga trabajando.</p><a className="edw-button edw-button--light" href="#inversion">Ver qué incluye <ArrowUpRight size={16} /></a></div>
      <div className="edw-showcase__cycle"><DentalCareVisual /><ul><li><Check size={16} />Hosting y mantenimiento técnico</li><li><Check size={16} />Monitoreo de demanda local</li><li><Check size={16} />3 créditos mensuales de solicitudes</li></ul></div>
    </Tabs.Content>
    <Tabs.Content value="diagnosis" className="edw-showcase__panel edw-showcase__diagnosis">
      <div className="edw-showcase__service-copy"><span>Diagnóstico gratuito</span><h2>Entiende tu web.<br />Decide por dónde empezar.</h2><p>Revisamos una página y te enviamos evidencia y hasta tres prioridades por email.</p><a className="edw-button edw-button--light" href="/diagnostico-seo">Solicitar diagnóstico <ArrowUpRight size={16} /></a></div>
      <div className="edw-showcase__report"><FileText size={24} strokeWidth={1.3} /><h3>Una revisión con contexto.</h3><ul><li><span>01</span>Velocidad y experiencia en celular</li><li><span>02</span>Información básica de la página</li><li><span>03</span>Claridad para buscadores e IA</li></ul><small>Gratis. Sin tarjeta ni cuenta.</small></div>
    </Tabs.Content>
  </Tabs.Root>;
}
