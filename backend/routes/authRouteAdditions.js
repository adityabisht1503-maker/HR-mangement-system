// ── ADD THESE TWO LINES to whichever file defines your authrouter ────────────
// (likely routes/quizrouter.js or routes/authRoutes.js)

const { updateProfile, changePassword } = require('../controller/profileController');
const { authMiddleware } = require('../middlewaer/authmiddlewear');

// PATCH /api/auth/profile  → update name/email/phone
authrouter.patch('/profile',  authMiddleware, updateProfile);

// PATCH /api/auth/password → change password (requires current password)
authrouter.patch('/password', authMiddleware, changePassword);
