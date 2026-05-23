import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { listPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Articles",
};

function formatDate(d: string | Date | undefined) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticlesPage() {
  const posts = await listPosts();

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold">Articles</h1>
          <p className="mt-3 text-[color:var(--secondary)]">
            Deep dives into Bitcoin and Lightning Network protocols.
          </p>
        </div>
        <Link
          href="/archives/"
          className="inline-flex items-center rounded-(--radius) border border-[color:var(--border)] bg-[color:var(--entry)] px-3 py-1.5 text-sm hover:bg-[color:var(--tertiary)]"
        >
          View archive &rarr;
        </Link>
      </header>

      <section className="post-list flex flex-col gap-(--content-gap)">
        {posts.map((post) => {
          const cover = post.frontmatter.cover?.image;
          return (
            <article
              key={post.slug}
              className="post-entry relative rounded-(--radius) border border-[color:var(--border)] bg-[color:var(--entry)] p-(--gap) hover:shadow-md transition-shadow"
            >
              {cover && (
                <figure className="entry-cover mb-3">
                  <Image
                    src={cover}
                    alt=""
                    width={1200}
                    height={630}
                    className="rounded-(--radius) w-full h-auto"
                    loading="lazy"
                    unoptimized
                  />
                </figure>
              )}
              <header className="entry-header">
                <h2 className="text-2xl font-bold">{post.frontmatter.title}</h2>
              </header>
              {post.frontmatter.summary && (
                <div className="entry-content mt-2 text-[color:var(--content)]">
                  {post.frontmatter.summary}
                </div>
              )}
              <footer className="entry-footer mt-3 text-sm text-[color:var(--secondary)]">
                <span>{formatDate(post.frontmatter.date)}</span>
                {post.frontmatter.date && <span>&nbsp;·&nbsp;</span>}
                <span>{siteConfig.author}</span>
              </footer>
              {/* Whole-card link, à la PaperMod's `.entry-link` */}
              <Link
                href={`/posts/${post.slug}/`}
                aria-label={`post link to ${post.frontmatter.title}`}
                className="absolute inset-0"
              />
            </article>
          );
        })}
      </section>
    </>
  );
}
