import parsePhoneNumber, { type CountryCode } from "libphonenumber-js/min";

export function normalizeWhatsApp(value: string, country?: CountryCode) {
  const raw = value.trim().replace(/^00/, "+");
  if (!raw || (!country && !raw.startsWith("+"))) return null;
  const phone = parsePhoneNumber(raw, { defaultCountry: country, extract: false });
  // Length validation avoids rejecting newly allocated number ranges.
  if (!phone || phone.ext || !phone.isPossible()) return null;
  return phone.number;
}
