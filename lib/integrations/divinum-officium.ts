/**
 * Import adapter for Divinum Officium.
 * Upstream Mass text files are stored under web/www/missa/<language>/ and are UTF-8
 * section files. Imports must retain source path, edition, attribution and MIT notice,
 * then pass editorial review before becoming public. This adapter does not auto-crawl.
 */
export interface ImportedSection { key: string; text: string }
export function parseDivinumOfficiumText(sourcePath: string, language: string, input: string) {
  const sections: ImportedSection[] = [];
  let current: ImportedSection | null = null;
  for (const rawLine of input.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const heading = /^\[([^\]]+)\]\s*$/.exec(rawLine.trim());
    if (heading) {
      current = { key: heading[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"), text: "" };
      sections.push(current);
    } else if (current) {
      current.text += (current.text ? "\n" : "") + rawLine;
    }
  }
  return { sourcePath, language, sections: sections.filter((section) => section.text.trim()) };
}
