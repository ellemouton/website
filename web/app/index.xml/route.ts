import { generateRssXml } from "@/lib/rss";

// Site-wide RSS feed at /index.xml (matches Hugo PaperMod's default
// path so existing feed-reader subscriptions keep working without a
// redirect). force-static makes this generate at build time and serve
// from CDN, same cost as a static asset.
export const dynamic = "force-static";

export async function GET() {
  const xml = await generateRssXml();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
