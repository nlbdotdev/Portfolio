import { Marked, Renderer } from 'marked';
export function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}
export function renderMarkdown(body: string, asset: (path: string) => string): string {
  const renderer = new Renderer();
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.link = function ({ href, tokens }) {
    const text = this.parser.parseInline(tokens);
    if (!/^(https?:\/\/|mailto:|#)/i.test(href)) return text;
    return `<a href="${escapeHtml(href)}" ${/^https?:/i.test(href) ? 'target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
  };
  renderer.image = ({ href, text }) =>
    href.startsWith('assets/')
      ? `<img src="${escapeHtml(asset(href))}" alt="${escapeHtml(text)}" loading="lazy" decoding="async" />`
      : escapeHtml(text);
  return new Marked({ renderer }).parse(body, { async: false });
}
