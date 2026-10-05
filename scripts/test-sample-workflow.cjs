const assert = require("node:assert/strict")
const { execFileSync } = require("node:child_process")
const { mkdtempSync, rmSync } = require("node:fs")
const { tmpdir } = require("node:os")
const { join } = require("node:path")
const { test, after } = require("node:test")

const output = mkdtempSync(join(tmpdir(), "fresh-trace-workflow-"))
execFileSync(process.execPath, [
  require.resolve("typescript/bin/tsc"),
  "features/samples/workflow.ts",
  "features/samples/report-list.ts",
  "features/samples/metrics.ts",
  "features/samples/product-metrics.ts",
  "features/samples/data/latest-samples.ts",
  "features/samples/sample-state.ts",
  "features/samples/final-product-log.ts",
  "--outDir",
  output,
  "--module",
  "commonjs",
  "--moduleResolution",
  "node",
  "--resolveJsonModule",
  "--esModuleInterop",
  "--skipLibCheck",
  "--target",
  "es2022",
])
const { createSample, saveSampleRecord } = require(
  join(output, "sample-state.js")
)
const { advanceSample, canViewStage, resolveStage } = require(
  join(output, "workflow.js")
)
const { emptyFinalProductLog, selectFinalProduct } = require(
  join(output, "final-product-log.js")
)
after(() => rmSync(output, { recursive: true, force: true }))
const draft = () =>
  createSample("TEST-001", "2026-10-01T10:00:00+03:00", "Analyst")

test("only reached stages are accessible, including through URLs", () => {
  const sample = { ...draft(), stage: "silo", status: "in-progress" }
  assert(canViewStage(sample, "register"))
  assert(canViewStage(sample, "silo"))
  assert(!canViewStage(sample, "product-logs"))
  assert(!canViewStage(sample, "invalid"))
  assert.equal(resolveStage(sample, "product-logs"), "silo")
  assert.equal(resolveStage(sample, "invalid"), "silo")
  assert.equal(resolveStage(sample, "lab-report"), "lab-report")
})
test("explicit advancement follows every stage and ends at Done", () => {
  let sample = draft()
  for (const [stage, status] of [
    ["lab-tests", "in-progress"],
    ["lab-report", "awaiting-review"],
    ["tanker", "in-progress"],
    ["silo", "in-progress"],
    ["standardization", "in-progress"],
    ["product-logs", "in-progress"],
    ["product-logs", "done"],
  ]) {
    sample = advanceSample(sample, sample.stage)
    assert.equal(sample.stage, stage)
    assert.equal(sample.status, status)
  }
  assert.equal(advanceSample(sample, sample.stage), sample)
})
test("earlier viewed stages cannot advance or regress recorded progress", () => {
  const sample = { ...draft(), stage: "silo", status: "in-progress" }
  assert.equal(advanceSample(sample, "register"), sample)
})
test("saving partial data preserves workflow and isolates saved records", () => {
  const sample = draft()
  sample.registration.description = "Partial draft"
  const saved = saveSampleRecord([], sample)
  sample.registration.description = "Unsaved edit"
  assert.equal(saved[0].registration.description, "Partial draft")
  assert.equal(saved[0].stage, "register")
  assert.equal(saved[0].status, "draft")
  assert.equal(saved[0].createdAt, sample.createdAt)
})
test("edits to Done samples retain completion", () => {
  const sample = { ...draft(), stage: "product-logs", status: "done" }
  const updated = {
    ...sample,
    registration: { ...sample.registration, description: "Corrected" },
  }
  const saved = saveSampleRecord([sample], updated)
  assert.equal(saved[0].status, "done")
  assert.equal(saved[0].stage, "product-logs")
  assert.equal(saved.length, 1)
})

