// Elle Mouton — CV
// Build:  typst compile cv.typ
// Watch:  typst watch cv.typ

#set document(title: "Elle Mouton — CV", author: "Elle Mouton")

// FontAwesome icons. Uses the OTF files installed by
// `brew install --cask font-fontawesome` (Font Awesome 7).
// Codepoints are stable across FA6/7 for the icons used here.
#let fa-solid(code)  = text(font: "Font Awesome 7 Free",   weight: 900)[#code]
#let fa-brand(code)  = text(font: "Font Awesome 7 Brands", weight: 400)[#code]
#let fa-phone        = fa-solid("\u{f095}")
#let fa-envelope     = fa-solid("\u{f0e0}")
#let fa-location     = fa-solid("\u{f3c5}")
#let fa-globe        = fa-solid("\u{f0ac}")
#let fa-github       = fa-brand("\u{f09b}")

// ---------- Theme ----------
#let navy        = rgb("#1f3a5f")
#let accent      = rgb("#3b6ea5")
#let onNavy      = rgb("#ffffff")
#let onNavyMuted = rgb("#c9d6e6")
#let body        = rgb("#1a1a1a")
#let muted       = rgb("#5a6573")

// Width of the navy sidebar as a fraction of the page width.
// Original Pages CV is roughly 33-35%; 34% reads close to the source.
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
  fill: body,
)
#set par(justify: false, leading: 0.7em, spacing: 6pt)
// Links keep their parent text colour; only underline.
#show link: it => underline(it)

// ---------- Helpers ----------
#let sidebar-h(body) = block(spacing: 0pt)[
  #set text(fill: white, size: 13pt, weight: "bold", tracking: 1pt)
  #upper(body)
  #v(3pt)
  #line(length: 36pt, stroke: 1pt + white)
  #v(7pt)
]

#let main-h(body) = block(spacing: 0pt)[
  #set text(fill: navy, size: 17pt, weight: "bold", tracking: 0.5pt)
  #upper(body)
  #v(3pt)
  #line(length: 100%, stroke: 0.6pt + accent)
  #v(12pt)
]

#let sidebar-row(icon, value) = block(spacing: 6pt)[
  #set text(fill: onNavy, size: 9.5pt)
  #grid(
    columns: (12pt, 1fr),
    column-gutter: 7pt,
    align: (left + horizon, left + horizon),
    text(fill: onNavyMuted)[#icon],
    value,
  )
]

#let job(company, title, dates, body) = [
  #block(spacing: 0pt)[
    #grid(
      columns: (1fr, auto),
      align: (left, right + horizon),
      [
        #text(weight: "bold", size: 11.5pt, fill: navy)[#company] \
        #text(size: 9.5pt, fill: muted)[#title]
      ],
      text(size: 9pt, fill: muted)[#dates],
    )
  ]
  #v(8pt)
  #block(inset: (left: 2pt), spacing: 6pt)[#body]
  #v(18pt)
]

#let bullet(body) = block(spacing: 6pt)[
  #grid(
    columns: (10pt, 1fr),
    column-gutter: 5pt,
    text(fill: accent)[•],
    body,
  )
]

