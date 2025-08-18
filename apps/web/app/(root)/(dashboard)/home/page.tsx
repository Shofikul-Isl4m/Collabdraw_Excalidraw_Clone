import MainPage from "@/components/home/MainPage";
import axiosInstance from "@/lib/axiosInstance";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const page = async () => {
  const jwtCookie = (await cookies()).get("jwt");
  if (!jwtCookie) {
    redirect("/signin");
  }

  const { data: user } = await axiosInstance.get("/auth/info");
  const { data: rooms } = await axiosInstance.get("/room/all");
  return (
    <>
      <MainPage
        jwtCookie={jwtCookie}
        rooms={rooms.rooms}
        userInfo={user.user}
      />
      ;
    </>
  );
};

export default page;
