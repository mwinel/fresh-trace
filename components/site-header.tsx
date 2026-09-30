"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlusIcon } from "lucide-react"

import { getNavigationTitle } from "@/config/navigation"

import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">
          {getNavigationTitle(pathname)}
        </h1>
        {pathname === "/samples" && (
          <Link
            href="/samples/register"
            className={buttonVariants({ className: "ml-auto" })}
          >
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Register sample
          </Link>
        )}
      </div>
    </header>
  )
}
