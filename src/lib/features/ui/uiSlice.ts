import { createSlice } from '@reduxjs/toolkit'

export interface UiState {
    isSidebarOpen: boolean;
}

const initialState: UiState = {
    isSidebarOpen: false,
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
    },
});

export const { toggleSidebar } = uiSlice.actions;

export default uiSlice.reducer;