import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

// Note: kept as a hand-authored React component rather than reading the
// Hugo content/about.md, because that file uses Hugo's {{< lead >}}
// shortcode and inline-HTML headings that goldmark+unsafe handles but
// remark does not. If you want to keep editing in markdown, the path is
// to add a small Hugo-shortcode preprocessor in lib/posts.ts.

export default function AboutPage() {
  return (
    <article className="about-page">
      <header className="post-header mb-6">
        <h1 className="post-title text-4xl font-extrabold">About</h1>
      </header>

      <div className="about-layout grid gap-12 lg:grid-cols-[240px_1fr]">
        <aside className="about-sidebar lg:sticky lg:top-20 lg:self-start text-sm">
          <nav className="about-toc">
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {[
                ["About", "#about"],
                ["Work", "#work"],
                ["Public Appearances", "#public-appearances"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--content)] hover:text-[color:var(--primary)] hover:underline"
                  >
                    <span className="text-[color:var(--secondary)] font-normal">
                      ——{" "}
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="about-main post-content">
          <h2 id="about">About</h2>
          <div
            className="lead-paragraph border-l-[3px] pl-4 my-6 text-[color:var(--secondary)]"
            style={{ borderColor: "var(--primary)", fontSize: "1.1rem", lineHeight: 1.55 }}
          >
            Software engineer with 5+ years building production-scale
            distributed systems — from high-volume Go microservices serving
            millions of users, to protocol-layer infrastructure on the Bitcoin
            Lightning Network, where I&rsquo;m a top contributor to LND
            (Lightning Network Daemon), the most widely-used implementation. I
            do my best work on small, mission-driven teams that move fast
            without compromising on quality.
          </div>

          <p>
            What a CV won&rsquo;t tell you: I love to build. Quality and fast
            iteration aren&rsquo;t in tension for me — they reinforce each
            other, and clear, direct communication is what holds them together.
            I&rsquo;m equally at home shipping the code and explaining it on a
            whiteboard, and I gravitate toward small teams where everyone owns
            the outcome.
          </p>
          <p>
            The current focus happens to be Bitcoin and Lightning, but the
            things I care about travel well across domains.
          </p>
          <p>
            You can grab my CV{" "}
            <Link href="/CV_Elle_Mouton.pdf">here</Link>.
          </p>

          <h2 id="work">Work</h2>

          <h3 id="lightning-labs" className="flex items-center gap-2">
            <Image
              src="/img/lightning-labs.png"
              alt="Lightning Labs"
              width={28}
              height={28}
              className="inline-block"
              unoptimized
            />
            <span>Lightning Labs — Lightning Infrastructure Engineer</span>
          </h3>
          <p>
            <em>2021 — Present</em>
          </p>
          <p>
            I joined Lightning Labs in 2021 after deciding in my final year of
            university that protocol work was what I wanted to do, and moved
            onto the Lightning Network protocol team itself at the end of 2023.
            Today my work splits across two areas:
          </p>
          <ul>
            <li>
              <strong>Lightning Network protocol &amp; LND (Lightning Network Daemon).</strong>{" "}
              Contributions and proposals to the Lightning Network
              specification, plus implementation and review work across LND —
              the most widely-used Lightning implementation. I&rsquo;m one of
              the top contributors to the{" "}
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
            Beyond shipping code, this work involves deep collaboration with
            the broader open-source Lightning community — code review,
            mailing-list spec discussions, and the last three Lightning
            Protocol Summits (Tokyo 2024, New York City 2023, San Francisco
            2022).
          </p>

          <h3 id="luno" className="flex items-center gap-2">
            <Image
              src="/img/luno.png"
              alt="Luno"
              width={28}
              height={28}
              className="inline-block"
              unoptimized
            />
            <span>Luno — Graduate Software Engineer</span>
          </h3>
          <p>
            <em>2020 — 2021</em>
          </p>
          <p>
            Backend engineer on the crypto-operations team, working in Go on
            gRPC microservices that handled high cryptocurrency volumes for
            millions of users. This is where I built up production Go
            experience, got comfortable inside distributed systems, and shipped
            through CI/CD pipelines into a real, high-load environment.
          </p>

          <h3 id="earlier-roles">Earlier roles</h3>
          <ul>
            <li>
              <strong>Aerobotics — Data Science Intern</strong>{" "}
              <em>(December 2018)</em>. Five-week stint on the data science
              team writing algorithms, including some 2D FFT work.
            </li>
            <li>
              <strong>MWR InfoSecurity — Security Intern</strong>{" "}
              <em>(July 2017)</em>. Two-week website penetration-testing
              bootcamp.
            </li>
          </ul>

          <h2 id="public-appearances">Public Appearances</h2>
          <ul>
            <li>
              <a href="https://podcast.chaincode.com/2023/07/17/elle-oli-taproot-channels">
                <strong>The Chaincode Podcast</strong> (2023)
              </a>{" "}
              — Simple Taproot Channels on the Lightning Network.
            </li>
            <li>
              <a href="https://vimeo.com/703262308">
                <strong>Advancing Bitcoin Conference</strong>, London (2022)
              </a>{" "}
              — Static invoices on the Lightning Network.
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=tF75BaqsJ3g">
                <strong>Connect The World Podcast</strong> (2022)
              </a>{" "}
              — All things Lightning.
            </li>
            <li>
              <a href="https://bitcoinops.org/en/podcast/2024/10/29/">
                <strong>Bitcoin Optech Podcast</strong> (Oct 2024)
              </a>{" "}
              — Proposed updates to the Lightning gossip protocol (start at
              1m35s).
            </li>
            <li>
              <a href="https://bitcoinops.org/en/podcast/2024/07/09/#adding-a-bolt11-invoice-field-for-blinded-paths">
                <strong>Bitcoin Optech Podcast</strong> (Jul 2024)
              </a>{" "}
              — Adding a BOLT11 invoice field for blinded paths (start at
              22m17s).
            </li>
            <li>
              <strong>Bitcoin++ Brazil (2025)</strong> — Technical hackathon
              judge (one of four).
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}
