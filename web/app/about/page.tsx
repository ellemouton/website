import type { Metadata } from "next";
import Image from "next/image";
import { PostCarousel } from "@/components/PostCarousel";

export const metadata: Metadata = {
  title: "About",
};

// Top-level ToC entries shown in the sidebar. Sub-headings (the role
// names under Work) are intentionally omitted to keep the rail tidy.
const TOC = [
  { label: "About", href: "#about" },
  { label: "Writing", href: "#writing" },
  { label: "Work", href: "#work" },
  { label: "Public Appearances", href: "#public-appearances" },
];

// Reusable muted-grey label for things like date ranges — kept as a small
// helper so the same treatment applies consistently and we don't have
// `<em>` lying around pretending to mark up metadata.
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

export default async function AboutPage() {
  return (
    <article className="about-page grid gap-10 md:grid-cols-[140px_1fr]">
      <aside className="about-sidebar md:sticky md:top-20 md:self-start text-sm">
        <nav>
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            {TOC.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="toc-link group inline-flex items-baseline gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--content)] hover:text-[color:var(--primary)]"
                >
                  {/* The dash grows on hover for a tamir.io-style "rule
                   * extending" feel. Implemented as a span with a
                   * transitioning width rather than animated `content`
                   * so it works without trickery. */}
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
      </aside>

      <div className="post-content space-y-2 min-w-0">
        <h2 id="about">About</h2>
        <p>
          Backend engineer with 5+ years building production-scale
          distributed systems in Go. My work spans event-driven microservices
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
          Lightning Labs: Lightning Infrastructure Engineer
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
          Luno: Graduate Software Engineer
        </h3>
        <DateRange>2020 to 2021</DateRange>
        <p>
          Backend engineer on the crypto-operations team. Worked in Go on
          event-driven microservices handling high cryptocurrency volumes
          for millions of users.
        </p>

        <hr className="my-12 border-[color:var(--border)]" />

        <h2 id="public-appearances">Public Appearances</h2>
        <ul>
          <li>
            <a href="https://podcast.chaincode.com/2023/07/17/elle-oli-taproot-channels">
              <strong>The Chaincode Podcast</strong>
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(2023)</span>: Simple
            Taproot Channels on the Lightning Network.
          </li>
          <li>
            <a href="https://vimeo.com/703262308">
              <strong>Advancing Bitcoin Conference</strong>, London
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(2022)</span>: Static
            invoices on the Lightning Network.
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=tF75BaqsJ3g">
              <strong>Connect The World Podcast</strong>
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(2022)</span>: All
            things Lightning.
          </li>
          <li>
            <a href="https://bitcoinops.org/en/podcast/2024/10/29/">
              <strong>Bitcoin Optech Podcast</strong>
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(Oct 2024)</span>:
            Proposed updates to the Lightning gossip protocol (start at 1m35s).
          </li>
          <li>
            <a href="https://bitcoinops.org/en/podcast/2024/07/09/#adding-a-bolt11-invoice-field-for-blinded-paths">
              <strong>Bitcoin Optech Podcast</strong>
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(Jul 2024)</span>:
            Adding a BOLT11 invoice field for blinded paths (start at 22m17s).
          </li>
          <li>
            <strong>Bitcoin++ Brazil</strong>{" "}
            <span style={{ color: "var(--secondary)" }}>(2025)</span>:
            Technical hackathon judge (one of four).
          </li>
        </ul>
      </div>
    </article>
  );
}
