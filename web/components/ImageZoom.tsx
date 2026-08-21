"use client";

import { useEffect, useState } from "react";

/**
 * Click-to-magnify for images inside `.post-content`.
 *
 * Post bodies are injected with dangerouslySetInnerHTML, so there are no React
 * nodes to attach handlers to. This binds a single delegated listener instead and
 * renders the overlay itself. Diagrams are scaled down hard to the column width,
 * which is what makes this worth having.
 */
export function ImageZoom() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const root = document.querySelector(".post-content");
    if (!root) return;

    root.querySelectorAll("img").forEach((img) => {
      (img as HTMLImageElement).style.cursor = "zoom-in";
    });

    const onClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "IMG") return;
      // leave images that are already links alone
      if (target.closest("a")) return;
      setSrc((target as HTMLImageElement).currentSrc || (target as HTMLImageElement).src);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSrc(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [src]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged diagram"
      onClick={() => setSrc(null)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "rgba(0,0,0,0.75)",
        cursor: "zoom-out",
        overflow: "auto",
      }}
    >
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%",
          minWidth: "min(1400px, 100%)",
          height: "auto",
          borderRadius: 6,
          background: "#fff",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          cursor: "default",
        }}
      />
    </div>
  );
}