test("switching products keeps readings isolated and restores legacy UHT values", () => {
  const uht = {
    ...emptyFinalProductLog,
    batchNumber: "UHT-1",
    finishedFat: "3.5",
  }
  const milk = selectFinalProduct(uht, "flavored-milk")
  assert.equal(milk.product, "Fresh Dairy Flavored Milk")
  assert.equal(milk.finishedFat, "")
  milk.flavor = "Vanilla"
  milk.finishedFat = "3.2"
  const ghee = selectFinalProduct(milk, "ghee")
  assert.equal(ghee.product, "Pure Natural Ghee")
  assert.equal(ghee.finishedFat, "")
  assert.equal(ghee.flavor, undefined)
  ghee.moisture = "0.2"
  const restoredUht = selectFinalProduct(ghee, "uht")
  assert.equal(restoredUht.batchNumber, "UHT-1")
  assert.equal(restoredUht.finishedFat, "3.5")
  const restoredMilk = selectFinalProduct(restoredUht, "flavored-milk")
  assert.equal(restoredMilk.flavor, "Vanilla")
  assert.equal(restoredMilk.finishedFat, "3.2")
  assert.equal(selectFinalProduct(restoredMilk, "ghee").moisture, "0.2")
  assert.equal(uht.productType, undefined)
  assert.equal(uht.productDrafts, undefined)
})

test("completing and saving a product preserves its selection and draft readings", () => {
  const sample = { ...draft(), stage: "product-logs", status: "in-progress" }
  sample.logs.finalProduct = selectFinalProduct(emptyFinalProductLog, "ghee")
  sample.logs.finalProduct.moisture = "0.2"
  const completed = advanceSample(sample, "product-logs")
  const saved = saveSampleRecord([], completed)[0]
  assert.equal(saved.status, "done")
  assert.equal(saved.logs.finalProduct.productType, "ghee")
  assert.equal(saved.logs.finalProduct.moisture, "0.2")
  sample.logs.finalProduct.moisture = "0.4"
  assert.equal(saved.logs.finalProduct.moisture, "0.2")
})

const { getSampleMetrics, metricTrend } = require(join(output, "metrics.js"))
const { archiveSampleRecords } = require(join(output, "sample-state.js"))
const { createSampleFixtures } = require(join(output, "data/latest-samples.js"))
const referenceAt = "2026-10-02T12:00:00+03:00"
const dayMs = 24 * 60 * 60 * 1000
const ago = (days) =>
  new Date(Date.parse(referenceAt) - days * dayMs).toISOString()
function record(id, events, archivedAt = null) {
  const sample = createSample(id, events[0][1], "Analyst")
  return {
    ...sample,
    status: events.at(-1)[0],
    statusHistory: events.map(([status, changedAt]) => ({ status, changedAt })),
    archivedAt,
  }
}

test("drafts do not register until their first saved transition; stale edits preserve history", () => {
  const sample = createSample("history", ago(2), "Analyst")
  let saved = saveSampleRecord([], sample, ago(2))
  assert.equal(getSampleMetrics(saved, referenceAt).registered.current, 0)
  saved = saveSampleRecord(saved, { ...sample, status: "in-progress" }, ago(1))
  assert.deepEqual(
    saved[0].statusHistory.map((event) => event.status),
    ["draft", "in-progress"]
  )
  saved = saveSampleRecord(
    saved,
    { ...sample, status: "in-progress" },
    referenceAt
  )
  assert.equal(saved[0].statusHistory.length, 2)
  assert.equal(getSampleMetrics(saved, referenceAt).registered.current, 1)
  assert.equal(sample.statusHistory.length, 1)
})

test("first registrations and completions count once at exact adjacent boundaries", () => {
  const records = [14, 7, 0, -1].map((days) =>
    record(String(days), [
      ["draft", ago(days + 1)],
      ["in-progress", ago(days)],
      ["done", ago(days)],
    ])
  )
  const metrics = getSampleMetrics(records, referenceAt)
  assert.deepEqual(metrics.registered, { current: 1, previous: 1 })
  assert.deepEqual(metrics.completed, { current: 1, previous: 1 })
  const repeated = record("repeated", [
    ["draft", ago(16)],
    ["in-progress", ago(15)],
    ["done", ago(10)],
    ["in-progress", ago(3)],
    ["done", ago(1)],
  ])
  assert.deepEqual(getSampleMetrics([repeated], referenceAt).completed, {
    current: 0,
    previous: 1,
  })
})

