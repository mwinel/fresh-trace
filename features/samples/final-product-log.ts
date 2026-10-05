import { productOptions as finalProductOptions } from "./products"
import type {
  SampleLogSection,
  FinalProductLogDetails,
  FinalProductLogValues,
  FinalProductDemoValues,
  FinalProductType,
} from "./types"

export const emptyFinalProductLog: FinalProductLogDetails = {
  serialNumber: "",
  analysisDate: "",
  product: "",
  machineNumber: "",
  batchNumber: "",
  manufactureDate: "",
  expiryDate: "",
  shift: "",
  siloTime: "",
  source: "",
  temperature: "",
  rt1: "",
  rt2: "",
  rt3: "",
  siloFat: "",
  siloDensity: "",
  siloSnf: "",
  brix: "",
  siloPh: "",
  siloLacticAcid: "",
  alcoholTest: "",
  finishedTime: "",
  finishedFat: "",
  finishedDensity: "",
  heatIndex: "",
  finishedPh: "",
  finishedLacticAcid: "",
  peroxideResidue: "",
  peroxidase: "",
  organoleptic: "",
  averageWeight: "",
  finishedRemarks: "",
  labTechnician: "",
  remarks: "",
}

// Record measured results without applying product-specific acceptance rules.
export const finalProductLogSections: SampleLogSection<
  keyof FinalProductLogValues
>[] = [
  {
    id: "sample",
    title: "Product and batch details",
    description: "Record the product, production batch, and analysis date.",
    fields: [
      { key: "serialNumber", label: "Serial number" },
      { key: "analysisDate", label: "Date of analysis", type: "date" },
      { key: "product", label: "Product" },
      { key: "machineNumber", label: "Machine number" },
      { key: "batchNumber", label: "Batch number" },
      { key: "manufactureDate", label: "Manufacture date", type: "date" },
      { key: "expiryDate", label: "Expiry date", type: "date" },
      { key: "shift", label: "Shift" },
    ],
  },
  {
    id: "silo",
    title: "Silo analysis",
    description:
      "Record the silo sample readings at the three-hour sampling interval shown in the log.",
    fields: [
      { key: "siloTime", label: "Sample time", type: "time" },
      { key: "source", label: "Source" },
      { key: "temperature", label: "Temperature (°C)", type: "number" },
      { key: "rt1", label: "RT — 1" },
      { key: "rt2", label: "RT — 2" },
      { key: "rt3", label: "RT — 3" },
      { key: "siloFat", label: "Fat (%)", type: "number" },
      { key: "siloDensity", label: "Density", type: "number" },
      { key: "siloSnf", label: "SNF (%)", type: "number" },
      { key: "brix", label: "Brix", type: "number" },
      { key: "siloPh", label: "pH", type: "number" },
      { key: "siloLacticAcid", label: "Lactic acid (%)", type: "number" },
      {
        key: "alcoholTest",
        label: "Alcohol test (80%)",
        options: ["Negative", "Positive"],
      },
    ],
  },
  {
    id: "finished-product",
    title: "Finished-product analysis",
    description:
      "Record the hourly finished-product readings. H.I. is recorded per sterilizer per shift.",
    fields: [
      { key: "finishedTime", label: "Sample time", type: "time" },
      { key: "finishedFat", label: "Fat (%)", type: "number" },
      { key: "finishedDensity", label: "Density", type: "number" },
      { key: "heatIndex", label: "H.I.", type: "number" },
      { key: "finishedPh", label: "pH", type: "number" },
      {
        key: "finishedLacticAcid",
        label: "T.A. / lactic acid (%)",
        type: "number",
      },
      {
        key: "peroxideResidue",
        label: "H₂O₂ residue",
        options: ["Negative", "Positive"],
      },
      {
        key: "peroxidase",
        label: "Peroxidase",
        options: ["Negative", "Positive"],
      },
      {
        key: "organoleptic",
        label: "Organoleptic",
        options: ["Normal", "Not normal"],
      },
      { key: "averageWeight", label: "Average weight", type: "number" },
      { key: "finishedRemarks", label: "Product remarks", type: "textarea" },
    ],
  },
  {
    id: "technician",
    title: "Technician and remarks",
    description: "Record the lab technician and any additional observations.",
    fields: [
      { key: "labTechnician", label: "Lab technician" },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
  },
]

export { productOptions as finalProductOptions } from "./products"

export const emptyFinalProductDemoValues: FinalProductDemoValues = {
  flavor: "",
  moisture: "",
  color: "",
  aroma: "",
  texture: "",
  packaging: "",
}

type ProductSection = SampleLogSection<
  keyof (FinalProductLogValues & FinalProductDemoValues)
>

const sensorySection: ProductSection = {
  id: "sensory-packaging",
  title: "Sensory observations and packaging",
  description: "Record observations for this demo analysis.",
  fields: [
    { key: "color", label: "Color / appearance" },
    { key: "aroma", label: "Aroma" },
    { key: "texture", label: "Texture / consistency" },
    { key: "packaging", label: "Packaging observations", type: "textarea" },
  ],
}

// Illustrative demo fields only; no acceptance thresholds or sampling rules.
export const finalProductSectionsByType: Record<
  FinalProductType,
  ProductSection[]
> = {
  uht: finalProductLogSections,
  "flavored-milk": [
    finalProductLogSections[0],
    {
      id: "flavored-milk-analysis",
      title: "Flavored milk analysis",
      description:
        "Demo fields for Fresh Dairy Flavored Milk; record measured results without pass/fail criteria.",
      fields: [
        { key: "flavor", label: "Flavor" },
        { key: "finishedTime", label: "Sample time", type: "time" },
        { key: "temperature", label: "Temperature (°C)", type: "number" },
        { key: "finishedFat", label: "Fat (%)", type: "number" },
        { key: "finishedPh", label: "pH", type: "number" },
        { key: "brix", label: "Brix (°Bx)", type: "number" },
        { key: "finishedLacticAcid", label: "Lactic acid (%)", type: "number" },
        {
          key: "averageWeight",
          label: "Average pack weight (g)",
          type: "number",
        },
      ],
    },
    sensorySection,
    finalProductLogSections[3],
  ],
  ghee: [
    finalProductLogSections[0],
    {
      id: "ghee-analysis",
      title: "Ghee analysis",
      description:
        "Demo fields for Pure Natural Ghee; record measured results without pass/fail criteria.",
      fields: [
        { key: "finishedTime", label: "Sample time", type: "time" },
        { key: "temperature", label: "Temperature (°C)", type: "number" },
        { key: "moisture", label: "Moisture (%)", type: "number" },
        { key: "finishedFat", label: "Milk fat (%)", type: "number" },
        {
          key: "averageWeight",
          label: "Average pack weight (g)",
          type: "number",
        },
      ],
    },
    sensorySection,
    finalProductLogSections[3],
  ],
}

export function selectFinalProduct(
  log: FinalProductLogDetails,
  nextType: FinalProductType
): FinalProductLogDetails {
  const { productType = "uht", productDrafts = {}, ...values } = log
  if (productType === nextType) return log
  return {
    ...(productDrafts[nextType] ?? {
      ...emptyFinalProductLog,
      product:
        finalProductOptions.find((option) => option.value === nextType)
          ?.label ?? "",
    }),
    productType: nextType,
    productDrafts: { ...productDrafts, [productType]: values },
  }
}
