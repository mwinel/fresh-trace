import {
  ChartBarIcon,
  CircleQuestionMarkIcon,
  FileChartColumnIcon,
  LayoutDashboardIcon,
  MonitorDotIcon,
  Settings2Icon,
  TestTubeDiagonalIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export type NavigationItem = {
  title: string
  url: string
  icon: LucideIcon
}

export const mainNavigation: NavigationItem[] = [
  { title: "Overview", url: "/overview", icon: LayoutDashboardIcon },
  { title: "Samples", url: "/samples", icon: TestTubeDiagonalIcon },
  { title: "Reports", url: "/reports", icon: FileChartColumnIcon },
  { title: "Analysis", url: "/analysis", icon: ChartBarIcon },
  { title: "Team", url: "/team", icon: UsersIcon },
  { title: "Settings", url: "/settings", icon: Settings2Icon },
]

export const secondaryNavigation: NavigationItem[] = [
  { title: "Get Help", url: "/help", icon: CircleQuestionMarkIcon },
  { title: "Status", url: "/status", icon: MonitorDotIcon },
]

export function isNavigationActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function getNavigationTitle(pathname: string) {
  return (
    [...mainNavigation, ...secondaryNavigation].find((item) =>
      isNavigationActive(pathname, item.url)
    )?.title ?? "Overview"
  )
}
