"use client";

import { CtaSection } from "@/components/arc/blocks/cta-section/cta-section";
import { FaqSection } from "@/components/arc/blocks/faq-section/faq-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/arc/tabs/tabs";
import { DiagnosisExampleDialog } from "@/components/DiagnosisExampleDialog";
import styles from "./DentalArcSections.module.css";

const questions = [
  { id: "diagnostico", question: "¿Qué recibo con el diagnóstico gratuito?", answer: "Una revisión de la página que nos compartas: cómo carga en celular, sus ajustes básicos, señales de claridad para buscadores e IA y hasta tres acciones para empezar a mejorarla. Te enviamos el resultado por email. No necesitas tarjeta ni crear una cuenta." },
  { id: "alcance", question: "¿El diagnóstico me dice en qué posición aparezco en Google?", answer: "No. Revisa una sola página y te ayuda a entender cómo funciona. No mide posiciones en Google, visitas a tu web ni presencia en Google Maps. Así puedes distinguir los ajustes de la página de un análisis completo de visibilidad." },
  { id: "ia", question: "¿El diagnóstico comprueba si ChatGPT recomienda mi clínica?", answer: "No. Identifica señales en una página: datos del negocio, ubicación, contacto y organización del contenido. Muestra evidencia y puntos que necesitan revisión humana. La presencia de esos elementos no demuestra que una IA cite o recomiende tu clínica." },
  { id: "independiente", question: "¿Funciona para una clínica pequeña o un profesional independiente?", answer: "Sí. Elevator Dental Web está pensada para clínicas y profesionales independientes de la odontología, incluidos implantólogos, ortodoncistas y especialistas en rehabilitación. Revisamos tus servicios, tu ubicación y tu situación antes de proponer un plan." },
  { id: "sin-web", question: "¿Y si todavía no tengo una web?", answer: "El diagnóstico necesita una página pública para analizarla. Si aún no tienes una, cuéntanos sobre tu clínica y los tratamientos que quieres impulsar. Podemos ayudarte a preparar una web desde el inicio." },
  { id: "servicio", question: "¿Qué diferencia hay entre el diagnóstico y la membresía?", answer: "El diagnóstico es una revisión puntual de una página. La membresía mantiene y opera tu web: incluye hosting, mantenimiento técnico, monitoreo de demanda local y ciclos mensuales de mejora. El alcance y el plan se conversan en llamada." },
  { id: "licencia", question: "¿La web es mía o funciona bajo licencia?", answer: "Elevator Web funciona bajo licencia mientras la membresía está activa. El servicio no incluye transferencia del código. Antes de contratar, revisamos contigo las condiciones de uso y de continuidad del servicio." },
  { id: "tiempos", question: "¿Cuánto tarda la publicación y cuándo se ven resultados?", answer: "El calendario se acuerda según las páginas, los materiales disponibles y las aprobaciones de la clínica. Publicar la web y ganar visibilidad son procesos distintos: el crecimiento orgánico necesita tiempo y no tiene una fecha de resultados garantizada." },
  { id: "solicitudes", question: "¿Cómo funcionan el mantenimiento y los cambios?", answer: "La membresía incluye hosting, mantenimiento técnico, ciclos de mejora y 3 créditos mensuales de solicitudes. Acordamos el alcance de cada solicitud antes de realizarla; no equivale a cambios ilimitados ni a cualquier desarrollo a medida." },
  { id: "resultados", question: "¿Me garantizan aparecer primero o recibir pacientes cada semana?", answer: "No. Ningún servicio puede controlar la posición en Google ni las respuestas de una plataforma de IA. Trabajamos para fortalecer tu visibilidad orgánica. La ubicación, la competencia, la información de tu clínica y la decisión de cada paciente también influyen." },
  { id: "contenido", question: "¿Tengo que publicar contenido todos los días?", answer: "No necesitas publicar todos los días ni automatizar la conversación clínica. Elevator trabaja la base digital para que buscadores y pacientes encuentren información clara sobre tus tratamientos. Tú revisas con nosotros los cambios sensibles de la información clínica." },
];

