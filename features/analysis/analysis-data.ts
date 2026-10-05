import type { Sample, SampleStage, SampleSource } from "../samples/types"
import { stageIndex } from "../samples/workflow"
import { sampleRegistrationTime } from "../samples/metrics"
import { productOptions } from "../samples/products"
import { tankerAnalysisFields } from "../samples/tanker-log"
import { siloLogSections } from "../samples/silo-log"
import { standardizationLogSections } from "../samples/standardization-log"
import { finalProductSectionsByType } from "../samples/final-product-log"

export const analysisStages = [
  { value: "lab-tests", label: "Lab tests" },
  { value: "tanker", label: "Tanker" },
  { value: "silo", label: "Silo" },
  { value: "standardization", label: "Standardization" },
  { value: "product-logs", label: "Final product" },
] as const
export type AnalysisStage = (typeof analysisStages)[number]["value"]
export const analysisMetrics = [
  { value: "ph", label: "pH", unit: "" },
  { value: "temperature", label: "Temperature", unit: "°C" },
  { value: "fat", label: "Milk fat", unit: "%" },
  { value: "addedWater", label: "Added water", unit: "%" },
] as const
export type AnalysisMetric = (typeof analysisMetrics)[number]["value"]
export type AnalysisGroup = "day" | "week"
export type AnalysisFilters = {
  days: 7 | 30 | 90
  source: string
  product: string
  stage: string
}
export const defaultAnalysisFilters: AnalysisFilters = {
  days: 30,
  source: "all",
  product: "all",
  stage: "all",
}
export type AnalysisResult = {
  id: string
  sampleId: string
  sourceId: string
  product: string
  stage: AnalysisStage
  date: string | null
  parameter: string
  metric: AnalysisMetric | null
  readings: { label: string; value: string }[]
  status: "pass" | "fail" | ""
  specification: string
  testMethod: string
  archived: boolean
}
const day = 86_400_000
const kampalaOffset = 3 * 60 * 60 * 1000
export function kampalaDate(timestamp: string) {
  const time = Date.parse(timestamp)
  return Number.isFinite(time)
    ? new Date(time + kampalaOffset).toISOString().slice(0, 10)
    : ""
}
function validDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const time = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === value
    ? value
    : null
}
function shiftDate(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * day)
    .toISOString()
    .slice(0, 10)
}
export function analysisWindow(referenceAt: string, days: number) {
  const end = kampalaDate(referenceAt)
  return { start: shiftDate(end, 1 - days), end }
}
export function numberReading(value: string): number | null {
  const trimmed = value.trim()
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null
  const number = Number(trimmed)
  return Number.isFinite(number) ? number : null
}
function metricFor(parameter: string): AnalysisMetric | null {
  if (parameter === "pH") return "ph"
  if (["Temperature, °C", "Temperature (°C)"].includes(parameter))
    return "temperature"
  if (
    ["Milk fat, %", "Milk fat (%)", "Butterfat (%)", "Fat (%)"].includes(
      parameter
    )
  )
    return "fat"
  if (["Added water, %", "Added water (%)"].includes(parameter))
    return "addedWater"
  return null
}

