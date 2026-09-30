"use client"

import { useRef, useState } from "react"
import { ReportReviewDialog } from "./report-review"
import { createPortal } from "react-dom"
import { EllipsisIcon, LockKeyholeIcon } from "lucide-react"
import { cn } from "cn"

import { testParameters } from "../data"
import type {
  LabTestDetails,
  LabTestResult,
  SampleIdentity,
  SampleSource,
  ReportReviewStatus,
  ReportReview,
  ReportConclusion,
  ReportReviewAction,
} from "../types"
import { sourceLabel } from "../source-utils"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

const reviewLabels: Record<ReportReviewStatus, string> = {
  "awaiting-review": "Awaiting review",
  approved: "Approved",
  rejected: "Rejected",
}

function formatDate(value: string) {
  if (!value) return "n/a"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Kampala",
  }).format(new Date(value.length === 10 ? `${value}T00:00:00+03:00` : value))
}

function resultLabel(value: string) {
  if (value === "positive") return "Positive"
  if (value === "negative") return "Negative"
  return value.trim() || "n/a"
}

type ReportProps = {
  reportNumber: string
  identity: SampleIdentity
  details: LabTestDetails
  source?: SampleSource
  results: LabTestResult[]
  review: ReportReview
}

function ReportDocument({
  reportNumber,
  identity,
  details,
  source,
  results,
  review,
}: ReportProps) {
  const reviewStatus = review.status
  const detailGroups = [
    {
      title: "Report details",
      fields: [
        ["Report No.", reportNumber],
        ["Client", details.client],
        ["Report issue date", formatDate(details.reportIssueDate)],
      ],
    },
    {
      title: "Sample details",
      fields: [
        ["Sample No.", identity.id],
        ["Source", source ? sourceLabel(source) : ""],
        ["Sampling date", formatDate(details.samplingDate)],
        ["Lab receipt date", formatDate(identity.createdAt)],
      ],
    },
    {
      title: "Testing details",
      fields: [
        ["Testing lab", details.testingLab],
        ["Testing date", formatDate(details.testingDate)],
      ],
    },
  ]
  return (
    <article
      aria-label="Raw milk laboratory test report"
      className="min-w-0 rounded-xl border bg-background p-5 @min-[44rem]/report:p-6"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b pb-5">
        <h3 className="text-lg font-semibold tracking-tight">
          Raw milk laboratory test report
        </h3>
        <p
          role="status"
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
            reviewStatus === "approved"
              ? "border-success/25 bg-success/10 text-success"
              : reviewStatus === "rejected"
                ? "border-destructive/25 bg-destructive/10 text-destructive"
                : "border-notice-border bg-notice text-notice-foreground"
          )}
        >
          <span className="sr-only">Review status: </span>
          {reviewLabels[reviewStatus]}
        </p>
      </div>
      <div className="mb-8 grid gap-6 @min-[44rem]/report:grid-cols-3 @min-[44rem]/report:gap-8 print:grid-cols-3">
        {detailGroups.map((group) => (
          <section
            key={group.title}
            aria-label={group.title}
            className="min-w-0"
          >
            <h4 className="mb-4 text-sm font-semibold">{group.title}</h4>
            <dl className="flex flex-col gap-4 text-sm">
              {group.fields.map(([label, value]) => (
                <div key={label} className="flex min-w-0 flex-col gap-1">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd
                    className={cn(
                      "min-w-0 break-words",
                      (!value || value === "n/a") && "text-muted-foreground"
                    )}
                  >
                    {value || "n/a"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-t pt-5">
        <h4 className="text-sm font-semibold">Test results</h4>
        <p className="text-xs text-muted-foreground">
          n/a indicates no value recorded.
        </p>
      </div>
      <Table className="min-w-[600px] table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {[
              "Parameter",
              "F/SILO",
              "M/SILO",
              "B/SILO",
              "L/SILO",
              "Status",
            ].map((label, index) => (
              <TableHead
                key={label}
                scope="col"
                className={cn(
                  "h-11 px-3 text-xs text-muted-foreground first:pl-0 last:pr-0",
                  index === 0 ? "w-[30%]" : "w-[14%]"
                )}
              >
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {testParameters.map((parameter) => {
            const row = results.find((result) => result.parameter === parameter)
            return (
              <TableRow key={parameter} className="hover:bg-transparent">
                <TableCell className="py-3 pr-3 pl-0 whitespace-normal">
                  {parameter}
                </TableCell>
                {[row?.fSilo, row?.mSilo, row?.bSilo, row?.lSilo].map(
                  (value, index) => (
                    <TableCell
                      key={index}
                      className={cn(
                        "px-3 py-3 break-words whitespace-normal tabular-nums",
                        !value?.trim() && "text-muted-foreground"
                      )}
                    >
                      {resultLabel(value ?? "")}
                    </TableCell>
                  )
                )}
                <TableCell
                  className={cn(
                    "py-3 pr-0 pl-3 whitespace-normal",
                    row?.status === "pass"
                      ? "text-success"
                      : row?.status === "fail"
                        ? "text-destructive"
                        : "text-muted-foreground"
                  )}
                >
                  {row?.status === "pass"
                    ? "Pass"
                    : row?.status === "fail"
                      ? "Fail"
                      : "n/a"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </article>
  )
}

export function LabReportPreview({
  onReview,
  reviewerName,
  ...report
}: ReportProps & {
  reviewerName: string
  onReview: (
    action: ReportReviewAction,
    conclusion: ReportConclusion,
    remarks: string
  ) => void
}) {
  const actionsButton = useRef<HTMLButtonElement>(null)
  const [action, setAction] = useState<ReportReviewAction | null>(null)
  return (
    <div className="@container/report flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Report summary</h3>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Report actions"
                ref={actionsButton}
              />
            }
          >
            <EllipsisIcon aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => window.print()}>
                Share report
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={report.review.status === "approved"}
                onClick={() => setAction("approved")}
              >
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={report.review.status === "rejected"}
                onClick={() => setAction("rejected")}
              >
                Reject
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="flex items-center gap-2 rounded-md border border-notice-border bg-notice px-3 py-2 text-sm text-notice-foreground">
        <LockKeyholeIcon className="size-4 shrink-0" aria-hidden="true" />
        Automatically populated · Read-only
      </p>
      <ReportDocument {...report} />
      {action && (
        <ReportReviewDialog
          returnFocus={actionsButton}
          action={action}
          review={report.review}
          reviewerName={reviewerName}
          onClose={() => setAction(null)}
          onConfirm={onReview}
        />
      )}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="report-print-view">
            <ReportDocument {...report} />
            <p className="mt-4 text-xs">Fresh Trace · Demo report</p>
          </div>,
          document.body
        )}
    </div>
  )
}
