require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const adminmail = async (user) => {
  try {
    console.log(user);

    const { data, error } = await resend.emails.send({
      from: "HR Management <onboarding@resend.dev>", // Replace with your verified domain later
      to: process.env.EMAIL,
      subject: "New Employee Recruitment Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2 style="color:#2563eb;">📋 New Employee Recruitment Request</h2>

          <p>A new candidate has applied for recruitment.</p>

          <table style="border-collapse: collapse; width:100%;">
            <tr>
              <td style="padding:8px; font-weight:bold;">Candidate Name</td>
              <td style="padding:8px;">${user.name}</td>
            </tr>

            <tr>
              <td style="padding:8px; font-weight:bold;">Email</td>
              <td style="padding:8px;">${user.email}</td>
            </tr>

            <tr>
              <td style="padding:8px; font-weight:bold;">Position Applied</td>
              <td style="padding:8px;">${user.role}</td>
            </tr>
          </table>

          <br/>

          <p>
            📌 Please review the candidate details and proceed with the recruitment process.
          </p>

          <hr/>

          <p style="font-size:13px;color:#666;">
            HR Management System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    console.log("Admin email sent successfully:", data);
  } catch (error) {
    console.error("Failed to send admin email:", error);
    throw error;
  }
};

module.exports = { adminmail };