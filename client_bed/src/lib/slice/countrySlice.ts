import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CountryState {
  id: string | null;
  name: string | null;
}

const initialState: CountryState = {
  id: null,
  name: null,
};

const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {
    setCountryId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    clearCountryId: (state) => {
      state.id = null;
    },
    setCountryName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    clearCountryName: (state) => {
      state.name = null;
    },
    // Reset all country state
    clearCountry: (state) => {
      state.id = null;
      state.name = null;
    },
  },
});

export const {
  setCountryId,
  clearCountryId,
  setCountryName,
  clearCountryName,
  clearCountry,
} = countrySlice.actions;

export default countrySlice.reducer;