import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

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

export async function getPost(slug: string): Promise<Post> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);

  const processed = await remark().use(remarkHtml).process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    contentHtml,
  };
}
