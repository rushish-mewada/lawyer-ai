import { configureStore } from '@reduxjs/toolkit'
import popoverReducer from './features/popoverSlice/popoverSlice'
import uiReducer from './features/ui/uiSlice'
import chatReducer from './features/chatSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      popover: popoverReducer,
      ui: uiReducer,
      chat: chatReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']