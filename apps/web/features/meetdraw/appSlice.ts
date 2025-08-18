import { Rooms, User } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: {
  user: User | null;
  rooms: Rooms | null;
  homeView: "meetdraw" | "create-room" | "join-room" | "chat";
  activeRoom: Rooms | null;
} = {
  user: null,
  rooms: null,
  homeView: "meetdraw",
  activeRoom: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setHomeView: (state, action) => {
      state.homeView = action.payload;
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.rooms = null;
    },
  },
});

export const { setUser, setRooms, setActiveRoom, setHomeView, logout } =
  appSlice.actions;

export default appSlice.reducer;
