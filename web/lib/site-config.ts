// Single source of truth for site-wide constants (title, author,
// navigation, social links). Mirrors the relevant subset of the Hugo
// config.yml at the repo root so a Hugo/Next.js A/B comparison reads
// the same content.

export const siteConfig = {
  title: "Elle Mouton",
  description:
    "Welcome! Here you'll find deep dives into Bitcoin and Lightning Network protocols.",
  author: "Elle Mouton",
  homeTitle: "Layer by Layer",
  homeContent:
    "Welcome! Here you'll find deep dives into Bitcoin and Lightning Network protocols. New here? Start with the [about page](/about/).",

  // Header menu items, ordered. Mirrors config.yml's `menu.main` minus
  // "Search" — search is a deferred feature (needs a client-side index
  // like Fuse.js or Pagefind) and is hidden until implemented rather
  // than linking to a dead page.
  menu: [
    { name: "About", href: "/about/" },
    { name: "Articles", href: "/articles/" },
    { name: "CV", href: "/CV_Elle_Mouton.pdf" },
  ],

  social: [
    { name: "github", url: "https://github.com/ellemouton" },
    { name: "twitter", url: "https://twitter.com/ellemouton" },
    { name: "keybase", url: "https://keybase.io/ellemo" },
    { name: "instagram", url: "https://www.instagram.com/ellemouton" },
    { name: "linkedin", url: "https://www.linkedin.com/in/elle-mouton-50635a143/" },
    { name: "rss", url: "/index.xml" },
  ],
} as const;
