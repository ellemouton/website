// Elle Mouton — CV
// Build:  typst compile cv.typ
// Watch:  typst watch cv.typ
//
// Layout: two-column with a navy sidebar on the left (avatar + contact +
// education + skills) and a white main column on the right (name +
// about + experience + appearances + writing).

#set document(title: "Elle Mouton — CV", author: "Elle Mouton")

// ---------- Icons ----------
// FontAwesome 7 (installed via `brew install --cask font-fontawesome`).
// We address codepoints directly rather than via the @preview/fontawesome
// package because that package looks for FA6 fonts by name.
#let fa-solid(code) = text(font: "Font Awesome 7 Free",   weight: 900)[#code]
#let fa-brand(code) = text(font: "Font Awesome 7 Brands", weight: 400)[#code]
#let fa-phone     = fa-solid("\u{f095}")
#let fa-envelope  = fa-solid("\u{f0e0}")
#let fa-location  = fa-solid("\u{f3c5}")
#let fa-globe     = fa-solid("\u{f0ac}")
#let fa-github    = fa-brand("\u{f09b}")
#let fa-linkedin  = fa-brand("\u{f08c}")
#let fa-instagram = fa-brand("\u{f16d}")
#let fa-link      = fa-solid("\u{f0c1}")

// ---------- Theme ----------
#let navy        = rgb("#1f3a5f")
#let accent      = rgb("#3b6ea5")
#let onNavy      = rgb("#ffffff")
#let onNavyMuted = rgb("#c9d6e6")
#let body-clr    = rgb("#1a1a1a")
#let muted       = rgb("#5a6573")

// Sidebar width as a fraction of the page. The original Pages CV is
// roughly 33–35%; 34% reads close to the source.
#let sidebar-frac = 34%

// ---------- Page ----------
#set page(
  paper: "a4",
  margin: 0pt,
  background: place(
    left + top,
    rect(width: sidebar-frac, height: 100%, fill: navy),
  ),
)

#set text(
  font: ("Helvetica Neue", "Helvetica", "Arial"),
  size: 9.5pt,
  fill: body-clr,
)
#set par(justify: false, leading: 0.7em, spacing: 7pt)
// Links are styled explicitly per site (no global underline) so the
// chain icon next to appearance titles stays clean and uncluttered.

// ---------- Helpers ----------
#let sidebar-h(body) = block(spacing: 0pt)[
  #set text(fill: white, size: 13pt, weight: "bold", tracking: 1pt)
  #upper(body)
  #v(5pt)
  #line(length: 42pt, stroke: 1pt + white)
  #v(14pt)
]

#let main-h(body) = block(spacing: 0pt)[
  #set text(fill: navy, size: 17pt, weight: "bold", tracking: 0.5pt)
  #upper(body)
  #v(3pt)
  #line(length: 100%, stroke: 0.6pt + accent)
  #v(7pt)
]

#let sidebar-row(icon, value, url: none) = {
  let row = block(spacing: 7pt)[
    #set text(fill: onNavy, size: 9.5pt)
    #grid(
      columns: (12pt, 1fr),
      column-gutter: 7pt,
      align: (left + horizon, left + horizon),
      text(fill: onNavyMuted)[#icon],
      value,
    )
  ]
  if url != none { link(url, row) } else { row }
}

#let job(role, company, dates, body) = block(spacing: 14pt, breakable: false)[
  #block(spacing: 0pt)[
    #text(weight: "bold", size: 12pt, fill: navy)[#role]
    #h(6pt)
    #text(size: 11pt, fill: muted)[|]
    #h(6pt)
    #text(weight: "regular", size: 12pt, fill: navy)[#company]
  ]
  #v(8pt)
  #text(size: 9pt, fill: muted, style: "italic")[#dates]
  #v(10pt)
  #block(inset: (left: 2pt))[#body]
]

#let bullet(body) = block(spacing: 7pt)[
  #grid(
    columns: (10pt, 1fr),
    column-gutter: 5pt,
    text(fill: accent)[•],
    body,
  )
]

#let appearance(title, desc, url) = block(spacing: 11pt, breakable: false)[
  #grid(
    columns: (10pt, 1fr),
    column-gutter: 6pt,
    row-gutter: 4pt,
    text(fill: accent)[•],
    [
      #text(weight: "bold", fill: navy)[#title]
      #h(6pt)
      #link(url)[#text(fill: accent, size: 8.5pt)[#fa-link]]
    ],
    [],
    text(fill: muted, size: 9.5pt)[#desc],
  )
]