// One laboratory parameter row has one recorded decision, even with several silo readings.
// Log fields have no decision field and remain unassessed regardless of their measured value.
export function collectAnalysisResults(samples: Sample[]): AnalysisResult[] {
  const results: AnalysisResult[] = []
  for (const sample of samples) {
    if (sample.status === "draft") continue
    const base = {
      sampleId: sample.id,
      sourceId: sample.registration.sourceId,
      product: sample.registration.productType,
      archived: Boolean(sample.archivedAt),
    }
    function add(
      stage: AnalysisStage,
      id: string,
      date: string,
      parameter: string,
      readings: AnalysisResult["readings"],
      status: AnalysisResult["status"] = "",
      specification = "",
      testMethod = ""
    ) {
      const recorded = readings.filter((reading) => reading.value.trim())
      if (!recorded.length || stageIndex(sample.stage) < stageIndex(stage))
        return
      results.push({
        ...base,
        id: `${sample.id}:${stage}:${id}`,
        stage,
        date: validDate(date),
        parameter,
        metric: metricFor(parameter),
        readings: recorded,
        status,
        specification,
        testMethod,
      })
    }
    for (const row of sample.laboratory.results) {
      add(
        "lab-tests",
        row.id,
        sample.laboratory.details.testingDate,
        row.parameter,
        [
          { label: "F/SILO", value: row.fSilo },
          { label: "M/SILO", value: row.mSilo },
          { label: "B/SILO", value: row.bSilo },
          { label: "L/SILO", value: row.lSilo },
        ],
        row.status,
        row.specification,
        row.testMethod
      )
    }
    const { tanker, silo, standardization, finalProduct } = sample.logs
    if (tanker)
      for (const chamber of tanker.chambers)
        for (const field of tankerAnalysisFields) {
          if (field.key !== "quantity")
            add(
              "tanker",
              `${chamber.id}:${field.key}`,
              tanker.details.date,
              field.label,
              [
                {
                  label: chamber.chamber || "Chamber",
                  value: chamber[field.key],
                },
              ]
            )
        }
    if (silo)
      for (const section of siloLogSections.filter(
        (section) => section.id === "analysis"
      ))
        for (const field of section.fields) {
          add("silo", field.key, silo.date, field.label, [
            { label: "Reading", value: silo[field.key] },
          ])
        }
    if (standardization)
      for (const section of standardizationLogSections)
        for (const field of section.fields) {
          if (
            ["resazurin", "analysis"].includes(section.id) ||
            field.key === "temperature"
          )
            add(
              "standardization",
              field.key,
              standardization.date,
              field.label,
              [{ label: "Reading", value: standardization[field.key] }]
            )
        }
    if (finalProduct && sample.registration.productType)
      for (const section of finalProductSectionsByType[
        sample.registration.productType
      ]) {
        if (["sample", "technician"].includes(section.id)) continue
        for (const field of section.fields) {
          if (
            field.type === "time" ||
            ["source", "flavor", "finishedRemarks"].includes(field.key)
          )
            continue
          add(
            "product-logs",
            field.key,
            finalProduct.analysisDate,
            field.label,
            [{ label: section.title, value: finalProduct[field.key] ?? "" }]
          )
        }
      }
  }
  return results
}

