"use client"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { AnalysisSelect } from "./analysis-select"
import {
  analysisMetrics,
  type AnalysisMetric,
  type AnalysisGroup,
  type AnalysisSummary,
  type TrendPoint,
  type AnalysisStage,
} from "../analysis-data"
const numbers = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "Africa/Kampala",
})
export const analysisDateLabel = (value: string) =>
  dateFormat.format(new Date(`${value}T00:00:00+03:00`))
const trendConfig = { mean: { label: "Mean reading", color: "var(--chart-3)" } }
const flagConfig = {
  count: { label: "Recorded failures", color: "var(--chart-2)" },
}

export function QualityTrend({
  points,
  metric,
  group,
  onMetric,
  onGroup,
  onInspect,
}: {
  points: TrendPoint[]
  metric: AnalysisMetric
  group: AnalysisGroup
  onMetric: (value: AnalysisMetric) => void
  onGroup: (value: AnalysisGroup) => void
  onInspect: (ids: string[], label: string) => void
}) {
  const selected = analysisMetrics.find((item) => item.value === metric)!
  const count = points.reduce((sum, point) => sum + point.count, 0)
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Quality trend</CardTitle>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <AnalysisSelect
              label="Metric"
              value={metric}
              options={analysisMetrics.map((item) => ({
                value: item.value,
                label: item.unit ? `${item.label} (${item.unit})` : item.label,
              }))}
              onChange={(value) => {
                const option = analysisMetrics.find(
                  (item) => item.value === value
                )
                if (option) onMetric(option.value)
              }}
            />
            <AnalysisSelect
              label="Group by"
              value={group}
              options={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
              ]}
              onChange={(value) => {
                if (value === "day" || value === "week") onGroup(value)
              }}
            />
          </div>
        </div>
        <CardDescription>
          {count} numeric readings · {group === "day" ? "Daily" : "Weekly"} mean{" "}
          {selected.label}
          {selected.unit ? ` (${selected.unit})` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-2 sm:px-6">
        {!count ? (
          <div
            role="status"
            className="flex h-[280px] items-center justify-center p-6 text-center text-sm text-muted-foreground"
          >
            No numeric {selected.label} readings in this selection.
          </div>
        ) : (
          <ChartContainer
            config={trendConfig}
            className="aspect-auto h-[280px] w-full"
            aria-label={`${selected.label} quality trend`}
          >
            <LineChart
              accessibilityLayer
              data={points}
              margin={{ top: 16, right: 18, bottom: 8, left: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={30}
                tickFormatter={analysisDateLabel}
              />
              <YAxis
                width={48}
                tick={{ fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(value) => numbers.format(Number(value))}
              />
              <ChartTooltip
                content={({ active, label }) => {
                  const point = points.find((item) => item.date === label)
                  if (!active || !point?.count || point.mean === null)
                    return null
                  return (
                    <div className="grid gap-1 rounded-lg border bg-background p-3 text-xs shadow-xl">
                      <span className="font-medium">
                        {group === "week" ? "Week of " : ""}
                        {analysisDateLabel(point.date)}
                      </span>
                      <span>
                        Mean {selected.label}: {numbers.format(point.mean)}{" "}
                        {selected.unit}
                      </span>
                      <span className="text-muted-foreground">
                        {point.count} readings · Select point to inspect
                      </span>
                    </div>
                  )
                }}
              />
              <Line
                dataKey="mean"
                type="linear"
                stroke="var(--color-mean)"
                strokeWidth={2}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={false}
                dot={(props) => {
                  const point = points[props.index ?? -1]
                  if (!point || point.mean === null)
                    return <g key={props.index} />
                  return (
                    <circle
                      key={point.date}
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="var(--color-mean)"
                      stroke="var(--background)"
                      strokeWidth={2}
                      tabIndex={0}
                      role="button"
                      className="cursor-pointer focus-visible:stroke-foreground"
                      aria-label={`Inspect ${selected.label} readings for ${group === "week" ? "week of " : ""}${analysisDateLabel(point.date)}`}
                      onClick={() =>
                        onInspect(
                          point.resultIds,
                          `${group === "week" ? "Week of " : ""}${analysisDateLabel(point.date)}`
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          onInspect(
                            point.resultIds,
                            analysisDateLabel(point.date)
                          )
                        }
                      }}
                    />
                  )
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Recorded readings only · Gaps mean no data</span>
        <Button
          variant="ghost"
          size="sm"
          disabled={!count}
          onClick={() =>
            onInspect(
              points.flatMap((point) => point.resultIds),
              `${selected.label} readings`
            )
          }
        >
          View readings
        </Button>
      </CardFooter>
    </Card>
  )
}
export function FlaggedByStage({
  summary,
  onInspect,
}: {
  summary: AnalysisSummary
  onInspect: (stage: AnalysisStage) => void
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Flagged results by stage</CardTitle>
        <CardDescription>
          Recorded Fail decisions · {summary.flagged.length} results
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-2 sm:px-6">
        {summary.flagged.length ? (
          <ChartContainer
            config={flagConfig}
            className="aspect-auto h-[280px] w-full"
            aria-label="Recorded failures by analysis stage"
          >
            <BarChart
              accessibilityLayer
              layout="vertical"
              data={summary.byStage}
              margin={{ top: 8, right: 25, left: 0, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={110}
                tick={{ fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={4}
                maxBarSize={30}
                isAnimationActive={false}
                className="cursor-pointer"
                onClick={(_data, index) => {
                  const stage = summary.byStage[index]
                  if (stage?.count) onInspect(stage.value)
                }}
              >
                <LabelList
                  dataKey="count"
                  position="right"
                  className="fill-muted-foreground"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div
            role="status"
            className="flex h-[280px] items-center justify-center p-6 text-center text-sm text-muted-foreground"
          >
            No recorded failures in this selection.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground">
        <p>Stages without pass/fail decisions remain unassessed.</p>
        <div className="flex flex-wrap gap-1">
          {summary.byStage
            .filter((stage) => stage.count)
            .map((stage) => (
              <Button
                key={stage.value}
                variant="ghost"
                size="sm"
                onClick={() => onInspect(stage.value)}
              >
                View {stage.label.toLowerCase()} failures
              </Button>
            ))}
        </div>
      </CardFooter>
    </Card>
  )
}
