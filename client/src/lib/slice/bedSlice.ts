import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BedState {
  id: string | null;
  organization: string | null;
  country: string | null;
  bedNo: number | null;
  maxNoContributer: number;
  amount: number | null;
  patientName: string | null;
  head: string | null;
  vcLink: string | null;
}

const initialState: BedState = {
  id: null,
  organization: null,
  country: null,
  bedNo: null,
  maxNoContributer: 15, // Default value
  amount: null,
  patientName: null,
  head: null,
  vcLink: null,
};

const bedSlice = createSlice({
  name: 'bed',
  initialState,
  reducers: {
    setBedId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setBedData: (state, action: PayloadAction<Partial<BedState>>) => {
      return { ...state, ...action.payload };
    },
    clearBedData: () => initialState,
    // Individual setters
    setOrganization: (state, action: PayloadAction<string>) => {
      state.organization = action.payload;
    },
    setCountry: (state, action: PayloadAction<string>) => {
      state.country = action.payload;
    },
    setBedNo: (state, action: PayloadAction<number>) => {
      state.bedNo = action.payload;
    },
    setMaxContributers: (state, action: PayloadAction<number>) => {
      state.maxNoContributer = action.payload;
    },
    setamount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
    },
    setPatientName: (state, action: PayloadAction<string>) => {
      state.patientName = action.payload;
    },
    setHead: (state, action: PayloadAction<string>) => {
      state.head = action.payload;
    },
    setVcLink: (state, action: PayloadAction<string>) => {
      state.vcLink = action.payload;
    },
  },
});

export const {
  setBedId,
  setBedData,
  clearBedData,
  setOrganization,
  setCountry,
  setBedNo,
  setMaxContributers,
  setamount,
  setPatientName,
  setHead,
  setVcLink,
} = bedSlice.actions;

export default bedSlice.reducer;