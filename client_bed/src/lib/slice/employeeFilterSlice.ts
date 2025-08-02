// redux/slices/employeeFilterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'lodash';

interface FilterState {
  startDateTime: string;
  endDateTime: string;
  employeeId: string;
  status: string;
  locate?: [number, number] | null;
}

const initialState: FilterState = {
  startDateTime: '',
  endDateTime: '',
  employeeId: '',
  status:'',
  locate: null,
};

const employeeFilterSlice = createSlice({
  name: 'employeeFilter',
  initialState,
  reducers: {
    setFilterData: (state, action: PayloadAction<FilterState>) => {
      state.startDateTime = action.payload.startDateTime;
      state.endDateTime = action.payload.endDateTime;
      state.employeeId = action.payload.employeeId;
      state.status = action.payload.status;
    },
    setLocate: (state, action: PayloadAction<[number,number]>) => {
      state.locate = action.payload;
    }
  },
});

export const { setFilterData,setLocate } = employeeFilterSlice.actions;
export default employeeFilterSlice.reducer;
