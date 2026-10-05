"use client"

import { useSamples } from "@/features/samples/components/sample-provider"
import { SampleHeaderActions } from "@/features/samples/components/sample-header-actions"
import { useDemoSession } from "@/features/auth/session-provider"
import { toast } from "sonner"
import { useParams, usePathname, useRouter } from "next/navigation"
import { PlusIcon, SearchIcon } from "lucide-react"
import { useSampleSearch } from "@/features/samples/components/sample-search-provider"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { getNavigationTitle } from "@/config/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()
  const { sampleId } = useParams<{ sampleId?: string }>()
  const router = useRouter()
  const { createDraft, samples } = useSamples()
  const sample = samples.find((item) => item.id === sampleId)
  const { user } = useDemoSession()
  const { query, setQuery, reportQuery, setReportQuery } = useSampleSearch()

  return (
    <header className="flex min-h-(--header-height) shrink-0 items-center gap-2 border-b py-2 transition-[width,height] ease-linear">
      <div className="flex w-full flex-wrap items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">
          {sample ? `#${sample.id}` : getNavigationTitle(pathname)}
        </h1>
        {pathname === "/team" && (
          <Button
            variant="default"
            className="ml-auto"
            type="submit"
            form="team-invite-launch"
          >
            Invite member
          </Button>
        )}
        {sample && (
          <div className="ml-auto">
            <SampleHeaderActions key={sample.id} sample={sample} />
          </div>
        )}
        {(pathname === "/samples" || pathname === "/reports") && (
          <div className="ml-auto flex w-full min-w-0 items-center gap-2 pt-2 sm:w-auto sm:pt-0">
            <InputGroup className="min-w-0 flex-1 sm:w-60">
              <InputGroupInput
                type="search"
                aria-label={
                  pathname === "/reports" ? "Search reports" : "Search samples"
                }
                placeholder={
                  pathname === "/reports"
                    ? "Search reports…"
                    : "Search samples…"
                }
                value={pathname === "/reports" ? reportQuery : query}
                onChange={(event) =>
                  (pathname === "/reports" ? setReportQuery : setQuery)(
                    event.target.value
                  )
                }
              />
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
            </InputGroup>
            {pathname === "/samples" && (
              <Button
                className="shrink-0"
                onClick={() => {
                  if (!user) return
                  try {
                    const draft = createDraft(user.name)
                    router.push(`/samples/${draft.id}?mode=edit`)
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to create sample."
                    )
                  }
                }}
              >
                <PlusIcon data-icon="inline-start" aria-hidden="true" />
                Add sample
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
