import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Build alias-redirect entries from each post's frontmatter `aliases` field.
// The Hugo site auto-generated these as redirect HTML pages; we replicate
// them as 301 redirects so old inbound links and existing utterances comment
// threads keyed by pathname keep resolving to the canonical post URL.
//
// Synchronous on purpose: next.config.ts calls this at config-eval time and
// Next.js does not await an async redirects() result graceful enough for
// dynamic disk reads. Keep it cheap.

const POSTS_DIR = path.join(process.cwd(), "..", "content", "posts");

export type AliasRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

export function buildAliasRedirects(): AliasRedirect[] {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"));

  const out: AliasRedirect[] = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(raw);
    const aliases: unknown = data.aliases;
    if (!Array.isArray(aliases)) continue;
    for (const a of aliases) {
      if (typeof a !== "string") continue;
      // Normalise to a trailing-slash source so it matches what Next.js
      // emits when `trailingSlash: true` rewrites a slash-less URL. The
      // destination keeps a trailing slash too — it matches the pathname
      // utterances saw on the Hugo site, preserving comment threads.
      const trimmed = a.trim().replace(/\/$/, "");
      out.push({
        source: `${trimmed}/`,
        destination: `/posts/${slug}/`,
        permanent: true,
      });
    }
  }
  return out;
}
