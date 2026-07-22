# AGENTS.md — ellemouton.com

Personal site of Elle Mouton: long-form Bitcoin/Lightning technical
writing, an about page, and a CV. Live at <https://www.ellemouton.com>.

Read this first, then the READMEs it points to. `README.md` (root) and
`web/README.md` are the detailed references — don't duplicate them here.

## The one thing to internalise: this is a Next.js app, not Hugo

The site was migrated from Hugo. The Hugo scaffolding is gone, but two
repo-root directories are still the source of truth and are read
*directly* by the Next.js app:

- `web/` — the **active** app (Next.js App Router, React 19, Tailwind
  v4, TypeScript). This is what Vercel builds and serves. Almost all
  code changes happen here.
- `content/posts/*.md` — canonical markdown for every blog post, read at
  build time by `web/lib/posts.ts` (one level *above* `web/`).
- `static/` — all static assets. `web/public` is a **symlink to
  `../static`**, so files here serve at the site root (`/og-image.jpg`,
  `/CV_Elle_Mouton.pdf`, `/img/...`, `/bip158/...`). Drop a file in
  `static/` and it's immediately available; do not create files under
  `web/public` directly.
- `cv/` — the CV is a **Typst** source (`cv/cv.typ`) compiled to
  `cv/cv.pdf`; the served copy lives in `static/`. See `cv/README.md`.

`web/AGENTS.md` carries an extra warning: this is a newer Next.js (16)
with breaking changes from older training data — check
`node_modules/next/dist/docs/` before writing routing/config code.

## URL stability — the load-bearing constraint

External pages link to old Hugo URLs, and the utterances comment widget
keys each thread by `window.location.pathname`. Old URLs must keep
resolving *exactly*, or comment threads orphan and inbound links break.

- `web/next.config.ts` pins `trailingSlash: true` (Hugo served
  `/posts/<slug>/` with the slash).
- `web/lib/redirects.ts` turns each post's `aliases:` frontmatter into
  308 permanent redirects to the canonical `/posts/<slug>/`.

Adding a post needs nothing special. **Renaming/moving** a post: add its
old path to that post's `aliases:` list so the old URL keeps redirecting.

## Running locally

```bash
cd web
npm install   # first time only
npm run dev   # http://localhost:3000
```

Also in `web/`: `npm run build`, `npm start`, `npm run lint`.

## Deployment

Vercel builds from `web/` on every push. `master` → production
(<https://www.ellemouton.com>); any other branch/PR → preview deploy.
Build settings live in the Vercel dashboard (no `vercel.json`). No custom
server — sitemap, RSS, and static assets are all produced by the build.

## Conventions

- Small site changes go directly on `master`; the live site follows it.
- Commit subjects start with a scope: `web:`, `static:`, `cv:`, `ci:`,
  etc., describing where the change lands.
