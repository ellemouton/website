import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Archive",
};

function postYear(d: string | Date | undefined): number {
  return d ? new Date(d).getFullYear() : 0;
}

function formatDate(d: string | Date | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function ArchivesPage() {
  const posts = await listPosts();

  // Group posts by year, ordered descending. Posts without a date land
  // in a "0" bucket at the end — surfacing them rather than hiding them.
  const byYear = new Map<number, typeof posts>();
  for (const p of posts) {
    const y = postYear(p.frontmatter.date);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <article>
      <header className="post-header mb-6">
        <h1 className="post-title text-4xl font-extrabold">Archive</h1>
      </header>

      {years.map((year) => (
        <section key={year} className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[color:var(--secondary)]">
            {year || "Undated"}
          </h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {byYear.get(year)!.map((p) => (
              <li key={p.slug} className="flex items-baseline gap-3">
                <span className="text-sm text-[color:var(--secondary)] w-20 shrink-0">
                  {formatDate(p.frontmatter.date)}
                </span>
                <Link
                  href={`/posts/${p.slug}/`}
                  className="hover:underline"
                >
                  {p.frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
