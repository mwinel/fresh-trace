import type { ReportReviewStatus } from "./types"

export const reportStatusLabels: Record<ReportReviewStatus, string> = {
  "awaiting-review": "Awaiting review",
  approved: "Approved",
  rejected: "Rejected",
}
