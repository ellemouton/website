"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flattenIds, type TocNode } from "@/lib/toc";

// A heading counts as "current" once its top edge has scrolled above this
// line, measured in px from the top of the viewport. Sitting a little way
// down the screen (rather than at 0) means a heading lights up as it
// reaches the top of the reading area, which is where the eye is, instead
// of only once it has scrolled off. Roughly one header-height plus some
// breathing room.
const ACTIVE_LINE_PX = 96;

// How close to the document bottom counts as "at the bottom", in px. The
// final section is often short enough that its heading never crosses
// ACTIVE_LINE_PX, so without this the last entry could never activate.
const BOTTOM_EPSILON_PX = 2;

// Keeps the active entry this many px clear of the rail's own edges when
// auto-scrolling a long ToC, so the current item never sits flush against
// the top or bottom where it reads as cut off.
const RAIL_SCROLL_PADDING_PX = 24;

function TocList({
  nodes,
  activeId,
  depth = 0,
}: {
  nodes: TocNode[];
  activeId: string | null;
  depth?: number;
}) {
  return (
    <ul className={depth === 0 ? "flex list-none flex-col gap-3 p-0 m-0" : "mt-2 flex list-none flex-col gap-2 p-0 m-0 pl-4"}>
      {nodes.map((n) => {
        const active = n.id === activeId;
        return (
          <li key={n.id}>
            <a
              href={`#${n.id}`}
              data-toc-id={n.id}
              // aria-current="location" is the correct token for "this is
              // where you are in the document" — it also doubles as the
              // styling hook, so the active look never drifts from the
              // value screen readers announce.
              aria-current={active ? "location" : undefined}
              className={
                "toc-link group inline-flex items-baseline gap-2 " +
                (depth === 0
                  ? "text-xs font-semibold uppercase tracking-[0.08em] "
                  : "text-xs normal-case tracking-normal ") +
                "text-[color:var(--secondary)] hover:text-[color:var(--primary)]"
              }
            >
              {/* Same growing dash as the About-page rail: it extends on
               * hover, and stays extended while the entry is current. */}
              <span
                aria-hidden
                className="toc-dash inline-block h-px shrink-0 bg-[color:var(--secondary)] transition-[width] duration-300"
              />
              <span>{n.text}</span>
            </a>
            {n.children.length > 0 && (
              <TocList nodes={n.children} activeId={activeId} depth={depth + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function PostTocSidebar({ nodes }: { nodes: TocNode[] }) {
  const ids = useMemo(() => flattenIds(nodes), [nodes]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const railRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      // Bottom of the page: nothing below can win, so pin to the last
      // heading. Without this the closing section stays unhighlighted.
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - BOTTOM_EPSILON_PX;
      if (scrolledToBottom) {
        setActiveId(ids[ids.length - 1]);
        return;
      }

      // `ids` is in document order, so the current section is the last
      // heading whose top has crossed the line. The first heading below
      // it ends the search.
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_LINE_PX) current = id;
        else break;
      }
      // Above the first heading (the intro), highlight the first entry
      // rather than nothing, so the rail never looks inert.
      setActiveId(current ?? ids[0]);
    };

    // Scroll fires far more often than we need to repaint; coalesce to one
    // measurement per frame so the reads stay cheap and off the scroll path.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  // Long posts give a ToC taller than the rail, so the active entry can
  // drift out of view. Nudge the rail's own scroll (never the page's) to
  // keep it visible.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !activeId) return;
    const link = rail.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId)}"]`);
    if (!link) return;

    const railBox = rail.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    if (linkBox.top < railBox.top + RAIL_SCROLL_PADDING_PX) {
      rail.scrollTop -= railBox.top + RAIL_SCROLL_PADDING_PX - linkBox.top;
    } else if (linkBox.bottom > railBox.bottom - RAIL_SCROLL_PADDING_PX) {
      rail.scrollTop += linkBox.bottom - (railBox.bottom - RAIL_SCROLL_PADDING_PX);
    }
  }, [activeId]);

  if (nodes.length === 0) return null;

  return (
    <nav ref={railRef} className="post-toc-rail" aria-label="Table of contents">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--content)]">
        Contents
      </p>
      <TocList nodes={nodes} activeId={activeId} />
    </nav>
  );
}
