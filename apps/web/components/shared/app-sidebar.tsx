import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";
import { History } from "../icons/animated/History";
import { HomeIcon } from "../icons/animated/Home";

import SideBarItem from "./SideBarItem";
import { NavUser } from "../Root-user";

const items = [
  {
    title: "Dashboard",
    url: "/home",
    icon: <HomeIcon />,
  },
  {
    title: "History",
    url: "/history",
    icon: <History />,
  },
];

export function AppSidebar({
  collapsible,
  variant,
}: {
  collapsible?: "offcanvas" | "icon" | "none";
  variant?: "sidebar" | "floating" | "inset";
}) {
  return (
    <Sidebar variant={variant} collapsible={collapsible} className="w-62">
      <SidebarContent className="flex flex-col">
        <SidebarHeader className="flex  flex-row items-center justify-between font-pencerio font-semibold text-2xl max-md:p-4">
          Cdraw
          <div className="max-md:hidden">
            <NavUser />
          </div>
        </SidebarHeader>
        <SidebarGroup className="mt-10 flex-1 ">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 ">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <SideBarItem
                      icon={item.icon}
                      url={item.url}
                      title={item.title}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter></SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
