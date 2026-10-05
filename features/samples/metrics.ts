import type { Sample, SampleStatus } from "./types"

export function sampleRegistrationTime(sample: Sample) {
  return sample.statusHistory.find((event) => event.status !== "draft")
    ?.changedAt
}

const week = 7 * 24 * 60 * 60 * 1000

export type SampleMetric = { current: number; previous: number }
export type SampleMetrics = Record<
  "registered" | "inProgress" | "awaitingReview" | "completed",
  SampleMetric
>

function statusAt(sample: Sample, cutoff: number): SampleStatus | null {
  if (sample.archivedAt && Date.parse(sample.archivedAt) <= cutoff) return null
  let status: SampleStatus | null = null
  for (const event of sample.statusHistory) {
    if (Date.parse(event.changedAt) <= cutoff) status = event.status
  }
  return status
}

export function getSampleMetrics(
  samples: Sample[],
  referenceAt: string
): SampleMetrics {
  const now = Date.parse(referenceAt)
  const previousEnd = now - week
  const previousStart = previousEnd - week
  const metrics: SampleMetrics = {
    registered: { current: 0, previous: 0 },
    inProgress: { current: 0, previous: 0 },
    awaitingReview: { current: 0, previous: 0 },
    completed: { current: 0, previous: 0 },
  }

  for (const sample of samples) {
    const registeredAt = sampleRegistrationTime(sample)
    const registration = registeredAt ? { changedAt: registeredAt } : undefined
    const completion = sample.statusHistory.find(
      (event) => event.status === "done"
    )
    for (const [key, event] of [
      ["registered", registration],
      ["completed", completion],
    ] as const) {
      if (!event) continue
      const time = Date.parse(event.changedAt)
      if (time > previousEnd && time <= now) metrics[key].current++
      else if (time > previousStart && time <= previousEnd)
        metrics[key].previous++
    }
    for (const [period, cutoff] of [
      ["current", now],
      ["previous", previousEnd],
    ] as const) {
      const status = statusAt(sample, cutoff)
      if (status === "registered" || status === "in-progress")
        metrics.inProgress[period]++
      if (status === "awaiting-review") metrics.awaitingReview[period]++
    }
  }
  return metrics
}

const numbers = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 })

export function metricTrend(metric: SampleMetric, kind: "activity" | "queue") {
  const difference = metric.current - metric.previous
  const direction = difference > 0 ? "up" : difference < 0 ? "down" : "flat"
  if (!difference) return { label: "No change", direction }
  if (kind === "activity" && !metric.previous)
    return { label: "No previous activity", direction }
  const value =
    kind === "activity"
      ? `${numbers.format(Math.abs(difference / metric.previous) * 100)}%`
      : numbers.format(Math.abs(difference))
  return { label: `${difference > 0 ? "+" : "−"}${value}`, direction }
}
