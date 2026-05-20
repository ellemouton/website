// Matches an opening heading tag of the wanted level. The `id` may appear
// before or after other attributes (rehype-slug usually emits it first,
// but we don't want to bind to that), and the inner content runs up to
// the matching closing tag.
const HEADING_RE = /<h([23])\b[^>]*?\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;

type Heading = {
  level: 2 | 3;
  id: string;
  text: string;
};

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  for (const match of html.matchAll(HEADING_RE)) {
    const level = Number(match[1]) as 2 | 3;
    const id = match[2];
    const text = stripHtml(match[3]);
    if (!id || !text) continue;
    headings.push({ level, id, text });
  }
  return headings;
}

// Groups a flat heading list into h2 buckets with their following h3s.
// Stray h3s before any h2 are hoisted to the top level so they still
// appear (rare but possible for short posts that skip h2 altogether).
type TocNode = { id: string; text: string; children: TocNode[] };

function nest(headings: Heading[]): TocNode[] {
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

function TocList({ nodes }: { nodes: TocNode[] }) {
  return (
    <ul>
      {nodes.map((n) => (
        <li key={n.id}>
          <a href={`#${n.id}`}>{n.text}</a>
          {n.children.length > 0 && <TocList nodes={n.children} />}
        </li>
      ))}
    </ul>
  );
}

export function PostToc({ html }: { html: string }) {
  const headings = extractHeadings(html);
  if (headings.length === 0) return null;
  const tree = nest(headings);

  return (
    <div className="toc">
      <details open>
        <summary>
          <span className="details">Table of Contents</span>
        </summary>
        <div className="inner">
          <TocList nodes={tree} />
        </div>
      </details>
    </div>
  );
}