test("queue snapshots use historical status and exclude future samples", () => {
  const records = [
    record("review", [
      ["draft", ago(12)],
      ["registered", ago(11)],
      ["awaiting-review", ago(2)],
    ]),
    record("done", [
      ["draft", ago(12)],
      ["awaiting-review", ago(10)],
      ["done", ago(1)],
    ]),
    record("future", [
      ["draft", ago(-1)],
      ["in-progress", ago(-1)],
    ]),
  ]
  const metrics = getSampleMetrics(records, referenceAt)
  assert.deepEqual(metrics.inProgress, { current: 0, previous: 1 })
  assert.deepEqual(metrics.awaitingReview, { current: 1, previous: 1 })
})

test("archive preserves activity, removes current queues and respects historical archive cutoff", () => {
  const records = [
    record("open", [
      ["draft", ago(12)],
      ["in-progress", ago(10)],
    ]),
    record("review", [
      ["draft", ago(12)],
      ["awaiting-review", ago(10)],
    ]),
    record("done", [
      ["draft", ago(4)],
      ["in-progress", ago(3)],
      ["done", ago(1)],
    ]),
  ]
  const archived = archiveSampleRecords(
    records,
    ["open", "review", "done"],
    referenceAt
  )
  const metrics = getSampleMetrics(archived, referenceAt)
  assert.deepEqual(metrics.inProgress, { current: 0, previous: 1 })
  assert.deepEqual(metrics.awaitingReview, { current: 0, previous: 1 })
  assert.deepEqual(metrics.registered, { current: 1, previous: 2 })
  assert.deepEqual(metrics.completed, { current: 1, previous: 0 })
  assert.equal(records[0].archivedAt, null)
  assert.equal(saveSampleRecord(archived, records[0], referenceAt), archived)
  assert.equal(
    archiveSampleRecords(archived, ["open"], ago(-1))[0].archivedAt,
    referenceAt
  )
  const atBoundary = archiveSampleRecords(records, ["open"], ago(7))
  assert.deepEqual(getSampleMetrics(atBoundary, referenceAt).inProgress, {
    current: 0,
    previous: 0,
  })
})

test("empty data and neutral trend labels cover zero, positive, negative and unchanged values", () => {
  for (const metric of Object.values(getSampleMetrics([], referenceAt))) {
    assert.deepEqual(metric, { current: 0, previous: 0 })
  }
  assert.deepEqual(metricTrend({ current: 0, previous: 0 }, "activity"), {
    label: "No change",
    direction: "flat",
  })
  assert.equal(
    metricTrend({ current: 1, previous: 0 }, "activity").label,
    "No previous activity"
  )
  assert.equal(
    metricTrend({ current: 4, previous: 3 }, "activity").label,
    "+33.3%"
  )
  assert.equal(
    metricTrend({ current: 0, previous: 3 }, "activity").label,
    "−100%"
  )
  assert.equal(metricTrend({ current: 4, previous: 6 }, "queue").label, "−2")
  assert.equal(metricTrend({ current: 4, previous: 1 }, "queue").label, "+3")
})

