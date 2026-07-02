require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const hrmail = async (user, isVerified) => {
  try {
    console.log(user);

    const verifiedHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #d4edda; border-radius: 8px; background-color: #f9fff9;">
        <h2 style="color: #28a745;">✅ Account Verified Successfully</h2>

        <p>Dear <strong>${user.name}</strong>,</p>

        <p>
          Congratulations! Your account has been
          <strong style="color:#28a745;">successfully verified</strong>
          by the HR department.
        </p>

        <p>You can now log in and access your employee dashboard.</p>

        <br/>

        <p><strong>👤 Employee Name:</strong> ${user.name}</p>
        <p><strong>💼 Position:</strong> ${user.role}</p>
        <p><strong>📧 Registered Email:</strong> ${user.email}</p>

        <br/>

        <p>Welcome aboard! We wish you success in your journey with us.</p>

        <hr/>

        <p style="font-size:14px;color:#666;">
          Regards,<br/>
          <strong>HR Department</strong>
        </p>
      </div>
    `;

    const notVerifiedHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f5c6cb; border-radius: 8px; background-color: #fff9f9;">

        <h2 style="color:#dc3545;">❌ Account Verification Failed</h2>

        <p>Dear <strong>${user.name}</strong>,</p>

        <p>
          We regret to inform you that your account could not be
          <strong style="color:#dc3545;">verified</strong> by the HR department.
        </p>

        <p>
          This may be due to incomplete or incorrect information submitted during registration.
        </p>

        <br/>

        <p><strong>👤 Employee Name:</strong> ${user.name}</p>
        <p><strong>💼 Position:</strong> ${user.role}</p>
        <p><strong>📧 Registered Email:</strong> ${user.email}</p>

        <br/>

        <p>
          Please contact the HR department if you believe this is an error or wish to resubmit your details.
        </p>

        <hr/>

        <p style="font-size:14px;color:#666;">
          Regards,<br/>
          <strong>HR Department</strong>
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "HR Department <onboarding@resend.dev>", // Replace with your verified domain later
      to: user.email,
      subject: isVerified
        ? "✅ Your Account Has Been Verified"
        : "❌ Account Verification Failed",
      html: isVerified ? verifiedHTML : notVerifiedHTML,
    });

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    console.log("Verification email sent:", data);
  } catch (error) {
    console.error("Failed to send HR email:", error);
    throw error;
  }
};

module.exports = { hrmail };