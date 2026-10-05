import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { LatestSamplesTable } from "@/features/samples/components/latest-samples-table"
import { SectionCards } from "@/components/section-cards"

export default function OverviewPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <div className="min-w-0 px-4 lg:px-6">
            <LatestSamplesTable
              showRowsPerPage={false}
              showDescription={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
