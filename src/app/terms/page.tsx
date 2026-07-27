import Link from "next/link";

export const metadata = {
  title: "Terms of Use — Thunder",
  description: "Terms of use for Thunder, a personal audience operating system product.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <p className="text-sm text-muted">
        <Link href="/" className="underline underline-offset-2 hover:text-fg">
          ← Thunder
        </Link>
      </p>
      <h1 className="mt-6 font-[family-name:var(--font-newsreader)] text-3xl font-semibold tracking-tight text-fg">
        Terms of Use
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: July 28, 2026</p>

      <div className="mt-8 space-y-5 text-sm leading-relaxed text-fg/90">
        <p>
          Thunder is a personal product (audience preflight / scenario lab) operated
          by the project author. These terms are intentionally short and honest.
        </p>
        <section>
          <h2 className="font-semibold text-fg">What Thunder is</h2>
          <p className="mt-2">
            Thunder helps you rehearse how segments of <em>your</em> imported
            audience comments might react to a draft. It is a grounded simulation —
            not a prediction of real humans, platform reach, or virality.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-fg">Your responsibilities</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Only upload comments and drafts you have the right to use.</li>
            <li>Do not abuse shared demo endpoints or attempt to bypass rate limits.</li>
            <li>Do not treat Live / Seeded / Recovery modes as interchangeable truth.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-fg">No warranties</h2>
          <p className="mt-2">
            The service is provided as-is. Outputs may be incomplete, wrong, or
            labeled recovery/seeded. Studio, Media, and Publish features are still
            being built; availability may change.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-fg">Costly features</h2>
          <p className="mt-2">
            Live language, cover images, voiceover, and scrapes may use third-party
            APIs. When authentication is enabled, those routes require a valid
            session or API token. Seeded demo paths are designed not to burn paid
            language credits.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-fg">Contact</h2>
          <p className="mt-2">
            For questions about this personal product, open an issue on{" "}
            <a
              className="underline underline-offset-2"
              href="https://github.com/harshjoshi23/Thunder"
            >
              github.com/harshjoshi23/Thunder
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-muted">
        See also{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
          Privacy
        </Link>
        .
      </p>
    </main>
  );
}
