import { type TocNode } from "@/lib/toc";

// Inline, collapsible ToC shown on narrow screens only. Wide screens get
// the sticky rail (PostTocSidebar) instead — a position:sticky sidebar has
// nowhere to live on a phone, so the two are mutually exclusive rather
// than the same component reflowing.

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

export function PostToc({ nodes }: { nodes: TocNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <div className="toc">
      <details>
        <summary>
          <span className="details">Table of Contents</span>
        </summary>
        <div className="inner">
          <TocList nodes={nodes} />
        </div>
      </details>
    </div>
  );
}
