"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@repo/ui/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import FilledUser from "./icons/FilledUser";
import { useAppSelector } from "@/lib/hooks/redux";
import { UserIcon } from "./icons/animated/user";

import Downitem from "./Downitem";
import { Sparkle } from "lucide-react";
import { title } from "process";
import { LogoutButton } from "./shared/LogoutButton";

export function NavUser() {
  const loading = false;
  const user = useAppSelector((state) => state.app.user);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton asChild>
          <Avatar className="group relative size-5 bg-neutral-200 rounded-full p-0  outline-none ring-offset-1 ring-offset-neutral-100 transition-all duration-200 ease-in-out hover:ring-2 hover:ring-black/10 focus-visible:ring-2 focus-visible:ring-black/50  data-[state='open']:ring-green/15  sm:size-6 ">
            {loading ? (
              <div className="size-5 animate-pulse rounded-full bg-neutral-200 sm:size-6 "></div>
            ) : (
              <>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  className="rounded-full"
                />
                <AvatarFallback className="size-5 rounded-lg  bg-neutral-200 text-xs font-medium sm:size-6">
                  <FilledUser className="size-4 fill-black/70 stroke-black/80 sm:size-5" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="mt-2 w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-white "
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="   flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-6 rounded-lg sm:size-8">
              {loading ? (
                <div className="size-6 animate-pulse rounded-full bg-neutral-200 sm:size-8"></div>
              ) : (
                <>
                  {" "}
                  <AvatarImage src="https://github.com/shadcn.png"></AvatarImage>
                  <AvatarFallback className="size-6 rounded-lg bg-neutral-200 text-xs font-medium sm:size-8">
                    <FilledUser />
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.name}</span>
              <span className="truncate text-xs text-gray-500">
                {/* {data?.user?.email} */} {user?.username}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {
            <div className="flex items-center w-full gap-3 rounded cursor-pointer px-2 py-1.5 text-left text-sm hover:bg-neutral-100">
              <UserIcon className="size-4 text-gray-600" />
              <span className="text-gray-600">Account</span>
            </div>
          }

          <LogoutButton />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
