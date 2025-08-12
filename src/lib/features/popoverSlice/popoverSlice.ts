import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PopoverState {
  activePopoverId: string | null;
}

const initialState: PopoverState = {
  activePopoverId: null,
}

export const popoverSlice = createSlice({
  name: 'popover',
  initialState,
  reducers: {
    openPopover: (state, action: PayloadAction<string>) => {
      state.activePopoverId = action.payload;
    },
    closePopover: (state) => {
      state.activePopoverId = null;
    },
    togglePopover: (state, action: PayloadAction<string>) => {
      if (state.activePopoverId === action.payload) {
        state.activePopoverId = null;
      } else {
        state.activePopoverId = action.payload;
      }
    },
  },
})

export const { openPopover, closePopover, togglePopover } = popoverSlice.actions

export default popoverSlice.reducer