"use client";

import { useEffect, useRef } from "react";

// utterances injects an iframe next to its <script> tag. Two things to be
// careful of in React:
//
//   1. Strict Mode runs effects twice in dev. The first run injects the
//      <script>, fetches client.js, and the script reaches into its parent
//      to insert the iframe. If the second run wipes the container before
//      the iframe lands, client.js throws NoModificationAllowedError
//      ("element has no parent"). So: only inject once per mount, and on
//      cleanup just leave the iframe alone.
//
//   2. Page navigation needs a fresh widget for the new pathname. The
//      effect dependency on `key` (passed from the parent, typically the
//      slug) handles that: when the parent re-mounts the Utterances tree
//      with a new key, the ref resets and we re-inject cleanly.
export function Utterances({ repo = "ellemouton/website" }: { repo?: string }) {
  const container = useRef<HTMLDivElement | null>(null);
  const injected = useRef(false);

  useEffect(() => {
    const root = container.current;
    if (!root || injected.current) return;
    injected.current = true;

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", repo);
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-light");
    root.appendChild(script);
  }, [repo]);

  return <div ref={container} className="utterances mt-12" />;
}
