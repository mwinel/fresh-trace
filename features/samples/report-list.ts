import type { Sample } from "./types"
import { canViewStage } from "./workflow"

export function hasLabReport(sample: Sample) {
  return (
    !sample.archivedAt &&
    sample.status !== "draft" &&
    canViewStage(sample, "lab-report")
  )
}

export function reportHref(sample: Sample) {
  return `/samples/${encodeURIComponent(sample.id)}?stage=lab-report`
}
