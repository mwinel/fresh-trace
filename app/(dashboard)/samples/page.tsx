import { LatestSamplesTable } from "@/features/samples/components/latest-samples-table"

export default function SamplesPage() {
  return (
    <div className="min-w-0 p-4 lg:p-6">
      <LatestSamplesTable showHeading={false} showStageFilter enableSearch />
    </div>
  )
}
