import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

// Posts live in the Hugo `content/posts` directory at the repo root,
// one level above the Next.js app. Keeping them in-place during the
// migration lets the Hugo site stay buildable for A/B comparison.
const POSTS_DIR = path.join(process.cwd(), "..", "content", "posts");

export type PostFrontmatter = {
  title: string;
  summary?: string;
  // gray-matter parses ISO date strings into Date objects, but the field
  // is sometimes a string in older posts. Allow both and normalise at the
  // render site.
  date?: string | Date;
  aliases?: string[];
  cover?: { image?: string };
};

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  contentHtml: string;
};

export async function listPostSlugs(): Promise<string[]> {
  const entries = await fs.readdir(POSTS_DIR);
  return entries
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export type PostSummary = {
  slug: string;
  frontmatter: PostFrontmatter;
};

// Lists posts (metadata only, no body) sorted by date descending. Used for
// the home page list view and the archive page, where we don't want to pay
// the cost of parsing every post's markdown body.
export async function listPosts(): Promise<PostSummary[]> {
  const slugs = await listPostSlugs();
  const summaries = await Promise.all(
    slugs.map(async (slug) => {
      const raw = await fs.readFile(
        path.join(POSTS_DIR, `${slug}.md`),
        "utf8",
      );
      const { data } = matter(raw);
      return { slug, frontmatter: data as PostFrontmatter };
    }),
  );
  return summaries.sort((a, b) => {
    const da = a.frontmatter.date ? new Date(a.frontmatter.date).getTime() : 0;
    const db = b.frontmatter.date ? new Date(b.frontmatter.date).getTime() : 0;
    return db - da;
  });
}

export async function getPost(slug: string): Promise<Post> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);

  // Pipeline:
  //   remark-parse  -> markdown → mdast
  //   remark-gfm    -> tables, strikethrough, task lists, autolinks
  //   remark-math   -> recognise $...$ and $$...$$ delimiters (Hugo posts
  //                    use these for KaTeX rendering)
  //   remark-rehype -> mdast → hast; allowDangerousHtml lets raw inline
  //                    HTML in posts (e.g. <img src=... #center>) pass
  //                    through, matching Hugo goldmark with unsafe=true.
  //   rehype-slug   -> id="..." on every heading so anchor links work.
  //   rehype-katex  -> renders the math nodes to KaTeX HTML.
  //   rehype-highlight -> syntax-highlights fenced code blocks.
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    contentHtml,
  };
}
