import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/posts";

// Canonical production base URL. Matches the value used by the RSS feed
// (lib/rss.ts) so absolute URLs in the sitemap and feed stay in lockstep.
const SITE_URL = "https://www.ellemouton.com";

// next.config.ts sets `trailingSlash: true`; every URL listed here must end
// with `/` so the sitemap advertises canonical URLs rather than ones that
// 308-redirect (which fragments crawler / sitemap-consumer caches).
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildTime = new Date();
  const posts = await listPosts();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: buildTime },
    { url: `${SITE_URL}/about/`, lastModified: buildTime },
    { url: `${SITE_URL}/articles/`, lastModified: buildTime },
    { url: `${SITE_URL}/archives/`, lastModified: buildTime },
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/posts/${p.slug}/`,
    lastModified: p.frontmatter.date
      ? new Date(p.frontmatter.date)
      : buildTime,
  }));

  return [...staticEntries, ...postEntries];
}
