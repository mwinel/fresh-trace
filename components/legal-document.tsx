import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export type LegalSection = { title: string; body: string }

type LegalDocumentProps = {
  title: string
  introduction: string
  sections: readonly LegalSection[]
}

export function LegalDocument({
  title,
  introduction,
  sections,
}: LegalDocumentProps) {
  return (
    <main className="min-h-svh bg-muted px-6 py-10 md:py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link
          href="/login"
          aria-label="Back to login"
          className="flex min-h-11 w-fit items-center gap-2 rounded-sm text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <ArrowLeft
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          Back
        </Link>
        <article className="flex flex-col gap-8 rounded-xl border bg-card p-6 text-card-foreground md:p-10">
          <header className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              FreshTrace
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="leading-relaxed text-muted-foreground">
              {introduction}
            </p>
            <p className="rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
              Starter draft — not yet effective. Complete the bracketed details
              and review this content before using it for a live service.
            </p>
          </header>
          {sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </article>
        <nav
          aria-label="Legal information"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
        >
          <Link href="/terms" className="underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </main>
  )
}
