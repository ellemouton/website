import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

// Top-level ToC entries shown in the sidebar. Sub-headings (the role
// names under Work) are intentionally omitted to keep the rail tidy.
const TOC = [
  { label: "About", href: "#about" },
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

export default function AboutPage() {
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

      <div className="post-content space-y-2">
        <h2 id="about">About</h2>
        <p>
          I&rsquo;m a Software engineer with 5+ years building production-scale distributed
          systems in Go — from high-volume financial microservices serving
          millions of users to LND, the most widely deployed Lightning Network
          (Bitcoin L2) implementation, operating across ~16k nodes and ~50k
          payment channels, to which I&rsquo;m a top open-source contributor. I
          thrive in small, fast-moving teams with high ownership and high
          engineering standards.
        </p>

        <p>
          You can grab my CV{" "}
          <Link href="/CV_Elle_Mouton.pdf">here</Link>.
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
          Lightning Labs — Lightning Infrastructure Engineer
        </h3>
        <DateRange>2021 — Present</DateRange>
        <p>
          I joined Lightning Labs in 2021 after deciding in my final year of
          university that protocol work was what I wanted to do, and moved
          onto the Lightning Network protocol team itself at the end of 2023.
          Today my work splits across two areas:
        </p>
        <ul>
          <li>
            <strong>
              Lightning Network protocol &amp; LND (Lightning Network Daemon).
            </strong>{" "}
            Contributions and proposals to the Lightning Network specification,
            plus implementation and review work across LND — the most
            widely-used Lightning implementation. I&rsquo;m one of the top
            contributors to the{" "}
            <a href="https://github.com/lightningnetwork/lnd/graphs/contributors">
              LND repository
            </a>
            , and have also led significant optimisations to the Neutrino
            Bitcoin light-client sync process.
          </li>
          <li>
            <strong>Lightning Terminal &amp; Lightning Node Connect.</strong>{" "}
            Led major features across the{" "}
            <a href="https://github.com/lightninglabs/lightning-terminal/graphs/contributors">
              Lightning Terminal
            </a>{" "}
            daemon and the{" "}
            <a href="https://github.com/lightninglabs/lightning-node-connect/graphs/contributors">
              Lightning Node Connect
            </a>{" "}
            protocol, where I&rsquo;m a top contributor to both.
          </li>
        </ul>
        <p>
          Beyond shipping code, this work involves deep collaboration with the
          broader open-source Lightning community — code review, mailing-list
          spec discussions, and the last three Lightning Protocol Summits
          (Tokyo 2024, New York City 2023, San Francisco 2022).
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
          Luno — Graduate Software Engineer
        </h3>
        <DateRange>2020 — 2021</DateRange>
        <p>
          Backend engineer on the crypto-operations team, working in Go on
          gRPC microservices that handled high cryptocurrency volumes for
          millions of users. This is where I built up production Go
          experience, got comfortable inside distributed systems, and shipped
          through CI/CD pipelines into a real, high-load environment.
        </p>

        <hr className="my-12 border-[color:var(--border)]" />

        <h2 id="public-appearances">Public Appearances</h2>
        <ul>
          <li>
            <a href="https://podcast.chaincode.com/2023/07/17/elle-oli-taproot-channels">
              <strong>The Chaincode Podcast</strong>
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(2023)</span> — Simple
            Taproot Channels on the Lightning Network.
          </li>
          <li>
            <a href="https://vimeo.com/703262308">
              <strong>Advancing Bitcoin Conference</strong>, London
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(2022)</span> — Static
            invoices on the Lightning Network.
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=tF75BaqsJ3g">
              <strong>Connect The World Podcast</strong>
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(2022)</span> — All
            things Lightning.
          </li>
          <li>
            <a href="https://bitcoinops.org/en/podcast/2024/10/29/">
              <strong>Bitcoin Optech Podcast</strong>
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(Oct 2024)</span> —
            Proposed updates to the Lightning gossip protocol (start at 1m35s).
          </li>
          <li>
            <a href="https://bitcoinops.org/en/podcast/2024/07/09/#adding-a-bolt11-invoice-field-for-blinded-paths">
              <strong>Bitcoin Optech Podcast</strong>
            </a>{" "}
            <span style={{ color: "var(--secondary)" }}>(Jul 2024)</span> —
            Adding a BOLT11 invoice field for blinded paths (start at 22m17s).
          </li>
          <li>
            <strong>Bitcoin++ Brazil</strong>{" "}
            <span style={{ color: "var(--secondary)" }}>(2025)</span> —
            Technical hackathon judge (one of four).
          </li>
        </ul>
      </div>
    </article>
  );
}
