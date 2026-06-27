import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount  : 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Replace entire list (on fetch)
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount   = action.payload.filter(n => !n.is_read).length;
    },

    // Mark a single notification as read
    markOneRead: (state, action) => {
      const n = state.notifications.find(n => n._id === action.payload);
      if (n && !n.is_read) {
        n.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all as read
    markAllRead: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, is_read: true }));
      state.unreadCount   = 0;
    },

    // Remove one from the list
    removeNotification: (state, action) => {
      const n = state.notifications.find(n => n._id === action.payload);
      if (n && !n.is_read) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
    },

    // Reset on logout
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount   = 0;
    },
  },
});

export const {
  setNotifications,
  markOneRead,
  markAllRead,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice;
