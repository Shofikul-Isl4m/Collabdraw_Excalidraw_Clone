"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { Rooms, User } from "@/types";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { redirect } from "next/navigation";
import { useEffect } from "react";

import { setHomeView } from "@/features/meetdraw/appSlice";
import { Button } from "@repo/ui/components/ui/button";
import { Button as Button2 } from "./StateButton";

export default function MainPage(
  {
    // jwtCookie,
    // user,
    // rooms,
  }: {
    // jwtCookie: RequestCookie;
    // user: User;
    // rooms: Rooms[];
  }
) {
  const userState = useAppSelector((state) => state.app.user);
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   if (!jwtCookie || !jwtCookie.value) {
  //     redirect("/signin");
  //   }

  //   if (userState) {
  //   }
  // }, []);
  const homeView = useAppSelector((state) => state.app.homeView);

  return (
    <div className="h-screen flex border-box p-2 border-box">
      <div className="flex min-h-0 flex-col  flex-1 space-y-2 p-2 h-screen rounded-xl gap-2">
        <div className="flex flex-row justify-between items-center rounded-lg py-3 px-4">
          <h1 className="font-semibold text-2xl md:text-3xl text-black-100/70">
            Dashboard
          </h1>
          <div className="flex  gap-2">
            <Button2
              className="w-full md:w-auto bg-black hover:bg-black/70 text-white cursor-pointer"
              value="join-room"
              onClick={(value) => dispatch(setHomeView(value))}
            >
              Create a Room
            </Button2>
            <Button
              variant="outline"
              className="w-full cursor-pointer  md:w-auto"
            >
              Join a Room
            </Button>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-h-0 p-2 pt-4 rounded-xl">
            {homeView === "meetdraw" && <MeetDrawView />}
          </div>
        </div>
      </div>
    </div>
  );
}
