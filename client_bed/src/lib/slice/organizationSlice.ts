import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrganizationState {
  id: string | null;
  name: string | null;
}

const initialState: OrganizationState = {
  id: null,
  name: null,
};

const OrganizationSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    setOrganizationId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    clearOrganizationId: (state) => {
      state.id = null;
    },

    setOrganizationName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    clearOrganizationName: (state) => {
      state.name = null;
    },
  },
});

export const { setOrganizationId, clearOrganizationId, setOrganizationName, clearOrganizationName } =
OrganizationSlice.actions;

export default OrganizationSlice.reducer;
