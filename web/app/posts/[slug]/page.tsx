import { notFound } from "next/navigation";
import { getPost, listPostSlugs } from "@/lib/posts";

export async function generateStaticParams() {
  const slugs = await listPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { slug: string };

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
    <article>
      <header>
        <h1>{post.frontmatter.title}</h1>
        {post.frontmatter.summary && <p>{post.frontmatter.summary}</p>}
        {post.frontmatter.date && (
          <time dateTime={String(post.frontmatter.date)}>
            {new Date(post.frontmatter.date).toISOString().slice(0, 10)}
          </time>
        )}
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </article>
  );
}