// Small uppercase muted label used inside Skills.
#let skill-label(body) = text(
  weight: "bold",
  fill: onNavyMuted,
  size: 8.5pt,
  tracking: 1pt,
)[#upper(body)]

// ---------- Layout ----------
#grid(
  columns: (sidebar-frac, 1fr),
  column-gutter: 0pt,

  // ============ SIDEBAR ============
  pad(x: 22pt, y: 32pt)[
    // Avatar — avatar.jpg is pre-cropped to a 600×600 square centred
    // on the face, so the circle mask just fills with the image.
    #align(center)[
      #box(
        width: 130pt,
        height: 130pt,
        clip: true,
        radius: 65pt,
        stroke: 2pt + white,
        image("avatar.jpg", width: 130pt, height: 130pt, fit: "cover"),
      )
    ]
    #v(10pt)
    #align(center)[
      #text(size: 9pt, style: "italic", fill: onNavyMuted)[
        Based in San Francisco
      ]
    ]

    #v(26pt)
    #block(spacing: 0pt)[
      #set text(fill: onNavy, size: 13pt)
      #link("tel:+14153351488")[#fa-phone]
      #h(10pt)
      #link("mailto:elle.mouton@gmail.com")[#fa-envelope]
      #h(10pt)
      #link("https://ellemouton.com")[#fa-globe]
      #h(10pt)
      #link("https://github.com/ellemouton")[#fa-github]
      #h(10pt)
      #link("https://www.linkedin.com/in/elle-mouton")[#fa-linkedin]
      #h(10pt)
      #link("https://instagram.com/ellemouton")[#fa-instagram]
    ]

    #v(26pt)
    #sidebar-h[Education]
    #block(spacing: 0pt)[
      #set text(fill: onNavy, size: 9.5pt)
      #set par(leading: 0.65em)
      #skill-label[BSc Electrical & Computer Engineering]
      #v(7pt)
      #text(fill: onNavyMuted, size: 8.5pt, style: "italic")[
        2016 – 2019 · University of Cape Town
      ]
      #v(10pt)
      #grid(
        columns: (6pt, 1fr),
        column-gutter: 8pt,
        row-gutter: 12pt,
        text(fill: accent)[•],
        [Graduated with First Class Honours as top BSc(Eng) student.],
        text(fill: accent)[•],
        [Awarded the prize for the best final-year thesis.],
      )
    ]

    #v(26pt)
    #sidebar-h[Skills]
    #block(spacing: 0pt)[
      #set text(fill: onNavy, size: 9.5pt)
      #set par(leading: 0.65em)

      #skill-label[Languages & Tools]
      #v(8pt)
      Go, Python, SQL, Git, Docker, gRPC
      #v(16pt)

      #skill-label[Domains]
      #v(8pt)
      Distributed systems · P2P networks · protocol design · database
      migrations · code review at scale
    ]
  ],

  // ============ MAIN ============
  pad(x: 30pt, y: 32pt)[
    // Name block
    #block(spacing: 0pt)[
      #text(size: 32pt, weight: "bold", fill: body-clr)[Elle ]
      #text(size: 32pt, weight: "regular", fill: body-clr)[Mouton]
      #v(4pt)
      #text(size: 13pt, fill: accent)[Backend Software Engineer]
      #v(6pt)
      #line(length: 72pt, stroke: 1pt + accent)
    ]
    #v(10pt)

    #main-h[About]
    Backend engineer with 5+ years building production-scale
    distributed systems. My work spans event-driven microservices
    serving millions of users and protocol-level upgrades to large,
    live peer-to-peer networks. I thrive in small, fast-moving teams
    with high ownership and high engineering standards.
    #v(7pt)
    Especially interested in developer tools, AI, and event-driven
    systems.
    #v(20pt)

    #main-h[Experience]
    #job(
      [Lightning Infrastructure Engineer],
      [Lightning Labs],
      [2021 – Present],
    )[
      One of the top contributors to #link("https://github.com/lightningnetwork/lnd/graphs/contributors?from=18%2F05%2F2024")[#text(fill: accent)[#underline[LND]]], the most widely-deployed
      Lightning Network implementation. My work centres on shipping
      protocol upgrades and large database migrations safely across a
      live peer-to-peer network of thousands of nodes. I also lead
      major features in the Lightning Terminal and Lightning Node
      Connect developer-tooling projects.

      #v(4pt)
      #bullet[
        Contributions to the Lightning Network protocol specification.
      ]
      #bullet[
        Significant optimisations to the Neutrino (Bitcoin light-client)
        sync process.
      ]
      #bullet[
        Extensive code review on a large, widely-used open-source
        codebase.
      ]
    ]

    #job(
      [Software Engineer],
      [Luno],
      [2020 – 2021],
    )[
      Backend engineer on the crypto-operations team. Worked in Go on
      event-driven microservices handling high cryptocurrency volumes
      for millions of users.
    ]

    #main-h[Public Appearances]
    #appearance(
      [Bitcoin++ Brazil (2025)],
      [Technical hackathon judge.],
      "https://btcplusplus.dev/floripa",
    )
    #appearance(
      [Bitcoin Optech Podcast (Oct 2024)],
      [Proposed updates to the Lightning gossip protocol.],
      "https://bitcoinops.org/en/podcast/2024/10/29/",
    )
    #appearance(
      [Bitcoin Optech Podcast (Jul 2024)],
      [Adding a BOLT11 invoice field for blinded paths.],
      "https://bitcoinops.org/en/podcast/2024/07/09/",
    )
    #appearance(
      [The Chaincode Podcast (2023)],
      [Simple Taproot Channels on the Lightning Network.],
      "https://podcast.chaincode.com/2023/07/17/elle-oli-taproot-channels",
    )
    #appearance(
      [Advancing Bitcoin Conference, London (2022)],
      [Static invoices on the Lightning Network.],
      "https://vimeo.com/703262308",
    )
    #appearance(
      [Connect The World Podcast (2022)],
      [All things Lightning.],
      "https://www.youtube.com/watch?v=tF75BaqsJ3g",
    )

    #v(6pt)
    #main-h[Writing]
    Deep-dive technical posts on Bitcoin and Lightning Network
    internals, widely read across the community.
    #link("https://www.ellemouton.com/articles/")[ #text(fill: accent, weight: "bold")[#underline[ellemouton.com/articles] →]]
  ],
)
