import type { FormEvent } from "react";

export function revealFormElement(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  window.scrollTo({ top: Math.max(0, element.getBoundingClientRect().top + window.scrollY - 104), behavior: "instant" });
}

export function showInvalidField(event: FormEvent<HTMLFormElement>, setError: (message: string) => void) {
  event.preventDefault();
  const field = event.target as HTMLInputElement;
  // Native validation dispatches one event for every invalid field. Reveal only the first.
  if (event.currentTarget.querySelector("input:invalid, select:invalid, textarea:invalid") !== field) return;
  setError(field.validity.valueMissing ? "Completa este campo para continuar." : field.type === "email" ? "Escribe un correo válido, por ejemplo nombre@clinica.com." : "Revisa este campo para continuar.");
  revealFormElement(field);
}

export async function postForm(url: string, payload: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(25_000) });
  } catch {
    throw new Error("No pudimos confirmar el envío. Revisa tu conexión y vuelve a intentarlo; tus respuestas siguen aquí.");
  }
  const result = await response.json().catch(() => null) as { ok?: boolean; bookingUrl?: string } | null;
  if (!response.ok || !result?.ok) {
    // Providers and gateways can return technical messages in another language.
    // Keep the recovery instruction under our control instead of echoing them.
    const message = response.status === 429
      ? "Hay demasiados intentos. Tus respuestas siguen aquí; espera unos minutos antes de volver a intentarlo."
      : response.status === 400 || response.status === 422
        ? "Revisa los datos del formulario. Tus respuestas siguen aquí; corrige los campos y vuelve a intentarlo."
        : "No pudimos confirmar el envío. Tus respuestas siguen aquí; vuelve a intentarlo.";
    throw new Error(message);
  }
  return result;
}