// Small uppercase muted label used inside the sidebar Skills section.
#let skill-label(body) = text(
  weight: "bold",
  fill: onNavyMuted,
  size: 8.5pt,
  tracking: 1pt,
)[#upper(body)]

#let appearance(title, desc, url) = block(spacing: 14pt, breakable: false)[
  #grid(
    columns: (10pt, 1fr),
    column-gutter: 5pt,
    row-gutter: 4pt,
    text(fill: accent)[•],
    link(url)[#text(weight: "bold", fill: navy)[#title]],
    [],
    text(fill: muted, size: 9pt)[#desc],
  )
]

// ---------- Layout ----------
#grid(
  columns: (sidebar-frac, 1fr),
  column-gutter: 0pt,

  // ============ SIDEBAR ============
  pad(x: 22pt, y: 28pt)[
    // Avatar — circular crop. avatar.jpg is pre-cropped to a square
    // centred on the face (see README), so the circle mask just needs
    // a plain image fill.
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
    #v(20pt)

    #sidebar-h[Contact]
    #sidebar-row(fa-phone, [+27 71 118 6141])
    #sidebar-row(
      fa-envelope,
      link("mailto:elle.mouton@gmail.com")[#text(fill: onNavy)[elle.mouton\@gmail.com]],
    )
    #sidebar-row(fa-location, [San Francisco, CA])

    #v(14pt)
    #sidebar-h[Links]
    #sidebar-row(
      fa-globe,
      link("https://ellemouton.com")[#text(fill: onNavy)[ellemouton.com]],
    )
    #sidebar-row(
      fa-github,
      link("https://github.com/ellemouton")[#text(fill: onNavy)[github.com/ellemouton]],
    )

    #v(24pt)
    #sidebar-h[Education]
    #block(spacing: 0pt)[
      #set text(fill: onNavy, size: 9.5pt)
      #set par(leading: 0.6em)
      #text(weight: "bold", size: 10pt)[
        BSc Electrical & Computer Engineering
      ]
      #v(6pt)
      #text(fill: onNavyMuted, size: 8.5pt, style: "italic")[
        2016 – 2019 · University of Cape Town
      ]
      #v(12pt)
      #grid(
        columns: (6pt, 1fr),
        column-gutter: 6pt,
        row-gutter: 10pt,
        text(fill: accent)[•],
        [Graduated with First Class Honours as top BSc(Eng) student.],
        text(fill: accent)[•],
        [Awarded the prize for the best final-year thesis.],
      )
    ]

    #v(24pt)
    #sidebar-h[Skills]
    #block(spacing: 0pt)[
      #set text(fill: onNavy, size: 9.5pt)
      #set par(leading: 0.6em)

      #skill-label[Tools]
      #v(5pt)
      Go, Python, TypeScript, SQL, Git, Docker, gRPC, React, Next.js
      #v(16pt)

      #skill-label[Domains]
      #v(5pt)
      Distributed systems, P2P networks, protocol design, database
      migrations, code review at scale, #box[CI/CD]
      #v(16pt)

      #skill-label[Soft]
      #v(5pt)
      Leadership, accountability, clear communication, fast learner
    ]
  ],

  // ============ MAIN ============
  pad(x: 26pt, y: 28pt)[
    // Name block
    #block(spacing: 0pt)[
      #text(size: 30pt, weight: "bold", fill: body)[Elle ]
      #text(size: 30pt, weight: "regular", fill: body)[Mouton]
      #v(2pt)
      #text(size: 13pt, fill: accent)[Backend Software Engineer]
      #v(4pt)
      #line(length: 70pt, stroke: 1pt + accent)
    ]
    #v(18pt)

    #main-h[About Me]
    Backend engineer with 5+ years building production-scale distributed
    systems. My work spans event-driven microservices serving millions of
    users and protocol-level upgrades to large, live peer-to-peer
    networks. I thrive in small, fast-moving teams with high ownership
    and high engineering standards.
    #v(6pt)
    Especially interested in developer tools, AI, and event-driven
    systems.
    #v(14pt)

    #main-h[Public Appearances]
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
      [Bitcoin++ Brazil (2025)],
      [Technical hackathon judge.],
      "https://btcplusplus.dev/floripa",
    )
    #v(10pt)

    #main-h[Work Experience]

    #job(
      [Lightning Labs],
      [Lightning Infrastructure Engineer],
      [2021 – Present],
    )[
      #bullet[
        One of the top contributors to LND, the most widely-deployed
        Lightning Network implementation.
      ]
      #bullet[
        Ship protocol upgrades and large database migrations safely
        across a live peer-to-peer network of thousands of nodes.
      ]
      #bullet[
        Lead major features on the Lightning Terminal and Lightning
        Node Connect developer-tooling projects.
      ]
      #bullet[
        Contributions to the Lightning Network protocol specification.
      ]
      #bullet[
        Significant optimisations to the Neutrino (Bitcoin light
        client) sync process.
      ]
      #bullet[
        Extensive code review on a large open-source codebase.
      ]
    ]

    #job(
      [Luno],
      [Software Engineer],
      [2020 – 2021],
    )[
      #bullet[
        Backend engineer on the crypto-operations team.
      ]
      #bullet[
        Built event-driven Go microservices handling high
        cryptocurrency volumes for millions of users.
      ]
      #bullet[
        Production microservices interfacing via gRPC.
      ]
    ]

    #v(6pt)
    #text(size: 8.5pt, fill: muted, style: "italic")[
      References available on request.
    ]
  ],
)
