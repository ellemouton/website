# CV

Elle's CV, written in [Typst](https://typst.app/). The Typst source is the
single source of truth; edit `cv.typ`, recompile, copy the PDF to wherever it
needs to be served.

## Build

```bash
cd cv
typst compile cv.typ   # one-shot → cv.pdf
typst watch   cv.typ   # auto-rebuild on save (use this when iterating)
```

The repo ships with a committed `cv.pdf` so it's viewable on GitHub without a
Typst install. Re-commit it whenever the source changes.

## Publishing to the website

The site serves the CV at `/CV_Elle_Mouton.pdf`, backed by
`../static/CV_Elle_Mouton.pdf`. After editing:

```bash
cp cv.pdf ../static/CV_Elle_Mouton.pdf
git add cv/cv.pdf cv/cv.typ ../static/CV_Elle_Mouton.pdf
git commit -m "cv: ..."
```

## Dependencies

- **Typst** — `brew install typst` (developed against 0.14).
- **FontAwesome 7** — `brew install --cask font-fontawesome`. The icon glyphs
  (phone, envelope, social brands, link/chain) come from the locally-installed
  `Font Awesome 7 Free` / `Font Awesome 7 Brands` OTFs. The icon helpers in
  `cv.typ` reference these font names directly instead of going through the
  `@preview/fontawesome` package, because that package targets FA6 by name and
  produced "unknown font family" warnings on this machine.

## Avatar

`avatar.jpg` is a **pre-cropped 600×600 square** centred on Elle's face. The
source is `../static/og-image.jpg` (1200×630, face at ~85% across). To
re-derive it:

```bash
cp ../static/og-image.jpg avatar.jpg
sips -c 600 600 --cropOffset 0 480 avatar.jpg --out avatar.jpg
```

The Typst code can then just use `fit: "cover"` inside a circle box — no
in-document image positioning needed. (We tried `place` / `move` inside a
clipped box first; Typst dropped the image, hence the pre-crop.)

If you change the source photo, redo the crop and adjust `--cropOffset 0 X`
until the face is centred in the circle.

## Card and logo images

`img/` holds the small images that appear in the CV:

- Company logos: `lightning-labs.png`, `luno.png` (rendered inline next to job
  titles, mirroring the website's Work section).
- Public Appearances cards: `advancing-bitcoin.png`, `bitcoin-optech.png`,
  `bitcoinplusplus.png`, `chaincode.png`, `connect-the-world.png`.

These are copies of files in `../web/public/img/`. If the website's versions
get refreshed, mirror them here:

```bash
cp ../web/public/img/{lightning-labs,luno,advancing-bitcoin,bitcoin-optech,bitcoinplusplus,chaincode,connect-the-world}.png img/
```

## Layout overview

- Page: A4, zero margin. A `place` background paints the navy sidebar (34% of
  page width, full height).
- Two-column `grid` lays the content on top: sidebar (avatar + social icon row
  + Education + Skills + spare-time / references footer) on the left, main
  column (About → Experience → Writing → Public Appearances) on the right.
- Helpers near the top of `cv.typ` (`sidebar-h`, `main-h`, `sidebar-row`,
  `job`, `bullet`, `appearance-card`, `skill-label`) are the only places worth
  editing for style tweaks; the layout below them just calls them.

## Conventions

- Links are styled inline per use rather than via a global `show link` rule.
  This is intentional: the social-icon row and the appearance cards wrap whole
  blocks in `link(url, ...)` and a global underline rule would underline the
  icons / card backgrounds.
- Section spacing on the right column is hand-tuned. If you add a new section
  expect to fiddle with the surrounding `#v(...)` values.
- All metrics-in-bullets cite a PR or issue link — keep that pattern when
  adding new claims so a reviewer can verify them in one click.
