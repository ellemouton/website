import Image from "next/image";
import { PostCarousel } from "@/components/PostCarousel";
import { SocialIcons } from "@/components/SocialIcons";

// Top-level ToC entries shown in the sidebar. Sub-headings (the role
// names under Work) are intentionally omitted to keep the rail tidy.
const TOC = [
  { label: "About", href: "#about" },
  { label: "Writing", href: "#writing" },
  { label: "Work", href: "#work" },
  { label: "Public Appearances", href: "#public-appearances" },
];

// Public Appearances grid data. Card images live in /public/img/.
// Aspect ratios vary; cards normalise to 16:10 via object-fit: cover.
const APPEARANCES = [
  {
    source: "The Chaincode Podcast",
    year: "2023",
    description: "Simple Taproot Channels on the Lightning Network.",
    href: "https://podcast.chaincode.com/2023/07/17/elle-oli-taproot-channels",
    image: "/img/chaincode.png",
  },
  {
    source: "Advancing Bitcoin Conference, London",
    year: "2022",
    description: "Static invoices on the Lightning Network.",
    href: "https://vimeo.com/703262308",
    image: "/img/advancing-bitcoin.png",
  },
  {
    source: "Connect The World Podcast",
    year: "2022",
    description: "All things Lightning.",
    href: "https://www.youtube.com/watch?v=tF75BaqsJ3g",
    image: "/img/connect-the-world.png",
  },
  {
    source: "Bitcoin Optech Podcast",
    year: "Oct 2024",
    description:
      "Proposed updates to the Lightning gossip protocol (start at 1m35s).",
    href: "https://bitcoinops.org/en/podcast/2024/10/29/",
    image: "/img/bitcoin-optech.png",
  },
  {
    source: "Bitcoin Optech Podcast",
    year: "Jul 2024",
    description:
      "Adding a BOLT11 invoice field for blinded paths (start at 22m17s).",
    href: "https://bitcoinops.org/en/podcast/2024/07/09/#adding-a-bolt11-invoice-field-for-blinded-paths",
    image: "/img/bitcoin-optech.png",
  },
  {
    source: "Bitcoin++ Brazil",
    year: "2025",
    description: "Technical hackathon judge (one of four).",
    href: "https://btcplusplus.dev/floripa",
    image: "/img/bitcoinplusplus.png",
  },
];

// Avatar diameter in px. Sidebar grid track is 160px wide, so the
// avatar fills almost the whole rail with a few px of breathing room.
const AVATAR_PX = 150;

function DateRange({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm tracking-wide"
      style={{ color: "var(--secondary)", margin: "0 0 var(--content-gap)" }}
    >
      {children}
    </p>
  );
}

