require("dotenv").config();
const nodemailer = require("nodemailer");

const deletemail = async (user) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"HR Department" <${process.env.EMAIL}>`,  // ✅ shows as HR in inbox
    to: user.email,
    subject: "🗑️ Your Account Has Been Deleted",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8f9fa;">
        <h2 style="color: #6c757d;">🗑️ Account Deleted</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>We want to inform you that your employee account has been <strong style="color: #dc3545;">permanently deleted</strong> from our system by the HR team.</p>
        <br/>
        <p>📌 <strong>Position:</strong> ${user.role}</p>
        <p>📧 <strong>Email:</strong> ${user.email}</p>
        <br/>
        <p>If you believe this was a mistake or have any concerns, please contact HR immediately.</p>
        <br/>
        <p style="color: #555;">Best Regards,<br/><strong>HR Department</strong></p>
      </div>
    `,
  });
};

module.exports = { deletemail };

