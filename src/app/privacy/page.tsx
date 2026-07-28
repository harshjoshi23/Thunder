import Link from "next/link";

export const metadata = {
  title: "Privacy — Thunder",
  description: "Privacy policy for Thunder, a personal audience operating system product.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <p className="text-sm text-muted">
        <Link href="/" className="underline underline-offset-2 hover:text-fg">
          ← Thunder
        </Link>
      </p>
      <h1 className="mt-6 font-[family-name:var(--font-newsreader)] text-3xl font-semibold tracking-tight text-fg">
        Privacy
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: July 28, 2026</p>

      <div className="mt-8 space-y-5 text-sm leading-relaxed text-fg/90">
        <p>
          Thunder is a personal product. This page describes what we intend to
          collect and how demo vs authenticated use differs. It is not legal advice.
        </p>
        <section>
          <h2 className="font-semibold text-fg">What you submit</h2>
          <p className="mt-2">
            Comments, creator context, drafts, and optional source URLs are sent to
            the server to run analysis. Without Studio / Postgres configured, runs
            are primarily request-scoped. Do not paste secrets or private credentials
            into comment fields.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-fg">Third-party processors</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>OpenAI / fal.ai — language and optional cover images when keys are set</li>
            <li>Firecrawl / ElevenLabs / n8n — optional scrape, voice, export webhook</li>
            <li>Clerk — authentication when enabled</li>
            <li>Upstash Redis — shared rate limits when configured</li>
            <li>Sentry — error monitoring when <code>SENTRY_DSN</code> is set</li>
            <li>Render (or your host) — infrastructure logs and health checks</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-fg">Saved projects (Studio)</h2>
          <p className="mt-2">
            When <code>DATABASE_URL</code> is configured, Studio may store projects,
            runs, and related metadata in Postgres. Until then, treat the public demo
            as ephemeral unless you export results yourself.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-fg">Cookies / auth</h2>
          <p className="mt-2">
            Theme preference may be stored in localStorage. When Clerk is
            configured, session cookies are used for sign-in. Rate limiting may
            key on IP headers from the reverse proxy.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-fg">Contact</h2>
          <p className="mt-2">
            Privacy questions: open an issue on{" "}
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
        <Link href="/terms" className="underline underline-offset-2 hover:text-fg">
          Terms of Use
        </Link>
        .
      </p>
    </main>
  );
}
