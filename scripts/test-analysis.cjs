const assert = require("node:assert/strict")
const { execFileSync } = require("node:child_process")
const { mkdtempSync, rmSync } = require("node:fs")
const { tmpdir } = require("node:os")
const { join } = require("node:path")
const { test, after } = require("node:test")
const output = mkdtempSync(join(tmpdir(), "fresh-trace-analysis-"))
execFileSync(process.execPath, [
  require.resolve("typescript/bin/tsc"),
  "features/analysis/analysis-data.ts",
  "features/samples/data/latest-samples.ts",
  "--outDir",
  output,
  "--module",
  "commonjs",
  "--moduleResolution",
  "node",
  "--resolveJsonModule",
  "--esModuleInterop",
  "--skipLibCheck",
  "--strict",
  "--target",
  "es2022",
])
after(() => rmSync(output, { recursive: true, force: true }))
const {
  getAnalysis,
  collectAnalysisResults,
  getQualityTrend,
  defaultAnalysisFilters: filters,
  numberReading,
  analysisCsv,
  analysisWindow,
  groupDate,
} = require(join(output, "analysis/analysis-data.js"))
const { createSample, parameterResult } = require(
  join(output, "samples/sample-state.js")
)
const { createSampleFixtures } = require(
  join(output, "samples/data/latest-samples.js")
)
const { emptySiloLog } = require(join(output, "samples/silo-log.js"))
const { emptyFinalProductLog } = require(
  join(output, "samples/final-product-log.js")
)
const now = "2026-10-03T22:00:00Z" // 4 October in Kampala
function sample(id = "A", date = "2026-10-03") {
  const record = createSample(id, "2026-10-03T06:00:00Z", "Analyst")
  record.status = "awaiting-review"
  record.stage = "lab-report"
  record.registration.sourceId = "source-1"
  record.registration.productType = "uht"
  record.laboratory.details.testingDate = date
  record.laboratory.results = [
    {
      ...parameterResult("pH", `${id}-ph`),
      fSilo: "6.6",
      mSilo: "6.8",
      status: "pass",
    },
  ]
  record.statusHistory.push(
    { status: "registered", changedAt: "2026-10-03T07:00:00Z" },
    { status: "awaiting-review", changedAt: "2026-10-03T09:00:00Z" }
  )
  return record
}
test("decisions count once per parameter, unassessed results never become passes", () => {
  const a = sample()
  a.laboratory.results.push(
    { ...parameterResult("Temperature, °C", "temp"), fSilo: "100", status: "" },
    {
      ...parameterResult("Organoleptic test", "sensory"),
      fSilo: "Normal",
      status: "fail",
    }
  )
  const summary = getAnalysis([a], now, filters)
  assert.equal(summary.samplesAnalysed, 1)
  assert.equal(summary.assessed, 2)
  assert.equal(summary.withinSpecification, 50)
  assert.equal(summary.flagged.length, 1)
  assert.equal(summary.unassessed, 1)
  assert.equal(
    summary.byStage.reduce((sum, stage) => sum + stage.count, 0),
    1
  )
})
test("calendar windows use Kampala and inclusive recorded dates without guessing missing dates", () => {
  assert.deepEqual(analysisWindow(now, 7), {
    start: "2026-09-28",
    end: "2026-10-04",
  })
  const records = [
    sample("before", "2026-09-27"),
    sample("start", "2026-09-28"),
    sample("end", "2026-10-04"),
    sample("future", "2026-10-05"),
    sample("undated", ""),
    sample("invalid", "2026-02-31"),
  ]
  const summary = getAnalysis(records, now, { ...filters, days: 7 })
  assert.deepEqual(
    summary.results.map((result) => result.sampleId),
    ["end", "start"]
  )
  assert.equal(summary.undated, 2)
})
test("source, product, and measurement-stage filters combine; drafts and unreached logs are excluded", () => {
  const a = sample()
  const b = sample("B")
  b.registration.productType = "ghee"
  const c = sample("C")
  c.registration.sourceId = "source-2"
  const d = sample("D")
  d.status = "draft"
  a.logs.silo = { ...emptySiloLog, date: "2026-10-03", ph: "7" }
  const summary = getAnalysis([a, b, c, d], now, {
    ...filters,
    source: "source-1",
    product: "uht",
    stage: "lab-tests",
  })
  assert.equal(summary.samplesAnalysed, 1)
  assert.equal(collectAnalysisResults([a]).length, 1)
  a.stage = "silo"
  const silo = getAnalysis([a], now, { ...filters, stage: "silo" })
  assert.equal(silo.results.length, 1)
  assert.equal(silo.assessed, 0)
  assert.equal(silo.withinSpecification, null)
})
test("archived samples keep historical results and are identified for disabled source access", () => {
  const a = sample()
  a.archivedAt = now
  const summary = getAnalysis([a], now, filters)
  assert.equal(summary.samplesAnalysed, 1)
  assert.equal(summary.results[0].archived, true)
})
test("turnaround uses first registration and first report readiness only, excluding incomplete histories", () => {
  const a = sample()
  a.statusHistory.push({
    status: "awaiting-review",
    changedAt: "2026-10-03T12:00:00Z",
  })
  const b = sample("B")
  b.statusHistory = [{ status: "draft", changedAt: b.createdAt }]
  const summary = getAnalysis([a, b], now, filters)
  assert.equal(summary.turnaroundHours, 2)
  assert.equal(summary.turnaroundCount, 1)
})
test("trends weight actual numeric readings, preserve zero and missing dates, and group weeks on Monday", () => {
  const a = sample()
  const b = sample("B")
  b.laboratory.results[0].fSilo = "7"
  b.laboratory.results[0].mSilo = "<6.8"
  const summary = getAnalysis([a, b], now, { ...filters, days: 7 })
  const daily = getQualityTrend(summary.results, summary.window, "ph", "day")
  assert.equal(daily.length, 7)
  assert.equal(daily.find((point) => point.date === "2026-10-03").count, 3)
  assert.ok(
    Math.abs(daily.find((point) => point.date === "2026-10-03").mean - 6.8) <
      0.000001
  )
  assert.equal(daily[0].mean, null)
  assert.equal(numberReading("0"), 0)
  for (const value of ["", "n/a", "6.7 mg", "Infinity", "0x10", "<6.8"])
    assert.equal(numberReading(value), null)
  assert.equal(groupDate("2026-10-04", "week"), "2026-09-28")
  const weekly = getQualityTrend(summary.results, summary.window, "ph", "week")
  assert.equal(weekly.length, 1)
  assert.equal(weekly[0].count, 3)
})
test("only active product readings are analysed, never preserved inactive drafts", () => {
  const a = sample()
  a.stage = "product-logs"
  a.registration.productType = "ghee"
  a.logs.finalProduct = {
    ...emptyFinalProductLog,
    productType: "ghee",
    analysisDate: "2026-10-03",
    moisture: "0.2",
    finishedPh: "6.7",
    productDrafts: { uht: { ...emptyFinalProductLog, finishedPh: "6.8" } },
  }
  const results = getAnalysis([a], now, {
    ...filters,
    stage: "product-logs",
  }).results
  assert.equal(results.length, 1)
  assert.equal(results[0].parameter, "Moisture (%)")
  assert.equal(results[0].status, "")
})
test("empty analysis has null percentages and turnaround, not fabricated zero performance", () => {
  const summary = getAnalysis([], now, filters)
  assert.equal(summary.samplesAnalysed, 0)
  assert.equal(summary.withinSpecification, null)
  assert.equal(summary.turnaroundHours, null)
  assert.equal(summary.flagged.length, 0)
})
test("CSV exports filtered results, decision provenance and context with escaped cells", () => {
  const a = sample()
  a.laboratory.results[0].specification = '=HYPERLINK("example")'
  const summary = getAnalysis([a], now, filters)
  const csv = analysisCsv(
    summary,
    [{ id: "source-1", name: 'Source, "A"', description: "", type: "tanker" }],
    filters,
    now
  )
  assert.match(csv, /"Source, ""A"""/)
  assert.match(csv, /'\=HYPERLINK/)
  assert.match(csv, /Recorded decision/)
  assert.match(csv, /"Pass"/)
  assert.equal(csv.split("\r\n").length, 2)
})
test("fixtures provide varied real chart inputs and explicit demo decisions without changing workflow identity", () => {
  const records = createSampleFixtures(now)
  const summary = getAnalysis(records, now, filters)
  assert.equal(records.length, 100)
  assert.ok(summary.flagged.length > 0)
  assert.ok(summary.unassessed > 0)
  assert.ok(summary.passed > 0)
  const trend = getQualityTrend(summary.results, summary.window, "ph", "day")
  assert.ok(
    new Set(trend.filter((point) => point.count).map((point) => point.mean))
      .size > 5
  )
})
