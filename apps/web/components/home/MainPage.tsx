"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { Rooms, User } from "@/types";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { redirect } from "next/navigation";
import { useEffect, useRef } from "react";
import StateButton from "./StateButton";
import MeetdrawsView from "./MeetdrawsView";
import CreateRoomButton from "../dashboard/CreateRoomButton";
import CreateRoomView from "./CreateRoomView";
import JoinRoomView from "./JoinRoomView";
import ChatRoom from "./ChatRoom";
import { setHomeView, setRooms, setUser } from "@/features/meetdraw/appSlice";

const MainPage = ({
  jwtCookie,
  rooms,
  userInfo,
}: {
  jwtCookie: RequestCookie;
  rooms: Rooms[];
  userInfo: User;
}) => {
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
        let newUserInfo: User = {
          id: userInfo.id,
          name: userInfo.name,
          username: userInfo.username,
        };
        dispatch(setUser(newUserInfo));
      }
    }
  }, [jwtCookie, userState]);

  const homeRef = useRef<HTMLDivElement>(null);

  const homeView = useAppSelector((state) => state.app.homeView);

  useEffect(() => {
    const homeDivCurrent = homeRef.current;
    if (!homeDivCurrent) return;
    dispatch(setRooms(rooms));
  }, []);

  return (
    <div ref={homeRef} className="relative flex h-screen p-2 gap-2 box-border">
      <div className="flex-1 min-h-0 flex flex-col space-y-2 p-2 rounded-xl ">
        <div className="rounded-lg flex items-center justify-between py-3 px-4">
          <h1 className="font-semibold text-2xl md:text-3xl text-black/70">
            Dashboard
          </h1>
          <div className="flex gap-2">
            <StateButton
              variant="secondary"
              value="join-room"
              onClick={() => dispatch(setHomeView("join-room"))}
            >
              Join Draw
            </StateButton>
            <StateButton
              className="bg-white"
              value="create-room"
              onClick={() => dispatch(setHomeView("create-room"))}
            >
              create Draw
            </StateButton>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-2 pt-4 flex-1 min-h-0">
          {homeView === "meetdraw" && <MeetdrawsView />}
          {homeView === "create-room" && <CreateRoomView />}
          {homeView === "join-room" && <JoinRoomView />}
          {homeView == "chat" && <ChatRoom jwtCookie={jwtCookie} />}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
