import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer
      className="footer mx-auto flex flex-col flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-[color:var(--secondary)] px-(--gap) sm:flex-row sm:justify-between"
      style={{
        maxWidth: "calc(var(--main-width) + var(--gap) * 2)",
        minHeight: "var(--footer-height)",
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span>
          © {new Date().getFullYear()}{" "}
          <Link href="/" className="hover:text-[color:var(--primary)]">
            {siteConfig.author}
          </Link>
        </span>
        <span aria-hidden>·</span>
        <a
          href="https://github.com/ellemouton/website"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[color:var(--primary)]"
        >
          View website source code on GitHub
        </a>
      </div>
      {/* Prominent cross-link to Elle's photography portfolio (separate site),
          pushed to the right and in the primary colour so it stands out from
          the muted footer text. Colour is set inline, not via a utility class:
          globals.css has an unlayered `a { color: inherit }` rule, and in
          Tailwind v4 unlayered CSS beats layered utilities regardless of
          specificity, so `text-[color:var(--primary)]` would be overridden. */}
      <a
        href="https://photo.ellemouton.com"
        style={{ color: "var(--primary)" }}
        className="font-medium hover:opacity-80"
      >
        See my photography website →
      </a>
    </footer>
  );
}