export function getAnalysis(
  samples: Sample[],
  referenceAt: string,
  filters: AnalysisFilters
) {
  const window = analysisWindow(referenceAt, filters.days)
  const matching = collectAnalysisResults(samples).filter(
    (result) =>
      (filters.source === "all" || result.sourceId === filters.source) &&
      (filters.product === "all" || result.product === filters.product) &&
      (filters.stage === "all" || result.stage === filters.stage)
  )
  const results = matching
    .filter(
      (result) =>
        result.date && result.date >= window.start && result.date <= window.end
    )
    .sort(
      (a, b) =>
        (b.date ?? "").localeCompare(a.date ?? "") || a.id.localeCompare(b.id)
    )
  const sampleIds = new Set(results.map((result) => result.sampleId))
  const passed = results.filter((result) => result.status === "pass").length
  const flagged = results.filter((result) => result.status === "fail")
  const assessed = passed + flagged.length
  const turnaround = samples.flatMap((sample) => {
    if (!sampleIds.has(sample.id)) return []
    const registeredAt = sampleRegistrationTime(sample)
    const readyAt = sample.statusHistory.find(
      (event) => event.status === "awaiting-review"
    )?.changedAt
    if (!registeredAt || !readyAt) return []
    const readyDate = kampalaDate(readyAt)
    const hours = (Date.parse(readyAt) - Date.parse(registeredAt)) / 3_600_000
    return readyDate >= window.start &&
      readyDate <= window.end &&
      Date.parse(readyAt) <= Date.parse(referenceAt) &&
      Number.isFinite(hours) &&
      hours >= 0
      ? [hours]
      : []
  })
  return {
    window,
    results,
    flagged,
    samplesAnalysed: sampleIds.size,
    assessed,
    passed,
    unassessed: results.length - assessed,
    withinSpecification: assessed ? (passed / assessed) * 100 : null,
    turnaroundHours: turnaround.length
      ? turnaround.reduce((sum, value) => sum + value, 0) / turnaround.length
      : null,
    turnaroundCount: turnaround.length,
    undated: matching.filter((result) => !result.date).length,
    byStage: analysisStages.map((stage) => ({
      ...stage,
      count: flagged.filter((result) => result.stage === stage.value).length,
    })),
  }
}
export type AnalysisSummary = ReturnType<typeof getAnalysis>
export function groupDate(date: string, group: AnalysisGroup) {
  if (group === "day") return date
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
  return shiftDate(date, -((weekday + 6) % 7))
}
export function getQualityTrend(
  results: AnalysisResult[],
  window: { start: string; end: string },
  metric: AnalysisMetric,
  group: AnalysisGroup
) {
  const buckets = new Map<
    string,
    { date: string; values: number[]; resultIds: string[] }
  >()
  for (let date = window.start; date <= window.end; date = shiftDate(date, 1)) {
    const key = groupDate(date, group)
    if (!buckets.has(key))
      buckets.set(key, { date: key, values: [], resultIds: [] })
  }
  for (const result of results) {
    if (!result.date || result.metric !== metric) continue
    const bucket = buckets.get(groupDate(result.date, group))
    if (!bucket) continue
    const values = result.readings
      .map((reading) => numberReading(reading.value))
      .filter((value): value is number => value !== null)
    if (!values.length) continue
    bucket.values.push(...values)
    bucket.resultIds.push(result.id)
  }
  return [...buckets.values()].map(({ date, values, resultIds }) => ({
    date,
    resultIds,
    count: values.length,
    mean: values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null,
  }))
}
export type TrendPoint = ReturnType<typeof getQualityTrend>[number]
export function resultHref(result: AnalysisResult) {
  return `/samples/${encodeURIComponent(result.sampleId)}?stage=${result.stage}`
}
export function readingLabel(result: AnalysisResult) {
  return result.readings
    .map((reading) => `${reading.label}: ${reading.value}`)
    .join(" · ")
}
export function stageLabel(stage: SampleStage) {
  return analysisStages.find((item) => item.value === stage)?.label ?? stage
}
function csvCell(value: string | number) {
  const text = String(value)
  // Spreadsheet exports must treat user-entered formulas as literal text.
  const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}
export function analysisCsv(
  summary: AnalysisSummary,
  sources: SampleSource[],
  filters: AnalysisFilters,
  referenceAt: string
) {
  const headers = [
    "Sample ID",
    "Source",
    "Product",
    "Stage",
    "Analysis date (Africa/Kampala)",
    "Parameter",
    "Readings",
    "Recorded decision",
    "Specification",
    "Test method",
    "Archived sample",
    "Period start",
    "Period end",
    "Source filter",
    "Product filter",
    "Stage filter",
    "Reference time",
    "Samples analysed",
    "Assessed results",
    "Pass results",
    "Flagged results",
    "Within specification (%)",
    "Average turnaround (hours)",
  ]
  const rows = summary.results.map((result) => [
    result.sampleId,
    sources.find((source) => source.id === result.sourceId)?.name ??
      result.sourceId,
    productOptions.find((product) => product.value === result.product)
      ?.chartLabel ?? result.product,
    stageLabel(result.stage),
    result.date ?? "",
    result.parameter,
    readingLabel(result),
    result.status === "pass"
      ? "Pass"
      : result.status === "fail"
        ? "Fail"
        : "Unassessed",
    result.specification,
    result.testMethod,
    result.archived ? "Yes" : "No",
    summary.window.start,
    summary.window.end,
    filters.source,
    filters.product,
    filters.stage,
    referenceAt,
    summary.samplesAnalysed,
    summary.assessed,
    summary.passed,
    summary.flagged.length,
    summary.withinSpecification ?? "",
    summary.turnaroundHours ?? "",
  ])
  return [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n")
}
