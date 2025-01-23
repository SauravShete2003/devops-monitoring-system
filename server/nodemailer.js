import nodemailer from 'nodemailer'

const sendEmailAlert = async (message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"DevOps Monitor" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL_RECIPIENT,
      subject: "System Alert",
      text: message,
    });

    console.log("Alert email sent: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send email alert:", error.message);
  }
};

export default sendEmailAlert;