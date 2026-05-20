import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, listPostSlugs } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { Utterances } from "@/components/Utterances";

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
    return {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
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

  return (
    <article className="post-single">
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

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <Utterances />
    </article>
  );
}
