const { Notificationmodel } = require("../model/Notification");
const { Passwordmodel }     = require("../model/Password");

/* ============================================================
   HELPER — called internally from other controllers
   Creates one notification record.
   Usage:
     await createNotification({
       recipientId   : user._id,        // Login model _id
       recipientRole : "admin",          // "admin" | "employee"
       type          : "leave_request",
       message       : "John applied for 3 days annual leave",
       refId         : leave._id,        // optional
     });
============================================================ */
const createNotification = async ({ recipientId, recipientRole, type, message, refId = null }) => {
  try {
    await Notificationmodel.create({
      recipient    : recipientId,
      recipientRole: recipientRole,
      type,
      message,
      refId,
    });
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

/* ============================================================
   HELPER — notify ALL admin users at once
   Used when employee does something all admins should see
============================================================ */
const notifyAllAdmins = async ({ type, message, refId = null }) => {
  try {
    const admins = await Passwordmodel.find({ role: "admin" }).select("_id");
    const docs = admins.map(a => ({
      recipient    : a._id,
      recipientRole: "admin",
      type,
      message,
      refId,
    }));
    if (docs.length) await Notificationmodel.insertMany(docs);
  } catch (err) {
    console.error("notifyAllAdmins failed:", err.message);
  }
};

/* ============================================================
   GET /api/notifications
   Returns notifications for the logged-in user only.
   Supports ?unread=true to filter unread only.
============================================================ */
const getMyNotifications = async (req, res) => {
  try {
    const { unread } = req.query;

    const filter = { recipient: req.user._id };
    if (unread === "true") filter.is_read = false;

    const notifications = await Notificationmodel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notificationmodel.countDocuments({
      recipient: req.user._id,
      is_read  : false,
    });

    return res.json({
      status: 1,
      message: "Notifications fetched",
      notifications,
      unreadCount,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* ============================================================
   PATCH /api/notifications/:id/read
   Mark a single notification as read
============================================================ */
const markOneRead = async (req, res) => {
  try {
    await Notificationmodel.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { is_read: true } }
    );
    return res.json({ status: 1, message: "Marked as read" });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* ============================================================
   PATCH /api/notifications/read-all
   Mark ALL of the logged-in user's notifications as read
============================================================ */
const markAllRead = async (req, res) => {
  try {
    await Notificationmodel.updateMany(
      { recipient: req.user._id, is_read: false },
      { $set: { is_read: true } }
    );
    return res.json({ status: 1, message: "All marked as read" });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* ============================================================
   DELETE /api/notifications/:id
   Delete a single notification
============================================================ */
const deleteNotification = async (req, res) => {
  try {
    await Notificationmodel.findOneAndDelete({
      _id      : req.params.id,
      recipient: req.user._id,
    });
    return res.json({ status: 1, message: "Notification deleted" });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = {
  createNotification,
  notifyAllAdmins,
  getMyNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
};
