import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, listPostSlugs } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { Utterances } from "@/components/Utterances";
import { PostToc } from "@/components/PostToc";
import { PostTocSidebar } from "@/components/PostTocSidebar";
import { extractHeadings, nest } from "@/lib/toc";
import { ImageZoom } from "@/components/ImageZoom";

export async function generateStaticParams() {
  const slugs = await listPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPost(slug);
    // Posts can opt into a custom share thumbnail via their `cover.image`
    // frontmatter (already used as the home-page card image). If absent
    // we let Next.js fall back to the site-wide OG image from layout.tsx.
    const cover = post.frontmatter.cover?.image;
    return {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      openGraph: {
        title: post.frontmatter.title,
        description: post.frontmatter.summary,
        type: "article",
        ...(cover ? { images: [cover] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: post.frontmatter.title,
        description: post.frontmatter.summary,
        ...(cover ? { images: [cover] } : {}),
      },
    };
  } catch {
    return {};
  }
}

function formatDate(d: string | Date | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getPost(slug);
  } catch {
    notFound();
  }

  // Headings are scraped once here and handed to both ToC renderers, so
  // the inline block and the sticky rail can never disagree. A post with
  // no headings gets neither, and keeps the plain reading column.
  const toc = nest(extractHeadings(post.contentHtml));
  const hasToc = toc.length > 0;

  return (
    <article className={hasToc ? "post-single post-with-toc" : "post-single"}>
      <header className="post-header mb-6">
        <h1 className="post-title text-4xl font-extrabold">
          {post.frontmatter.title}
        </h1>
        {post.frontmatter.summary && (
          <p className="post-description mt-2 text-[color:var(--secondary)]">
            {post.frontmatter.summary}
          </p>
        )}
        <div className="post-meta mt-3 text-sm text-[color:var(--secondary)]">
          {post.frontmatter.date && (
            <time dateTime={String(post.frontmatter.date)}>
              {formatDate(post.frontmatter.date)}
            </time>
          )}
          {post.frontmatter.date && <span>&nbsp;·&nbsp;</span>}
          <span>{siteConfig.author}</span>
        </div>
      </header>

      {/* The rail is pulled out into the left margin (see globals.css)
       * rather than taking a grid column, so the prose column keeps its
       * full --main-width measure and stays centred. Below the width
       * where a margin rail fits, the inline block takes over. */}
      {hasToc && (
        <>
          <aside className="post-toc-aside">
            <PostTocSidebar nodes={toc} />
          </aside>
          <div className="post-toc-inline">
            <PostToc nodes={toc} />
          </div>
        </>
      )}

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <ImageZoom />

      <Utterances />
    </article>
  );
}
