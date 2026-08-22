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
const HEADING_RE = /<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
const ID_RE = /\bid="([^"]*)"/i;
const CLASS_RE = /\bclass="([^"]*)"/i;

// Headings carrying this class exist only for screen readers — the
// "Footnotes" heading rehype appends is the one in practice. They are
// invisible in the prose, so listing them would offer a jump to a
// section the reader cannot see, and let the scrollspy highlight a
// heading with no visible content under it.
const VISUALLY_HIDDEN_CLASS = "sr-only";

export type Heading = {
  level: number;
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
    const level = Number(match[1]);
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

// Groups headings into a two-level tree.
//
// Posts do not share a heading convention. Some open sections at h1 and
// nest steps at h3 (sphinx, onion-routing-prelims); some start at h2;
// several start at h3 and nest at h4. Assuming a fixed h2/h3 pair meant
// the h1-style posts listed only their step-by-step sub-parts and none of
// their actual sections.
//
// So the levels are derived per post rather than fixed: whichever level
// is shallowest becomes the rail's top level, and the next shallowest
// nests under it. Anything deeper is dropped, which keeps the rail
// scannable on posts that go four levels down.
//
// This runs on the already-filtered list, so a visually hidden heading
// can never set the top level -- the footnotes h2 rehype appends would
// otherwise outrank the h3 sections of a post that starts at h3.
export function nest(headings: Heading[]): TocNode[] {
  if (headings.length === 0) return [];

  const levels = [...new Set(headings.map((h) => h.level))].sort((a, b) => a - b);
  const topLevel = levels[0];
  const childLevel = levels[1];

  const roots: TocNode[] = [];
  let current: TocNode | null = null;
  for (const h of headings) {
    if (h.level !== topLevel && h.level !== childLevel) continue;
    const node: TocNode = { id: h.id, text: h.text, children: [] };
    if (h.level === topLevel) {
      roots.push(node);
      current = node;
    } else if (current) {
      // A child heading that appears before any top-level one is hoisted
      // so it still shows up rather than being silently dropped.
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
