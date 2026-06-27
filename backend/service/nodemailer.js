require("dotenv").config();

const nodemailer =   require("nodemailer");

 const sendVerificationEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  // const link = `http://localhost:${process.env.PORT}/verify/${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    // html: `<p>Click to verify your email:</p>  
    //        <a href="${link}">Verify Email</a>`
         html: `
      

<h1 style="letter-spacing:4px; color:#2563eb;">
  ${otp}
</h1>

<p>
  ⏱️ This OTP is valid for <strong>10 minutes</strong>.
</p>



    `   
  });
    
};


module.exports = {sendVerificationEmail}