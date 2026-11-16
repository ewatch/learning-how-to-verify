/** Minimal inline formatting for data strings: escapes HTML, turns `code` into <code>. */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
export function inline(s: string): string {
  return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
}