export function AboutContent() {
  return (
    <article className="about-page grid gap-10 md:grid-cols-[160px_1fr]">
      <aside
        className="about-sidebar text-sm md:sticky md:top-20 md:self-start md:flex md:flex-col"
        // Sticky viewport height: the sidebar fills the screen minus
        // its top offset (`md:top-20` = 5rem). That gives us a known
        // height so mt-auto can push the social icons to the bottom
        // of the visible rail.
        style={{ minHeight: "calc(100vh - 5rem)" }}
      >
        {/* Profile photo: same image used as the site's OG card.
         * object-cover crops the wide 1200x630 source to a square;
         * object-position 85% 50% shifts the crop right so the left
         * edge is trimmed and framing centres on the portrait. */}
        <div
          className="mt-2 overflow-hidden rounded-full border border-[color:var(--border)]"
          style={{
            width: AVATAR_PX,
            height: AVATAR_PX,
            aspectRatio: "1 / 1",
          }}
        >
          <Image
            src="/og-image.jpg"
            alt="Elle Mouton"
            width={630}
            height={630}
            unoptimized
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "85% 50%",
            }}
          />
        </div>
        <nav className="mt-6">
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            {TOC.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="toc-link group inline-flex items-baseline gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--content)] hover:text-[color:var(--primary)]"
                >
                  {/* The dash grows on hover for a tamir.io-style
                   * "rule extending" feel. Implemented as a span with
                   * a transitioning width rather than animated
                   * `content` so it works without trickery. */}
                  <span
                    aria-hidden
                    className="toc-dash inline-block h-px bg-[color:var(--secondary)] transition-[width] duration-300"
                  />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 md:mt-auto md:pt-6 md:pb-12">
          <SocialIcons />
        </div>
      </aside>

      <div className="post-content space-y-2 min-w-0">
        <h2 id="about">About</h2>
        <p>
          Backend engineer with 5+ years building production-scale
          distributed systems. My work spans event-driven microservices
          serving millions of users and protocol-level upgrades to large,
          live peer-to-peer networks. I thrive in small, fast-moving teams
          with high ownership and high engineering standards.
        </p>

        <p>
          I&rsquo;m especially interested in developer tools, AI, data
          pipelines, and event-driven systems.
        </p>

        <hr className="my-12 border-[color:var(--border)]" />

        <h2 id="writing">Writing</h2>
        <p>
          I write deep-dive technical posts on Bitcoin and Lightning Network
          internals. They&rsquo;ve been well received across the community
          and have helped many engineers understand some of Lightning&rsquo;s
          most complex inner workings. Breaking dense protocols and systems
          down into approachable pieces is something I genuinely enjoy.
        </p>
        <PostCarousel />
        <p className="mt-2 text-sm">
          <a href="/articles/">See all articles &rarr;</a>
        </p>

        <hr className="my-12 border-[color:var(--border)]" />

        <h2 id="work">Work</h2>

        <h3 id="lightning-labs">
          <Image
            src="/img/lightning-labs.png"
            alt="Lightning Labs"
            width={28}
            height={28}
            unoptimized
            style={{
              display: "inline-block",
              verticalAlign: "-0.25em",
              marginRight: "0.5em",
            }}
          />
          Lightning Infrastructure Engineer | Lightning Labs
        </h3>
        <DateRange>2021 to Present</DateRange>
        <p>
          One of the top contributors to{" "}
          <a href="https://github.com/lightningnetwork/lnd/graphs/contributors">
            LND
          </a>
          , the most widely-deployed Lightning Network implementation. My
          work centres on shipping protocol upgrades and large database
          migrations safely across a live peer-to-peer network of thousands
          of nodes. I also lead major features in the{" "}
          <a href="https://github.com/lightninglabs/lightning-terminal/graphs/contributors">
            Lightning Terminal
          </a>{" "}
          and{" "}
          <a href="https://github.com/lightninglabs/lightning-node-connect/graphs/contributors">
            Lightning Node Connect
          </a>{" "}
          developer tooling.
        </p>

        <h3 id="luno">
          <Image
            src="/img/luno.png"
            alt="Luno"
            width={28}
            height={28}
            unoptimized
            style={{
              display: "inline-block",
              verticalAlign: "-0.25em",
              marginRight: "0.5em",
            }}
          />
          Software Engineer | Luno
        </h3>
        <DateRange>2020 to 2021</DateRange>
        <p>
          Backend engineer on the crypto-operations team. Worked in Go on
          event-driven microservices handling high cryptocurrency volumes
          for millions of users.
        </p>

        <hr className="my-12 border-[color:var(--border)]" />

        <h2 id="public-appearances">Public Appearances</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {APPEARANCES.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="appearance-card group flex flex-col overflow-hidden rounded-(--radius) border border-[color:var(--border)] bg-[color:var(--entry)] no-underline transition-shadow hover:shadow-md"
            >
              <div
                className="w-full overflow-hidden bg-[color:var(--tertiary)]"
                style={{ aspectRatio: "16 / 10" }}
              >
                <Image
                  src={a.image}
                  alt=""
                  width={1024}
                  height={640}
                  unoptimized
                  className="transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 p-3">
                <p className="text-sm font-semibold text-[color:var(--content)]">
                  {a.source}{" "}
                  <span style={{ color: "var(--secondary)" }}>({a.year})</span>
                </p>
                <p className="text-sm text-[color:var(--secondary)]">
                  {a.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
