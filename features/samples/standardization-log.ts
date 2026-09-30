import type { SampleLogSection, StandardizationLogDetails } from "./types"

export const emptyStandardizationLog: StandardizationLogDetails = {
  serialNumber: "",
  date: "",
  time: "",
  source: "",
  quantity: "",
  temperature: "",
  resazurin1Hour: "",
  resazurin2Hours: "",
  resazurin3Hours: "",
  phosphatase: "",
  acidity: "",
  ph: "",
  alcoholTest: "",
  hydrogenPeroxide: "",
  butterfat: "",
  density: "",
  snf: "",
  addedWater: "",
  freezingPoint: "",
  organoleptic: "",
  mb: "",
  labTechnician: "",
  remarks: "",
}

// Capture observations only; product-specific standards do not determine approval here.
export const standardizationLogSections: SampleLogSection<
  keyof StandardizationLogDetails
>[] = [
  {
    id: "sample",
    title: "Sample details",
    description: "Record the milk source, quantity, and sampling details.",
    fields: [
      { key: "serialNumber", label: "Serial number" },
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "time" },
      { key: "source", label: "Source / line" },
      { key: "quantity", label: "Quantity", type: "number" },
      { key: "temperature", label: "Temperature (°C)", type: "number" },
    ],
  },
  {
    id: "resazurin",
    title: "Resazurin readings",
    description: "Record the resazurin results at one, two, and three hours.",
    fields: [
      { key: "resazurin1Hour", label: "1 hour" },
      { key: "resazurin2Hours", label: "2 hours" },
      { key: "resazurin3Hours", label: "3 hours" },
    ],
  },
  {
    id: "analysis",
    title: "Analysis results",
    description: "Record the test results for the pasteurized milk sample.",
    fields: [
      {
        key: "phosphatase",
        label: "Phosphatase",
        options: ["Negative", "Positive"],
      },
      { key: "acidity", label: "Acidity (%)", type: "number" },
      { key: "ph", label: "pH", type: "number" },
      {
        key: "alcoholTest",
        label: "Alcohol test (80%)",
        options: ["Negative", "Positive"],
      },
      {
        key: "hydrogenPeroxide",
        label: "Hydrogen peroxide",
        options: ["Negative", "Positive"],
      },
      { key: "butterfat", label: "Butterfat (%)", type: "number" },
      { key: "density", label: "Density", type: "number" },
      { key: "snf", label: "SNF (%)", type: "number" },
      { key: "addedWater", label: "Added water (%)", type: "number" },
      { key: "freezingPoint", label: "Freezing point (°C)", type: "number" },
      {
        key: "organoleptic",
        label: "Organoleptic",
        options: ["Normal", "Not normal"],
      },
      { key: "mb", label: "M.B." },
    ],
  },
  {
    id: "technician",
    title: "Technician and remarks",
    description:
      "Record the lab technician and any observations about this sample.",
    fields: [
      { key: "labTechnician", label: "Lab technician" },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
  },
]
