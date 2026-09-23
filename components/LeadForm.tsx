"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Check } from "./Icons";

const activationFields = [
  { name: "name", step: "01", label: "Tú" },
  { name: "clinic", step: "02", label: "Clínica" },
  { name: "city", step: "03", label: "Mercado" },
  { name: "contact", step: "04", label: "Contacto" },
] as const;

export function LeadForm() {
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [completedFields, setCompletedFields] = useState<Record<string, boolean>>({});

  const completedCount = activationFields.filter((field) => completedFields[field.name]).length;

  function updateField(name: string, value: string) {
    const completed = value.trim().length > 1;
    setCompletedFields((current) => current[name] === completed ? current : { ...current, [name]: completed });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = [
      `Nombre: ${data.get("name") ?? ""}`,
      `Clínica: ${data.get("clinic") ?? ""}`,
      `Ciudad: ${data.get("city") ?? ""}`,
      `Contacto: ${data.get("contact") ?? ""}`,
    ].join("\n");

    const href = `mailto:hello@theelevator.io?subject=${encodeURIComponent("Solicitud — Elevator Web")}&body=${encodeURIComponent(body)}`;
    setEmailDraft(href);
    window.location.href = href;
  }

  if (emailDraft) {
    return (
      <div className="form-success form-success--activated" role="status">
        <span className="form-success__pulse"><Check /></span>
        <div>
          <small>SECUENCIA PREPARADA · 4/4</small>
          <strong>Tu solicitud está lista para enviar.</strong>
          <p>Confirma el envío desde tu correo. Si no se abrió automáticamente, usa el botón de abajo.</p>
          <a className="button button--light button--full" href={emailDraft}>
            Abrir y enviar mi solicitud <ArrowUpRight />
          </a>
          <button className="form-success__edit" type="button" onClick={() => setEmailDraft(null)}>
            Editar mis datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div className="form-activation-head">
        <span><i /> VERIFICACIÓN DE ENCAJE</span>
        <strong>{completedCount}/4 señales listas</strong>
      </div>

      <div
        className="form-activation-progress"
        role="progressbar"
        aria-label="Progreso de la solicitud"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={completedCount}
      >
        {activationFields.map((field) => (
          <span className={completedFields[field.name] ? "is-complete" : ""} key={field.name}>
            <i>{field.step}</i><b>{field.label}</b><Check />
          </span>
        ))}
      </div>

      <div className="field-row">
        <label>
          <span><i>01</i> Tu nombre</span>
          <input name="name" autoComplete="name" placeholder="Nombre y apellido" onChange={(event) => updateField("name", event.currentTarget.value)} required />
        </label>
        <label>
          <span><i>02</i> Nombre de la clínica</span>
          <input name="clinic" autoComplete="organization" placeholder="Clínica Dental" onChange={(event) => updateField("clinic", event.currentTarget.value)} required />
        </label>
      </div>
      <div className="field-row">
        <label>
          <span><i>03</i> Ciudad</span>
          <input name="city" autoComplete="address-level2" placeholder="Madrid, CDMX…" onChange={(event) => updateField("city", event.currentTarget.value)} required />
        </label>
        <label>
          <span><i>04</i> Email o WhatsApp</span>
          <input name="contact" placeholder="¿Dónde podemos contactarte?" onChange={(event) => updateField("contact", event.currentTarget.value)} required />
        </label>
      </div>
      <button className="button button--light button--full" type="submit">
        Verificar encaje para mi Elevator Web <ArrowUpRight />
      </button>
      <p className="form-note"><span /> Cuatro datos. Recibirás una respuesta de encaje, no una propuesta genérica.</p>
    </form>
  );
}
