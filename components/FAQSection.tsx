import { Check, Spark } from "./Icons";

const faqs = [
  {
    category: "INVERSIÓN",
    question: "¿Qué pago por la activación y qué se cobra después?",
    answer:
      "La activación de $1,497 USD cubre onboarding, construcción, configuración y publicación. Cuando la web entra en operación comienza la Membership de $697 USD al mes, que mantiene la infraestructura y el ciclo mensual de crecimiento.",
  },
  {
    category: "PRIMEROS 90 DÍAS",
    question: "¿Qué puedo esperar durante los primeros 90 días?",
    answer:
      "Una web publicada y medible, una línea base, oportunidades detectadas y los primeros ciclos de mejora. Es una proyección operativa; no garantizamos posiciones, recomendaciones de IA ni pacientes específicos.",
  },
  {
    category: "EXPECTATIVAS",
    question: "¿Qué resultados puede y no puede garantizar Elevator?",
    answer:
      "Elevator garantiza la operación acordada: monitoreo, priorización, protección técnica y mejoras mensuales. No puede garantizar una posición, recomendación de IA o cantidad de pacientes; también influyen tu mercado, oferta y capacidad de conversión.",
  },
  {
    category: "CONTROL",
    question: "¿Cómo funcionan el CMS, las aprobaciones y los créditos?",
    answer:
      "No tienes que administrar otro CMS. Solicitas cambios en lenguaje sencillo y apruebas información médica, legal, comercial o sensible para SEO. La Membership incluye 3 créditos mensuales para solicitudes estandarizadas; no incluye desarrollo ilimitado a medida.",
  },
  {
    category: "PROPIEDAD",
    question: "¿Qué ocurre con la web si cancelo?",
    answer:
      "Tu clínica conserva su dominio, marca y materiales propios. Elevator conserva el sistema y el código; al cancelar terminan la licencia, el hosting y la operación mensual. Las condiciones de migración se acuerdan antes de comenzar.",
  },
];

export function FAQSection() {
  return (
    <section className="faq-section section-light" id="preguntas">
      <div className="faq-orbit" aria-hidden="true" />
      <div className="container faq-layout">
        <aside className="faq-intro" data-reveal="left">
          <span className="kicker">06 · ANTES DE ACTIVAR</span>
          <h2>Lo importante.<br /><span>Sin letra pequeña.</span></h2>
          <p>Cinco respuestas para decidir con claridad y cero promesas escondidas.</p>

          <div className="faq-console" aria-hidden="true">
            <div><span><i /> REVISIÓN DE CLARIDAD</span><small>5 PUNTOS</small></div>
            <strong>Sabes exactamente<br />qué estás adquiriendo.</strong>
            <div className="faq-console__checks">
              {faqs.map((faq, index) => <span key={faq.category}>0{index + 1}<Check /></span>)}
            </div>
          </div>
        </aside>

        <div className="faq-list" data-reveal="right">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>
                <span className="faq-number">0{index + 1}</span>
                <span className="faq-question">
                  <small>{faq.category}</small>
                  <strong>{faq.question}</strong>
                </span>
                <span className="faq-toggle"><i>+</i><Check /></span>
              </summary>
              <div className="faq-answer">
                <Spark />
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
          <p className="faq-closing"><Check /> Si algo no está claro, no deberías comprarlo. Por eso lo dejamos definido antes de comenzar.</p>
        </div>
      </div>
    </section>
  );
}
