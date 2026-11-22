// Génération de QR codes (paquet « qrcode », déjà prévu dans l'installation du projet).
import QRCode from "qrcode";

export const tableUrl = (base: string, slug: string, qrToken: string) => `${base}/r/${slug}/table/${qrToken}`;

export function qrDataUrl(text: string, size = 512): Promise<string> {
  return QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: "M" });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
