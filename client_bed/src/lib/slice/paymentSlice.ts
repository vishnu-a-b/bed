import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaymentState {
  id: any;
  paymentId: string | null;
}

const initialState: PaymentState = {
  id: null,
  paymentId: null,
};

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPaymentId: (state, action: PayloadAction<string>) => {
      state.paymentId = action.payload;
    },
    clearPaymentId: (state) => {
      state.paymentId = null;
    },
  },
});

export const { setPaymentId, clearPaymentId } = paymentSlice.actions;
export default paymentSlice.reducer;