import Link from "next/link";
import Image from "next/image";
import { listPosts } from "@/lib/posts";

// Width of each card in the horizontal strip. Chosen so ~2.5 cards
// peek into view on a typical desktop main column (~720px content
// width) — enough to make the strip read as "scrollable" at a glance,
// rather than fitting everything and looking like a grid.
const CARD_WIDTH_PX = 260;

// Aspect ratio of the cover thumbnail (matches the post-list cover
// images on the home page, which are rendered at 1200x630).
const COVER_W = 1200;
const COVER_H = 630;

export async function PostCarousel() {
  const posts = await listPosts();
  if (posts.length === 0) return null;

  return (
    <div
      className="post-carousel flex w-full snap-x snap-mandatory gap-4 overflow-x-auto py-2"
      role="list"
      aria-label="Blog posts"
    >
      {posts.map((post) => {
        const cover = post.frontmatter.cover?.image;
        return (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}/`}
            role="listitem"
            className="group shrink-0 snap-start overflow-hidden rounded-(--radius) border border-[color:var(--border)] bg-[color:var(--entry)] transition-shadow hover:shadow-md"
            style={{ width: CARD_WIDTH_PX }}
          >
            {cover ? (
              <div
                className="w-full overflow-hidden bg-[color:var(--tertiary)]"
                style={{ aspectRatio: "16 / 10" }}
              >
                <Image
                  src={cover}
                  alt=""
                  width={COVER_W}
                  height={COVER_H}
                  className="transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  loading="lazy"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="w-full bg-[color:var(--tertiary)]"
                style={{ aspectRatio: "16 / 10" }}
              />
            )}
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-semibold text-[color:var(--content)]">
                {post.frontmatter.title}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
