import { canViewStage } from "../workflow"
import type { Sample } from "../types"
export function sampleHasReport(sample: Sample) {
  return canViewStage(sample, "lab-report")
}
