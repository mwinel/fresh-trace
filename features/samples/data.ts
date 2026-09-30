import laboratoryTestParameters from "./data/laboratory-test-parameters.json"
import sourceFixtures from "./data/sources.json"
import type { SampleSource } from "./types"

// Trusted local source fixtures.
export const initialSources = sourceFixtures as SampleSource[]

export const sampleSteps = [
  {
    id: "register",
    label: "Sample register",
    title: "Laboratory sample register",
  },
  { id: "lab-tests", label: "Laboratory test", title: "Laboratory test" },
  {
    id: "lab-report",
    label: "Laboratory report",
    title: "Raw milk laboratory test report",
  },
  {
    id: "tanker",
    label: "Tanker logs",
    title: "Raw milk tanker analysis logs",
  },
  { id: "silo", label: "Silo logs", title: "Raw milk silo monitoring logs" },
  {
    id: "standardization",
    label: "Standardization logs",
    title: "Pasteurized milk standardization logs",
  },
  { id: "product-logs", label: "Product logs", title: "UHT logs" },
] as const

// Illustrative options for the local demo, not laboratory policy.
export const sampleOptions = {
  volumes: ["250 ml", "500 ml", "1 litre"],
  equipment: [
    "Sterile sampling bottle",
    "Stainless steel sampling dipper",
    "Tanker sampling valve",
    "Sterile sampling pipette",
  ],
  integrity: ["Good", "Bad", "Excellent"],
  analyses: [
    "Antibiotic screening",
    "Chemistry",
    "Composition",
    "Microbiology",
  ],
  samplers: ["Alex K", "Sarah N"],
}

// Illustrative client and lab choices for the local demo.
export const labTestOptions = {
  clients: [
    "Dairy production (demo)",
    "Milk collection (demo)",
    "Quality assurance (demo)",
  ],
  testingLabs: [
    "Dairy quality laboratory (demo)",
    "Microbiology laboratory (demo)",
    "External testing laboratory (demo)",
  ],
}

export const testParameters = laboratoryTestParameters.parameters.map(
  (parameter) =>
    parameter.unit ? `${parameter.name}, ${parameter.unit}` : parameter.name
)
