"use client"

import { useId, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useSamples } from "@/features/samples/components/sample-provider"
import { productOptions } from "@/features/samples/products"
import {
  getProductSampleMetrics,
  type SampleChartDays,
} from "@/features/samples/product-metrics"

const ranges = [7, 30, 90] as const
const chartConfig = Object.fromEntries(
  productOptions.map((product) => [
    product.value,
    { label: product.chartLabel, color: product.color },
  ])
) satisfies ChartConfig
const counts = new Intl.NumberFormat("en-GB")
const dateLabel = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Kampala",
})
const fullDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Kampala",
})

export function ChartAreaInteractive() {
  const { samples, referenceAt } = useSamples()
  const [days, setDays] = useState<SampleChartDays>(7)
  const id = useId().replace(/:/g, "")
  const { rows, total } = getProductSampleMetrics(samples, referenceAt, days)
  function changeRange(value: string | null) {
    const next = ranges.find((range) => String(range) === value)
    if (next) setDays(next)
  }
  return (
    <Card className="@container/card" aria-label="Samples by product">
      <CardHeader>
        <CardTitle>Samples by product</CardTitle>
        <CardDescription>
          {counts.format(total)} samples registered in the last {days} days
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[String(days)]}
            onValueChange={(values) => changeRange(values[0] ?? null)}
            variant="outline"
            className="hidden @[767px]/card:flex"
            aria-label="Chart time range"
          >
            {ranges.map((range) => (
              <ToggleGroupItem key={range} value={String(range)}>
                Last {range} days
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select
            value={String(days)}
            onValueChange={changeRange}
            items={ranges.map((range) => ({
              value: String(range),
              label: `Last ${range} days`,
            }))}
          >
            <SelectTrigger
              size="sm"
              className="w-36 @[767px]/card:hidden"
              aria-label="Chart time range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ranges.map((range) => (
                  <SelectItem key={range} value={String(range)}>
                    Last {range} days
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-2 sm:px-6">
        {total === 0 ? (
          <div
            className="flex h-[250px] items-center justify-center p-6 text-center text-sm text-muted-foreground"
            role="status"
          >
            No samples registered in this period
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
            aria-label={`Daily sample registrations by product for the last ${days} days`}
          >
            <AreaChart
              accessibilityLayer
              data={rows}
              margin={{ left: 0, right: 12 }}
            >
              <defs>
                {productOptions.map((product) => (
                  <linearGradient
                    key={product.value}
                    id={`${id}-${product.value}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={product.color}
                      stopOpacity={0.55}
                    />
                    <stop
                      offset="95%"
                      stopColor={product.color}
                      stopOpacity={0.12}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={32}
                tickMargin={8}
                tickFormatter={(value: string) =>
                  dateLabel.format(new Date(`${value}T00:00:00+03:00`))
                }
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <ChartTooltip
                content={({ active, label }) => {
                  if (!active) return null
                  const row = rows.find((item) => item.date === label)
                  if (!row) return null
                  return (
                    <div className="grid min-w-44 gap-2 rounded-lg border bg-background p-3 text-xs shadow-xl">
                      <div className="font-medium">
                        {fullDate.format(
                          new Date(`${row.date}T00:00:00+03:00`)
                        )}
                      </div>
                      {productOptions.map((product) => (
                        <div
                          key={product.value}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="size-2 shrink-0 rounded-sm"
                            style={{ background: product.color }}
                            aria-hidden="true"
                          />
                          <span className="flex-1 text-muted-foreground">
                            {product.chartLabel}
                          </span>
                          <span className="font-medium tabular-nums">
                            {counts.format(row[product.value])}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between gap-4 border-t pt-2 font-medium">
                        <span>Total</span>
                        <span className="tabular-nums">
                          {counts.format(row.total)}
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
              {productOptions.map((product) => (
                <Area
                  key={product.value}
                  dataKey={product.value}
                  name={product.chartLabel}
                  type="linear"
                  stackId="samples"
                  fill={`url(#${id}-${product.value})`}
                  stroke={product.color}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        )}
        <ul
          aria-label="Products"
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs"
        >
          {productOptions.map((product) => (
            <li key={product.value} className="flex items-center gap-2">
              <span
                className="size-2 rounded-sm"
                style={{ background: product.color }}
                aria-hidden="true"
              />
              {product.chartLabel}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