test("relative fixtures are deterministic, chronological and populate both activity windows", () => {
  const fixtures = createSampleFixtures(referenceAt)
  assert.deepEqual(fixtures, createSampleFixtures(referenceAt))
  assert.equal(fixtures.length, 100)
  const intakeByDay = new Map()
  for (const sample of fixtures) {
    const age = Math.floor(
      (Date.parse(referenceAt) - Date.parse(sample.createdAt)) / dayMs
    )
    intakeByDay.set(age, (intakeByDay.get(age) ?? 0) + 1)
  }
  assert.equal(intakeByDay.size, 18)
  assert(new Set(intakeByDay.values()).size > 1)
  assert(
    new Set(fixtures.map((sample) => sample.registration.sourceId)).size > 1
  )
  assert.deepEqual(
    new Set(fixtures.map((sample) => sample.status)),
    new Set(["registered", "in-progress", "awaiting-review", "done"])
  )
  const shifted = createSampleFixtures(ago(-30))
  const metrics = getSampleMetrics(fixtures, referenceAt)
  assert.deepEqual(getSampleMetrics(shifted, ago(-30)), metrics)
  assert(metrics.registered.current > 0 && metrics.registered.previous > 0)
  assert(metrics.completed.current > 0 && metrics.completed.previous > 0)
  assert.equal(
    new Set(fixtures.map((sample) => sample.id)).size,
    fixtures.length
  )
  fixtures.forEach((sample, index) => {
    assert.equal(sample.statusHistory[0].changedAt, sample.createdAt)
    assert.equal(sample.statusHistory.at(-1).status, sample.status)
    assert.equal(sample.laboratory.reportNumber, `RP-${sample.id}`)
    assert.equal(sample.id, shifted[index].id)
    assert.equal(
      Date.parse(shifted[index].createdAt) - Date.parse(sample.createdAt),
      30 * dayMs
    )
    sample.statusHistory.forEach((event, position) => {
      assert(Date.parse(event.changedAt) <= Date.parse(referenceAt))
      if (position)
        assert(
          Date.parse(event.changedAt) >=
            Date.parse(sample.statusHistory[position - 1].changedAt)
        )
    })
  })
})

const { getProductSampleMetrics } = require(join(output, "product-metrics.js"))
const {
  changeSampleProduct,
  sampleProductError,
  sampleFinalProductLog,
} = require(join(output, "sample-state.js"))

test("product chart totals reconcile with registered cards across ranges and products", () => {
  const samples = createSampleFixtures(referenceAt)
  for (const days of [7, 30, 90]) {
    const chart = getProductSampleMetrics(samples, referenceAt, days)
    assert.equal(
      chart.total,
      chart.rows.reduce((sum, row) => sum + row.total, 0)
    )
    for (const row of chart.rows)
      assert.equal(row.total, row.uht + row["flavored-milk"] + row.ghee)
    for (const product of ["uht", "flavored-milk", "ghee"])
      assert(chart.rows.some((row) => row[product] > 0))
    if (days === 7)
      assert.equal(
        chart.total,
        getSampleMetrics(samples, referenceAt).registered.current
      )
    else assert.equal(chart.total, 100)
  }
})

test("chart counts first registration only, retaining archives and excluding drafts and boundary events", () => {
  const samples = [7, 0, -1].map((age) =>
    changeSampleProduct(
      record(String(age), [
        ["draft", ago(age + 1)],
        ["registered", ago(age)],
      ]),
      "uht"
    )
  )
  const archived = archiveSampleRecords(samples, ["0"], referenceAt)
  archived.push(
    changeSampleProduct(createSample("draft", ago(1), "Analyst"), "ghee")
  )
  assert.equal(getProductSampleMetrics(archived, referenceAt, 7).total, 1)
  const repeated = changeSampleProduct(
    record("repeat", [
      ["draft", ago(10)],
      ["registered", ago(9)],
      ["in-progress", ago(1)],
    ]),
    "ghee"
  )
  assert.equal(getProductSampleMetrics([repeated], referenceAt, 7).total, 0)
})

