"use client"

import { useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { EllipsisVerticalIcon } from "lucide-react"

import type { Sample } from "../types"
import { resolveStage } from "../workflow"
import { ArchiveSampleDialog } from "./archive-sample-dialog"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SampleHeaderActions({ sample }: { sample: Sample }) {
  const [archiveOpen, setArchiveOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  function editSample() {
    const stage = resolveStage(
      sample,
      searchParams.get("stage") ??
        (searchParams.get("view") === "report" ? "lab-report" : null)
    )
    window.history.replaceState(
      null,
      "",
      `/samples/${sample.id}?stage=${stage}&mode=edit`
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              ref={triggerRef}
              variant="outline"
              size="icon-sm"
              aria-label={`Actions for sample ${sample.id}`}
            />
          }
        >
          <EllipsisVerticalIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-24">
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={searchParams.get("mode") === "edit"}
              onClick={editSample}
            >
              Edit
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
        onArchived={() => router.push("/samples")}
      />
    </>
  )
}
