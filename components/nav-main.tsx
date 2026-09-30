"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { isNavigationActive, type NavigationItem } from "@/config/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  className,
}: {
  items: NavigationItem[]
  className?: string
}) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = isNavigationActive(pathname, item.url)
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  className="h-9 md:h-9"
                  tooltip={item.title}
                  isActive={isActive}
                  render={
                    <Link
                      href={item.url}
                      aria-current={isActive ? "page" : undefined}
                      onNavigate={() => setOpenMobile(false)}
                    />
                  }
                >
                  <item.icon aria-hidden="true" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
