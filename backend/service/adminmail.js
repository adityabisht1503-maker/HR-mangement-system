// ✅ Accept user directly, not req/res
require("dotenv").config();
const nodemailer =   require("nodemailer");
const adminmail = async (user) => {
  try {
    console.log(user); // Will now correctly log the user

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: process.env.EMAIL,
      subject: "New Employee Recruitment Request",
      html: `
        <h2>New Employee Recruitment</h2>
        <p><strong>Candidate Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Position Applied For:</strong> ${user.role}</p>
        <p>📌 Please review the candidate details and confirm the recruitment.</p>
      `,
    });

  } catch (error) {
    console.error("Failed to send admin email:", error);
    // ❌ Don't use res.status() here — there's no res parameter
    throw error; // Let the caller handle it
  }
};
module.exports={adminmail};