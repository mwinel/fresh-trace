"use client"

import { SampleSourceName } from "./sample-provider"

import Link from "next/link"
import { cn } from "cn"
import { useRef, useState, type ReactNode } from "react"
import { ArchiveSampleDialog } from "./archive-sample-dialog"
import { EllipsisVerticalIcon } from "lucide-react"
import { SampleStatusIcon } from "./sample-status-icon"

import { stageDotClasses } from "../stage-styles"
import {
  type SampleListItem,
  sampleStageLabel,
  sampleStatusLabels,
} from "../data/latest-samples"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Kampala",
})
function SampleStatusBadge({ status }: { status: SampleListItem["status"] }) {
  return (
    <Badge variant="outline" className="px-1.5 text-muted-foreground">
      <SampleStatusIcon status={status} />
      {sampleStatusLabels[status]}
    </Badge>
  )
}

function SampleRowActions({ sample }: { sample: SampleListItem }) {
  const [archiveOpen, setArchiveOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              ref={triggerRef}
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              aria-label={`Actions for sample ${sample.id}`}
            />
          }
        >
          <EllipsisVerticalIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 whitespace-nowrap">
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link href={`/samples/${sample.id}`} />}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
              Archive
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ArchiveSampleDialog
        sampleId={sample.id}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        returnFocus={triggerRef}
      />
    </>
  )
}

export type SampleColumnId =
  "number" | "source" | "registered" | "stage" | "status" | "action"
type SampleColumn = {
  id: SampleColumnId
  label: string
  hideHeader?: boolean
  className?: string
  cell: (sample: SampleListItem) => ReactNode
}

export const sampleColumns: SampleColumn[] = [
  {
    id: "number",
    label: "Sample No.",
    className: "font-medium",
    cell: (sample) => sample.id,
  },
  {
    id: "source",
    label: "Source",
    className: "max-w-72 whitespace-normal",
    cell: (sample) => (
      <SampleSourceName sourceId={sample.registration.sourceId} />
    ),
  },
  {
    id: "registered",
    label: "Date",
    className: "text-muted-foreground",
    cell: (sample) => (
      <time dateTime={sample.createdAt}>
        {dateFormat.format(new Date(sample.createdAt))}
      </time>
    ),
  },
  {
    id: "stage",
    label: "Stage",
    className: "text-muted-foreground",
    cell: (sample) => (
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "size-2 shrink-0 rounded-full",
            stageDotClasses[sample.stage]
          )}
        />
        {sampleStageLabel(sample.stage)}
      </span>
    ),
  },
  {
    id: "status",
    label: "Status",
    cell: (sample) => <SampleStatusBadge status={sample.status} />,
  },
  {
    id: "action",
    label: "Actions",
    hideHeader: true,
    className: "w-12 text-right",
    cell: (sample) => <SampleRowActions sample={sample} />,
  },
]
