import { ArrowRight, CalendarDays, Check, FileText, MapPin, Search } from "lucide-react";
import { JourneyMotion } from "@/components/JourneyMotion";
import { ElevatorMascot } from "@/components/ElevatorMascot";

export function DentalVisualStory() {
  return <figure className="edw-journey" aria-labelledby="edw-journey-caption">
    <figcaption id="edw-journey-caption"><span>DE LA INFORMACIÓN AL CONTACTO</span><span>Recorrido ilustrativo</span></figcaption>
    <div className="edw-journey__canvas">
      <JourneyMotion />
      <article className="edw-journey__page">
        <div className="edw-journey__bar"><FileText size={15} /><span>La web de tu clínica</span><span>↗</span></div>
        <div className="edw-journey__page-body"><span className="edw-journey__category">ODONTOLOGÍA · TU CIUDAD</span><h3>Tus tratamientos.<br />Bien explicados.</h3><p>Qué haces, quién te atiende y cómo dar el siguiente paso.</p><div className="edw-journey__topics"><span>Servicios</span><span>Equipo</span><span>Ubicación</span></div><span className="edw-journey__page-link">Conocer las opciones <ArrowRight size={14} /></span></div>
      </article>
      <div className="edw-journey__engine"><div className="edw-journey__orb" aria-hidden="true"><ElevatorMascot /></div><strong>ELEVATOR</strong><p>Ordenar. Conectar.<br />Seguir mejorando.</p></div>
      <div className="edw-journey__outcomes">
        <div className="edw-journey__outcome"><Search size={19} /><div><strong>Información comprensible</strong><span>Para pacientes, buscadores e IA.</span></div></div>
        <div className="edw-journey__outcome"><MapPin size={19} /><div><strong>Una identidad coherente</strong><span>Servicios, profesionales y sede.</span></div></div>
        <div className="edw-journey__outcome"><CalendarDays size={19} /><div><strong>Un contacto claro</strong><span>Una ruta para solicitar una cita.</span></div><ArrowRight className="edw-journey__arrow" size={16} /></div>
      </div>
    </div>
    <div className="edw-journey__foot"><Check size={14} /><span>Información revisada contigo. La decisión de atención parte de una valoración profesional.</span></div>
  </figure>;
}

export function DentalBuildVisual() {
  return <div className="edw-blueprint" aria-label="Estructura de la web: inicio, tratamientos, equipo y ubicación"><div className="edw-blueprint__root"><FileText size={17} /> Tu clínica</div><div className="edw-blueprint__branches"><span>Tratamientos</span><span>Equipo</span><span>Ubicación</span></div><p>Una estructura. Información conectada.</p></div>;
}

export function DentalCareVisual() {
  return <div className="edw-care" aria-label="Ciclo de mejora: revisar, priorizar y mejorar"><div><span>Revisar</span><ArrowRight size={14} /><span>Priorizar</span><ArrowRight size={14} /><span>Mejorar</span></div><p>El siguiente ciclo parte de lo aprendido.</p></div>;
}
