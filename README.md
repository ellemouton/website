# ellemouton.com

Personal site of Elle Mouton — long-form technical writing on Bitcoin
and Lightning Network internals, plus an about page and CV. Live at
<https://www.ellemouton.com>.

## Layout

The site was originally a Hugo build. The Hugo scaffolding has been
removed; only two directories carried over still matter:

- `web/` — the Next.js app (App Router, React 19, Tailwind v4). This
  is what Vercel builds and serves.
- `content/posts/*.md` — the canonical markdown source for every blog
  post. The Next.js app reads from here directly via
  `web/lib/posts.ts`.
- `static/` — all static assets (per-post image directories, OG card,
  CV, favicons, the `img/` folder for site-chrome images, etc.).
  `web/public` is a **symlink to `../static`**, so Next.js serves
  everything in here at the root path (`/og-image.jpg`,
  `/CV_Elle_Mouton.pdf`, `/img/...`, `/bip158/...`, etc.). Drop new
  static files into `static/` and they're immediately available.

## Running locally

```bash
cd web
npm install        # first time only
npm run dev        # http://localhost:3000
```

Other scripts in `web/`:

- `npm run build` — production build (TypeScript checked).
- `npm start` — serve the production build.
- `npm run lint` — ESLint pass.

## Deployment

Vercel builds from `web/` on every push:

- `master` → production (<https://www.ellemouton.com>).
- Any other branch / PR → preview deployment.

The Vercel project lives at
<https://vercel.com/ellemoutons-projects/website>; build settings
are managed in the dashboard (no `vercel.json` in the repo).

## URL stability

Every existing blog-post URL on the old Hugo site must keep resolving
because external pages link to them and the utterances comment widget
keys each thread by `window.location.pathname`. See
[`web/README.md`](web/README.md) for the rules and which files
implement them.

In short: don't drop the trailing slash, and if you rename or move a
post, add its old path to the post's `aliases:` frontmatter so the old
URL keeps redirecting to the new one.

## Branch and commit conventions

- Work directly on `master` for small site changes; the live site
  follows it.
- Commit messages start with a short scope (`web:`, `static:`,
  `hugo:`, `ci:`, etc.) describing where the change lands.
