import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'date-fns';

interface updateState {
  id: string | null;
  url: string | null;
  refresh: boolean;
}

const initialState: updateState = {
  id: null,
  url: null,
  refresh: false,
};

const updateSlice = createSlice({
  name: 'update',
  initialState,
  reducers: {
    setUpdateId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setUpdateUrl: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
    },
    clearUpdate: (state) => {
      state.id = null;
      state.url = null;
    },
    refreshTable: (state) => {
      state.refresh = !state.refresh;
    }
    
  },
});

export const {
  setUpdateId,
  setUpdateUrl,
  clearUpdate,
  refreshTable
} = updateSlice.actions;

export default updateSlice.reducer;