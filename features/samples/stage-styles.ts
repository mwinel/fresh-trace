import type { SampleStage } from "./data/latest-samples"

export const stageDotClasses = {
  register: "bg-stage-register",
  "lab-tests": "bg-stage-lab-tests",
  "lab-report": "bg-stage-lab-report",
  tanker: "bg-stage-tanker",
  silo: "bg-stage-silo",
  standardization: "bg-stage-standardization",
  "product-logs": "bg-stage-product-logs",
} satisfies Record<SampleStage, string>
