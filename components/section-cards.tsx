"use client"

import type { CSSProperties } from "react"
import { MinusIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

import { sampleStatusColors } from "@/features/samples/status-styles"
import type { SampleStatus } from "@/features/samples/types"
import { useSamples } from "@/features/samples/components/sample-provider"
import {
  getSampleMetrics,
  metricTrend,
  type SampleMetrics,
} from "@/features/samples/metrics"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { SampleStatusIcon } from "@/features/samples/components/sample-status-icon"

const cards: {
  key: keyof SampleMetrics
  title: string
  kind: "activity" | "queue"
  verb: string
  status: SampleStatus
}[] = [
  {
    key: "registered",
    status: "registered",
    title: "Registered",
    kind: "activity",
    verb: "registered",
  },
  {
    key: "inProgress",
    status: "in-progress",
    title: "In progress",
    kind: "queue",
    verb: "open",
  },
  {
    key: "awaitingReview",
    status: "awaiting-review",
    title: "Awaiting review",
    kind: "queue",
    verb: "waiting",
  },
  {
    key: "completed",
    status: "done",
    title: "Completed",
    kind: "activity",
    verb: "completed",
  },
]
const count = new Intl.NumberFormat("en-GB")

export function SectionCards() {
  const { samples, referenceAt } = useSamples()
  const metrics = getSampleMetrics(samples, referenceAt)

  return (
    <section
      aria-label="Sample overview"
      className="flex flex-col gap-3 px-4 lg:px-6"
    >
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {cards.map((card) => {
          const metric = metrics[card.key]
          const trend = metricTrend(metric, card.kind)
          const Icon =
            trend.direction === "up"
              ? TrendingUpIcon
              : trend.direction === "down"
                ? TrendingDownIcon
                : MinusIcon
          const difference = metric.current - metric.previous
          return (
            <Card
              key={card.key}
              className="sample-metric-card @container/card"
              style={
                {
                  "--sample-accent": sampleStatusColors[card.status],
                } as CSSProperties
              }
            >
              <CardHeader>
                <div className="flex min-w-0 items-center gap-2">
                  <div className="sample-metric-icon flex size-6 shrink-0 items-center justify-center rounded-md">
                    <SampleStatusIcon status={card.status} className="size-3" />
                  </div>
                  <CardDescription className="text-sm font-medium text-foreground/75">
                    {card.title}
                  </CardDescription>
                </div>
                <CardTitle className="col-span-2 row-start-2 mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                  {count.format(metric.current)}
                </CardTitle>
                <CardAction className="row-span-1 self-center">
                  <Badge
                    variant="outline"
                    className="h-auto max-w-32 text-[12px] whitespace-normal"
                  >
                    <Icon aria-hidden="true" />
                    {trend.label}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="mt-auto flex-col items-start gap-1.5 text-[12px]">
                <div className="text-muted-foreground">
                  {card.kind === "activity"
                    ? `${count.format(metric.current)} vs ${count.format(metric.previous)} in the previous 7 days`
                    : difference === 0
                      ? `Unchanged from ${count.format(metric.previous)} ${card.verb} 7 days ago`
                      : `${count.format(Math.abs(difference))} ${difference > 0 ? "more" : "fewer"} ${card.verb} than 7 days ago (${count.format(metric.previous)})`}
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
