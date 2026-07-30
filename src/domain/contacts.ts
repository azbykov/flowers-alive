/** Structured seller contact channels + deep-link helpers. */

export interface ContactChannels {
  phone: string;
  telegram: string;
  whatsapp: string;
}

const EMPTY: ContactChannels = { phone: "", telegram: "", whatsapp: "" };

/** Strip @ and whitespace; empty string if nothing left. */
export function normalizeTelegram(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

/** Digits only (for tel: / wa.me). Keeps leading country code digits. */
export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function normalizePhone(raw: string): string {
  return raw.trim();
}

export function hasAnyContact(c: ContactChannels): boolean {
  return Boolean(
    normalizePhone(c.phone) ||
      normalizeTelegram(c.telegram) ||
      normalizePhone(c.whatsapp),
  );
}

/** Heuristic split of legacy freeform `contact` into typed channels. */
export function parseLegacyContact(contact: string): ContactChannels {
  const trimmed = contact.trim();
  if (!trimmed) return { ...EMPTY };
  if (trimmed.startsWith("@")) {
    return { ...EMPTY, telegram: normalizeTelegram(trimmed) };
  }
  // Bare telegram-looking handle without @
  if (/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(trimmed) && !/\d{6,}/.test(trimmed)) {
    return { ...EMPTY, telegram: trimmed };
  }
  return { ...EMPTY, phone: trimmed };
}

/**
 * Merge DB row: prefer structured columns; fall back to parsing legacy `contact`.
 */
export function resolveContacts(row: {
  phone?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
  contact?: string | null;
}): ContactChannels {
  const phone = (row.phone ?? "").trim();
  const telegram = normalizeTelegram(row.telegram ?? "");
  const whatsapp = (row.whatsapp ?? "").trim();
  if (phone || telegram || whatsapp) {
    return { phone, telegram, whatsapp };
  }
  return parseLegacyContact(row.contact ?? "");
}

/** Single-line label for legacy `contact` column sync. */
export function legacyContactLabel(c: ContactChannels): string {
  const phone = normalizePhone(c.phone);
  if (phone) return phone;
  const tg = normalizeTelegram(c.telegram);
  if (tg) return `@${tg}`;
  return normalizePhone(c.whatsapp);
}

export function phoneHref(phone: string): string | null {
  const digits = digitsOnly(phone);
  if (digits.length < 8) return null;
  return `tel:+${digits.replace(/^\+/, "")}`;
}

export function telegramHref(telegram: string): string | null {
  const user = normalizeTelegram(telegram);
  if (!/^[a-zA-Z0-9_]{5,32}$/.test(user)) return null;
  return `https://t.me/${user}`;
}

export function whatsappHref(whatsapp: string): string | null {
  const digits = digitsOnly(whatsapp);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

/** Soft format checks — empty is ok; non-empty must look plausible. */
export function isValidPhoneInput(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  const digits = digitsOnly(trimmed);
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidTelegramInput(raw: string): boolean {
  const user = normalizeTelegram(raw);
  if (!user) return true;
  return /^[a-zA-Z0-9_]{5,32}$/.test(user);
}

export function avatarColor(name: string): string {
  const colors = ["#c2557a", "#d98324", "#6d9a4f", "#7c68ad", "#b23b4e"];
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return colors[sum % colors.length];
}