test("chart groups by Kampala date and fills empty days without timezone shifts", () => {
  const end = "2026-10-03T12:00:00+03:00"
  const samples = [
    changeSampleProduct(
      record("before", [
        ["draft", "2026-10-01T10:00:00Z"],
        ["registered", "2026-10-01T20:59:00Z"],
      ]),
      "uht"
    ),
    changeSampleProduct(
      record("after", [
        ["draft", "2026-10-01T10:00:00Z"],
        ["registered", "2026-10-01T21:00:00Z"],
      ]),
      "ghee"
    ),
  ]
  const chart = getProductSampleMetrics(samples, end, 7)
  assert.equal(chart.rows.length, 8)
  assert.equal(chart.rows.find((row) => row.date === "2026-10-01").uht, 1)
  assert.equal(chart.rows.find((row) => row.date === "2026-10-02").ghee, 1)
  assert.equal(chart.rows.find((row) => row.date === "2026-10-03").total, 0)
  const empty = getProductSampleMetrics([], end, 90)
  assert.equal(empty.total, 0)
  assert(empty.rows.every((row) => row.total === 0))
})

test("registration requires a product while drafts may remain unselected", () => {
  const sample = draft()
  assert.equal(sample.registration.productType, "")
  assert.equal(sampleProductError(sample), "")
  assert(sampleProductError(sample, true))
  assert(sampleProductError({ ...sample, status: "registered" }))
  assert.equal(
    sampleProductError(changeSampleProduct(sample, "ghee"), true),
    ""
  )
})

test("product switching synchronizes registration and preserves each product log draft", () => {
  let sample = changeSampleProduct(draft(), "ghee")
  sample.logs.finalProduct = {
    ...sampleFinalProductLog(sample),
    moisture: "0.2",
  }
  sample = changeSampleProduct(sample, "uht")
  sample.logs.finalProduct.finishedFat = "3.4"
  sample = changeSampleProduct(sample, "ghee")
  assert.equal(sample.registration.productType, "ghee")
  assert.equal(sample.logs.finalProduct.productType, "ghee")
  assert.equal(sample.logs.finalProduct.moisture, "0.2")
  const changedLog = selectFinalProduct(sample.logs.finalProduct, "uht")
  sample = changeSampleProduct(
    { ...sample, logs: { ...sample.logs, finalProduct: changedLog } },
    "uht"
  )
  assert.equal(sample.registration.productType, "uht")
  assert.equal(sample.logs.finalProduct.finishedFat, "3.4")
})

test("product corrections reclassify a registration without changing history or totals", () => {
  const sample = changeSampleProduct(
    record("correction", [
      ["draft", ago(2)],
      ["registered", ago(1)],
    ]),
    "uht"
  )
  const saved = saveSampleRecord(
    [sample],
    changeSampleProduct(sample, "ghee"),
    referenceAt
  )
  assert.deepEqual(saved[0].statusHistory, sample.statusHistory)
  const chart = getProductSampleMetrics(saved, referenceAt, 7)
  assert.equal(chart.total, 1)
  assert.equal(
    chart.rows.reduce((total, row) => total + row.uht, 0),
    0
  )
  assert.equal(
    chart.rows.reduce((total, row) => total + row.ghee, 0),
    1
  )
})

test("report list includes only reached reports and respects archives and review decisions", () => {
  const { hasLabReport, reportHref } = require(join(output, "report-list.js"))
  const sample = draft()
  assert.equal(hasLabReport(sample), false)
  assert.equal(
    hasLabReport({ ...sample, status: "in-progress", stage: "lab-tests" }),
    false
  )
  for (const status of ["awaiting-review", "approved", "rejected"]) {
    const report = {
      ...sample,
      status: "in-progress",
      stage: "lab-report",
      laboratory: {
        ...sample.laboratory,
        review: { ...sample.laboratory.review, status },
      },
    }
    assert.equal(hasLabReport(report), true)
    assert.equal(
      hasLabReport({ ...report, archivedAt: "2026-10-03T10:00:00Z" }),
      false
    )
    assert.equal(reportHref(report), "/samples/TEST-001?stage=lab-report")
  }
  assert.equal(
    hasLabReport({ ...sample, status: "done", stage: "product-logs" }),
    true
  )
})
