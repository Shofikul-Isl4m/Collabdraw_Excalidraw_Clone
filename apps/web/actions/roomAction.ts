"use server";

export interface RoomActionState {
  message: string;
  room?: Rooms;
}

import axiosInstance from "@/lib/axiosInstance";
import { Rooms } from "@/types";

export async function getRooms({ search = "" }: { search?: string }) {
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.append("search", search);
  }
  try {
    const room = await axiosInstance.get(
      `/room/all${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return {
      message: "get room successfull",
      rooms: room.data.rooms,
    };
  } catch (error) {
    console.log(error);
    console.error("error fetching room : ", error);
  }
}

export async function joinRoomAction(
  initialState: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const joinCode = formData.get("joinCode") as string;

  if (!joinCode || joinCode.trim().length === 0) {
    return {
      message: "Join code is required",
    };
  }

  try {
    const room = await axiosInstance.post(`/room/join`, {
      joinCode,
    });
    return {
      message: "Room joined successfully",
      room: room.data.room,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: error.response.data.message,
    };
  }
}
