import type { TankerChamberLog, TankerLogDetails } from "./types"

export const emptyTankerLog: TankerLogDetails = {
  serialNumber: "",
  date: "",
  sampleTime: "",
  releaseTime: "",
  vehicleNumber: "",
  milkCentre: "",
  deliveryNote: "",
  releaseSlip: "",
}

export function createTankerChamber(chamber = ""): TankerChamberLog {
  return {
    id: crypto.randomUUID(),
    chamber,
    quantity: "",
    temperature: "",
    alcoholTest: "",
    butterfat: "",
    density: "",
    snf: "",
    ph: "",
    lacticAcid: "",
    rt: "",
    addedWater: "",
    freezingPoint: "",
    adulterants: "",
    extraneousMatter: "",
    organoleptic: "",
    antibiotics: "",
    somaticCellCount: "",
  }
}

export const tankerDeliveryFields: {
  key: keyof TankerLogDetails
  label: string
  type?: "date" | "time"
}[] = [
  { key: "serialNumber", label: "Serial number" },
  { key: "date", label: "Date", type: "date" },
  { key: "sampleTime", label: "Sample time", type: "time" },
  { key: "releaseTime", label: "Release time", type: "time" },
  { key: "vehicleNumber", label: "Vehicle number" },
  { key: "milkCentre", label: "Milk centre" },
  { key: "deliveryNote", label: "Delivery note" },
  { key: "releaseSlip", label: "Release slip number" },
]

// Record observed results only. The photographed standards are not approval rules.
export const tankerAnalysisFields: {
  key: Exclude<keyof TankerChamberLog, "id" | "chamber">
  label: string
  type?: "number"
  options?: string[]
}[] = [
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "temperature", label: "Temperature (°C)", type: "number" },
  {
    key: "alcoholTest",
    label: "Alcohol test (80%)",
    options: ["Negative", "Positive"],
  },
  { key: "butterfat", label: "Butterfat (%)", type: "number" },
  { key: "density", label: "Density", type: "number" },
  { key: "snf", label: "SNF (%)", type: "number" },
  { key: "ph", label: "pH", type: "number" },
  { key: "lacticAcid", label: "Lactic acid (%)", type: "number" },
  { key: "rt", label: "RT" },
  { key: "addedWater", label: "Added water (%)", type: "number" },
  { key: "freezingPoint", label: "Freezing point (°C)", type: "number" },
  { key: "adulterants", label: "Adulterants" },
  { key: "extraneousMatter", label: "Extraneous matter" },
  {
    key: "organoleptic",
    label: "Organoleptic",
    options: ["Normal", "Not normal"],
  },
  { key: "antibiotics", label: "Antibiotics" },
  { key: "somaticCellCount", label: "Somatic cell count" },
]
