// slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string;
  role: string;
  name: string;
  photo: string;
}

const initialState: UserState = {
  id: "",
  role: "",
  name: "",
  photo: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDetails: (
      state,
      action: PayloadAction<{
        id: string;
        role: string;
        name: string;
        photo: string;

      }>
    ) => {
      const { id, role, name, photo } = action.payload;
      state.id = id;
      state.role = role;
      state.name = name;
      state.photo =photo;
    },
  },
});

export const { setUserDetails } = userSlice.actions;
export const selectUserDetails = (state: { user: UserState }) => state.user;

export default userSlice.reducer;
