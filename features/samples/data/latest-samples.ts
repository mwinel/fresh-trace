import { sampleSteps } from "./registration-data"

import type { Sample, SampleStage, SampleStatus, LabTestResult } from "../types"
import { productOptions } from "../products"
import { createSample } from "../sample-state"
export type { SampleStage, SampleStatus } from "../types"
export type SampleListItem = Sample

export const sampleStatusLabels: Record<SampleStatus, string> = {
  draft: "Draft",
  registered: "Registered",
  "in-progress": "In progress",
  "awaiting-review": "Awaiting review",
  done: "Done",
}

// Stable record identities; timestamps are initialized once per demo session.
const sampleFixtures: (Pick<Sample, "id" | "stage" | "status"> & {
  sourceId: string
})[] = [
  {
    id: "C26309-069",
    sourceId: "source-tanker-001",
    stage: "register",
    status: "registered",
  },
  {
    id: "C26309-750",
    sourceId: "source-truck-001",
    stage: "lab-tests",
    status: "in-progress",
  },
  {
    id: "C26309-192",
    sourceId: "source-truck-002",
    stage: "lab-report",
    status: "awaiting-review",
  },
  {
    id: "C26309-162",
    sourceId: "source-tanker-001",
    stage: "tanker",
    status: "in-progress",
  },
  {
    id: "C26309-106",
    sourceId: "source-cooling-tank-001",
    stage: "silo",
    status: "in-progress",
  },
  {
    id: "C26309-055",
    sourceId: "source-mixing-tank-001",
    stage: "standardization",
    status: "in-progress",
  },
  {
    id: "C26309-917",
    sourceId: "source-truck-003",
    stage: "product-logs",
    status: "in-progress",
  },
  {
    id: "C26309-118",
    sourceId: "source-truck-004",
    stage: "product-logs",
    status: "done",
  },
  {
    id: "C26309-014",
    sourceId: "source-truck-005",
    stage: "lab-report",
    status: "awaiting-review",
  },
  {
    id: "C26309-312",
    sourceId: "source-cooling-tank-001",
    stage: "silo",
    status: "in-progress",
  },
  {
    id: "C26309-460",
    sourceId: "source-tanker-001",
    stage: "tanker",
    status: "in-progress",
  },
  {
    id: "C26309-870",
    sourceId: "source-truck-001",
    stage: "lab-tests",
    status: "in-progress",
  },
  {
    id: "C26299-454",
    sourceId: "source-truck-002",
    stage: "product-logs",
    status: "done",
  },
  {
    id: "C26299-462",
    sourceId: "source-mixing-tank-001",
    stage: "standardization",
    status: "in-progress",
  },
  {
    id: "C26299-218",
    sourceId: "source-truck-003",
    stage: "lab-report",
    status: "awaiting-review",
  },
  {
    id: "C26299-573",
    sourceId: "source-truck-004",
    stage: "product-logs",
    status: "done",
  },
  {
    id: "C26299-961",
    sourceId: "source-cooling-tank-001",
    stage: "silo",
    status: "in-progress",
  },
  {
    id: "C26299-813",
    sourceId: "source-tanker-001",
    stage: "tanker",
    status: "in-progress",
  },
  {
    id: "C26299-558",
    sourceId: "source-truck-005",
    stage: "product-logs",
    status: "done",
  },
  {
    id: "C26299-798",
    sourceId: "source-truck-001",
    stage: "lab-report",
    status: "awaiting-review",
  },
  {
    id: "C26299-944",
    sourceId: "source-mixing-tank-001",
    stage: "standardization",
    status: "in-progress",
  },
  {
    id: "C26299-578",
    sourceId: "source-truck-002",
    stage: "product-logs",
    status: "done",
  },
  {
    id: "C26299-455",
    sourceId: "source-truck-003",
    stage: "product-logs",
    status: "done",
  },
  {
    id: "C26299-899",
    sourceId: "source-tanker-001",
    stage: "product-logs",
    status: "done",
  },
]

// Uneven daily intake: 52 samples in the last week, 34 in the previous
// week, and 14 older records. Offsets are relative to the session clock.
const dailySampleCounts = [
  8, 7, 10, 6, 9, 5, 7, 6, 4, 7, 3, 5, 4, 5, 4, 3, 4, 3,
]
const sampleAges = dailySampleCounts.flatMap((count, daysAgo) =>
  Array.from(
    { length: count },
    (_, index) => daysAgo + (index + 1) / (count + 1)
  )
)

