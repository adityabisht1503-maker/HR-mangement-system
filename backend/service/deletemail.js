require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const deletemail = async (user) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "HR Department <onboarding@resend.dev>", // Replace with your verified domain later
      to: user.email,
      subject: "🗑️ Your Account Has Been Deleted",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8f9fa;">
          
          <h2 style="color: #dc3545;">🗑️ Account Deleted</h2>

          <p>Dear <strong>${user.name}</strong>,</p>

          <p>
            We would like to inform you that your employee account has been
            <strong style="color:#dc3545;">permanently deleted</strong>
            from our HR Management System by the HR department.
          </p>

          <br/>

          <p><strong>👤 Employee Name:</strong> ${user.name}</p>
          <p><strong>📧 Email:</strong> ${user.email}</p>
          <p><strong>💼 Position:</strong> ${user.role}</p>

          <br/>

          <p>
            If you believe this action was taken in error or have any questions,
            please contact the HR department.
          </p>

          <hr/>

          <p style="font-size:14px;color:#666;">
            Regards,<br/>
            <strong>HR Department</strong>
          </p>

        </div>
      `,
    });

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    console.log("Deletion email sent:", data);
  } catch (err) {
    console.error("Failed to send deletion email:", err);
    throw err;
  }
};

module.exports = { deletemail };