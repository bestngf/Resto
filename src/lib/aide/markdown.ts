// Mini-parseur Markdown pour les articles d'aide.
// Il produit une structure de donnees (jamais de HTML) : l'affichage se fait avec des
// elements React, donc aucun code injecte dans un article ne peut s'executer.
//
// Syntaxe prise en charge :
//   ## Titre, ### Sous-titre, paragraphes, listes "- " et "1. ",
//   > astuce, **gras**, *italique*, [texte](lien), ::illustration nom

export type Inline =
  | { k: "t"; v: string }
  | { k: "b"; v: Inline[] }
  | { k: "i"; v: Inline[] }
  | { k: "a"; v: Inline[]; href: string };

export type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; inline: Inline[] }
  | { type: "ul"; items: Inline[][] }
  | { type: "ol"; items: Inline[][] }
  | { type: "tip"; inline: Inline[] }
  | { type: "illustration"; name: string };

/** Seuls les liens internes, https, mailto et tel sont autorises. */
export function isSafeHref(href: string): boolean {
  if (/[\s\u0000-\u001f]/.test(href)) return false;
  if (/^\/(?!\/)/.test(href)) return true;
  return /^(https:\/\/|mailto:|tel:)/i.test(href);
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf) {
      out.push({ k: "t", v: buf });
      buf = "";
    }
  };
  while (i < src.length) {
    if (src.startsWith("**", i)) {
      const j = src.indexOf("**", i + 2);
      if (j > i + 2) {
        flush();
        out.push({ k: "b", v: parseInline(src.slice(i + 2, j)) });
        i = j + 2;
      } else {
        buf += "**";
        i += 2;
      }
      continue;
    }
    if (src[i] === "*") {
      const j = src.indexOf("*", i + 1);
      if (j > i + 1 && src[j + 1] !== "*") {
        flush();
        out.push({ k: "i", v: parseInline(src.slice(i + 1, j)) });
        i = j + 1;
        continue;
      }
    }
    if (src[i] === "[") {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(src.slice(i));
      if (m && isSafeHref(m[2])) {
        flush();
        out.push({ k: "a", v: parseInline(m[1]), href: m[2] });
        i += m[0].length;
        continue;
      }
    }
    buf += src[i];
    i += 1;
  }
  flush();
  return out;
}

const isBlockStart = (line: string) =>
  /^(#{2,3} |- |\d+\. |> |::illustration )/.test(line);

export function parseBlocks(body: string): Block[] {
  const lines = body.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (!line.trim()) {
      i += 1;
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^### (.+)$/.exec(line))) {
      blocks.push({ type: "h3", text: m[1].trim() });
      i += 1;
    } else if ((m = /^## (.+)$/.exec(line))) {
      blocks.push({ type: "h2", text: m[1].trim() });
      i += 1;
    } else if ((m = /^::illustration ([a-z0-9-]+)$/.exec(line))) {
      blocks.push({ type: "illustration", name: m[1] });
      i += 1;
    } else if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        parts.push(lines[i].slice(2).trim());
        i += 1;
      }
      blocks.push({ type: "tip", inline: parseInline(parts.join(" ")) });
    } else if (line.startsWith("- ")) {
      const items: Inline[][] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(parseInline(lines[i].slice(2).trim()));
        i += 1;
      }
      blocks.push({ type: "ul", items });
    } else if (/^\d+\. /.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\d+\. /, "").trim()));
        i += 1;
      }
      blocks.push({ type: "ol", items });
    } else {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
        parts.push(lines[i].trim());
        i += 1;
      }
      blocks.push({ type: "p", inline: parseInline(parts.join(" ")) });
    }
  }
  return blocks;
}

/** Texte brut (sans mise en forme) des premiers caracteres, pour la recherche. */
export function makeSummary(body: string, max = 320): string {
  const text = body
    .replace(/::illustration [a-z0-9-]+/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, max);
}
