import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer
      className="footer mx-auto flex flex-wrap items-center justify-center gap-2 text-sm text-[color:var(--secondary)] px-(--gap)"
      style={{
        maxWidth: "calc(var(--main-width) + var(--gap) * 2)",
        minHeight: "var(--footer-height)",
      }}
    >
      <span>
        © {new Date().getFullYear()}{" "}
        <a href="/" className="hover:text-[color:var(--primary)]">
          {siteConfig.author}
        </a>
      </span>
      <span aria-hidden>·</span>
      {/* Subtle cross-link to Elle's photography portfolio (separate site). */}
      <a
        href="https://photo.ellemouton.com"
        className="hover:text-[color:var(--primary)]"
      >
        Photography
      </a>
      <span aria-hidden>·</span>
      <a
        href="https://github.com/ellemouton/website"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-[color:var(--primary)]"
      >
        View website source code on GitHub
      </a>
    </footer>
  );
}
