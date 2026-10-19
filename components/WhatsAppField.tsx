"use client";

import { useId } from "react";
import parsePhoneNumber, { getCountryCallingCode, type CountryCode } from "libphonenumber-js/min";
import { normalizeWhatsApp } from "@/lib/phone";
import countryOptions from "@/lib/country-options-es.json";

// Keep server and browser labels/order identical for hydration.
const countries = countryOptions.map(({ code }) => code as CountryCode);

export function WhatsAppField({ country, number, error, onChange, onBlur }: {
  country: CountryCode; number: string; error: string;
  onChange: (country: CountryCode, number: string, international: string) => void;
  onBlur: () => void;
}) {
  const id = useId();
  const update = (nextCountry: CountryCode, raw: string) => {
    let national = raw;
    if (/^\s*(\+|00)/.test(raw)) {
      const international = raw.trim().replace(/^00/, "+");
      const parsed = parsePhoneNumber(international, { extract: false });
      if (parsed) {
        nextCountry = parsed.country || countries.find(code => getCountryCallingCode(code) === parsed.countryCallingCode) || nextCountry;
        national = parsed.nationalNumber;
      }
    }
    national = national.replace(/[^0-9\s().-]/g, "");
    onChange(nextCountry, national, normalizeWhatsApp(national, nextCountry) || "");
  };
  return <div className="qual-phone">
    <span className="qual-phone__title">WhatsApp</span>
    <div className="qual-phone__row">
      <label className="qual-field qual-phone__country"><span>País y código</span><select name="whatsappCountry" autoComplete="section-whatsapp country" value={country} onChange={event => update(event.currentTarget.value as CountryCode, number)}>{countryOptions.map(({ code, name }) => <option key={code} value={code}>{name} +{getCountryCallingCode(code as CountryCode)}</option>)}</select></label>
      <label className="qual-field qual-phone__number"><span>Número de WhatsApp</span><input id={id} name="whatsappNational" type="tel" autoComplete="tel-national" inputMode="tel" maxLength={30} value={number} onChange={event => update(country, event.currentTarget.value)} onBlur={onBlur} aria-invalid={Boolean(error)} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`} placeholder="Tu número sin el código de país" required /></label>
    </div>
    <small id={`${id}-hint`}>El código +{getCountryCallingCode(country)} se añade automáticamente.</small>
    {error && <p id={`${id}-error`} className="qual-phone__error" role="alert">{error}</p>}
  </div>;
}
