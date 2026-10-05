import { emptyFinalProductLog, selectFinalProduct } from "./final-product-log"
import { isProductType } from "./products"
import type {
  Sample,
  ReportReview,
  LabTestResult,
  FinalProductType,
} from "./types"
import { testParameters, parameterMetadata } from "./data/registration-data"

export const emptyReview: ReportReview = {
  status: "awaiting-review",
  conclusion: "",
  remarks: "",
  analysedBy: null,
}
export function parameterResult(parameter: string, id: string): LabTestResult {
  return {
    id,
    parameter,
    ...parameterMetadata(parameter),
    fSilo: "",
    mSilo: "",
    bSilo: "",
    lSilo: "",
    status: "",
  }
}
export function createSample(
  id: string,
  createdAt: string,
  receivedBy: string
): Sample {
  return {
    id,
    createdAt,
    stage: "register",
    status: "draft",
    statusHistory: [{ status: "draft", changedAt: createdAt }],
    archivedAt: null,
    registration: {
      productType: "",
      sourceId: "",
      description: "",
      volume: "",
      equipment: "",
      temperature: "",
      receiptTime: "",
      integrity: "",
      analysis: "",
      sampler: "",
      receivedBy,
    },
    laboratory: {
      reportNumber: `RP-${id}`,
      details: {
        deliveryReportNumber: "",
        client: "",
        testingLab: "",
        sellByDate: "",
        samplingDate: "",
        testingDate: "",
        reportIssueDate: "",
        testingTime: "",
      },
      results: testParameters
        .slice(0, 4)
        .map((parameter, index) =>
          parameterResult(parameter, `${id}-result-${index + 1}`)
        ),
      review: { ...emptyReview },
    },
    logs: {
      tanker: null,
      silo: null,
      standardization: null,
      finalProduct: null,
    },
  }
}

// Snapshot the complete record so later form edits cannot mutate saved data.
export function saveSampleRecord(
  samples: Sample[],
  sample: Sample,
  savedAt: string = new Date().toISOString()
): Sample[] {
  const previous = samples.find((item) => item.id === sample.id)
  if (previous?.archivedAt) return samples
  const saved = structuredClone(sample)
  // The stored history is authoritative, including when an editor has an old draft.
  saved.statusHistory = structuredClone(
    previous?.statusHistory ?? [
      { status: "draft", changedAt: sample.createdAt },
    ]
  )
  saved.archivedAt = previous?.archivedAt ?? null
  if ((previous?.status ?? "draft") !== saved.status) {
    saved.statusHistory.push({ status: saved.status, changedAt: savedAt })
  }
  return samples.some((item) => item.id === sample.id)
    ? samples.map((item) => (item.id === sample.id ? saved : item))
    : [saved, ...samples]
}

export function archiveSampleRecords(
  samples: Sample[],
  ids: readonly string[],
  archivedAt: string
): Sample[] {
  const selected = new Set(ids)
  return samples.map((sample) =>
    selected.has(sample.id) && !sample.archivedAt
      ? { ...sample, archivedAt }
      : sample
  )
}

export function changeSampleProduct(
  sample: Sample,
  productType: FinalProductType
): Sample {
  return {
    ...sample,
    registration: { ...sample.registration, productType },
    logs: {
      ...sample.logs,
      finalProduct: sample.logs.finalProduct
        ? {
            ...selectFinalProduct(sample.logs.finalProduct, productType),
            productType,
          }
        : null,
    },
  }
}

export function sampleProductError(sample: Sample, advancing = false): string {
  return (advancing || sample.status !== "draft") &&
    !isProductType(sample.registration.productType)
    ? "Select a product before saving the registered sample."
    : ""
}

export function sampleFinalProductLog(sample: Sample) {
  const productType = sample.registration.productType
  const log = sample.logs.finalProduct ?? emptyFinalProductLog
  return productType
    ? { ...selectFinalProduct(log, productType), productType }
    : log
}
