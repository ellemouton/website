// Table-of-contents extraction for post pages.
//
// Posts are rendered to an HTML string at build time (see lib/posts.ts),
// so the headings are scraped from that string rather than walking a DOM.
// Both ToC renderers — the inline <details> block on narrow screens and
// the sticky sidebar rail on wide ones — consume the same tree.

// Matches an opening heading tag of the wanted level, capturing its whole
// attribute string so `id` and `class` can be read out of it in either
// order (rehype-slug usually emits id first, but we don't want to bind to
// that). Inner content runs up to the matching closing tag.
const HEADING_RE = /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
const ID_RE = /\bid="([^"]*)"/i;
const CLASS_RE = /\bclass="([^"]*)"/i;

// Headings carrying this class exist only for screen readers — the
// "Footnotes" heading rehype appends is the one in practice. They are
// invisible in the prose, so listing them would offer a jump to a
// section the reader cannot see, and let the scrollspy highlight a
// heading with no visible content under it.
const VISUALLY_HIDDEN_CLASS = "sr-only";

export type Heading = {
  level: 2 | 3;
  id: string;
  text: string;
};

export type TocNode = { id: string; text: string; children: TocNode[] };

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  for (const match of html.matchAll(HEADING_RE)) {
    const level = Number(match[1]) as 2 | 3;
    const attrs = match[2] ?? "";
    const id = attrs.match(ID_RE)?.[1] ?? "";
    const cls = attrs.match(CLASS_RE)?.[1] ?? "";
    const text = stripHtml(match[3]);
    if (!id || !text) continue;
    if (cls.split(/\s+/).includes(VISUALLY_HIDDEN_CLASS)) continue;
    headings.push({ level, id, text });
  }
  return headings;
}

// Groups a flat heading list into h2 buckets with their following h3s.
// Stray h3s before any h2 are hoisted to the top level so they still
// appear (rare but possible for short posts that skip h2 altogether).
export function nest(headings: Heading[]): TocNode[] {
  const roots: TocNode[] = [];
  let current: TocNode | null = null;
  for (const h of headings) {
    const node: TocNode = { id: h.id, text: h.text, children: [] };
    if (h.level === 2) {
      roots.push(node);
      current = node;
    } else if (current) {
      current.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// Flattens the nested tree back into document order. The scrollspy walks
// this to decide which heading is current, so the order has to match the
// order the headings actually appear on the page.
export function flattenIds(nodes: TocNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: TocNode[]) => {
    for (const n of list) {
      ids.push(n.id);
      walk(n.children);
    }
  };
  walk(nodes);
  return ids;
}
