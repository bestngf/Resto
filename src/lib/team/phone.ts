export const digits = (p: string | null | undefined) => (p ?? "").replace(/\D/g, "");
export const validPhone = (p: string) => { const d = digits(p); return d.length >= 8 && d.length <= 15; };
