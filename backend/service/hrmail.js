require("dotenv").config();
const nodemailer = require("nodemailer");

const hrmail = async (user, isVerified) => {
  try {
    console.log(user);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verifiedHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #d4edda; border-radius: 8px; background-color: #f9fff9;">
        <h2 style="color: #28a745;">✅ Account Verified Successfully</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>We are pleased to inform you that your account has been <strong style="color: #28a745;">verified</strong> by our HR team.</p>
        <p>You can now log in and access your employee portal.</p>
        <br/>
        <p>📌 <strong>Position:</strong> ${user.role}</p>
        <p>📧 <strong>Registered Email:</strong> ${user.email}</p>
        <br/>
        <p>Welcome aboard! If you have any questions, feel free to reach out to HR.</p>
        <br/>
        <p style="color: #555;">Best Regards,<br/><strong>HR Department</strong></p>
      </div>
    `;

    const notVerifiedHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f5c6cb; border-radius: 8px; background-color: #fff9f9;">
        <h2 style="color: #dc3545;">❌ Account Verification Failed</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>We regret to inform you that your account could <strong style="color: #dc3545;">not be verified</strong> by our HR team at this time.</p>
        <p>This may be due to incomplete or incorrect information provided during registration.</p>
        <br/>
        <p>📌 <strong>Position Applied For:</strong> ${user.role}</p>
        <p>📧 <strong>Registered Email:</strong> ${user.email}</p>
        <br/>
        <p>Please contact HR for further clarification or to resubmit your details.</p>
        <br/>
        <p style="color: #555;">Best Regards,<br/><strong>HR Department</strong></p>
      </div>
    `;

    await transporter.sendMail({
      
      to: user.email, // ✅ Send to the candidate
      subject: isVerified
        ? "✅ Your Account Has Been Verified"
        : "❌ Account Verification Failed",
      html: isVerified ? verifiedHTML : notVerifiedHTML,
    });

    console.log(`Verification email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send HR email:", error);
    throw error;
  }
};

module.exports = { hrmail };