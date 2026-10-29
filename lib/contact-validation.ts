export const validContactName = (name: string) => /\p{L}/u.test(name.trim()) && !/[<>]/.test(name);

export function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed || (/^[a-z][a-z\d+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed))) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) return "";
    return url.href;
  } catch { return ""; }
}