function DiagnosisPreview() {
  return <div className={styles.preview}>
    <h3>Lo que recibirás</h3>
    <p className={styles.intro}>Un informe para entender tu página y decidir por dónde empezar.</p><div className={styles.urlPreview}><span>URL A REVISAR</span><code>tuclinica.com/tratamiento</code><span aria-hidden="true">↗</span></div>
    <Tabs defaultValue="velocidad">
      <TabsList aria-label="Qué incluye tu diagnóstico">
        <TabsTrigger value="velocidad">Velocidad</TabsTrigger>
        <TabsTrigger value="pagina">Tu página</TabsTrigger>
        <TabsTrigger value="claridad">Buscadores e IA</TabsTrigger><TabsTrigger value="prioridades">Prioridades</TabsTrigger>
      </TabsList>
      <TabsContent value="velocidad">
        <div className={styles.panel}>
          <h4>¿Tu página hace esperar al visitante?</h4>
          <p>Verás cuánto tarda en aparecer el contenido principal en celular y qué puede estar frenando la carga.</p>
          <ul><li>Tiempo hasta ver el primer contenido</li><li>Estabilidad de textos, imágenes y botones</li><li>Oportunidades para acelerar la página</li></ul>
        </div>
      </TabsContent>
      <TabsContent value="pagina">
        <div className={styles.panel}>
          <h4>¿La información básica está en orden?</h4>
          <p>Revisamos los elementos que ayudan a visitantes y buscadores a comprender la página.</p>
          <ul><li>Título y descripción de la página</li><li>Conexión segura y adaptación al celular</li><li>Organización del contenido y descripciones de imágenes</li></ul>
        </div>
      </TabsContent>
      <TabsContent value="claridad">
        <div className={styles.panel}>
          <h4>¿Se puede entender quién eres y qué ofreces?</h4>
          <p>Buscamos señales concretas en la página y mostramos la evidencia, sin inventar una puntuación de presencia en IA.</p>
          <ul><li>Nombre del negocio, ubicación y datos estructurados</li><li>Enlaces de contacto y solicitud de cita</li><li>Preguntas, referencias a profesionales y contenido que requiere revisión</li></ul>
        </div>
      </TabsContent>
      <TabsContent value="prioridades">
        <div className={styles.panel}>
          <h4>¿Qué conviene mejorar primero?</h4>
          <p>Recibirás hasta tres acciones basadas en lo que encontremos, explicadas con palabras claras.</p>
          <ul><li>Los puntos básicos que conviene corregir</li><li>Las mejoras de carga que pueden ayudar</li><li>Una referencia para conversar con tu equipo web</li></ul>
        </div>
      </TabsContent>
    </Tabs>
    <p className={styles.footnote}>Vista del alcance del informe. Revisamos una página; no medimos posiciones ni recomendaciones de una IA.</p>
    <DiagnosisExampleDialog />
  </div>;
}

export function DentalDiagnosisSection() {
  return <div className={`edw-arc ${styles.section}`} data-theme="dark" data-accent="blue" id="diagnostico">
    <CtaSection
      variant="split"
      title="Antes de cambiar tu web, entiende cómo está"
      description="Revisa cómo carga tu página y qué información pueden identificar los buscadores y asistentes de IA. Recibe evidencia y prioridades por email."
      primaryAction={{ label: "Solicitar diagnóstico", href: "/diagnostico-seo" }}
      secondaryAction={null}
      points={["Revisamos la página que tú elijas", "Te enviamos el informe por email", "Gratis, sin tarjeta ni cuenta"]}
      visual={<DiagnosisPreview />}
    />
  </div>;
}

export function DentalQuestionsSection() {
  return <div className={`edw-arc ${styles.section}`} data-theme="dark" data-accent="blue" id="preguntas">
    <FaqSection
      variant="accordion"
      title="Preguntas antes de dar el siguiente paso"
      description="Qué revisamos, para quién es Elevator y qué puedes esperar del servicio."
      items={questions}
      defaultValue={["diagnostico"]}
      contact={{ label: "Hablemos de tu clínica", description: "Si tu caso necesita más contexto, cuéntanos qué quieres mejorar.", href: "#contacto" }}
    />
  </div>;
}
