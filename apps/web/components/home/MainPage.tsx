"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { Rooms, User } from "@/types";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { redirect } from "next/navigation";
import { useEffect } from "react";

import { setHomeView, setUser } from "@/features/meetdraw/appSlice";
import { Button } from "@repo/ui/components/ui/button";
import { Button as Button2 } from "./StateButton";
import MeetDrawView from "./MeetDrawView";
import JoinRoomView from "./JoinRoomView";
import CreateRoomView from "./CreateRoomView";

export default function MainPage({
  jwtCookie,
  userInfo,
  rooms,
}: {
  jwtCookie: RequestCookie;
  userInfo: User;
  rooms: Rooms[];
}) {
  const userState = useAppSelector((state) => state.app.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!jwtCookie || !jwtCookie.value) {
      redirect("/signin");
    }

    if (!userState) {
      const user = JSON.parse(sessionStorage.getItem("user")!);
      if (user) {
        dispatch(setUser(user));
      } else if (userInfo) {
        const user = {
          id: userInfo.id,
          username: userInfo.username,
          name: userInfo.name,
        };
        dispatch(setUser(user));
      }
    }
  }, [jwtCookie, userState]);
  const homeView = useAppSelector((state) => state.app.homeView);
  console.log("Current homeView:", homeView);

  return (
    <div className="h-screen border-box p-2 relative flex ">
      <div className="flex flex-col gap-2 space-y-2 flex-1 min-h-0  ">
        <div className="flex justify-between items-center p-6 ">
          <div className="text-black/80 md:text-3xl text-2xl font-semibold">
            Dashboard
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => dispatch(setHomeView("join-room"))}
            >
              Join a Room
            </Button>

            <Button2
              value="create-room"
              onValueClick={(value) => {
                console.log("Dispatching setHomeView with value:", value);
                dispatch(setHomeView(value));
              }}
              className="bg-black text-white hover:bg-black/70"
            >
              Create a Room
            </Button2>
          </div>
        </div>
        <div className="flex flex-1 flex-col h-screen items-center justify-center border border-gray-200 border-b-0">
          {homeView === "create-room" && <CreateRoomView />}
          {homeView === "join-room" && <JoinRoomView />}
        </div>
      </div>
    </div>
  );
}
