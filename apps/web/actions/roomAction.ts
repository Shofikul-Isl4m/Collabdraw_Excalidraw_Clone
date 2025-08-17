import axiosInstance from "@/lib/axiosInstance";
import { error } from "console";

const getRooms = async ({ search }: { search: string }) => {
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.append("search", search);
  }

  try {
    const rooms = await axiosInstance.get(
      `room/all${queryParams ? `?${queryParams.toString()}` : ""}`
    );

    return {
      message: "get room successful",
      rooms: rooms.data.rooms,
    };
  } catch (e) {
    console.log(e);

    console.error("erroe fetching room", error);
  }
};
export { getRooms };
