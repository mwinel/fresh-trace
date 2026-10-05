import { SampleProvider } from "@/features/samples/components/sample-provider"
import { RequireDemoSession } from "@/features/auth/session-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SampleSearchProvider } from "@/features/samples/components/sample-search-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireDemoSession>
      <SampleProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 14)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SampleSearchProvider>
              <SiteHeader />
              {children}
            </SampleSearchProvider>
          </SidebarInset>
        </SidebarProvider>
      </SampleProvider>
    </RequireDemoSession>
  )
}