const day = 24 * 60 * 60 * 1000
const dateOnly = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Kampala",
})
const timeOnly = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Kampala",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export function createSampleFixtures(referenceAt: string): Sample[] {
  const reference = Date.parse(referenceAt)
  return sampleAges
    .map((ageDays, index) => {
      const fixture = sampleFixtures[index % sampleFixtures.length]
      const productWeight = (index * 7 + Math.floor(ageDays)) % 10
      const createdAt = new Date(reference - ageDays * day).toISOString()
      // Preserve the original records; additional records reuse the source mix.
      // Most older additions have finished, with a smaller outstanding backlog.
      const completed =
        index >= sampleFixtures.length && ageDays >= 7 && index % 4 !== 0
      const entry = {
        ...fixture,
        id:
          index < sampleFixtures.length ? fixture.id : `C26299-${600 + index}`,
        stage: completed ? ("product-logs" as const) : fixture.stage,
        status: completed ? ("done" as const) : fixture.status,
      }
      const sample = createSample(entry.id, createdAt, "Sarah N")
      const statuses: SampleStatus[] = ["draft", "registered"]
      if (entry.status !== "registered") statuses.push("in-progress")
      if (entry.stage !== "register" && entry.stage !== "lab-tests")
        statuses.push("awaiting-review")
      if (
        ["tanker", "silo", "standardization", "product-logs"].includes(
          entry.stage
        )
      )
        statuses.push("in-progress")
      if (entry.status === "done") statuses.push("done")
      // Vary processing time without allowing any event after the reference time.
      const durationHours = Math.min(
        ageDays * 24 - 0.25,
        entry.status === "done" ? 12 + (index % 9) * 8 : 2 + (index % 7) * 4
      )
      const statusHistory = statuses.map((status, position) => ({
        status,
        changedAt: new Date(
          Date.parse(createdAt) +
            (position / (statuses.length - 1)) * durationHours * 60 * 60 * 1000
        ).toISOString(),
      }))
      const reportAt = statusHistory.find(
        (event) => event.status === "awaiting-review"
      )?.changedAt
      const hasReport =
        sampleSteps.findIndex((step) => step.id === entry.stage) >= 2
      return {
        ...sample,
        stage: entry.stage,
        status: entry.status,
        statusHistory,
        registration: {
          ...sample.registration,
          sourceId: entry.sourceId,
          productType:
            productOptions[productWeight < 5 ? 0 : productWeight < 8 ? 1 : 2]
              .value,
          description:
            "Illustrative milk quality sample for the Fresh Trace demo.",
          volume: "500 ml",
          equipment: "Sterile sampling bottle",
          temperature: "5.0",
          receiptTime: timeOnly.format(new Date(createdAt)),
          integrity: "Good",
          analysis: "Composition",
          sampler: "Alex K",
        },
        laboratory: {
          ...sample.laboratory,
          details: {
            ...sample.laboratory.details,
            client: "Quality assurance (demo)",
            testingLab: "Dairy quality laboratory (demo)",
            samplingDate: dateOnly.format(new Date(createdAt)),
            testingDate: reportAt ? dateOnly.format(new Date(reportAt)) : "",
            reportIssueDate: reportAt
              ? dateOnly.format(new Date(reportAt))
              : "",
          },
          // Explicit illustrative decisions, not threshold calculations or lab policy.
          results: sample.laboratory.results.map<LabTestResult>(
            (row, resultIndex) => {
              const flagged = index % 11 === 0 && resultIndex === 3
              const unassessed = index % 7 === 0
              const values = [
                "Normal",
                (3.5 + (index % 9) * 0.2).toFixed(1),
                "6",
                flagged ? "6.9" : (6.61 + (index % 9) * 0.02).toFixed(2),
              ]
              return {
                ...row,
                fSilo: hasReport ? values[resultIndex] : "",
                status:
                  hasReport && !unassessed ? (flagged ? "fail" : "pass") : "",
              }
            }
          ),
        },
      }
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export function sampleStageLabel(stage: SampleStage) {
  return sampleSteps.find((item) => item.id === stage)?.label ?? stage
}
