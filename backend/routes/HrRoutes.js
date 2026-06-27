const express = require("express");
const Hrrouter = express.Router();
const { authMiddleware } = require("../middlewaer/authmiddlewear");
const { getVerificationStats, getVerificationRequests, approveUser, rejectUser, revokeUser } = require("../controller/hrVerificationController");

// ✅ Match exactly what your frontend axios calls expect

Hrrouter.get("/verifications/stats", authMiddleware, getVerificationStats);         // GET  /api/hr/verifications/stats
Hrrouter.get("/verifications",       authMiddleware, getVerificationRequests);       // GET  /api/hr/verifications?status=pending
Hrrouter.put("/verifications/:id/approve", authMiddleware, approveUser);            // PUT  /api/hr/verifications/:id/approve
Hrrouter.delete("/verifications/:id/reject", authMiddleware, rejectUser);           // DELETE /api/hr/verifications/:id/reject
Hrrouter.put("/verifications/:id/revoke", authMiddleware, revokeUser);              // PUT  /api/hr/verifications/:id/revoke

module.exports = Hrrouter;