const express = require("express");
const { authMiddleware } = require("../middlewaer/authmiddlewear");
const {
  getMyNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
} = require("../controller/notificationController");

const notificationRouter = express.Router();

// GET    /api/notifications           → get my notifications (role-filtered automatically)
notificationRouter.get("/",            authMiddleware, getMyNotifications);

// PATCH  /api/notifications/read-all  → mark all as read  (must be before /:id)
notificationRouter.patch("/read-all",  authMiddleware, markAllRead);

// PATCH  /api/notifications/:id/read  → mark one as read
notificationRouter.patch("/:id/read",  authMiddleware, markOneRead);

// DELETE /api/notifications/:id       → delete one
notificationRouter.delete("/:id",      authMiddleware, deleteNotification);

module.exports = { notificationRouter };
