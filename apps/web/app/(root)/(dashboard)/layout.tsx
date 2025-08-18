import { AppSidebar } from "@/components/shared/app-sidebar";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/ui/sidebar";
// import { TopBar } from "@/components/shared/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-100 overflow-hidden h-screen">
      <SidebarProvider>
        <AppSidebar collapsible="none" variant="inset" />
        <SidebarInset className=" relative rounded-none rounded-tl-2xl pt-px md:border md:border-b-0 md:border-r-0 md:border-neutral-200/80 md:bg-white">
          {/* <TopBar /> */}
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
