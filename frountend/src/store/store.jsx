import { configureStore } from '@reduxjs/toolkit'
import authslice from './authslice'
import notificationSlice from './notificationSlice'

export const store = configureStore({
  reducer: {
     auth:authslice.reducer,
    notifications: notificationSlice.reducer
  },
})

export default store




