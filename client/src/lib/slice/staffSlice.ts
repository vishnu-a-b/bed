import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clear } from 'console';
import { set } from 'date-fns';

interface staffState {
  id: string | null;
  name: string | null;
  userId: string | null;
  userName: string | null;
}

const initialState: staffState = {
  id: null,
  name: null,
  userId: null,
  userName: null,
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setStaffId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    clearStaffId: (state) => {
      state.id = null;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    clearUser: (state) => {
      state.userId = null;
      state.userName = null;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    clearName: (state) => {
      state.name = null;
    },
  },
});

export const {
  setStaffId,
  clearStaffId,
  setUserName,
  setUserId,
  clearUser,
  setName,
  clearName,
} = staffSlice.actions;

export default staffSlice.reducer;
