import { CircleCheckIcon, LoaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { sampleStatusColors } from "../status-styles"
import type { SampleStatus } from "../types"

export function SampleStatusIcon({
  status,
  className,
}: {
  status: SampleStatus
  className?: string
}) {
  const Icon = status === "done" ? CircleCheckIcon : LoaderIcon
  return (
    <Icon
      aria-hidden="true"
      style={{ color: sampleStatusColors[status] }}
      className={cn(
        status === "done" && "fill-current stroke-background",
        className
      )}
    />
  )
}
