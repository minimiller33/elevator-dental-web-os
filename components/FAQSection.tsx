import { Check, Spark } from "./Icons";

const faqs = [
  {
    category: "INVERSIÓN",
    question: "¿Cómo se define el alcance y la inversión?",
    answer:
      "En una llamada revisamos las necesidades de tu clínica, el alcance inicial y la operación mensual. Te explicamos cada etapa y su inversión para que puedas decidir con claridad antes de comenzar.",
  },
  {
    category: "PARA QUIÉN ES",
    question: "¿Sirve para un profesional independiente o solo para clínicas?",
    answer:
      "Está pensada para clínicas dentales y profesionales independientes de la odontología, como implantólogos, ortodoncistas y especialistas en rehabilitación. La estrategia se adapta a los servicios y al área donde atiendes.",
  },
  {
    category: "EXPECTATIVAS",
    question: "¿Me garantiza aparecer primero en Google o en ChatGPT?",
    answer:
      "No. Ningún servicio puede controlar qué posición ocupa una página ni qué recomienda una plataforma de IA. Sí trabajamos para que la información de tu clínica sea clara, rastreable y útil, y para mejorarla con señales del mercado.",
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
          <p>Qué hacemos, para quién funciona y qué resultados dependen de cada plataforma.</p>

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
