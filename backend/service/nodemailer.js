require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "HR Management <onboarding@resend.dev>", // Replace with your verified domain later
      to: email,
      subject: "🔐 Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; background-color: #ffffff;">

          <h2 style="color:#2563eb; text-align:center;">
            🔐 Email Verification
          </h2>

          <p>Hello,</p>

          <p>
            Thank you for registering with our <strong>HR Management System</strong>.
            Please use the One-Time Password (OTP) below to verify your email address.
          </p>

          <div style="text-align:center; margin:30px 0;">
            <span style="
              display:inline-block;
              background:#2563eb;
              color:white;
              padding:15px 30px;
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              border-radius:8px;">
              ${otp}
            </span>
          </div>

          <p style="text-align:center;">
            ⏱️ This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <hr/>

          <p style="font-size:13px;color:#666;">
            If you did not request this verification, you can safely ignore this email.
          </p>

          <p style="font-size:14px;color:#666;">
            Regards,<br>
            <strong>HR Management Team</strong>
          </p>

        </div>
      `,
    });

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    console.log("Verification email sent:", data);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    throw err;
  }
};

module.exports = { sendVerificationEmail };