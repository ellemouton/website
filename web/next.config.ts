import type { NextConfig } from "next";
import { buildAliasRedirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  // Hugo serves every page with a trailing slash, e.g. `/posts/bip158/`.
  // utterances uses `window.location.pathname` as the comment-thread key, so
  // a Next.js URL without the slash would tie posts to a *different* GH
  // issue and orphan every existing comment. Match Hugo's behaviour.
  trailingSlash: true,

  async redirects() {
    // 308 permanent redirects from every legacy URL (post frontmatter
    // `aliases` field, plus the old `/<slug>` and `/blog/view/N` paths)
    // to the canonical `/posts/<slug>`. Keeping these alive is critical:
    // utterances ties each comment thread to a pathname, and incoming
    // links from the rest of the web rely on the old routes.
    return buildAliasRedirects();
  },
};

export default nextConfig;
