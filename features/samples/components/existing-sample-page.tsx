"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSamples } from "./sample-provider"
import { SampleRegistrationPage } from "./sample-registration-page"
import { buttonVariants } from "@/components/ui/button"
export function ExistingSample({ sampleId }: { sampleId: string }) {
  const { samples } = useSamples()
  const searchParams = useSearchParams()
  const sample = samples.find(
    (item) => item.id === sampleId && !item.archivedAt
  )
  if (!sample)
    return (
      <section className="flex flex-col items-start gap-4 p-6">
        <h2 className="text-lg font-medium">Sample unavailable</h2>
        <p>
          This sample was not found. Demo samples added during a session are
          lost on refresh.
        </p>
        <Link href="/samples" className={buttonVariants()}>
          Back to Samples
        </Link>
      </section>
    )
  return (
    <SampleRegistrationPage
      key={`${sampleId}:${searchParams.get("mode") ?? ""}`}
      existingSample={sample}
    />
  )
}
