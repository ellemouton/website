import { generateRssXml } from "@/lib/rss";

// Hugo's PaperMod also emitted a section feed at /posts/index.xml.
// Since the site has exactly one content section (posts) it carries
// the same items as /index.xml — we just expose both URLs so neither
// type of existing subscription breaks.
export const dynamic = "force-static";

export async function GET() {
  const xml = await generateRssXml();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
