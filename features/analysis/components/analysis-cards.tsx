import type { CSSProperties } from "react"
import {
  FlaskConicalIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
  ClockIcon,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import type { AnalysisSummary } from "../analysis-data"

const number = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 })
export function AnalysisCards({ summary }: { summary: AnalysisSummary }) {
  const cards = [
    {
      title: "Samples analysed",
      Icon: FlaskConicalIcon,
      color: "var(--status-registered)",
      value: number.format(summary.samplesAnalysed),
      detail: `${summary.results.length} recorded results in this period`,
    },
    {
      title: "Within specification",
      Icon: CircleCheckIcon,
      color: "var(--success)",
      value:
        summary.withinSpecification === null
          ? "—"
          : `${number.format(summary.withinSpecification)}%`,
      detail: summary.assessed
        ? `${summary.passed} of ${summary.assessed} assessed results marked Pass`
        : "No recorded pass/fail decisions",
    },
    {
      title: "Flagged results",
      Icon: TriangleAlertIcon,
      color: "var(--status-awaiting-review)",
      value: number.format(summary.flagged.length),
      detail: `${summary.flagged.length} marked Fail · ${summary.unassessed} unassessed`,
    },
    {
      title: "Average turnaround",
      Icon: ClockIcon,
      color: "var(--status-in-progress)",
      value:
        summary.turnaroundHours === null
          ? "—"
          : `${number.format(summary.turnaroundHours)} h`,
      detail: `Registration to first lab report · ${summary.turnaroundCount} samples`,
    },
  ]
  return (
    <section
      aria-label="Analysis summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map(({ title, Icon, color, value, detail }) => (
        <Card
          key={title}
          className="sample-metric-card"
          style={{ "--sample-accent": color } as CSSProperties}
        >
          <CardHeader>
            <div className="flex min-w-0 items-center gap-2">
              <div className="sample-metric-icon flex size-6 shrink-0 items-center justify-center rounded-md">
                <Icon className="size-3" style={{ color }} aria-hidden="true" />
              </div>
              <CardDescription className="text-sm font-medium text-foreground/75">
                {title}
              </CardDescription>
            </div>
            <CardTitle className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
              {value}
            </CardTitle>
          </CardHeader>
          <CardFooter className="mt-auto text-xs text-muted-foreground">
            {detail}
          </CardFooter>
        </Card>
      ))}
    </section>
  )
}
