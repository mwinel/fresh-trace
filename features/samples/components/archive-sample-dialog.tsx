"use client"

import type { RefObject } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSamples } from "./sample-provider"

export function ArchiveSampleDialog({
  sampleId,
  open,
  onOpenChange,
  returnFocus,
  onArchived,
}: {
  sampleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocus: RefObject<HTMLButtonElement | null>
  onArchived?: () => void
}) {
  const { archiveSamples } = useSamples()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        finalFocus={() =>
          returnFocus.current ??
          document.querySelector<HTMLButtonElement>(
            '[aria-label^="Sort samples:"]'
          ) ??
          false
        }
      >
        <DialogHeader>
          <DialogTitle>Archive sample {sampleId}?</DialogTitle>
          <DialogDescription>
            This sample will be hidden for this demo session and unsaved changes
            will be discarded. Its history stays in the overview trends. Changes
            reset on refresh.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            onClick={() => {
              onOpenChange(false)
              archiveSamples([sampleId])
              onArchived?.()
              toast.success(
                "Sample archived for this demo session. Changes reset on refresh."
              )
            }}
          >
            Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
