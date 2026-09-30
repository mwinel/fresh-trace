"use client"

import { useState, type RefObject } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { SelectField } from "./sample-form-fields"
import type {
  ReportConclusion,
  ReportReview,
  ReportReviewAction,
} from "../types"

const conclusionLabels = {
  conforms: "Conforms",
  "does-not-conform": "Does not conform",
}
const actionLabels = {
  "technical-sign-off": "Sign off technical review",
  approved: "Approve report",
  rejected: "Reject report",
}

export function ReportReviewDialog({
  returnFocus,
  action,
  review,
  reviewerName,
  onClose,
  onConfirm,
}: {
  returnFocus: RefObject<HTMLButtonElement | null>
  action: ReportReviewAction
  review: ReportReview
  reviewerName: string
  onClose: () => void
  onConfirm: (
    action: ReportReviewAction,
    conclusion: ReportConclusion,
    remarks: string
  ) => void
}) {
  const [conclusion, setConclusion] = useState(
    review.conclusion ? conclusionLabels[review.conclusion] : ""
  )
  const [remarks, setRemarks] = useState(review.remarks)
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        finalFocus={returnFocus}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{actionLabels[action]}</DialogTitle>
          <DialogDescription>
            Your name ({reviewerName}) and the current date will be recorded.
            Demo changes reset on refresh.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (!conclusion) {
              toast.error("Select an overall conclusion.")
              document.getElementById("report-conclusion")?.focus()
              return
            }
            if (action === "rejected" && !remarks.trim()) {
              toast.error("Enter a reason for rejection in remarks.")
              document.getElementById("report-remarks")?.focus()
              return
            }
            onConfirm(
              action,
              conclusion === "Conforms" ? "conforms" : "does-not-conform",
              remarks.trim()
            )
            onClose()
          }}
        >
          <FieldGroup>
            <SelectField
              id="report-conclusion"
              label="Overall conclusion"
              placeholder="Select conclusion"
              options={Object.values(conclusionLabels)}
              value={conclusion}
              onChange={setConclusion}
            />
            <Field>
              <FieldLabel htmlFor="report-remarks">
                Remarks{action === "rejected" ? " (required)" : ""}
              </FieldLabel>
              <Textarea
                id="report-remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                rows={4}
                placeholder={
                  action === "rejected"
                    ? "Explain why this report is being rejected…"
                    : "Add review notes…"
                }
              />
            </Field>
          </FieldGroup>
          <p className="text-xs text-muted-foreground">
            Approval records acceptance of the report, not whether the sample
            conforms. Changing the conclusion or remarks clears any previous
            technical sign-off.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={action === "rejected" ? "destructive" : "default"}
            >
              {actionLabels[action]}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
