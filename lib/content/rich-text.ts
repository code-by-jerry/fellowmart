/** Lightweight markdown-ish → safe HTML for blog/pages. */
export function renderRichTextHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const blocks = escaped.split(/\n{2,}/);

  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      if (trimmed.startsWith("### ")) {
        return `<h3>${inlineFormat(trimmed.slice(4))}</h3>`;
      }
      if (trimmed.startsWith("## ")) {
        return `<h2>${inlineFormat(trimmed.slice(3))}</h2>`;
      }
      if (trimmed.startsWith("# ")) {
        return `<h2>${inlineFormat(trimmed.slice(2))}</h2>`;
      }

      const withBreaks = inlineFormat(trimmed).replace(/\n/g, "<br />");
      return `<p>${withBreaks}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

function inlineFormat(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>',
    );
}
