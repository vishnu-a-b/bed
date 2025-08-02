import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
export interface linkState {
  link: string;
}

// Define the initial state using that type
const initialState: linkState = {
  link: ''
}

export const linkSlice = createSlice({
  name: 'link',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    
    changeLink: (state, action: PayloadAction<string>) => {
      state.link = action.payload
    }
  }
})

export const { changeLink } = linkSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.link.link;

export default linkSlice.reducer