import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface supporterState {
  id: string | null;
  name: string | null;
  userId: string | null;
  userName: string | null;
}

const initialState: supporterState = {
  id: null,
  name: null,
  userId: null,
  userName: null,
};

const supporterSlice = createSlice({
  name: 'supporter',
  initialState,
  reducers: {
    setSupporterId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    clearSupporterId: (state) => {
      state.id = null;
    },
    setSupporterUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setSupporterUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    clearSupporterUser: (state) => {
      state.userId = null;
      state.userName = null;
    },
    setSupporterName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    clearSupporterName: (state) => {
      state.name = null;
    },
  },
});

export const {
  setSupporterId,
  clearSupporterId,
  setSupporterUserName,
  setSupporterUserId,
  clearSupporterUser,
  setSupporterName,
  clearSupporterName,
} = supporterSlice.actions;

export default supporterSlice.reducer;