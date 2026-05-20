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
    </footer>
  );
}
