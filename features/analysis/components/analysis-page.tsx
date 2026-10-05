"use client"
import { useState } from "react"
import { DownloadIcon, InfoIcon } from "lucide-react"
import { toast } from "sonner"
import { useSamples } from "@/features/samples/components/sample-provider"
import { productOptions } from "@/features/samples/products"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  analysisCsv,
  analysisMetrics,
  analysisStages,
  defaultAnalysisFilters,
  getAnalysis,
  getQualityTrend,
  type AnalysisFilters,
  type AnalysisMetric,
  type AnalysisGroup,
} from "../analysis-data"
import { AnalysisSelect } from "./analysis-select"
import { AnalysisCards } from "./analysis-cards"
import {
  QualityTrend,
  FlaggedByStage,
  analysisDateLabel,
} from "./analysis-charts"
import { AnalysisResultsTable } from "./analysis-results-table"

export function AnalysisPage() {
  const { samples, sources, referenceAt } = useSamples()
  const [filters, setFilters] = useState<AnalysisFilters>(
    defaultAnalysisFilters
  )
  const [metric, setMetric] = useState<AnalysisMetric>("ph")
  const [group, setGroup] = useState<AnalysisGroup>("day")
  const [inspection, setInspection] = useState<{
    ids: string[]
    title: string
    specification: boolean
  } | null>(null)
  const summary = getAnalysis(samples, referenceAt, filters)
  const points = getQualityTrend(summary.results, summary.window, metric, group)
  const inspected = summary.results.filter((result) =>
    inspection?.ids.includes(result.id)
  )
  const filterKey = JSON.stringify(filters)
  function changeFilters(next: Partial<AnalysisFilters>) {
    setFilters((current) => ({ ...current, ...next }))
    setInspection(null)
  }
  function exportAnalysis() {
    const csv = analysisCsv(summary, sources, filters, referenceAt)
    const url = URL.createObjectURL(
      new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })
    )
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `fresh-trace-analysis-${summary.window.start}-to-${summary.window.end}.csv`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success(`Exported ${summary.results.length} results as CSV.`)
  }
  return (
    <div className="flex min-w-0 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <section aria-label="Analysis filters" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <AnalysisSelect
              label="Date range"
              prefix={false}
              value={String(filters.days)}
              options={[7, 30, 90].map((days) => ({
                value: String(days),
                label: `Last ${days} days`,
              }))}
              onChange={(value) => {
                const days = Number(value)
                if (days === 7 || days === 30 || days === 90)
                  changeFilters({ days })
              }}
            />
            <AnalysisSelect
              label="Source"
              value={filters.source}
              options={[
                { value: "all", label: "All" },
                ...sources.map((source) => ({
                  value: source.id,
                  label: source.name,
                })),
              ]}
              onChange={(source) => changeFilters({ source })}
            />
            <AnalysisSelect
              label="Product"
              value={filters.product}
              options={[
                { value: "all", label: "All" },
                ...productOptions.map((product) => ({
                  value: product.value,
                  label: product.chartLabel,
                })),
              ]}
              onChange={(product) => changeFilters({ product })}
            />
            <AnalysisSelect
              label="Stage"
              value={filters.stage}
              options={[{ value: "all", label: "All" }, ...analysisStages]}
              onChange={(stage) => changeFilters({ stage })}
            />
            {filterKey !== JSON.stringify(defaultAnalysisFilters) && (
              <Button
                variant="ghost"
                onClick={() => changeFilters(defaultAnalysisFilters)}
              >
                Clear filters
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!summary.results.length}
            onClick={exportAnalysis}
          >
            <DownloadIcon data-icon="inline-start" aria-hidden="true" />
            Export analysis
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {analysisDateLabel(summary.window.start)}–
          {analysisDateLabel(summary.window.end)} · Recorded analysis dates in
          Africa/Kampala
          {summary.undated > 0
            ? ` · ${summary.undated} undated results excluded`
            : ""}
        </p>
      </section>
      <AnalysisCards summary={summary} />
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <QualityTrend
          points={points}
          metric={metric}
          group={group}
          onMetric={setMetric}
          onGroup={setGroup}
          onInspect={(ids, title) =>
            setInspection({ ids, title, specification: false })
          }
        />
        <FlaggedByStage
          summary={summary}
          onInspect={(stage) =>
            setInspection({
              ids: summary.flagged
                .filter((result) => result.stage === stage)
                .map((result) => result.id),
              title: `${analysisStages.find((item) => item.value === stage)?.label} · Flagged results`,
              specification: false,
            })
          }
        />
      </div>
      <Card className="min-w-0">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Results requiring attention</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <InfoIcon className="size-4 shrink-0" aria-hidden="true" />
            Inspect a result or chart point to see the source record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalysisResultsTable
            key={filterKey}
            results={summary.flagged}
            emptyText={
              summary.results.length
                ? "No recorded failures in this selection. Unassessed results are not counted as Pass."
                : "No recorded results match these filters."
            }
            onInspect={(result) =>
              setInspection({
                ids: [result.id],
                title: `${result.sampleId} · ${result.parameter}`,
                specification: true,
              })
            }
          />
        </CardContent>
      </Card>
      <Dialog
        open={inspection !== null}
        onOpenChange={(open) => {
          if (!open) setInspection(null)
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{inspection?.title}</DialogTitle>
            <DialogDescription>
              {inspection?.specification
                ? "Specification and decision recorded with this result. No additional limits have been applied."
                : `Source readings for this selection. ${analysisMetrics.find((item) => item.value === metric)?.label} trend values are means of numeric readings.`}
            </DialogDescription>
          </DialogHeader>
          {inspection?.specification && inspected[0] && (
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">
                  Recorded specification
                </dt>
                <dd className="mt-1 font-medium">
                  {inspected[0].specification || "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Test method</dt>
                <dd className="mt-1">
                  {inspected[0].testMethod || "Not recorded"}
                </dd>
              </div>
            </dl>
          )}
          <AnalysisResultsTable
            key={inspection?.ids.join(",")}
            results={inspected}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
