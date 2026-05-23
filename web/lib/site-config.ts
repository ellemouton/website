// Single source of truth for site-wide constants (title, author,
// navigation, social links).

export const siteConfig = {
  title: "Elle Mouton",
  description:
    "Backend engineer in San Francisco. 5+ years building distributed systems, from event-driven microservices to protocol-level work on live peer-to-peer networks.",
  author: "Elle Mouton",

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
