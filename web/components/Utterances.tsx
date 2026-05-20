"use client";

import { useEffect, useRef } from "react";

// Loads the utterances comment widget by injecting its <script> tag.
// Keeping the exact `repo` and `issue-term="pathname"` configuration from
// the Hugo theme means each post stays bound to the same GitHub issue —
// so every existing comment thread continues to work after migration.
//
// Re-injected on path change so the widget refreshes if the user
// client-side navigates between posts.
export function Utterances({ repo = "ellemouton/website" }: { repo?: string }) {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    root.replaceChildren();

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
