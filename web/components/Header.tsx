import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="header">
      <nav
        className="nav mx-auto flex items-center justify-between gap-4 px-(--gap) py-0"
        style={{
          maxWidth: "calc(var(--nav-width) + var(--gap) * 2)",
          height: "var(--header-height)",
        }}
      >
        <div className="logo">
          <Link
            href="/"
            className="text-2xl font-bold"
            title={`${siteConfig.title} (Alt + H)`}
            accessKey="h"
          >
            {siteConfig.title}
          </Link>
        </div>
        <ul
          id="menu"
          className="flex list-none items-center gap-4 m-0 p-0 flex-wrap"
        >
          {siteConfig.menu.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="px-2 py-1 hover:text-[color:var(--secondary)]"
                title={item.name}
              >
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
