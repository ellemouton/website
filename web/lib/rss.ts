import { listPostSlugs, getPost, type Post } from "./posts";
import { siteConfig } from "./site-config";

// The canonical base URL embedded in the feed. Feed readers cache absolute
// URLs, so this must match what's served in production — otherwise
// readers will continue to point at the wrong host after deploy.
const SITE_URL = "https://www.ellemouton.com";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function postDateMs(p: Post): number {
  return p.frontmatter.date ? new Date(p.frontmatter.date).getTime() : 0;
}

// Generate an RSS 2.0 feed of all posts, full-text. Mirrors Hugo's
// PaperMod output (ShowFullTextinRSS: true in config.yml): one <item>
// per post, sorted by date descending, with <content:encoded> carrying
// the rendered HTML body.
export async function generateRssXml(): Promise<string> {
  const slugs = await listPostSlugs();
  const posts = await Promise.all(slugs.map((slug) => getPost(slug)));
  posts.sort((a, b) => postDateMs(b) - postDateMs(a));

  const latest = posts[0];
  const lastBuildDate = latest
    ? new Date(latest.frontmatter.date ?? Date.now()).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/posts/${p.slug}/`;
      const pubDate = p.frontmatter.date
        ? new Date(p.frontmatter.date).toUTCString()
        : "";
      return `    <item>
      <title>${escapeXml(p.frontmatter.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(p.frontmatter.summary ?? "")}</description>
      <content:encoded><![CDATA[${p.contentHtml}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <generator>Next.js</generator>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/index.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
