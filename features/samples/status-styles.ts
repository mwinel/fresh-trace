import type { SampleStatus } from "./types"

export const sampleStatusColors: Record<SampleStatus, string> = {
  draft: "var(--muted-foreground)",
  registered: "var(--status-registered)",
  "in-progress": "var(--status-in-progress)",
  "awaiting-review": "var(--status-awaiting-review)",
  done: "var(--success)",
}
