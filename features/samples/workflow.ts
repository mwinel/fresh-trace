import { sampleSteps } from "./data/registration-data"
import type { Sample, SampleStage } from "./types"

export function stageIndex(stage: string) {
  return sampleSteps.findIndex((item) => item.id === stage)
}
export function canViewStage(sample: Sample, stage: string) {
  const index = stageIndex(stage)
  return index >= 0 && index <= stageIndex(sample.stage)
}
export function resolveStage(
  sample: Sample,
  requested?: string | null
): SampleStage {
  return requested && canViewStage(sample, requested)
    ? sampleSteps[stageIndex(requested)].id
    : sample.stage
}
export function canAdvance(sample: Sample, viewedStage: SampleStage) {
  return sample.status !== "done" && sample.stage === viewedStage
}
export function advanceSample(
  sample: Sample,
  viewedStage: SampleStage
): Sample {
  if (!canAdvance(sample, viewedStage)) return sample
  const next = sampleSteps[stageIndex(viewedStage) + 1]
  return next
    ? {
        ...sample,
        stage: next.id,
        status: next.id === "lab-report" ? "awaiting-review" : "in-progress",
      }
    : { ...sample, status: "done" }
}
