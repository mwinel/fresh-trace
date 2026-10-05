"use client"
import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  readingLabel,
  resultHref,
  stageLabel,
  type AnalysisResult,
} from "../analysis-data"

export function AnalysisResultsTable({
  results,
  onInspect,
  emptyText = "No results recorded for this selection.",
}: {
  results: AnalysisResult[]
  onInspect?: (result: AnalysisResult) => void
  emptyText?: string
}) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(results.length / 10))
  const current = Math.min(page, pages - 1)
  if (current !== page) setPage(current)
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="min-w-0 overflow-hidden rounded-xl border">
        <Table className="min-w-[850px]">
          <TableHeader className="bg-muted">
            <TableRow>
              {[
                "Sample ID",
                "Stage",
                "Parameter",
                "Result",
                "Specification",
                "Action",
              ].map((label) => (
                <TableHead scope="col" key={label}>
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.slice(current * 10, (current + 1) * 10).map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{result.sampleId}</TableCell>
                <TableCell>{stageLabel(result.stage)}</TableCell>
                <TableCell className="max-w-48 whitespace-normal">
                  {result.parameter}
                </TableCell>
                <TableCell className="max-w-64 whitespace-normal">
                  <div className="flex flex-col items-start gap-1.5">
                    <span>{readingLabel(result)}</span>
                    <Badge variant="outline" className="text-muted-foreground">
                      {result.status === "fail" && (
                        <TriangleAlertIcon
                          className="text-status-awaiting-review"
                          aria-hidden="true"
                        />
                      )}
                      {result.status === "fail"
                        ? "Recorded fail"
                        : result.status === "pass"
                          ? "Recorded pass"
                          : "Unassessed"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {onInspect ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0"
                      onClick={() => onInspect(result)}
                      aria-label={`View specification for ${result.parameter}, ${result.sampleId}`}
                    >
                      View specification
                    </Button>
                  ) : (
                    <span className="whitespace-normal">
                      {result.specification || "Not recorded"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {result.archived ? (
                    <span className="text-xs text-muted-foreground">
                      Sample archived
                    </span>
                  ) : (
                    <Link
                      href={resultHref(result)}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        className: "px-0",
                      })}
                    >
                      View sample
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!results.length && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-36 text-center text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {results.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span aria-live="polite">
            {current * 10 + 1}–{Math.min((current + 1) * 10, results.length)} of{" "}
            {results.length} results
          </span>
          <nav
            aria-label="Analysis results pagination"
            className="flex items-center gap-2"
          >
            <span className="mr-2">
              Page {current + 1} of {pages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              aria-label="Previous results page"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current === pages - 1}
              onClick={() => setPage(current + 1)}
              aria-label="Next results page"
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}
