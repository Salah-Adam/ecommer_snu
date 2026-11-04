/** Normalises Somali mobile numbers to +252XXXXXXXXX. Returns null if invalid. */
export function normalizeSomaliPhone(input: string): string | null {
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+252")) d = d.slice(4);
  else if (d.startsWith("00252")) d = d.slice(5);
  else if (d.startsWith("252") && d.length === 12) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  if (!/^[1-9]\d{8}$/.test(d)) return null;
  return `+252${d}`;
}

/** The two-digit operator prefix, e.g. "61" for +25261xxxxxxx. */
export const phonePrefix = (normalized: string) => normalized.slice(4, 6);

export const formatSomaliPhone = (normalized: string) =>
  normalized.replace(/^\+252(\d{2})(\d{3})(\d{4})$/, "+252 $1 $2 $3");
