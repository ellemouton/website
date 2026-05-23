This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## URL stability

The site was previously a Hugo site and has external inbound links plus
utterances comment threads keyed by `window.location.pathname`. The
following must keep resolving exactly as they did on Hugo:

- `/posts/<slug>/` (canonical), with the trailing slash.
- Every URL listed in a post's `aliases:` frontmatter under
  `content/posts/*.md`.

Before changing anything routing-related, read:

- `web/next.config.ts` — pins `trailingSlash: true` and wires up the
  legacy redirects.
- `web/lib/redirects.ts` — turns each post's `aliases` frontmatter into
  permanent (308) redirects to the canonical `/posts/<slug>/`.

If you add a new post, you don't need to do anything special. If you
rename or move an existing post, add its previous path to that post's
`aliases:` list so the old URL keeps redirecting.

## Deployment

This site is deployed on Vercel:
<https://vercel.com/ellemoutons-projects/website>

The project was recently migrated from Hugo to Next.js (the legacy Hugo
files still live at the repo root; the active app is this `web/`
directory). Vercel is configured to build from `web/` and deploys
automatically:

- Pushes to `master` → production deploy.
- Pushes to any other branch / PR → preview deploy.

Build settings on Vercel match the scripts in `package.json`
(`next build` / `next start`). No custom server or extra infrastructure
— everything (static assets, MDX rendering, sitemap, RSS) is produced
by the Next.js build.
