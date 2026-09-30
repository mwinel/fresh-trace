import type { SampleLogSection, SiloLogDetails } from "./types"

export const emptySiloLog: SiloLogDetails = {
  serialNumber: "",
  date: "",
  time: "",
  sourceTank: "",
  product: "",
  quantity: "",
  temperature: "",
  rt: "",
  acidity: "",
  ph: "",
  alcoholTest: "",
  cob: "",
  butterfat: "",
  density: "",
  snf: "",
  addedWater: "",
  freezingPoint: "",
  urea: "",
  neutralizers: "",
  hydrogenPeroxide: "",
  organoleptic: "",
  processedToSilo: "",
  labTechnician: "",
  remarks: "",
}

// Capture observations without deriving approval decisions from the paper standards.
export const siloLogSections: SampleLogSection<keyof SiloLogDetails>[] = [
  {
    id: "sample",
    title: "Sample details",
    description: "Record the source tank, product, and sampling details.",
    fields: [
      { key: "serialNumber", label: "Serial number" },
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "time" },
      { key: "sourceTank", label: "Source / tank" },
      { key: "product", label: "Product" },
      { key: "quantity", label: "Quantity", type: "number" },
    ],
  },
  {
    id: "analysis",
    title: "Analysis results",
    description:
      "Record the physical and chemical results for this silo sample.",
    fields: [
      { key: "temperature", label: "Temperature (°C)", type: "number" },
      { key: "rt", label: "10 mins RT" },
      { key: "acidity", label: "Acidity (%)", type: "number" },
      { key: "ph", label: "pH", type: "number" },
      {
        key: "alcoholTest",
        label: "Alcohol test (80%)",
        options: ["Negative", "Positive"],
      },
      {
        key: "cob",
        label: "Clot on boiling (COB)",
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
    ],
  },
  {
    id: "adulterants",
    title: "Adulterant checks",
    description:
      "Record the results for urea, neutralizers, and hydrogen peroxide.",
    fields: [
      { key: "urea", label: "Urea" },
      { key: "neutralizers", label: "Neutralizers" },
      { key: "hydrogenPeroxide", label: "Hydrogen peroxide" },
    ],
  },
  {
    id: "processing",
    title: "Processing details",
    description:
      "Record the destination silo, lab technician, and any remarks.",
    fields: [
      { key: "processedToSilo", label: "Processed to silo" },
      { key: "labTechnician", label: "Lab technician", startsNewRow: true },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
  },
]
